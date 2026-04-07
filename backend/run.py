import sys
import os
import multiprocessing
import uvicorn

# Ensure the backend directory is in the path
sys.path.insert(0, os.path.dirname(__file__))

from app.main import app
from app.database import engine, Base

if __name__ == "__main__":
    multiprocessing.freeze_support()
    
    # Ensure tables exists (Alembic might not have run if it's first run in a new path)
    Base.metadata.create_all(bind=engine)
    
    # Start the server using the app object directly
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
