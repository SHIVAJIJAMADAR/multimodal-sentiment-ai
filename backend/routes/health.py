"""Service health."""

from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
def health():
    return {
        "status": "running",
        "service": "LiveLib MABSA",
        "version": "2.0.0",
    }
