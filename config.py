import os

class Config:
    """Flask configuration for PGD application"""
    
    # Database Configuration
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///pgd.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Flask Configuration
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'pgd-dev-secret-key-2025-secure'
    JSON_SORT_KEYS = False
    
    # Session Configuration
    SESSION_COOKIE_SECURE = False  # Set to True in production (HTTPS only)
    SESSION_COOKIE_HTTPONLY = True  # Prevent JS access
    SESSION_COOKIE_SAMESITE = 'Lax'
    PERMANENT_SESSION_LIFETIME = 86400  # 24 hours
    
    # Admin Credentials (Username: admin, Password: pgd@2025)
    ADMIN_USERNAME = os.environ.get('ADMIN_USERNAME') or 'admin'
    ADMIN_PASSWORD_HASH = 'scrypt:32768:8:1$VLH9cqB43GtMcz3r$998e08c0bce0fa875ea6c42bf1e9eedb45c8160f83951a81c520ead3063b6920861de97995b123894c65ac5500979a8c520fb512270ebf4298090a57a45225cc'

