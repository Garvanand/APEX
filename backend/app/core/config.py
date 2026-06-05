import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    DATABASE_URL: str = Field(default="sqlite+aiosqlite:///./apex_dev.db")
    JWT_SECRET_KEY: str = Field(default="9ef0528254adbe3e3e08fca71a6c42171c77840134f71a7d6092040b2401f893")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    GROQ_API_KEY: str = Field(default="")

    # Standard configuration to read .env file
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "development.env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
