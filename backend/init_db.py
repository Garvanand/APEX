import asyncio
import logging
from app.core.database import engine
from app.database.models import Base

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("APEX-DB-Init")

async def init_db():
    logger.info("Connecting to PostgreSQL to check schema setup...")
    
    # Wait a few seconds to ensure postgres container is fully ready to accept sockets
    await asyncio.sleep(2)
    
    async with engine.begin() as conn:
        try:
            from sqlalchemy import text
            # 1. Install uuid-ossp
            logger.info("Initializing 'uuid-ossp' extension...")
            await conn.execute(text("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"))
            
            # 2. Install vector
            logger.info("Initializing 'vector' extension...")
            await conn.execute(text("CREATE EXTENSION IF NOT EXISTS \"vector\";"))
            
            # 3. Create all mapped tables
            logger.info("Creating all APEX database tables...")
            await conn.run_sync(Base.metadata.create_all)
            
            logger.info("Successfully created all 32 APEX database tables!")
        except Exception as e:
            logger.error(f"Failed to initialize database: {e}")

if __name__ == "__main__":
    asyncio.run(init_db())
