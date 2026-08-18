from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    APP_NAME: str = "Jisser API"
    VERSION: str = "1.0.0"
    DEBUG: bool = True

    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_KEY: str = ""
    SUPABASE_ANON_KEY: str = ""
    JWT_SECRET: str = ""

    CORS_ORIGINS: str = "http://localhost:3000"

    DEEPSEEK_API_KEY: str = ""
    LLM_MODEL: str = "deepseek-chat"
    LLM_BASE_URL: str = "https://api.deepseek.com/v1"

    STORAGE_BUCKET: str = "documents"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
