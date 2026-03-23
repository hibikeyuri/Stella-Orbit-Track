"""Structured logging configuration for Stella Orbit Track."""

import logging
import sys


def setup_logging(level: int = logging.INFO) -> None:
    """Configure root logger with structured format and silence noisy libraries."""
    logging.basicConfig(
        level=level,
        format="%(asctime)s  %(levelname)-8s  [%(name)s]  %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
        stream=sys.stderr,
        force=True,
    )
    # Silence noisy third-party loggers
    for name in ("sqlalchemy.engine", "httpx", "httpcore", "watchfiles"):
        logging.getLogger(name).setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """Return a named logger. Call setup_logging() once at startup."""
    return logging.getLogger(name)
