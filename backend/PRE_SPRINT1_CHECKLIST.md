# Pre-Sprint 1 Testing Checklist

Before starting Sprint 1, please verify the following:

## ✅ 1. Dependencies Installation

Run this command to verify all packages are installed:
```bash
pip list | grep -E "(langchain|chromadb|pypdf|python-docx|python-pptx|tiktoken)"
```

**Expected output should include:**
- langchain
- langchain-openai
- chromadb
- pypdf
- python-docx
- python-pptx
- tiktoken
- unstructured

## ✅ 2. Model Imports Test

Run this Python command to test model imports:
```bash
python -c "
from app.models.session import DealStage, SessionCreate, ChatMessage
from app.models.user import CompanyProfile, UserProfileUpdate
from app.models.document import DocumentCreate, TalkPointCreate
print('✅ All models import successfully')
"
```

## ✅ 3. RAG Service Import Test

Run this Python command to test RAG service:
```bash
python -c "
from app.services.rag_service import RAGService
print('✅ RAG service imports successfully')
"
```

## ✅ 4. Environment Variables

Verify your `.env` file contains:
```bash
cat .env | grep OPENAI_API_KEY
```

**Required:**
- `OPENAI_API_KEY` - For embeddings and AI features
- `MONGODB_URL` - For database connection
- `JWT_SECRET_KEY` - For authentication

## ✅ 5. Existing App Still Works

Start the FastAPI server:
```bash
uvicorn app.main:app --reload
```

Then test these endpoints:
- `GET http://localhost:8000/health` - Should return 200 OK
- `POST http://localhost:8000/api/v1/auth/register` - Should work
- `POST http://localhost:8000/api/v1/auth/login` - Should work

## ✅ 6. Database Connection

Verify MongoDB connection:
```bash
python -c "
import asyncio
from app.db.mongodb import get_database
async def test():
    db = await get_database()
    print(f'✅ Connected to database: {db.name}')
asyncio.run(test())
"
```

## ✅ 7. ChromaDB Directory

Check that ChromaDB can create its directory:
```bash
python -c "
import chromadb
from chromadb.config import Settings
client = chromadb.PersistentClient(path='./test_chroma', settings=Settings(anonymized_telemetry=False))
print('✅ ChromaDB initialized successfully')
import shutil
shutil.rmtree('./test_chroma')
print('✅ Test directory cleaned up')
"
```

## ✅ 8. Document Processing Libraries

Test document processing imports:
```bash
python -c "
import pypdf
from docx import Document
from pptx import Presentation
print('✅ All document processing libraries available')
"
```

## 🔧 Quick Fix Commands

If any tests fail, try these:

### Reinstall dependencies:
```bash
pip install -r requirements.txt --upgrade
```

### Clear Python cache:
```bash
find . -type d -name __pycache__ -exec rm -r {} +
find . -type f -name "*.pyc" -delete
```

### Verify Python version (should be 3.9+):
```bash
python --version
```

## 📋 Manual Testing Steps

### Test 1: Model Validation
1. Open Python REPL: `python`
2. Run:
```python
from app.models.session import DealStage
print(list(DealStage))
# Should show: [Prospecting, Discovery, Qualification, Proposal, Negotiation, Closing, Follow-up]
```

### Test 2: RAG Service Basic Test
1. Create a test file `test_rag_quick.py`:
```python
import asyncio
import os
from app.services.rag_service import RAGService

async def test():
    api_key = os.getenv("OPENAI_API_KEY", "test-key")
    rag = RAGService(api_key, "./test_db")
    print("✅ RAG service created")
    
    # Cleanup
    import shutil
    if os.path.exists("./test_db"):
        shutil.rmtree("./test_db")
    print("✅ Test complete")

asyncio.run(test())
```

2. Run: `python test_rag_quick.py`

## ✅ Ready for Sprint 1?

Once all checks pass, you're ready to proceed with Sprint 1!

Sprint 1 will implement:
- Document upload API endpoints
- Text extraction from files
- Vector indexing integration
- Knowledge base UI

## 🚨 Common Issues & Solutions

### Issue: ChromaDB import error
**Solution:** 
```bash
pip uninstall chromadb
pip install chromadb==0.4.22
```

### Issue: langchain version conflicts
**Solution:**
```bash
pip install langchain==0.1.0 langchain-openai==0.0.2 --force-reinstall
```

### Issue: OpenAI API key not found
**Solution:** Add to `.env` file:
```
OPENAI_API_KEY=sk-your-key-here
```

### Issue: MongoDB connection fails
**Solution:** Check MongoDB is running and URL is correct in `.env`

## 📝 Notes

- All tests should be run from the backend directory
- Make sure virtual environment is activated
- Keep the test outputs for reference
- If RAG service test fails due to missing API key, it's okay - we'll use it in Sprint 1

---

**Status**: Ready to proceed once all ✅ checks pass
