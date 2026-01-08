"""
Peeping Tom Detector using Google Cloud Vision API.
Detects multiple faces to alert users about privacy concerns.
"""

import base64
from services.gcp_client import gcp_client


class PeepingTomDetector:
    """
    Face detection for privacy protection using Cloud Vision API.
    """
    
    def detect_faces(self, image_content: bytes) -> dict:
        """
        Detect faces in an image.
        
        Args:
            image_content: Image bytes
            
        Returns:
            dict with face detection results
        """
        if not image_content:
            return {
                'success': False,
                'error': 'No image content provided',
                'faces': [],
                'face_count': 0,
                'alert': False
            }
        
        # Use the centralized GCP client
        result = gcp_client.detect_faces(image_content)
        
        if result.get('success'):
            face_count = result.get('face_count', 0)
            return {
                'success': True,
                'faces': result.get('faces', []),
                'face_count': face_count,
                'alert': face_count > 1,  # Alert if more than one face
                'alert_message': f"Warning: {face_count} faces detected!" if face_count > 1 else None
            }
        else:
            return {
                'success': False,
                'error': result.get('error', 'Face detection failed'),
                'faces': [],
                'face_count': 0,
                'alert': False
            }
    
    def detect_from_base64(self, image_base64: str) -> dict:
        """
        Detect faces from base64-encoded image.
        
        Args:
            image_base64: Base64-encoded image
            
        Returns:
            dict with face detection results
        """
        try:
            # Remove data URL prefix if present
            if ',' in image_base64:
                image_base64 = image_base64.split(',')[1]
            
            image_content = base64.b64decode(image_base64)
            return self.detect_faces(image_content)
        except Exception as e:
            return {
                'success': False,
                'error': f'Failed to decode image: {str(e)}',
                'faces': [],
                'face_count': 0,
                'alert': False
            }
    
    def analyze_privacy_risk(self, image_base64: str) -> dict:
        """
        Analyze privacy risk from camera feed.
        
        Args:
            image_base64: Base64-encoded image from webcam
            
        Returns:
            dict with risk analysis
        """
        result = self.detect_from_base64(image_base64)
        
        if not result.get('success'):
            return result
        
        face_count = result.get('face_count', 0)
        
        # Determine risk level
        if face_count == 0:
            risk_level = 'low'
            risk_message = 'No faces detected'
        elif face_count == 1:
            risk_level = 'low'
            risk_message = 'Only you are visible'
        elif face_count == 2:
            risk_level = 'medium'
            risk_message = 'Someone else may be watching your screen'
        else:
            risk_level = 'high'
            risk_message = f'Multiple people ({face_count}) detected near your screen'
        
        return {
            'success': True,
            'face_count': face_count,
            'risk_level': risk_level,
            'risk_message': risk_message,
            'should_alert': face_count > 1,
            'faces': result.get('faces', [])
        }


# Global instance
peeping_tom_detector = PeepingTomDetector()
