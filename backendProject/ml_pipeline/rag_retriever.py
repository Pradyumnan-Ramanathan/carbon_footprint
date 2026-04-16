from __future__ import annotations

import hashlib
import logging
import os
from dataclasses import dataclass

import numpy as np

try:
    from .schema import SearchQueryObject
except ImportError:  # pragma: no cover - fallback for direct script execution
    from schema import SearchQueryObject

try:
    from pinecone import Pinecone
except ImportError:  # pragma: no cover - pinecone is optional at runtime
    Pinecone = None  # type: ignore[assignment]


LOGGER = logging.getLogger(__name__)


@dataclass
class RetrievalResult:
    name: str
    carbon_footprint_kg: float
    source_note: str
    similarity_score: float


class InMemoryVectorStore:
    """Zero-dependency vector-store stub that imitates semantic retrieval."""

    def __init__(self) -> None:
        self._records: dict[str, float] = {
            "apple": 0.3,
            "banana": 0.4,
            "tomato": 0.5,
            "milk": 1.2,
            "whole milk": 1.2,
            "orange juice": 0.8,
            "corn flakes": 0.9,
            "generic packaged grocery item": 1.0,
        }

    def search(self, query_text: str) -> RetrievalResult:
        normalized_query = query_text.strip().lower()
        for key, value in self._records.items():
            if key in normalized_query:
                return RetrievalResult(
                    name=key,
                    carbon_footprint_kg=value,
                    source_note="Matched against mocked Agribalyse-style in-memory vector index.",
                    similarity_score=0.96,
                )

        return RetrievalResult(
            name="generic grocery item",
            carbon_footprint_kg=0.75,
            source_note="No close semantic hit found. Returned fallback footprint from mocked vector index.",
            similarity_score=0.51,
        )


class PineconeVectorStore:
    """Pinecone-backed vector search for Agribalyse-style records."""

    def __init__(self, api_key: str, index_name: str, namespace: str = "agribalyse") -> None:
        if Pinecone is None:
            raise RuntimeError("pinecone package is not installed.")

        self._namespace = namespace
        self._pc = Pinecone(api_key=api_key)
        self._index = self._pc.Index(name=index_name)

    def search(self, query_text: str) -> RetrievalResult:
        embedding = self._embed_text(query_text)
        response = self._index.query(
            vector=embedding,
            namespace=self._namespace,
            top_k=1,
            include_metadata=True,
        )

        matches = getattr(response, "matches", None) or response.get("matches", [])
        if not matches:
            return RetrievalResult(
                name="generic grocery item",
                carbon_footprint_kg=0.75,
                source_note="Pinecone query returned no matches. Using fallback carbon footprint value.",
                similarity_score=0.0,
            )

        top_match = matches[0]
        metadata = getattr(top_match, "metadata", None) or top_match.get("metadata", {})
        score = float(getattr(top_match, "score", None) or top_match.get("score", 0.0))

        item_name = str(metadata.get("name", "generic grocery item"))
        carbon_footprint = float(metadata.get("carbon_footprint_kg", 0.75))
        return RetrievalResult(
            name=item_name,
            carbon_footprint_kg=carbon_footprint,
            source_note="Matched against Pinecone Agribalyse index metadata.",
            similarity_score=score,
        )

    def _embed_text(self, query_text: str, dimension: int = 32) -> list[float]:
        """Deterministic local embedding stub for Pinecone query compatibility.

        Replace this with a production embedding model during dataset indexing.
        """

        digest = hashlib.sha256(query_text.encode("utf-8")).digest()
        repeats = (dimension + len(digest) - 1) // len(digest)
        raw = (digest * repeats)[:dimension]
        vector = np.asarray(list(raw), dtype=np.float32)
        normalized = (vector / 255.0) * 2.0 - 1.0
        norm = float(np.linalg.norm(normalized))
        if norm > 0:
            normalized = normalized / norm
        return normalized.astype(float).tolist()


class CarbonRAG:
    """RAG retriever with a vector-store interface and safe local fallback."""

    def __init__(self) -> None:
        self._vector_store = self._build_vector_store()
        self.last_source_note = "No query executed yet."

    def query(self, query_obj: SearchQueryObject) -> float:
        normalized_name = query_obj.name.strip().lower()
        LOGGER.info("Querying mocked vector DB for %s", normalized_name)

        if not normalized_name:
            LOGGER.warning("Empty query name received by retriever. Returning fallback value.")
            self.last_source_note = "Empty query name received. Returning fallback carbon footprint value."
            return 0.0

        prompt = self._build_retrieval_prompt(query_obj)
        retrieval_result = self._vector_store.search(prompt)
        self.last_source_note = retrieval_result.source_note
        return retrieval_result.carbon_footprint_kg

    def _build_retrieval_prompt(self, query_obj: SearchQueryObject) -> str:
        return (
            f"Based on the item '{query_obj.name}' which is '{query_obj.type}', "
            "retrieve the CO2e value per kg. Adjust for packaging material if present."
        )

    def _build_vector_store(self) -> InMemoryVectorStore | PineconeVectorStore:
        api_key = os.getenv("PINECONE_API_KEY", "").strip()
        index_name = os.getenv("PINECONE_INDEX_NAME", "").strip()
        namespace = os.getenv("PINECONE_NAMESPACE", "agribalyse").strip() or "agribalyse"

        if not api_key or not index_name:
            LOGGER.info("Pinecone environment not configured. Using in-memory vector store fallback.")
            return InMemoryVectorStore()

        try:
            LOGGER.info("Initializing Pinecone vector store for index '%s'.", index_name)
            return PineconeVectorStore(api_key=api_key, index_name=index_name, namespace=namespace)
        except Exception as exc:  # pragma: no cover - network/runtime issues
            LOGGER.warning("Failed to initialize Pinecone vector store. Using fallback index: %s", exc)
            return InMemoryVectorStore()
