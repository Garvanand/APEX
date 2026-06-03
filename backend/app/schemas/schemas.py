from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID

# --- Auth Schemas ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, description="Must be at least 8 characters long")
    first_name: str
    last_name: str

class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    first_name: str
    last_name: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    device_id: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"
    expires_in: int = 3600

class TokenRefreshRequest(BaseModel):
    refresh_token: str

# --- Cognitive Signals Schemas ---
class SignalIngest(BaseModel):
    timestamp: datetime
    device_source: str
    heart_rate: Optional[float] = None
    hrv: Optional[float] = None
    blink_rate_per_min: Optional[int] = None
    screen_interaction_density: Optional[float] = None
    active_application: Optional[str] = None
    ambient_noise_db: Optional[float] = None

class CognitiveStateResponse(BaseModel):
    user_id: UUID
    state: str
    confidence_score: float
    updated_at: datetime
    contributing_signals: Dict[str, Any]
