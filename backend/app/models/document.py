"""
Document models for knowledge base management.
Handles document uploads, indexing, and metadata.
"""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import uuid4
from enum import Enum


class DocumentStatus(str, Enum):
    """Enum for document processing status."""
    UPLOADING = "uploading"
    PROCESSING = "processing"
    INDEXED = "indexed"
    ERROR = "error"


class DocumentSource(str, Enum):
    """Enum for document source type."""
    UPLOAD = "upload"
    GOOGLE_DRIVE = "google_drive"
    SHAREPOINT = "sharepoint"


class DocumentCreate(BaseModel):
    """Schema for creating a new document record."""
    filename: str = Field(..., description="Original filename")
    content_type: str = Field(..., description="MIME type (e.g., application/pdf)")
    source: DocumentSource = Field(default=DocumentSource.UPLOAD, description="Document source")
    source_metadata: Optional[Dict[str, Any]] = Field(default=None, description="Source-specific metadata (e.g., Drive file ID)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "filename": "product_overview.pdf",
                "content_type": "application/pdf",
                "source": "upload",
                "source_metadata": None
            }
        }


class DocumentInDB(BaseModel):
    """Schema for document stored in database."""
    document_id: str = Field(default_factory=lambda: str(uuid4()))
    user_id: str = Field(..., description="ID of the user who owns this document")
    filename: str
    file_path: str = Field(..., description="Local path or cloud storage URL")
    content_type: str
    source: DocumentSource
    source_metadata: Optional[Dict[str, Any]] = None
    status: DocumentStatus = Field(default=DocumentStatus.UPLOADING)
    file_size: Optional[int] = Field(None, description="File size in bytes")
    page_count: Optional[int] = Field(None, description="Number of pages (for PDFs)")
    chunk_count: Optional[int] = Field(None, description="Number of text chunks indexed")
    upload_date: datetime = Field(default_factory=datetime.utcnow)
    indexed_at: Optional[datetime] = Field(None, description="When indexing completed")
    error_message: Optional[str] = Field(None, description="Error message if status is ERROR")
    
    class Config:
        json_schema_extra = {
            "example": {
                "document_id": "770e8400-e29b-41d4-a716-446655440002",
                "user_id": "550e8400-e29b-41d4-a716-446655440000",
                "filename": "product_overview.pdf",
                "file_path": "/uploads/770e8400-e29b-41d4-a716-446655440002.pdf",
                "content_type": "application/pdf",
                "source": "upload",
                "source_metadata": None,
                "status": "indexed",
                "file_size": 1024000,
                "page_count": 15,
                "chunk_count": 45,
                "upload_date": "2026-02-19T10:00:00Z",
                "indexed_at": "2026-02-19T10:01:30Z",
                "error_message": None
            }
        }


class DocumentResponse(BaseModel):
    """Schema for document API response."""
    document_id: str
    filename: str
    content_type: str
    source: DocumentSource
    status: DocumentStatus
    file_size: Optional[int] = None
    page_count: Optional[int] = None
    chunk_count: Optional[int] = None
    upload_date: datetime
    indexed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "document_id": "770e8400-e29b-41d4-a716-446655440002",
                "filename": "product_overview.pdf",
                "content_type": "application/pdf",
                "source": "upload",
                "status": "indexed",
                "file_size": 1024000,
                "page_count": 15,
                "chunk_count": 45,
                "upload_date": "2026-02-19T10:00:00Z",
                "indexed_at": "2026-02-19T10:01:30Z",
                "error_message": None
            }
        }


class DocumentListResponse(BaseModel):
    """Schema for paginated document list response."""
    documents: list[DocumentResponse]
    total: int
    limit: int
    offset: int
    
    class Config:
        json_schema_extra = {
            "example": {
                "documents": [],
                "total": 0,
                "limit": 20,
                "offset": 0
            }
        }


class DocumentUploadResponse(BaseModel):
    """Schema for document upload response."""
    document_id: str
    filename: str
    status: DocumentStatus
    message: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "document_id": "770e8400-e29b-41d4-a716-446655440002",
                "filename": "product_overview.pdf",
                "status": "processing",
                "message": "Document uploaded successfully and is being processed"
            }
        }


class TalkPointCreate(BaseModel):
    """Schema for creating talk points."""
    customer_name: Optional[str] = Field(None, description="Target customer name")
    customer_persona: Optional[str] = Field(None, description="Customer persona or role")
    deal_stage: Optional[str] = Field(None, description="Current deal stage")
    context: Optional[str] = Field(None, description="Additional context for talk point generation")
    
    class Config:
        json_schema_extra = {
            "example": {
                "customer_name": "Acme Corp",
                "customer_persona": "Technical CTO",
                "deal_stage": "Proposal",
                "context": "Focus on security and scalability features"
            }
        }


class TalkPointInDB(BaseModel):
    """Schema for talk points stored in database."""
    talk_point_id: str = Field(default_factory=lambda: str(uuid4()))
    user_id: str = Field(..., description="ID of the user who generated this")
    customer_name: Optional[str] = None
    customer_persona: Optional[str] = None
    deal_stage: Optional[str] = None
    context: Optional[str] = None
    generated_content: str = Field(..., description="Generated talk points in Markdown format")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_schema_extra = {
            "example": {
                "talk_point_id": "880e8400-e29b-41d4-a716-446655440003",
                "user_id": "550e8400-e29b-41d4-a716-446655440000",
                "customer_name": "Acme Corp",
                "customer_persona": "Technical CTO",
                "deal_stage": "Proposal",
                "context": "Focus on security",
                "generated_content": "# Talk Points for Acme Corp\n\n## Key Messages\n...",
                "created_at": "2026-02-19T11:00:00Z"
            }
        }


class TalkPointResponse(BaseModel):
    """Schema for talk point API response."""
    talk_point_id: str
    customer_name: Optional[str] = None
    customer_persona: Optional[str] = None
    deal_stage: Optional[str] = None
    generated_content: str
    created_at: datetime
    
    class Config:
        json_schema_extra = {
            "example": {
                "talk_point_id": "880e8400-e29b-41d4-a716-446655440003",
                "customer_name": "Acme Corp",
                "customer_persona": "Technical CTO",
                "deal_stage": "Proposal",
                "generated_content": "# Talk Points\n\n## Key Messages\n- Security first...",
                "created_at": "2026-02-19T11:00:00Z"
            }
        }
