"""
RAG (Retrieval Augmented Generation) service for knowledge base management.
Handles document indexing, vector search, and context retrieval using ChromaDB.
"""
import os
import logging
from typing import List, Dict, Any, Optional
from pathlib import Path
import chromadb
from chromadb.config import Settings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
import tiktoken

logger = logging.getLogger(__name__)


class RAGService:
    """Service for managing document embeddings and retrieval."""
    
    def __init__(self, openai_api_key: str, persist_directory: str = "./chroma_db"):
        """
        Initialize RAG service with ChromaDB.
        
        Args:
            openai_api_key: OpenAI API key for embeddings
            persist_directory: Directory to persist ChromaDB data
        """
        self.openai_api_key = openai_api_key
        self.persist_directory = persist_directory
        
        # Initialize ChromaDB client
        self.client = chromadb.PersistentClient(
            path=persist_directory,
            settings=Settings(
                anonymized_telemetry=False,
                allow_reset=True
            )
        )
        
        # Initialize OpenAI embeddings
        self.embeddings = OpenAIEmbeddings(
            openai_api_key=openai_api_key,
            model="text-embedding-3-small"
        )
        
        # Initialize text splitter
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=self._count_tokens,
            separators=["\n\n", "\n", ". ", " ", ""]
        )
        
        logger.info(f"RAG service initialized with persist directory: {persist_directory}")
    
    def _count_tokens(self, text: str) -> int:
        """Count tokens in text using tiktoken."""
        try:
            encoding = tiktoken.encoding_for_model("gpt-4")
            return len(encoding.encode(text))
        except Exception as e:
            logger.warning(f"Error counting tokens: {e}, using character count / 4")
            return len(text) // 4
    
    def _get_or_create_collection(self, user_id: str) -> chromadb.Collection:
        """
        Get or create a collection for a specific user.
        
        Args:
            user_id: User ID to create collection for
            
        Returns:
            ChromaDB collection
        """
        collection_name = f"user_{user_id.replace('-', '_')}"
        try:
            collection = self.client.get_or_create_collection(
                name=collection_name,
                metadata={"user_id": user_id}
            )
            return collection
        except Exception as e:
            logger.error(f"Error getting/creating collection for user {user_id}: {e}")
            raise
    
    async def add_document(
        self,
        user_id: str,
        document_id: str,
        text: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> int:
        """
        Add a document to the vector store.
        
        Args:
            user_id: User ID who owns the document
            document_id: Unique document identifier
            text: Document text content
            metadata: Additional metadata to store with chunks
            
        Returns:
            Number of chunks created
        """
        try:
            # Split text into chunks
            chunks = self.text_splitter.split_text(text)
            logger.info(f"Split document {document_id} into {len(chunks)} chunks")
            
            if not chunks:
                logger.warning(f"No chunks created for document {document_id}")
                return 0
            
            # Get user's collection
            collection = self._get_or_create_collection(user_id)
            
            # Generate embeddings for each chunk
            embeddings_list = await self._generate_embeddings(chunks)
            
            # Prepare metadata for each chunk
            chunk_metadata = metadata or {}
            chunk_metadata["document_id"] = document_id
            chunk_metadata["user_id"] = user_id
            
            # Create unique IDs for each chunk
            chunk_ids = [f"{document_id}_chunk_{i}" for i in range(len(chunks))]
            
            # Add to ChromaDB
            collection.add(
                ids=chunk_ids,
                embeddings=embeddings_list,
                documents=chunks,
                metadatas=[{**chunk_metadata, "chunk_index": i} for i in range(len(chunks))]
            )
            
            logger.info(f"Successfully indexed {len(chunks)} chunks for document {document_id}")
            return len(chunks)
            
        except Exception as e:
            logger.error(f"Error adding document {document_id}: {e}")
            raise
    
    async def _generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for a list of texts.
        
        Args:
            texts: List of text strings
            
        Returns:
            List of embedding vectors
        """
        try:
            embeddings = await self.embeddings.aembed_documents(texts)
            return embeddings
        except Exception as e:
            logger.error(f"Error generating embeddings: {e}")
            raise
    
    async def query(
        self,
        user_id: str,
        query_text: str,
        top_k: int = 5,
        filter_metadata: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Query the vector store for relevant chunks.
        
        Args:
            user_id: User ID to query documents for
            query_text: Query text
            top_k: Number of results to return
            filter_metadata: Optional metadata filters
            
        Returns:
            List of relevant chunks with metadata
        """
        try:
            # Get user's collection
            collection = self._get_or_create_collection(user_id)
            
            # Generate query embedding
            query_embedding = await self.embeddings.aembed_query(query_text)
            
            # Query ChromaDB
            results = collection.query(
                query_embeddings=[query_embedding],
                n_results=top_k,
                where=filter_metadata
            )
            
            # Format results
            formatted_results = []
            if results and results['documents'] and len(results['documents']) > 0:
                for i in range(len(results['documents'][0])):
                    formatted_results.append({
                        "text": results['documents'][0][i],
                        "metadata": results['metadatas'][0][i] if results['metadatas'] else {},
                        "distance": results['distances'][0][i] if results['distances'] else None,
                        "document_id": results['metadatas'][0][i].get('document_id') if results['metadatas'] else None
                    })
            
            logger.info(f"Query returned {len(formatted_results)} results for user {user_id}")
            return formatted_results
            
        except Exception as e:
            logger.error(f"Error querying vector store for user {user_id}: {e}")
            raise
    
    async def delete_document(self, user_id: str, document_id: str) -> bool:
        """
        Delete all chunks for a specific document.
        
        Args:
            user_id: User ID who owns the document
            document_id: Document ID to delete
            
        Returns:
            True if successful
        """
        try:
            collection = self._get_or_create_collection(user_id)
            
            # Get all chunk IDs for this document
            results = collection.get(
                where={"document_id": document_id}
            )
            
            if results and results['ids']:
                collection.delete(ids=results['ids'])
                logger.info(f"Deleted {len(results['ids'])} chunks for document {document_id}")
            else:
                logger.warning(f"No chunks found for document {document_id}")
            
            return True
            
        except Exception as e:
            logger.error(f"Error deleting document {document_id}: {e}")
            raise
    
    async def get_document_count(self, user_id: str) -> int:
        """
        Get the number of unique documents for a user.
        
        Args:
            user_id: User ID
            
        Returns:
            Number of unique documents
        """
        try:
            collection = self._get_or_create_collection(user_id)
            results = collection.get()
            
            if results and results['metadatas']:
                unique_docs = set(meta.get('document_id') for meta in results['metadatas'] if meta.get('document_id'))
                return len(unique_docs)
            
            return 0
            
        except Exception as e:
            logger.error(f"Error getting document count for user {user_id}: {e}")
            return 0
    
    def reset_collection(self, user_id: str) -> bool:
        """
        Reset (delete) a user's entire collection.
        
        Args:
            user_id: User ID
            
        Returns:
            True if successful
        """
        try:
            collection_name = f"user_{user_id.replace('-', '_')}"
            self.client.delete_collection(name=collection_name)
            logger.info(f"Reset collection for user {user_id}")
            return True
        except Exception as e:
            logger.error(f"Error resetting collection for user {user_id}: {e}")
            return False


# Singleton instance
_rag_service: Optional[RAGService] = None


def get_rag_service(openai_api_key: str) -> RAGService:
    """
    Get or create RAG service singleton.
    
    Args:
        openai_api_key: OpenAI API key
        
    Returns:
        RAGService instance
    """
    global _rag_service
    if _rag_service is None:
        _rag_service = RAGService(openai_api_key=openai_api_key)
    return _rag_service
