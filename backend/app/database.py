from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
import os
import sys
import shutil
import time
from dotenv import load_dotenv

load_dotenv()

def get_db_path():
    # If explicitly set in environment, use that
    if os.getenv("SQLITE_DB_PATH"):
        return os.getenv("SQLITE_DB_PATH")
        
    # Standard location for persistence: %APPDATA%/DietCalc/dietcalc.db
    app_data = os.getenv('APPDATA') or os.path.expanduser('~')
    storage_dir = os.path.join(app_data, "DietCalc")
    os.makedirs(storage_dir, exist_ok=True)
    persistent_db = os.path.join(storage_dir, "dietcalc.db")

    # If the persistent DB does not exist, try to initialize it from the bundle
    if not os.path.exists(persistent_db) or os.path.getsize(persistent_db) < 50000:
        if hasattr(sys, '_MEIPASS'):
            seed_db = os.path.join(sys._MEIPASS, "backend", "data", "dietcalc.db")
        else:
            seed_db = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "dietcalc.db")
            
        if os.path.exists(seed_db):
            try:
                shutil.copy2(seed_db, persistent_db)
            except Exception as e:
                print(f"[Database] ERROR copying seed DB: {e}")
    
    return persistent_db

def create_pg_engine(url, timeout=5):
    """Attempt to create a PG engine and verify connection within timeout."""
    if not url:
        return None
    
    # Fix protocol
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    
    try:
        # Create engine with a shorter connection timeout (in seconds)
        # connect_args for psycopg2: connect_timeout
        engine = create_engine(url, connect_args={"connect_timeout": timeout})
        
        # Test connection
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            print("[Database] Successfully connected to PostgreSQL.")
            return engine
    except Exception as e:
        print(f"[Database] PostgreSQL connection failed (timeout={timeout}s): {e}")
        return None

# Database Initialization
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_pg_engine(DATABASE_URL, timeout=5)

if engine is None:
    # Fallback to SQLite
    print("[Database] Falling back to SQLite.")
    SQLALCHEMY_DATABASE_URL = f"sqlite:///{get_db_path()}"
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
