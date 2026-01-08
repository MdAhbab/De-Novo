# De-Novo
A platform to support disabled people.

Structured Project Overview
Here is the "proper" version, organised into a technical specification format suitable for a proposal or documentation.
Project Name: Unified Social Platform for Accessible Communication
1. Executive Summary We are developing a unified web platform designed specifically for individuals with disabilities (specifically those with hearing, speech, and visual impairments) who face barriers interacting in standard social environments. The goal is to provide a secure, inclusive social interface that facilitates connection and emotional well-being.
2. Target Audience (Stakeholders)
Visually Impaired (Blind)
Speech Impaired (Mute)
Hearing Impaired (Deaf)
3. Key Features & Functionality
Adaptive User Interface:
Includes a standard UI and specific modes for colour blindness.
Text-to-Voice & Voice-to-Text: Core accessibility features to bridge communication gaps between different types of impairments.
Mood & Atmosphere:
Utilises music and sound waves designed to relax or uplift the user's mood.
Smart Chat System:
Sentiment Analysis: Real-time analysis during chats to assist users in understanding emotional context.
Voice Messaging (VM): Enabled for ease of communication.
4. Security & Privacy (End-to-End Encryption)
Data Privacy: All communication is End-to-End (E2E) encrypted. Developers and administrators have zero access to message content.
Database Security:
MySQL: Used for encrypted storage of core data.
MongoDB: Used for handling communication types with "Facebook-level" security protocols.
User Security Tools:
"Peeping Tom" Warning: Leverages laptop hardware (camera/sensors) and Computer Vision to detect unauthorized persons looking at the user's screen (shoulder surfing protection).
5. Technical Stack & AI Integration
Cloud Infrastructure: Google Cloud Platform (GCP)’s ai and vertex ai for training
AI Models:
Gemma-3: Leveraged for language processing and intelligent assistance.
CNN (Convolutional Neural Networks) & Computer Vision: Used for the security features (peeking detection) and potentially for UI navigation assistance.
Django, React, Html, CSS, Vanilla js.
