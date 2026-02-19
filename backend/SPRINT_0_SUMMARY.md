# Sprint 0 Summary: Environment & Pivot Setup

## Completion Date
February 19, 2026

## Overview
Sprint 0 focused on pivoting the existing Interview Prep application to a Sales Call Preparation Platform. This sprint established the foundation for RAG (Retrieval Augmented Generation) capabilities and updated data models to support sales-specific features.

## Completed Tasks

### Task 0.1: Clean & Refactor Models ✅

#### Updated `app/models/session.py`
- **Added `DealStage` Enum**: Supports B2B sales lifecycle stages
  - Prospecting
  - Discovery
  - Qualification
  - Proposal
  - Negotiation
  - Closing
  - Follow-up

- **Enhanced `ChatMessage` Model**: Added `retrieved_context_ids` field for RAG tracing
  - Tracks which documents were used to generate AI responses
  - Enables transparency and citation of sources

- **Updated `SessionSetup` and `SessionCreate` Models**: Added sales-specific fields
  - `customer_name`: Target customer/prospect name
  - `customer_persona`: Customer persona (e.g., "Skeptical CFO", "Technical CTO")
  - `deal_stage`: Current stage in sales lifecycle

#### Updated `app/models/user.py`
- **Added `CompanyProfile` Model**: Structured company/product information
  - `name`: Company or product name
  - `description`: Company background or product description
  - `value_proposition`: Key value proposition or USPs
  - `industry`: Industry or market segment

- **Enhanced `UserInDB` Model**: Added `company_profile` field
- **Updated `UserResponse` Model**: Includes company profile in API responses
- **Enhanced `UserProfileUpdate` Model**: Allows updating company profile

### Task 0.2: RAG Dependencies & Setup ✅

#### Created `app/models/document.py`
Comprehensive document management models:

- **`DocumentStatus` Enum**: uploading, processing, indexed, error
- **`DocumentSource` Enum**: upload, google_drive, sharepoint
- **`DocumentCreate`**: Schema for creating document records
- **`DocumentInDB`**: Complete document database schema with metadata
  - Tracks file path, content type, source, status
  - Includes file_size, page_count, chunk_count
  - Timestamps for upload and indexing completion
- **`DocumentResponse`**: API response schema
- **`DocumentListResponse`**: Paginated list response
- **`DocumentUploadResponse`**: Upload confirmation response

**Talk Points Models**:
- **`TalkPointCreate`**: Schema for generating talk points
- **`TalkPointInDB`**: Database schema for stored talk points
- **`TalkPointResponse`**: API response schema

#### Created `app/services/rag_service.py`
Full-featured RAG service with ChromaDB integration:

**Key Features**:
- **ChromaDB Integration**: Persistent vector database for embeddings
- **OpenAI Embeddings**: Uses `text-embedding-3-small` model
- **Smart Text Chunking**: RecursiveCharacterTextSplitter with:
  - 1000 token chunks
  - 200 token overlap
  - Token-aware splitting using tiktoken

**Core Methods**:
- `add_document()`: Index documents with vector embeddings
- `query()`: Semantic search with top-k results
- `delete_document()`: Remove document and all chunks
- `get_document_count()`: Count unique documents per user
- `reset_collection()`: Clear user's entire collection

**Architecture**:
- User-specific collections (multi-tenant isolation)
- Metadata tracking for document tracing
- Async/await support for performance
- Comprehensive error handling and logging

#### Updated `requirements.txt`
Added new dependencies:

**RAG & Vector Database**:
- `langchain==0.1.0`: LLM application framework
- `langchain-openai==0.0.2`: OpenAI integration for LangChain
- `chromadb==0.4.22`: Vector database
- `tiktoken==0.5.2`: Token counting

**Document Processing**:
- `pypdf==3.17.4`: PDF text extraction
- `python-docx==1.1.0`: Word document processing
- `python-pptx==0.6.23`: PowerPoint processing
- `unstructured==0.11.8`: Universal document parser

**Note**: `python-multipart==0.0.6` was already present for file uploads

#### Installed Dependencies ✅
All new dependencies successfully installed via `pip install -r requirements.txt`

## Architecture Decisions

### Multi-Tenant Vector Storage
- Each user gets their own ChromaDB collection
- Collection naming: `user_{user_id}` (with hyphens replaced by underscores)
- Ensures data isolation and privacy

### Embedding Strategy
- Using OpenAI's `text-embedding-3-small` for cost-effectiveness
- Chunk size: 1000 tokens (optimal for retrieval quality vs. cost)
- Overlap: 200 tokens (maintains context across chunks)

### Document Processing Pipeline
1. Upload → 2. Text Extraction → 3. Chunking → 4. Embedding → 5. Indexing
- Status tracking at each stage
- Error handling with detailed error messages
- Metadata preservation throughout pipeline

## Database Schema Updates

### `users` Collection
```json
{
  "company_profile": {
    "name": "string",
    "description": "string",
    "value_proposition": "string",
    "industry": "string"
  }
}
```

### `sessions` Collection
```json
{
  "config": {
    "customer_name": "string",
    "customer_persona": "string",
    "deal_stage": "Discovery|Proposal|etc."
  },
  "transcript": [
    {
      "role": "user|ai",
      "message": "string",
      "timestamp": "datetime",
      "retrieved_context_ids": ["doc_id_1", "doc_id_2"]
    }
  ]
}
```

### `documents` Collection (New)
```json
{
  "document_id": "uuid",
  "user_id": "uuid",
  "filename": "string",
  "file_path": "string",
  "content_type": "string",
  "source": "upload|google_drive|sharepoint",
  "status": "uploading|processing|indexed|error",
  "file_size": "int",
  "page_count": "int",
  "chunk_count": "int",
  "upload_date": "datetime",
  "indexed_at": "datetime",
  "error_message": "string"
}
```

### `talk_points` Collection (New)
```json
{
  "talk_point_id": "uuid",
  "user_id": "uuid",
  "customer_name": "string",
  "customer_persona": "string",
  "deal_stage": "string",
  "context": "string",
  "generated_content": "markdown",
  "created_at": "datetime"
}
```

## Files Modified/Created

### Modified Files
1. [`app/models/session.py`](app/models/session.py) - Added sales-specific fields and RAG support
2. [`app/models/user.py`](app/models/user.py) - Added company profile support
3. [`requirements.txt`](requirements.txt) - Added RAG and document processing dependencies

### New Files
1. [`app/models/document.py`](app/models/document.py) - Document and talk point models
2. [`app/services/rag_service.py`](app/services/rag_service.py) - RAG service with ChromaDB

## Next Steps: Sprint 1

Sprint 1 will focus on **Knowledge Base (RAG Core)**:

### Planned Tasks
1. **Document Upload Backend**
   - Create document upload API endpoint (`POST /api/v1/documents/upload`)
   - Implement file saving logic
   - Integrate text extraction (PyPDF, python-docx, python-pptx)

2. **Vector Indexing**
   - Connect upload endpoint to RAG service
   - Implement background processing for large documents
   - Add status updates during indexing

3. **Knowledge Base UI**
   - Create knowledge base management page
   - Implement file upload interface
   - Display document list with status indicators
   - Add delete functionality

4. **Cloud Storage Integration** (if time permits)
   - Google Drive OAuth integration
   - SharePoint authentication
   - File sync functionality

## Technical Notes

### ChromaDB Persistence
- Data persisted to `./chroma_db` directory
- Survives application restarts
- Backup strategy needed for production

### Performance Considerations
- Embedding generation is async for better performance
- Batch processing recommended for multiple documents
- Consider rate limiting for OpenAI API calls

### Security Considerations
- User data isolation via separate collections
- File upload validation needed (file size, type)
- Sanitize filenames to prevent path traversal

## Testing Recommendations

Before Sprint 1:
1. Test RAG service with sample documents
2. Verify ChromaDB persistence across restarts
3. Test embedding generation with various text sizes
4. Validate user collection isolation
5. Test error handling for malformed documents

## Conclusion

Sprint 0 successfully established the foundation for the Sales Call Prep platform pivot. All core models, services, and dependencies are in place to support RAG-powered features. The architecture supports multi-tenant isolation, comprehensive document management, and efficient vector search capabilities.

**Status**: ✅ Complete and ready for Sprint 1
