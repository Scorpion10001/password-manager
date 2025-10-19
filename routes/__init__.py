from flask import Blueprint

# Create blueprints
auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')
passwords_bp = Blueprint('passwords', __name__, url_prefix='/api/passwords')

# Import route handlers
from routes.auth import *
from routes.passwords import *
