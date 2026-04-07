import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    DATABASE_URL = os.getenv("DATABASE_URL")
    DB_CONNECT_TIMEOUT = int(os.getenv("DB_CONNECT_TIMEOUT", 5))
    
    @staticmethod
    def get_sqlite_url():
        # Fallback logic moved to database.py for better handling
        pass
