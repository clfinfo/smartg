import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'super-secret-smart-reporting-key-2026')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-secret-smart-reporting-system-token')
    
    # SQLAlchemy Configuration
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///smart_reporting.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Upload Settings
    UPLOAD_FOLDER = os.path.join(os.path.abspath(os.path.dirname(__file__)), os.getenv('UPLOAD_FOLDER', 'static/uploads'))
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024 # 16 MB max limit
    
    # Google Maps API Key
    MAPS_API_KEY = os.getenv('MAPS_API_KEY', 'YOUR_API_KEY')
