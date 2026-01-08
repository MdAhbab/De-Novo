"""
Gemma/Gemini Assistant for intelligent accessibility help.
Provides AI-powered assistance for platform navigation and message composition.
"""

import os
import json

# Try to import Google AI
try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False
    print("Warning: google-generativeai not installed.")


class GemmaAssistant:
    """
    Gemma/Gemini-powered assistant for De-Novo platform.
    
    Setup:
    1. Get API key from: https://aistudio.google.com
    2. Set GOOGLE_API_KEY environment variable
    """
    
    def __init__(self):
        self.api_key = os.environ.get('GOOGLE_API_KEY', '')
        self.model = None
        
        if GENAI_AVAILABLE and self.api_key:
            try:
                genai.configure(api_key=self.api_key)
                # Using Gemini 1.5 Flash for faster responses
                self.model = genai.GenerativeModel('gemini-1.5-flash')
            except Exception as e:
                print(f"Failed to initialize Gemini: {e}")
    
    def get_system_prompt(self) -> str:
        """Return the system prompt for the assistant."""
        return """You are a helpful assistant for De-Novo, an accessible communication platform 
for people with disabilities (visual, hearing, and speech impairments).

Your role is to:
1. Help users navigate the platform
2. Explain features in accessible, clear language
3. Provide emotional support and understanding
4. Suggest accessibility settings based on user needs
5. Help compose messages when requested

Guidelines:
- Be patient, warm, and encouraging
- Use simple, clear language
- Avoid idioms or complex phrases that might confuse non-native speakers
- When describing visual elements, be detailed for visually impaired users
- Offer alternatives when suggesting features (e.g., "You can use voice or text")
- Be sensitive to the challenges users may face
- Keep responses concise but helpful"""
    
    def chat(self, user_message: str, conversation_history: list = None) -> dict:
        """
        Chat with the assistant.
        
        Args:
            user_message: User's message
            conversation_history: List of previous messages [{'role': 'user/assistant', 'content': '...'}]
        
        Returns:
            dict with response and success status
        """
        if not user_message:
            return {
                'success': False,
                'response': 'Please provide a message.',
                'error': 'Empty message'
            }
        
        if not self.model:
            return self._fallback_response(user_message)
        
        try:
            # Build conversation with system prompt
            messages = []
            
            # Add system prompt as first user message
            messages.append({
                'role': 'user',
                'parts': [self.get_system_prompt()]
            })
            messages.append({
                'role': 'model',
                'parts': ['I understand. I\'m here to help users of De-Novo platform with accessibility needs. How can I assist you today?']
            })
            
            # Add conversation history
            if conversation_history:
                for msg in conversation_history[-10:]:  # Last 10 messages
                    role = 'user' if msg['role'] == 'user' else 'model'
                    messages.append({
                        'role': role,
                        'parts': [msg['content']]
                    })
            
            # Start chat with history
            chat = self.model.start_chat(history=messages)
            response = chat.send_message(user_message)
            
            return {
                'success': True,
                'response': response.text
            }
        except Exception as e:
            print(f"Assistant chat error: {e}")
            return self._fallback_response(user_message)
    
    def help_compose_message(self, intent: str, context: str = None, 
                            tone: str = 'friendly') -> dict:
        """
        Help users compose messages.
        
        Args:
            intent: What the user wants to communicate
            context: Additional context about the conversation
            tone: Desired tone (friendly, formal, casual, apologetic)
        
        Returns:
            dict with message suggestions
        """
        if not intent:
            return {
                'success': False,
                'suggestions': [],
                'error': 'Please describe what you want to say'
            }
        
        if not self.model:
            return {
                'success': True,
                'suggestions': [
                    f"Here's a {tone} way to express that: {intent}",
                    f"You could say: {intent}",
                    f"Another option: {intent}"
                ]
            }
        
        try:
            prompt = f"""Help compose a message with the following intent: {intent}

{"Context: " + context if context else ""}
Desired tone: {tone}

Provide exactly 3 different message options that express this intent.
Make them clear, {tone}, and appropriate for someone with disabilities who may use assistive technology.
Keep each option under 200 characters.

Respond in JSON format:
{{"suggestions": ["option1", "option2", "option3"]}}
"""
            
            response = self.model.generate_content(prompt)
            response_text = response.text.strip()
            
            # Clean markdown if present
            if response_text.startswith('```'):
                response_text = response_text.split('```')[1]
                if response_text.startswith('json'):
                    response_text = response_text[4:]
            
            result = json.loads(response_text)
            
            return {
                'success': True,
                'suggestions': result.get('suggestions', [])
            }
        except Exception as e:
            print(f"Message composition error: {e}")
            return {
                'success': True,
                'suggestions': [
                    f"Here's one way to say it: {intent}",
                    f"You could also try: {intent}",
                    f"Or simply: {intent}"
                ]
            }
    
    def explain_for_accessibility(self, content: str, impairment_type: str) -> dict:
        """
        Explain content in an accessible way.
        
        Args:
            content: Content to explain
            impairment_type: 'visual', 'hearing', or 'speech'
        
        Returns:
            dict with accessible explanation
        """
        if not content:
            return {
                'success': False,
                'explanation': '',
                'error': 'No content provided'
            }
        
        if not self.model:
            return {
                'success': True,
                'explanation': content
            }
        
        try:
            prompts = {
                'visual': f"""Describe this content in detail for a visually impaired user. 
Be descriptive about any visual elements, layout, or imagery.
Content: {content}""",
                
                'hearing': f"""Explain this content for a deaf user.
Avoid references to sounds or audio. Focus on visual and textual information.
If there are audio elements, describe what information they convey.
Content: {content}""",
                
                'speech': f"""Summarize this content briefly for a user who communicates via typing.
Keep it concise and easy to reference.
Content: {content}"""
            }
            
            prompt = prompts.get(impairment_type, prompts['visual'])
            response = self.model.generate_content(prompt)
            
            return {
                'success': True,
                'explanation': response.text
            }
        except Exception as e:
            print(f"Accessibility explanation error: {e}")
            return {
                'success': True,
                'explanation': content
            }
    
    def get_accessibility_tips(self, disability_type: str) -> dict:
        """
        Get personalized accessibility tips.
        
        Args:
            disability_type: 'visual', 'hearing', 'speech', or 'multiple'
        
        Returns:
            dict with tips and recommendations
        """
        tips = {
            'visual': {
                'settings': [
                    'Enable Text-to-Speech (TTS) for message reading',
                    'Increase font size for better visibility',
                    'Enable high contrast mode',
                    'Use screen reader compatibility mode'
                ],
                'features': [
                    'Voice messages - send and receive audio messages',
                    'TTS - have messages read aloud to you',
                    'Keyboard navigation - navigate without a mouse',
                    'Audio notifications for new messages'
                ]
            },
            'hearing': {
                'settings': [
                    'Enable Speech-to-Text (STT) for voice message transcription',
                    'Turn on visual notifications',
                    'Enable vibration alerts',
                    'Set up visual indicators for sound events'
                ],
                'features': [
                    'Real-time message transcription',
                    'Visual sentiment indicators on messages',
                    'Text-based communication priority',
                    'Visual typing indicators'
                ]
            },
            'speech': {
                'settings': [
                    'Enable message composition assistant',
                    'Set up quick reply templates',
                    'Enable predictive text',
                    'Use voice-to-text for input when possible'
                ],
                'features': [
                    'AI-powered message suggestions',
                    'Quick reply options',
                    'Emoji and sticker responses',
                    'Pre-composed message templates'
                ]
            },
            'multiple': {
                'settings': [
                    'Customize accessibility combination',
                    'Enable all assistive features',
                    'Set up personalized shortcuts',
                    'Configure multi-modal feedback'
                ],
                'features': [
                    'Full TTS and STT support',
                    'Visual and audio notifications',
                    'AI assistant for navigation help',
                    'Flexible input and output options'
                ]
            }
        }
        
        return {
            'success': True,
            'disability_type': disability_type,
            **tips.get(disability_type, tips['multiple'])
        }
    
    def _fallback_response(self, user_message: str) -> dict:
        """Provide fallback response when AI is unavailable."""
        message_lower = user_message.lower()
        
        if 'help' in message_lower:
            response = """I'm here to help! Here are some things I can assist with:
- Navigating the platform
- Composing messages
- Adjusting accessibility settings
- Understanding features

What would you like help with?"""
        elif 'setting' in message_lower or 'accessibility' in message_lower:
            response = """To adjust accessibility settings:
1. Go to Settings
2. Select Accessibility
3. Choose your preferences for:
   - Font size
   - High contrast
   - Text-to-Speech
   - Speech-to-Text

Would you like specific guidance on any setting?"""
        elif 'message' in message_lower or 'chat' in message_lower:
            response = """To send a message:
1. Go to the Chat section
2. Select a contact or start a new conversation
3. Type your message or use voice input
4. Press Send

You can also use voice messages by holding the microphone button."""
        else:
            response = """I'm your De-Novo assistant. I can help you with:
- Platform navigation
- Accessibility settings
- Composing messages
- Understanding features

How can I assist you today?"""
        
        return {
            'success': True,
            'response': response
        }


# Singleton instance
gemma_assistant = GemmaAssistant()
