from typing import Dict

from .base import OAuthProvider
from .github import GitHubOAuthProvider
from .google import GoogleOAuthProvider

OAUTH_PROVIDERS: Dict[str, OAuthProvider] = {
    "github": GitHubOAuthProvider(),
    "google": GoogleOAuthProvider(),
}
