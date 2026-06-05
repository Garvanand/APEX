from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.core.config import settings

# Initialize async engine for PostgreSQL connection pooling
engine_args = {
    "echo": False,
    "future": True,
}

if "sqlite" not in settings.DATABASE_URL:
    engine_args["pool_size"] = 20
    engine_args["max_overflow"] = 10
else:
    # Optional: check_same_thread=False is needed if sharing sqlite conns across threads,
    # but aiosqlite handles concurrency via asyncio.
    pass

engine = create_async_engine(
    settings.DATABASE_URL,
    **engine_args
)

# Create session generator
SessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# FastAPI session dependency
async def get_db():
    async with SessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
