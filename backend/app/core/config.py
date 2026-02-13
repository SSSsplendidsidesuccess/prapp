"""
Configuration module using Pydantic Settings.
Loads environment variables from .env file.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Application settings
    APP_ENV: str = "development"
    PORT: int = 8000
    
    # Database settings
    MONGODB_URI: str
    
    # Authentication settings
    JWT_SECRET: str = "your-secret-key-change-in-production"
    JWT_EXPIRES_IN: int = 604800  # 7 days in seconds
    
    # CORS settings
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:3001"
    
    # OpenAI settings
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True
    )
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Convert CORS_ORIGINS string to list."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]


# Create a single instance to be imported throughout the app
settings = Settings()