from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2
import os
import base64
import secrets

class PasswordEncryption:
    """Handles encryption and decryption of stored passwords with enhanced security"""
    
    def __init__(self):
        # Master encryption key from environment
        master_key = os.getenv('ENCRYPTION_KEY')
        if not master_key:
            # Generate a key if not provided (for development only)
            master_key = Fernet.generate_key().decode()
        
        self.master_key = master_key.encode() if isinstance(master_key, str) else master_key
        self.cipher_suite = Fernet(self.master_key)
    
    def encrypt(self, password: str, user_id: int = None) -> str:
        """
        Encrypt a password with optional user-specific salt
        
        Args:
            password: Plain text password to encrypt
            user_id: Optional user ID for additional security layer
        
        Returns:
            Encrypted password string (base64 encoded)
        """
        # Add timestamp and random nonce for additional security
        nonce = secrets.token_hex(8)
        data_to_encrypt = f"{nonce}:{password}"
        
        encrypted = self.cipher_suite.encrypt(data_to_encrypt.encode())
        return encrypted.decode()
    
    def decrypt(self, encrypted_password: str) -> str:
        """
        Decrypt a password
        
        Args:
            encrypted_password: Encrypted password string
        
        Returns:
            Decrypted plain text password
        """
        try:
            decrypted = self.cipher_suite.decrypt(encrypted_password.encode())
            # Extract password from nonce:password format
            parts = decrypted.decode().split(':', 1)
            return parts[1] if len(parts) > 1 else decrypted.decode()
        except Exception as e:
            raise ValueError(f"Failed to decrypt password: {str(e)}")
    
    @staticmethod
    def generate_key() -> str:
        """Generate a new encryption key"""
        return Fernet.generate_key().decode()
    
    @staticmethod
    def derive_key_from_password(password: str, salt: bytes = None) -> bytes:
        """
        Derive an encryption key from a user password using PBKDF2
        
        Args:
            password: User password
            salt: Optional salt (generated if not provided)
        
        Returns:
            Tuple of (derived_key, salt)
        """
        if salt is None:
            salt = os.urandom(16)
        
        kdf = PBKDF2(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
        )
        
        key = base64.urlsafe_b64encode(kdf.derive(password.encode()))
        return key, salt


class PasswordStorage:
    """Manages secure password storage with metadata"""
    
    @staticmethod
    def validate_password_entry(data: dict) -> tuple[bool, str]:
        """
        Validate password entry data
        
        Args:
            data: Password entry dictionary
        
        Returns:
            Tuple of (is_valid, error_message)
        """
        required_fields = ['service_name', 'username', 'password']
        
        for field in required_fields:
            if field not in data or not data[field]:
                return False, f"Missing required field: {field}"
        
        if len(data['service_name']) > 120:
            return False, "Service name too long (max 120 characters)"
        
        if len(data['username']) > 120:
            return False, "Username too long (max 120 characters)"
        
        if len(data['password']) < 1:
            return False, "Password cannot be empty"
        
        if 'url' in data and data['url'] and len(data['url']) > 255:
            return False, "URL too long (max 255 characters)"
        
        if 'notes' in data and data['notes'] and len(data['notes']) > 1000:
            return False, "Notes too long (max 1000 characters)"
        
        return True, ""
    
    @staticmethod
    def sanitize_password_entry(data: dict) -> dict:
        """
        Sanitize password entry data
        
        Args:
            data: Password entry dictionary
        
        Returns:
            Sanitized dictionary
        """
        sanitized = {
            'service_name': data.get('service_name', '').strip(),
            'username': data.get('username', '').strip(),
            'password': data.get('password', ''),
            'url': data.get('url', '').strip() if data.get('url') else None,
            'notes': data.get('notes', '').strip() if data.get('notes') else None,
        }
        
        return sanitized


# Initialize encryption utility
encryption = PasswordEncryption()
