from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from scalar_fastapi import get_scalar_api_reference

from app.api.router import master_router
from app.config import app_settings
from app.database.session import create_db_tables
from app.worker.tasks import start_scheduler, stop_scheduler

# Dev-friendly regex: always allow localhost / 127.0.0.1 (any port)
# and Cloudflare quick-tunnel subdomains.
_DEV_ORIGIN_REGEX = (
    r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$"
    r"|^https://[a-z0-9-]+\.trycloudflare\.com$"
)


@asynccontextmanager
async def lifespan_handler(app: FastAPI):
    await create_db_tables()
    await start_scheduler(app)
    yield
    await stop_scheduler(app)


app = FastAPI(lifespan=lifespan_handler)


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "data": None,
            "error": {
                "code": exc.status_code,
                "message": exc.detail,
            },
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "data": None,
            "error": {
                "code": 422,
                "message": "Validation error",
                "details": exc.errors(),
            },
        },
    )


app.add_middleware(
    CORSMiddleware,
    allow_origins=app_settings.cors_origins,  # production origins from .env
    allow_origin_regex=_DEV_ORIGIN_REGEX,  # dev / tunnel origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(master_router)


@app.get("/scalar", include_in_schema=False)
def get_scalar_docs():
    return get_scalar_api_reference(
        openapi_url=app.openapi_url,
        title="Scalar API",
    )
