# Password Manager

A secure password manager application built with Flask backend and Next.js frontend.

## Features

- **User Authentication**: Secure registration and login with JWT tokens
- **Password Encryption**: AES-256 encryption for stored passwords
- **Password Generation**: Customizable password generator with strength analysis
- **Password Strength Indicator**: Real-time strength checking with detailed feedback
- **Secure Storage**: Encrypted password storage with user isolation
- **Responsive UI**: Modern, mobile-friendly interface

## Project Structure

\`\`\`
password-manager/
├── app.py                 # Flask application entry point
├── models.py              # Database models (User, Password)
├── config.py              # Configuration settings
├── requirements.txt       # Python dependencies
├── routes/
│   ├── __init__.py
│   ├── auth.py           # Authentication endpoints
│   └── passwords.py      # Password management endpoints
├── utils/
│   ├── encryption.py     # Encryption utilities
│   └── password_generator.py  # Password generation and validation
└── .env.example          # Environment variables template
\`\`\`

## Backend Setup

### Prerequisites
- Python 3.8+
- pip

### Installation

1. Clone the repository
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
