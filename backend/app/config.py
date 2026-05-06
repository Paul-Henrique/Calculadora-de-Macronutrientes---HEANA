import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
DB_CONNECT_TIMEOUT = int(os.getenv("DB_CONNECT_TIMEOUT", 5))
