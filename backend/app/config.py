from pathlib import Path

from pydantic import EmailStr
from pydantic_settings import BaseSettings, SettingsConfigDict

APP_DIR = Path(__file__).resolve().parent.parent


_base_config = SettingsConfigDict(
    env_file=APP_DIR / ".env",
    env_ignore_empty=True,
    extra="ignore",
)


class AppSettings(BaseSettings):
    APP_NAME: str = "Stella-Orbital-Track"
    APP_DOMAIN: str = "localhost:8000"
    APP_PROTOCOL: str = "http"

    CORS_ALLOWED_ORIGINS: str = ""

    DATABASE_URL: str = "sqlite+aiosqlite:///sqlite.db"

    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0

    model_config = _base_config

    @property
    def base_url(self) -> str:
        """Canonical backend URL used for email links, OAuth callbacks, etc."""
        return f"{self.APP_PROTOCOL}://{self.APP_DOMAIN}"

    @property
    def cors_origins(self) -> list[str]:
        """Parse CORS_ALLOWED_ORIGINS into a list."""
        if not self.CORS_ALLOWED_ORIGINS:
            return []
        return [o.strip() for o in self.CORS_ALLOWED_ORIGINS.split(",") if o.strip()]


class SecuritySettings(BaseSettings):
    JWT_SECRET: str
    JWT_ALGORITHM: str

    TOKEN_SAFE_SECRET: str
    TOKEN_SALT: str

    model_config = _base_config


class NotificationSettings(BaseSettings):
    MAIL_USERNAME: str
    MAIL_PASSWORD: str
    MAIL_FROM: EmailStr
    MAIL_PORT: int
    MAIL_SERVER: str
    MAIL_FROM_NAME: str

    MAIL_STARTTLS: bool = True
    MAIL_SSL_TLS: bool = False

    model_config = _base_config


class GithubSettings(BaseSettings):
    GITHUB_CLIENT_ID: str
    GITHUB_CLIENT_SECRET: str
    GITHUB_AUTHORIZATION_URL: str

    model_config = _base_config


class GoogleSettings(BaseSettings):
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    GOOGLE_AUTHORIZATION_URL: str
    GOOGLE_REDIRECT_URI: str

    model_config = _base_config


class CelestrakSettings(BaseSettings):
    CELESTRAK_BASE_URL: str
    CELESTRAK_GROUP: str
    CELESTRAK_FORMAT: str = "json"

    SATELLITE_SYNC_INTERVAL_SECONDS: int = 3600
    TLE_REFRESH_INTERVAL_SECONDS: int = 900

    model_config = _base_config


app_settings = AppSettings()
security_settings = SecuritySettings()
notification_settings = NotificationSettings()
github_settings = GithubSettings()
google_settings = GoogleSettings()
celestrak_settings = CelestrakSettings()
