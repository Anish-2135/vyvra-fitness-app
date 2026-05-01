# backend/app/routes/ai_routes.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.subscription import Subscription
from app.services.ai_service import get_ai_recommendation, get_ai_chat_response

ai_bp = Blueprint('ai', __name__)


def get_or_create_subscription(user_id: int) -> Subscription:
    """
    Gets the subscription for a user.
    If they don't have one yet, creates a free plan subscription.
    This runs automatically on first AI request.
    """
    sub = Subscription.query.filter_by(user_id=user_id).first()
    if not sub:
        sub = Subscription(user_id=user_id, plan='free')
        db.session.add(sub)
        db.session.commit()
    return sub


@ai_bp.route('/recommend', methods=['POST'])
@jwt_required()
def get_recommendation():
    """
    POST /api/ai/recommend
    Generates personalised AI fitness recommendations.
    Free users: 5 requests/day. Pro users: unlimited.
    """
    user_id = int(get_jwt_identity())

    # Check subscription and limits
    sub = get_or_create_subscription(user_id)

    if not sub.can_use_ai():
        return jsonify({
            'error': 'Daily AI limit reached',
            'message': 'You have used all 5 free AI requests for today. Upgrade to Pro for unlimited access.',
            'upgrade_required': True,
            'subscription': sub.to_dict()
        }), 429  # 429 = Too Many Requests

    # Get optional custom question from request body
    data = request.get_json() or {}
    user_question = data.get('question', None)

    try:
        # Call Claude API
        recommendation = get_ai_recommendation(user_id, user_question)

        # Count this as one AI request used
        sub.use_ai_request()

        return jsonify({
            'recommendation': recommendation,
            'subscription': sub.to_dict()
        }), 200

    except Exception as e:
        return jsonify({'error': f'AI service error: {str(e)}'}), 500


@ai_bp.route('/chat', methods=['POST'])
@jwt_required()
def chat():
    """
    POST /api/ai/chat
    Multi-turn fitness chat with Claude.
    Body: { "message": "...", "history": [...] }
    """
    user_id = int(get_jwt_identity())

    sub = get_or_create_subscription(user_id)

    if not sub.can_use_ai():
        return jsonify({
            'error': 'Daily AI limit reached',
            'message': 'Upgrade to Pro for unlimited AI chat.',
            'upgrade_required': True
        }), 429

    data = request.get_json()
    if not data or not data.get('message'):
        return jsonify({'error': 'Message is required'}), 400

    user_message   = data.get('message')
    history        = data.get('history', [])

    try:
        response = get_ai_chat_response(user_id, history, user_message)
        sub.use_ai_request()

        return jsonify({
            'response': response,
            'subscription': sub.to_dict()
        }), 200

    except Exception as e:
        return jsonify({'error': f'AI service error: {str(e)}'}), 500


@ai_bp.route('/subscription', methods=['GET'])
@jwt_required()
def get_subscription():
    """GET /api/ai/subscription — Returns the user's current plan info."""
    user_id = int(get_jwt_identity())
    sub = get_or_create_subscription(user_id)
    return jsonify({'subscription': sub.to_dict()}), 200


@ai_bp.route('/upgrade', methods=['POST'])
@jwt_required()
def upgrade_to_pro():
    """
    POST /api/ai/upgrade
    Simulates upgrading to Pro (no real payment yet — Day 5!).
    """
    user_id = int(get_jwt_identity())
    sub = get_or_create_subscription(user_id)
    sub.plan = 'pro'
    db.session.commit()

    return jsonify({
        'message': 'Upgraded to Pro successfully!',
        'subscription': sub.to_dict()
    }), 200