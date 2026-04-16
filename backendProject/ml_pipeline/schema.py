from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class SearchQueryObject(BaseModel):
    type: str = Field(..., description="Query object type, e.g. packaged or non-packaged.")
    name: str = Field(..., description="Resolved grocery item name.")
    attributes: dict[str, Any] = Field(
        default_factory=dict,
        description="Additional retrieval attributes used by the retriever.",
    )


class FinalOutput(BaseModel):
    item_name: str = Field(..., description="Predicted grocery item name.")
    category: str = Field(..., description="Item category or routing outcome.")
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    carbon_footprint_kg: float = Field(..., ge=0.0)
    source_note: str = Field(..., description="Information about the footprint source.")
