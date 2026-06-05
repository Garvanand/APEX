from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.api.auth import router as auth_router
from app.api.cognitive import router as cognitive_router
from app.api.agents import router as agents_router
from app.api.pairing import router as pairing_router
from app.core.database import engine
from app.database.models import Base

# Setup logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="APEX Core Engine",
    description="Adaptive Presence & Execution Intelligence System API",
    version="1.0.0"
)

# Configure CORS for Tauri and mobile development clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from sqlalchemy import text

@app.on_event("startup")
async def startup_event():
    """Initializes schema dependencies on database startup."""
    logger.info("Initializing database extensions and schemas...")
    async with engine.begin() as conn:
        try:
            pass
            
            # Create tables
            await conn.run_sync(Base.metadata.create_all)
            logger.info("APEX database tables checked/created successfully.")
        except Exception as e:
            logger.error(f"Database schema initialization failed: {e}")

# Include core routes
app.include_router(auth_router, prefix="/api/v1")
app.include_router(cognitive_router, prefix="/api/v1")
app.include_router(agents_router, prefix="/api/v1")
app.include_router(pairing_router, prefix="/api/v1")

@app.get("/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "service": "apex-core-engine",
        "timestamp": str(Base.metadata.schema)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
