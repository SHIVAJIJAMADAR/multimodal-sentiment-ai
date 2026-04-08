"""Parse and validate multimodal form requests."""

from __future__ import annotations

from typing import Optional, Tuple

from fastapi import HTTPException, UploadFile


async def read_multimodal_form(
    text: str,
    image: Optional[UploadFile],
) -> Tuple[str, Optional[bytes]]:
    if not text.strip():
        raise HTTPException(status_code=400, detail="Text input cannot be empty")

    image_bytes: Optional[bytes] = None
    if image is not None:
        if image.content_type not in ["image/jpeg", "image/png"]:
            raise HTTPException(
                status_code=400,
                detail="Only JPEG or PNG images are supported",
            )
        image_bytes = await image.read()

    return text, image_bytes
