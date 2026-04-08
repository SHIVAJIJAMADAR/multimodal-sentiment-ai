"""
vision.py — Visual sentiment analysis via image brightness, saturation,
and visual complexity.

Pure heuristic approach using OpenCV + NumPy.
No deep learning models.
"""

from __future__ import annotations

import numpy as np
import cv2


class VisualAnalyzer:
    """
    Produces a visual sentiment score from raw image bytes.

    Visual cues used
    ----------------
    1. Brightness (Value channel in HSV)
    2. Saturation (colour intensity)
    3. Edge density (visual complexity)

    Bright and colourful scenes → positive
    Dark / dull / cluttered scenes → negative
    """

    _BRIGHTNESS_WEIGHT: float = 0.5
    _SATURATION_WEIGHT: float = 0.3
    _EDGE_WEIGHT: float = 0.2

    def analyze(self, image_bytes: bytes) -> float:
        """
        Return a sentiment score in [-1, 1] for an uploaded image.
        """

        buf = np.frombuffer(image_bytes, dtype=np.uint8)
        img = cv2.imdecode(buf, cv2.IMREAD_COLOR)

        if img is None:
            raise ValueError("Could not decode image bytes.")

        # Resize for consistent processing speed
        img = self._resize_image(img)

        # HSV conversion
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

        mean_saturation = float(hsv[:, :, 1].mean()) / 255.0
        mean_brightness = float(hsv[:, :, 2].mean()) / 255.0

        edge_density = self._compute_edge_density(img)

        # Weighted heuristic combination
        raw = (
            self._BRIGHTNESS_WEIGHT * mean_brightness
            + self._SATURATION_WEIGHT * mean_saturation
            - self._EDGE_WEIGHT * edge_density
        )

        visual_score = 2 * raw - 1

        return float(np.clip(visual_score, -1.0, 1.0))

    # ------------------------------------------------------------------
    # Helper functions
    # ------------------------------------------------------------------

    def _resize_image(self, img: np.ndarray) -> np.ndarray:
        """
        Resize large images for faster processing.
        """
        max_size = 512

        h, w = img.shape[:2]

        if max(h, w) > max_size:

            scale = max_size / max(h, w)

            new_w = int(w * scale)
            new_h = int(h * scale)

            img = cv2.resize(img, (new_w, new_h))

        return img

    def _compute_edge_density(self, img: np.ndarray) -> float:
        """
        Calculate edge density using Canny edge detection.
        High edge density → clutter → slightly negative sentiment.
        """

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        edges = cv2.Canny(gray, 100, 200)

        edge_pixels = np.count_nonzero(edges)

        total_pixels = edges.size

        density = edge_pixels / total_pixels

        return float(density)