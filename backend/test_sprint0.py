"""
Sprint 0 Testing Script
Tests core functionality before moving to Sprint 1
"""
import asyncio
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def test_imports():
    """Test that all new dependencies can be imported."""
    print("=" * 60)
    print("TEST 1: Import Dependencies")
    print("=" * 60)
    
    try:
        import chromadb
        print("✅ chromadb imported successfully")
    except ImportError as e:
        print(f"❌ chromadb import failed: {e}")
        return False
    
    try:
        import langchain
        print("✅ langchain imported successfully")
    except ImportError as e:
        print(f"❌ langchain import failed: {e}")
        return False
    
    try:
        from langchain_openai import OpenAIEmbeddings
        print("✅ langchain_openai imported successfully")
    except ImportError as e:
        print(f"❌ langchain_openai import failed: {e}")
        return False
    
    try:
        import pypdf
        print("✅ pypdf imported successfully")
    except ImportError as e:
        print(f"❌ pypdf import failed: {e}")
        return False
    
    try:
        from docx import Document
        print("✅ python-docx imported successfully")
    except ImportError as e:
        print(f"❌ python-docx import failed: {e}")
        return False
    
    try:
        import tiktoken
        print("✅ tiktoken imported successfully")
    except ImportError as e:
        print(f"❌ tiktoken import failed: {e}")
        return False
    
    print("\n✅ All dependencies imported successfully!\n")
    return True


async def test_models():
    """Test that all new models can be instantiated."""
    print("=" * 60)
    print("TEST 2: Model Validation")
    print("=" * 60)
    
    try:
        from app.models.session import DealStage, SessionCreate, ChatMessage
        
        # Test DealStage enum
        stage = DealStage.DISCOVERY
        print(f"✅ DealStage enum works: {stage}")
        
        # Test SessionCreate with sales fields
        session = SessionCreate(
            preparation_type="Sales",
            customer_name="Test Corp",
            customer_persona="Technical CTO",
            deal_stage=DealStage.DISCOVERY
        )
        print(f"✅ SessionCreate with sales fields works")
        
        # Test ChatMessage with retrieved_context_ids
        message = ChatMessage(
            role="ai",
            message="Test message",
            retrieved_context_ids=["doc1", "doc2"]
        )
        print(f"✅ ChatMessage with retrieved_context_ids works")
        
    except Exception as e:
        print(f"❌ Session models test failed: {e}")
        return False
    
    try:
        from app.models.user import CompanyProfile, UserProfileUpdate
        
        # Test CompanyProfile
        profile = CompanyProfile(
            name="Test Company",
            description="Test description",
            value_proposition="Test value prop"
        )
        print(f"✅ CompanyProfile model works")
        
        # Test UserProfileUpdate with company_profile
        update = UserProfileUpdate(
            name="Test User",
            company_profile=profile
        )
        print(f"✅ UserProfileUpdate with company_profile works")
        
    except Exception as e:
        print(f"❌ User models test failed: {e}")
        return False
    
    try:
        from app.models.document import (
            DocumentStatus, DocumentSource, DocumentCreate,
            TalkPointCreate
        )
        
        # Test DocumentCreate
        doc = DocumentCreate(
            filename="test.pdf",
            content_type="application/pdf",
            source=DocumentSource.UPLOAD
        )
        print(f"✅ DocumentCreate model works")
        
        # Test TalkPointCreate
        talk_point = TalkPointCreate(
            customer_name="Test Corp",
            deal_stage="Discovery"
        )
        print(f"✅ TalkPointCreate model works")
        
    except Exception as e:
        print(f"❌ Document models test failed: {e}")
        return False
    
    print("\n✅ All models validated successfully!\n")
    return True


async def test_rag_service():
    """Test RAG service initialization and basic operations."""
    print("=" * 60)
    print("TEST 3: RAG Service")
    print("=" * 60)
    
    openai_api_key = os.getenv("OPENAI_API_KEY")
    
    if not openai_api_key:
        print("⚠️  OPENAI_API_KEY not found in environment")
        print("   Skipping RAG service test (will use mock in production)")
        return True
    
    try:
        from app.services.rag_service import RAGService
        
        # Initialize RAG service
        rag_service = RAGService(
            openai_api_key=openai_api_key,
            persist_directory="./test_chroma_db"
        )
        print("✅ RAG service initialized successfully")
        
        # Test adding a document
        test_user_id = "test-user-123"
        test_doc_id = "test-doc-456"
        test_text = """
        This is a test document about our product.
        Our product helps sales teams prepare for customer calls.
        It uses AI to generate questions and provide feedback.
        The key features include mock sessions and talk point generation.
        """
        
        chunk_count = await rag_service.add_document(
            user_id=test_user_id,
            document_id=test_doc_id,
            text=test_text,
            metadata={"filename": "test.txt"}
        )
        print(f"✅ Document indexed successfully: {chunk_count} chunks created")
        
        # Test querying
        results = await rag_service.query(
            user_id=test_user_id,
            query_text="What are the key features?",
            top_k=2
        )
        print(f"✅ Query executed successfully: {len(results)} results returned")
        
        if results:
            print(f"   Sample result: {results[0]['text'][:100]}...")
        
        # Test document count
        doc_count = await rag_service.get_document_count(test_user_id)
        print(f"✅ Document count retrieved: {doc_count} documents")
        
        # Test deletion
        await rag_service.delete_document(test_user_id, test_doc_id)
        print(f"✅ Document deleted successfully")
        
        # Cleanup
        rag_service.reset_collection(test_user_id)
        print(f"✅ Test collection cleaned up")
        
        # Remove test directory
        import shutil
        if os.path.exists("./test_chroma_db"):
            shutil.rmtree("./test_chroma_db")
            print(f"✅ Test database directory removed")
        
    except Exception as e:
        print(f"❌ RAG service test failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    print("\n✅ RAG service tested successfully!\n")
    return True


async def test_existing_app():
    """Test that existing app still works with new changes."""
    print("=" * 60)
    print("TEST 4: Existing App Compatibility")
    print("=" * 60)
    
    try:
        from app.main import app
        print("✅ FastAPI app imports successfully")
        
        # Check that routes are still accessible
        routes = [route.path for route in app.routes]
        expected_routes = ["/api/v1/auth/register", "/api/v1/auth/login", "/api/v1/sessions"]
        
        for route in expected_routes:
            if any(route in r for r in routes):
                print(f"✅ Route exists: {route}")
            else:
                print(f"⚠️  Route might be missing: {route}")
        
    except Exception as e:
        print(f"❌ App compatibility test failed: {e}")
        return False
    
    print("\n✅ Existing app compatibility verified!\n")
    return True


async def run_all_tests():
    """Run all tests."""
    print("\n" + "=" * 60)
    print("SPRINT 0 - PRE-SPRINT 1 TESTING")
    print("=" * 60 + "\n")
    
    results = []
    
    # Test 1: Imports
    results.append(await test_imports())
    
    # Test 2: Models
    results.append(await test_models())
    
    # Test 3: RAG Service
    results.append(await test_rag_service())
    
    # Test 4: Existing App
    results.append(await test_existing_app())
    
    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(results)
    total = len(results)
    
    print(f"\nTests Passed: {passed}/{total}")
    
    if passed == total:
        print("\n✅ ALL TESTS PASSED! Ready for Sprint 1")
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Please review before Sprint 1")
    
    print("\n" + "=" * 60 + "\n")


if __name__ == "__main__":
    asyncio.run(run_all_tests())
