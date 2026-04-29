from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

db = SQLAlchemy()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)

    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)
    jwt.init_app(app)

    CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

    from app.routes.auth_routes import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')

    from app.routes.fitness_routes import fitness_bp
    app.register_blueprint(fitness_bp, url_prefix='/api/fitness')

    with app.app_context():
        db.create_all()

    return app