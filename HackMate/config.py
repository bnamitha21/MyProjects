import os

class Config:
    # Flask configuration
    SECRET_KEY = os.environ.get('SECRET_KEY', 'hackmate-secret-dev-key-12345')
    
    # MySQL database configuration
    DB_HOST = 'localhost'
    DB_USER = 'root'
    DB_PASSWORD = 'root'  # Update this if your local MySQL root user has a password
    DB_NAME = 'hackmate_db'
    
    # Upload folder for profile photos
    # Resolves to c:\Users\Namitha\OneDrive\Desktop\Hackmate\static\uploads
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'static', 'uploads')
    
    # 2MB max limit for uploaded files (e.g., profile pictures)
    MAX_CONTENT_LENGTH = 2 * 1024 * 1024
    
    # Allowed image file extensions
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
