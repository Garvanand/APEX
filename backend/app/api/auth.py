from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import uuid

from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.database.models import User, UserPreference, AuthToken, DeviceRegistration
from app.schemas.schemas import UserCreate, UserResponse, UserLogin, TokenResponse, TokenRefreshRequest

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if user already exists
    result = await db.execute(select(User).filter(User.email == user_in.email))
    existing_user = result.scalars().first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists in the APEX database."
        )

    # Create new user and preferences
    new_user = User(
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        first_name=user_in.first_name,
        last_name=user_in.last_name,
        is_active=True # Setting true for ease of local testing
    )
    db.add(new_user)
    await db.flush() # Flush to populate new_user.id

    # Create default user preference
    preferences = UserPreference(user_id=new_user.id)
    db.add(preferences)
    
    await db.commit()
    await db.refresh(new_user)
    return new_user

@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).filter(User.email == credentials.email))
    user = result.scalars().first()
    
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="The email or password provided is incorrect."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has not been activated yet."
        )

    # Issue access and refresh tokens
    access_token = create_access_token(subject=user.id)
    refresh_token = str(uuid.uuid4()) # In practice, a cryptographically secure random string

    # Store refresh token
    db_token = AuthToken(
        user_id=user.id,
        refresh_token=refresh_token,
        expires_at=datetime.utcnow() + timedelta(days=7)
    )
    db.add(db_token)

    # Track device registration
    device_result = await db.execute(
        select(DeviceRegistration).filter(DeviceRegistration.device_id == credentials.device_id)
    )
    existing_device = device_result.scalars().first()
    if existing_device:
        existing_device.last_seen_at = datetime.utcnow()
    else:
        new_device = DeviceRegistration(
            user_id=user.id,
            device_id=credentials.device_id,
            device_type="mobile" if "iqoo" in credentials.device_id.lower() else "desktop"
        )
        db.add(new_device)

    await db.commit()

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token
    )

@router.post("/refresh", response_model=TokenResponse)
async def refresh(refresh_in: TokenRefreshRequest, db: AsyncSession = Depends(get_db)):
    # Find token
    result = await db.execute(
        select(AuthToken).filter(AuthToken.refresh_token == refresh_in.refresh_token)
    )
    db_token = result.scalars().first()

    if not db_token or db_token.is_revoked or db_token.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Session expired or invalid refresh token. Please log in again."
        )

    # Revoke old refresh token and generate new tokens
    db_token.is_revoked = True
    
    access_token = create_access_token(subject=db_token.user_id)
    new_refresh_token = str(uuid.uuid4())
    
    new_db_token = AuthToken(
        user_id=db_token.user_id,
        refresh_token=new_refresh_token,
        expires_at=datetime.utcnow() + timedelta(days=7)
    )
    db.add(new_db_token)
    await db.commit()

    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh_token
    )

@router.post("/logout")
async def logout(refresh_in: TokenRefreshRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(AuthToken).filter(AuthToken.refresh_token == refresh_in.refresh_token)
    )
    db_token = result.scalars().first()

    if db_token:
        db_token.is_revoked = True
        await db.commit()

    return {"status": "success", "message": "Token invalidated and session destroyed successfully."}
