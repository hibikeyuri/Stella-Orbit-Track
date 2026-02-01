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
    CELESTRAK_FORMAT: str

    SATELLITE_SYNC_INTERVAL_SECONDS: int = 3600
    TLE_REFRESH_INTERVAL_SECONDS: int = 900

    model_config = _base_config


app_settings = AppSettings()
security_settings = SecuritySettings()
notification_settings = NotificationSettings()
github_settings = GithubSettings()
google_settings = GoogleSettings()
celestrak_settings = CelestrakSettings()
