"""
Documents API endpoints for knowledge base management.
Handles document upload, listing, and deletion.
"""
import os
import logging
from pathlib import Path
from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status, BackgroundTasks
from fastapi.responses import JSONResponse

from app.core.dependencies import get_current_user, get_database
from app.models.user import UserInDB
from app.models.document import (
    DocumentInDB,
    DocumentResponse,
    DocumentListResponse,
    DocumentUploadResponse,
    DocumentStatus,
    DocumentSource
)
from app.services.document_processor import DocumentProcessor
from app.services.rag_service import get_rag_service
from app.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/documents", tags=["documents"])

# Create uploads directory if it doesn't exist
UPLOAD_DIR = Path("./uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


async def process_and_index_document(
    document_id: str,
    user_id: str,
    file_path: str,
    content_type: str,
    db
):
    """
    Background task to process document and index it in the vector store.
    
    Args:
        document_id: Document ID
        user_id: User ID
        file_path: Path to the uploaded file
        content_type: MIME type of the file
        db: Database connection
    """
    try:
        logger.info(f"Starting background processing for document {document_id}")
        
        # Update status to processing
        await db.documents.update_one(
            {"document_id": document_id},
            {"$set": {"status": DocumentStatus.PROCESSING}}
        )
        
        # Extract text from document
        text, metadata = DocumentProcessor.process_document(file_path, content_type)
        
        # Get RAG service
        rag_service = get_rag_service(settings.OPENAI_API_KEY)
        
        # Index document in vector store
        chunk_count = await rag_service.add_document(
            user_id=user_id,
            document_id=document_id,
            text=text,
            metadata={"content_type": content_type, **metadata}
        )
        
        # Update document status to indexed
        update_data = {
            "status": DocumentStatus.INDEXED,
            "indexed_at": datetime.utcnow(),
            "chunk_count": chunk_count
        }
        
        # Add metadata from extraction
        if "page_count" in metadata:
            update_data["page_count"] = metadata["page_count"]
        elif "slide_count" in metadata:
            update_data["page_count"] = metadata["slide_count"]
        
        await db.documents.update_one(
            {"document_id": document_id},
            {"$set": update_data}
        )
        
        logger.info(f"Successfully indexed document {document_id} with {chunk_count} chunks")
        
    except Exception as e:
        logger.error(f"Error processing document {document_id}: {e}")
        
        # Update status to error
        await db.documents.update_one(
            {"document_id": document_id},
            {
                "$set": {
                    "status": DocumentStatus.ERROR,
                    "error_message": str(e)
                }
            }
        )


@router.post("/upload", response_model=DocumentUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Upload a document to the knowledge base.
    
    Supported formats: PDF, DOCX, PPTX, TXT
    
    The document will be processed in the background and indexed for RAG.
    """
    try:
        # Validate file type
        if not DocumentProcessor.is_supported(file.content_type):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file type: {file.content_type}. Supported types: PDF, DOCX, PPTX, TXT"
            )
        
        # Validate file size (max 50MB)
        MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
        file_content = await file.read()
        file_size = len(file_content)
        
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large. Maximum size is 50MB"
            )
        
        # Create document record
        from uuid import uuid4
        document_id = str(uuid4())
        
        # Save file to disk
        file_extension = Path(file.filename).suffix
        safe_filename = f"{document_id}{file_extension}"
        file_path = UPLOAD_DIR / safe_filename
        
        with open(file_path, "wb") as f:
            f.write(file_content)
        
        logger.info(f"Saved file {file.filename} to {file_path}")
        
        # Create document record in database
        document = DocumentInDB(
            document_id=document_id,
            user_id=current_user.user_id,
            filename=file.filename,
            file_path=str(file_path),
            content_type=file.content_type,
            source=DocumentSource.UPLOAD,
            status=DocumentStatus.UPLOADING,
            file_size=file_size
        )
        
        await db.documents.insert_one(document.model_dump())
        
        # Schedule background processing
        background_tasks.add_task(
            process_and_index_document,
            document_id=document_id,
            user_id=current_user.user_id,
            file_path=str(file_path),
            content_type=file.content_type,
            db=db
        )
        
        return DocumentUploadResponse(
            document_id=document_id,
            filename=file.filename,
            status=DocumentStatus.PROCESSING,
            message="Document uploaded successfully and is being processed"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading document: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading document: {str(e)}"
        )


@router.get("", response_model=DocumentListResponse)
async def list_documents(
    limit: int = 20,
    offset: int = 0,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    List all documents for the current user.
    
    Supports pagination with limit and offset parameters.
    """
    try:
        # Get total count
        total = await db.documents.count_documents({"user_id": current_user.user_id})
        
        # Get documents
        cursor = db.documents.find(
            {"user_id": current_user.user_id}
        ).sort("upload_date", -1).skip(offset).limit(limit)
        
        documents = []
        async for doc in cursor:
            documents.append(DocumentResponse(
                document_id=doc["document_id"],
                filename=doc["filename"],
                content_type=doc["content_type"],
                source=doc["source"],
                status=doc["status"],
                file_size=doc.get("file_size"),
                page_count=doc.get("page_count"),
                chunk_count=doc.get("chunk_count"),
                upload_date=doc["upload_date"],
                indexed_at=doc.get("indexed_at"),
                error_message=doc.get("error_message")
            ))
        
        return DocumentListResponse(
            documents=documents,
            total=total,
            limit=limit,
            offset=offset
        )
        
    except Exception as e:
        logger.error(f"Error listing documents: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error listing documents: {str(e)}"
        )


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Get details of a specific document.
    """
    try:
        doc = await db.documents.find_one({
            "document_id": document_id,
            "user_id": current_user.user_id
        })
        
        if not doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        return DocumentResponse(
            document_id=doc["document_id"],
            filename=doc["filename"],
            content_type=doc["content_type"],
            source=doc["source"],
            status=doc["status"],
            file_size=doc.get("file_size"),
            page_count=doc.get("page_count"),
            chunk_count=doc.get("chunk_count"),
            upload_date=doc["upload_date"],
            indexed_at=doc.get("indexed_at"),
            error_message=doc.get("error_message")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting document: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting document: {str(e)}"
        )


@router.delete("/{document_id}", status_code=status.HTTP_200_OK)
async def delete_document(
    document_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Delete a document from the knowledge base.
    
    This will remove the document from the database, delete the file,
    and remove all vector embeddings.
    """
    try:
        # Find document
        doc = await db.documents.find_one({
            "document_id": document_id,
            "user_id": current_user.user_id
        })
        
        if not doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        # Delete from vector store
        try:
            rag_service = get_rag_service(settings.OPENAI_API_KEY)
            await rag_service.delete_document(current_user.user_id, document_id)
            logger.info(f"Deleted document {document_id} from vector store")
        except Exception as e:
            logger.warning(f"Error deleting from vector store: {e}")
        
        # Delete file from disk
        try:
            file_path = Path(doc["file_path"])
            if file_path.exists():
                file_path.unlink()
                logger.info(f"Deleted file {file_path}")
        except Exception as e:
            logger.warning(f"Error deleting file: {e}")
        
        # Delete from database
        await db.documents.delete_one({"document_id": document_id})
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"message": "Document deleted successfully"}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting document: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting document: {str(e)}"
        )
