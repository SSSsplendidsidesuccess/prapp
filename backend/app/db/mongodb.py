"""
MongoDB connection module using Motor (async driver).
Handles database connection lifecycle.
"""
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Global MongoDB client instance
mongodb_client: AsyncIOMotorClient = None
database = None


async def connect_to_mongo():
    """
    Connect to MongoDB Atlas using Motor async client.
    Called during FastAPI startup event.
    """
    global mongodb_client, database
    
    try:
        logger.info("Connecting to MongoDB...")
        mongodb_client = AsyncIOMotorClient(settings.MONGODB_URI)
        database = mongodb_client.get_default_database()
        
        # Test the connection
        await mongodb_client.admin.command('ping')
        logger.info("Connected to MongoDB successfully")
        
        # Create indexes
        await create_indexes()
        
    except Exception as e:
        logger.warning(f"Failed to connect to MongoDB: {e}")
        logger.warning("Server will start without database connectivity")
        # Don't raise - allow server to start without DB


async def close_mongo_connection():
    """
    Close MongoDB connection.
    Called during FastAPI shutdown event.
    """
    global mongodb_client
    
    if mongodb_client:
        logger.info("Closing MongoDB connection...")
        mongodb_client.close()
        logger.info("MongoDB connection closed")


async def ping_db() -> bool:
    """
    Test MongoDB connectivity by sending a ping command.
    Returns True if connection is successful, False otherwise.
    """
    try:
        if mongodb_client:
            await mongodb_client.admin.command('ping')
            return True
        return False
    except Exception as e:
        logger.error(f"MongoDB ping failed: {e}")
        return False


def get_database():
    """
    Get the database instance.
    Used for dependency injection in routes.
    """
    return database


async def create_indexes():
    """
    Create MongoDB indexes for efficient queries.
    Called during startup after database connection.
    """
    if database is None:
        logger.warning("Database not available, skipping index creation")
        return
    
    try:
        logger.info("Creating MongoDB indexes...")
        
        # Helper function to create index if it doesn't exist
        async def ensure_index(collection, keys, **kwargs):
            try:
                await collection.create_index(keys, **kwargs)
            except Exception as e:
                # Index might already exist, which is fine
                if "already exists" in str(e) or "IndexKeySpecsConflict" in str(e):
                    logger.debug(f"Index already exists: {keys}")
                else:
                    raise
        
        # Users collection indexes
        await ensure_index(database.users, "user_id", unique=True)
        await ensure_index(database.users, "email", unique=True, sparse=True)
        logger.info("Ensured indexes for users collection")
        
        # PRDs collection indexes
        await ensure_index(database.prds, "prd_id", unique=True)
        await ensure_index(database.prds, "user_id")
        await ensure_index(database.prds, [("user_id", 1), ("status", 1)])
        await ensure_index(database.prds, [("user_id", 1), ("created_at", -1)])
        await ensure_index(database.prds, [("user_id", 1), ("updated_at", -1)])
        logger.info("Ensured indexes for prds collection")
        
        # Evaluations collection indexes
        await ensure_index(database.evaluations, "evaluation_id", unique=True)
        await ensure_index(database.evaluations, "prd_id", unique=True)
        await ensure_index(database.evaluations, "user_id")
        await ensure_index(database.evaluations, [("user_id", 1), ("created_at", -1)])
        await ensure_index(database.evaluations, [("user_id", 1), ("overall_score", -1)])
        logger.info("Ensured indexes for evaluations collection")
        
        # Sessions collection indexes
        await ensure_index(database.sessions, "session_id", unique=True)
        await ensure_index(database.sessions, "user_id")
        await ensure_index(database.sessions, [("user_id", 1), ("status", 1)])
        await ensure_index(database.sessions, [("user_id", 1), ("created_at", -1)])
        await ensure_index(database.sessions, [("user_id", 1), ("preparation_type", 1)])
        logger.info("Ensured indexes for sessions collection")
        
        # Session evaluations collection indexes
        await ensure_index(database.session_evaluations, "evaluation_id", unique=True)
        await ensure_index(database.session_evaluations, "session_id", unique=True)
        await ensure_index(database.session_evaluations, "user_id")
        await ensure_index(database.session_evaluations, [("user_id", 1), ("created_at", -1)])
        await ensure_index(database.session_evaluations, [("user_id", 1), ("overall_score", -1)])
        logger.info("Ensured indexes for session_evaluations collection")
        
        # Additional indexes for analytics queries
        await ensure_index(database.prds, [("user_id", 1), ("status", 1), ("created_at", -1)])
        await ensure_index(database.prds, [("title", "text"), ("description", "text")])
        logger.info("Ensured text search indexes for prds collection")
        
        logger.info("All indexes ensured successfully")
        
    except Exception as e:
        logger.error(f"Error creating indexes: {e}")
        # Don't raise - allow server to continue even if index creation fails