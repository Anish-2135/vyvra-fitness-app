from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from app import db
from app.models.user import User
from app.services.auth_service import hash_password, verify_password

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()

    if not data:
        return jsonify({'error': 'No data provided'}), 400

    username = data.get('username', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not username or not email or not password:
        return jsonify({'error': 'All fields are required'}), 400

    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400

    existing_user = User.query.filter(
        (User.email == email) | (User.username == username)
    ).first()

    if existing_user:
        if existing_user.email == email:
            return jsonify({'error': 'Email already registered'}), 409
        return jsonify({'error': 'Username already taken'}), 409

    hashed = hash_password(password)

    new_user = User(
        username=username,
        email=email,
        password_hash=hashed
    )

    db.session.add(new_user)
    db.session.commit()

    token = create_access_token(identity=str(new_user.id))

    return jsonify({
        'message': 'Account created successfully',
        'token': token,
        'user': {
            'id': new_user.id,
            'username': new_user.username,
            'email': new_user.email
        }
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data:
        return jsonify({'error': 'No data provided'}), 400

    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not verify_password(password, user.password_hash):
        return jsonify({'error': 'Invalid email or password'}), 401

    token = create_access_token(identity=str(user.id))

    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email
        }
    }), 200