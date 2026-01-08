"""
End-to-End Encryption Service for De-Novo platform.
Uses RSA for key exchange and AES-GCM for message encryption.
"""

import os
import base64
import json
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.backends import default_backend


class EncryptionService:
    """
    Handles E2E encryption for messages.
    RSA-2048 for key exchange, AES-256-GCM for messages.
    """
    
    def __init__(self):
        self.key_size = 2048
        self.aes_key_size = 32  # 256 bits
    
    def generate_key_pair(self):
        """
        Generate RSA key pair for a user.
        Returns dict with public_key and private_key as PEM strings.
        """
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=self.key_size,
            backend=default_backend()
        )
        
        public_key = private_key.public_key()
        
        # Serialize keys to PEM format
        private_pem = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        ).decode('utf-8')
        
        public_pem = public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        ).decode('utf-8')
        
        return {
            'private_key': private_pem,
            'public_key': public_pem
        }
    
    def encrypt_message(self, message: str, recipient_public_key: str) -> dict:
        """
        Encrypt a message for a recipient.
        Uses hybrid encryption: AES-GCM for message, RSA for AES key.
        
        Returns dict with:
        - encrypted_content: Base64 encoded encrypted message
        - encrypted_key: Base64 encoded encrypted AES key
        - nonce: Base64 encoded nonce
        """
        # Generate random AES key and nonce
        aes_key = AESGCM.generate_key(bit_length=256)
        nonce = os.urandom(12)  # 96 bits for GCM
        
        # Encrypt message with AES-GCM
        aesgcm = AESGCM(aes_key)
        encrypted_content = aesgcm.encrypt(
            nonce,
            message.encode('utf-8'),
            None  # No additional authenticated data
        )
        
        # Encrypt AES key with recipient's RSA public key
        public_key = serialization.load_pem_public_key(
            recipient_public_key.encode('utf-8'),
            backend=default_backend()
        )
        
        encrypted_key = public_key.encrypt(
            aes_key,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )
        
        return {
            'encrypted_content': base64.b64encode(encrypted_content).decode('utf-8'),
            'encrypted_key': base64.b64encode(encrypted_key).decode('utf-8'),
            'nonce': base64.b64encode(nonce).decode('utf-8')
        }
    
    def decrypt_message(
        self,
        encrypted_content: str,
        encrypted_key: str,
        nonce: str,
        private_key: str
    ) -> str:
        """
        Decrypt a message using the recipient's private key.
        
        Args:
            encrypted_content: Base64 encoded encrypted message
            encrypted_key: Base64 encoded encrypted AES key
            nonce: Base64 encoded nonce
            private_key: PEM encoded private key
            
        Returns:
            Decrypted message string
        """
        # Decode base64 values
        encrypted_content_bytes = base64.b64decode(encrypted_content)
        encrypted_key_bytes = base64.b64decode(encrypted_key)
        nonce_bytes = base64.b64decode(nonce)
        
        # Decrypt AES key with RSA private key
        priv_key = serialization.load_pem_private_key(
            private_key.encode('utf-8'),
            password=None,
            backend=default_backend()
        )
        
        aes_key = priv_key.decrypt(
            encrypted_key_bytes,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )
        
        # Decrypt message with AES-GCM
        aesgcm = AESGCM(aes_key)
        decrypted_content = aesgcm.decrypt(
            nonce_bytes,
            encrypted_content_bytes,
            None
        )
        
        return decrypted_content.decode('utf-8')
    
    def encrypt_for_storage(self, data: str, storage_key: bytes = None) -> dict:
        """
        Encrypt data for secure storage (not E2E, just storage encryption).
        
        Args:
            data: String data to encrypt
            storage_key: Optional AES key, generates new if not provided
            
        Returns:
            Dict with encrypted_data, nonce, and key (if generated)
        """
        if storage_key is None:
            storage_key = AESGCM.generate_key(bit_length=256)
            include_key = True
        else:
            include_key = False
        
        nonce = os.urandom(12)
        aesgcm = AESGCM(storage_key)
        encrypted = aesgcm.encrypt(nonce, data.encode('utf-8'), None)
        
        result = {
            'encrypted_data': base64.b64encode(encrypted).decode('utf-8'),
            'nonce': base64.b64encode(nonce).decode('utf-8')
        }
        
        if include_key:
            result['key'] = base64.b64encode(storage_key).decode('utf-8')
        
        return result
    
    def decrypt_from_storage(
        self,
        encrypted_data: str,
        nonce: str,
        storage_key: str
    ) -> str:
        """
        Decrypt data from storage.
        
        Args:
            encrypted_data: Base64 encoded encrypted data
            nonce: Base64 encoded nonce
            storage_key: Base64 encoded AES key
            
        Returns:
            Decrypted string
        """
        encrypted_bytes = base64.b64decode(encrypted_data)
        nonce_bytes = base64.b64decode(nonce)
        key_bytes = base64.b64decode(storage_key)
        
        aesgcm = AESGCM(key_bytes)
        decrypted = aesgcm.decrypt(nonce_bytes, encrypted_bytes, None)
        
        return decrypted.decode('utf-8')


# Global instance
encryption_service = EncryptionService()


def generate_user_keys():
    """Generate encryption keys for a new user."""
    return encryption_service.generate_key_pair()


def encrypt_message(message: str, recipient_public_key: str) -> dict:
    """Encrypt a message for a recipient."""
    return encryption_service.encrypt_message(message, recipient_public_key)


def decrypt_message(
    encrypted_content: str,
    encrypted_key: str,
    nonce: str,
    private_key: str
) -> str:
    """Decrypt a message."""
    return encryption_service.decrypt_message(
        encrypted_content,
        encrypted_key,
        nonce,
        private_key
    )
