from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from routes import passwords_bp
from app import db
from models import User, Password
from utils.encryption import encryption, PasswordStorage
from utils.password_generator import PasswordGenerator, PasswordValidator

@passwords_bp.route('', methods=['GET'])
@jwt_required()
def get_passwords():
    """Get all passwords for authenticated user"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    passwords = Password.query.filter_by(user_id=user_id).order_by(Password.created_at.desc()).all()
    return jsonify([p.to_dict() for p in passwords]), 200

@passwords_bp.route('', methods=['POST'])
@jwt_required()
def add_password():
    """Add a new password entry"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    
    is_valid, error_msg = PasswordStorage.validate_password_entry(data)
    if not is_valid:
        return jsonify({'error': error_msg}), 400
    
    sanitized_data = PasswordStorage.sanitize_password_entry(data)
    encrypted_pwd = encryption.encrypt(sanitized_data['password'], user_id)
    
    password_entry = Password(
        user_id=user_id,
        service_name=sanitized_data['service_name'],
        username=sanitized_data['username'],
        encrypted_password=encrypted_pwd,
        url=sanitized_data['url'],
        notes=sanitized_data['notes']
    )
    
    db.session.add(password_entry)
    db.session.commit()
    
    return jsonify({'message': 'Password added successfully', 'password': password_entry.to_dict()}), 201

@passwords_bp.route('/<int:password_id>', methods=['GET'])
@jwt_required()
def get_password(password_id):
    """Get a specific password (decrypted)"""
    user_id = get_jwt_identity()
    password_entry = Password.query.get(password_id)
    
    if not password_entry:
        return jsonify({'error': 'Password entry not found'}), 404
    
    if password_entry.user_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    pwd_dict = password_entry.to_dict()
    try:
        pwd_dict['password'] = encryption.decrypt(password_entry.encrypted_password)
    except ValueError as e:
        return jsonify({'error': 'Failed to decrypt password'}), 500
    
    return jsonify(pwd_dict), 200

@passwords_bp.route('/<int:password_id>', methods=['PUT'])
@jwt_required()
def update_password(password_id):
    """Update a password entry"""
    user_id = get_jwt_identity()
    password_entry = Password.query.get(password_id)
    
    if not password_entry:
        return jsonify({'error': 'Password entry not found'}), 404
    
    if password_entry.user_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    
    if 'service_name' in data:
        if len(data['service_name']) > 120:
            return jsonify({'error': 'Service name too long'}), 400
        password_entry.service_name = data['service_name'].strip()
    
    if 'username' in data:
        if len(data['username']) > 120:
            return jsonify({'error': 'Username too long'}), 400
        password_entry.username = data['username'].strip()
    
    if 'password' in data:
        try:
            password_entry.encrypted_password = encryption.encrypt(data['password'], user_id)
        except Exception as e:
            return jsonify({'error': 'Failed to encrypt password'}), 500
    
    if 'url' in data:
        if data['url'] and len(data['url']) > 255:
            return jsonify({'error': 'URL too long'}), 400
        password_entry.url = data['url'].strip() if data['url'] else None
    
    if 'notes' in data:
        if data['notes'] and len(data['notes']) > 1000:
            return jsonify({'error': 'Notes too long'}), 400
        password_entry.notes = data['notes'].strip() if data['notes'] else None
    
    db.session.commit()
    return jsonify({'message': 'Password updated successfully', 'password': password_entry.to_dict()}), 200

@passwords_bp.route('/<int:password_id>', methods=['DELETE'])
@jwt_required()
def delete_password(password_id):
    """Delete a password entry"""
    user_id = get_jwt_identity()
    password_entry = Password.query.get(password_id)
    
    if not password_entry:
        return jsonify({'error': 'Password entry not found'}), 404
    
    if password_entry.user_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    db.session.delete(password_entry)
    db.session.commit()
    
    return jsonify({'message': 'Password deleted successfully'}), 200

@passwords_bp.route('/generate', methods=['POST'])
@jwt_required()
def generate_password():
    """Generate a new password with custom options"""
    data = request.get_json() or {}
    
    try:
        password = PasswordGenerator.generate(
            length=data.get('length', 16),
            use_uppercase=data.get('use_uppercase', True),
            use_lowercase=data.get('use_lowercase', True),
            use_digits=data.get('use_digits', True),
            use_special=data.get('use_special', True),
            exclude_ambiguous=data.get('exclude_ambiguous', False)
        )
        
        strength = PasswordGenerator.check_strength(password)
        crack_time = PasswordGenerator.estimate_crack_time(password)
        
        return jsonify({
            'password': password,
            'strength': strength,
            'crack_time': crack_time
        }), 200
    except Exception as e:
        return jsonify({'error': f'Failed to generate password: {str(e)}'}), 500

@passwords_bp.route('/strength', methods=['POST'])
@jwt_required()
def check_strength():
    """Check password strength with detailed analysis"""
    data = request.get_json()
    if not data or not data.get('password'):
        return jsonify({'error': 'Password required'}), 400
    
    try:
        strength = PasswordGenerator.check_strength(data['password'])
        crack_time = PasswordGenerator.estimate_crack_time(data['password'])
        
        return jsonify({
            'strength': strength,
            'crack_time': crack_time
        }), 200
    except Exception as e:
        return jsonify({'error': f'Failed to check strength: {str(e)}'}), 500

@passwords_bp.route('/validate', methods=['POST'])
@jwt_required()
def validate_password():
    """Validate password against security standards"""
    data = request.get_json()
    if not data or not data.get('password'):
        return jsonify({'error': 'Password required'}), 400
    
    try:
        validation = PasswordValidator.validate(data['password'])
        return jsonify(validation), 200
    except Exception as e:
        return jsonify({'error': f'Failed to validate password: {str(e)}'}), 500
