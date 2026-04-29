# backend/app/routes/fitness_routes.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.fitness_entry import FitnessEntry
from app.services.analysis_service import get_user_insights
from datetime import date, timedelta

fitness_bp = Blueprint('fitness', __name__)


@fitness_bp.route('/add', methods=['POST'])
@jwt_required()
def add_entry():
    user_id = int(get_jwt_identity())
    data = request.get_json()

    if not data:
        return jsonify({'error': 'No data provided'}), 400

    today = date.today()
    existing = FitnessEntry.query.filter_by(
        user_id=user_id, entry_date=today
    ).first()

    if existing:
        existing.steps        = data.get('steps',        existing.steps)
        existing.calories     = data.get('calories',     existing.calories)
        existing.sleep_hours  = data.get('sleep_hours',  existing.sleep_hours)
        existing.water_litres = data.get('water_litres', existing.water_litres)
        db.session.commit()
        return jsonify({
            'message': 'Entry updated successfully',
            'entry': existing.to_dict()
        }), 200

    entry = FitnessEntry(
        user_id=user_id,
        entry_date=today,
        steps=data.get('steps', 0),
        calories=data.get('calories', 0),
        sleep_hours=data.get('sleep_hours', 0.0),
        water_litres=data.get('water_litres', 0.0)
    )
    db.session.add(entry)
    db.session.commit()

    return jsonify({
        'message': 'Entry saved successfully',
        'entry': entry.to_dict()
    }), 201


@fitness_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    user_id = int(get_jwt_identity())
    today = date.today()

    today_entry = FitnessEntry.query.filter_by(
        user_id=user_id, entry_date=today
    ).first()

    seven_days_ago = today - timedelta(days=6)
    weekly_entries = FitnessEntry.query.filter(
        FitnessEntry.user_id == user_id,
        FitnessEntry.entry_date >= seven_days_ago
    ).order_by(FitnessEntry.entry_date.asc()).all()

    weekly_chart = []
    for i in range(7):
        day = seven_days_ago + timedelta(days=i)
        entry = next(
            (e for e in weekly_entries if e.entry_date == day), None
        )
        weekly_chart.append({
            'date':     day.strftime('%a'),
            'steps':    entry.steps    if entry else 0,
            'calories': entry.calories if entry else 0,
        })

    return jsonify({
        'today':           today_entry.to_dict() if today_entry else None,
        'weekly_chart':    weekly_chart,
        'has_today_entry': today_entry is not None
    }), 200


@fitness_bp.route('/history', methods=['GET'])
@jwt_required()
def get_history():
    user_id = int(get_jwt_identity())

    entries = FitnessEntry.query.filter_by(user_id=user_id)\
        .order_by(FitnessEntry.entry_date.desc())\
        .limit(30)\
        .all()

    return jsonify({
        'entries': [e.to_dict() for e in entries]
    }), 200


@fitness_bp.route('/insights', methods=['GET'])
@jwt_required()
def get_insights():
    user_id = int(get_jwt_identity())
    insights = get_user_insights(user_id)
    return jsonify(insights), 200


@fitness_bp.route('/<int:entry_id>', methods=['PUT'])
@jwt_required()
def update_entry(entry_id):
    user_id = int(get_jwt_identity())
    entry = FitnessEntry.query.filter_by(
        id=entry_id, user_id=user_id
    ).first()

    if not entry:
        return jsonify({'error': 'Entry not found'}), 404

    data = request.get_json()
    entry.steps        = data.get('steps',        entry.steps)
    entry.calories     = data.get('calories',     entry.calories)
    entry.sleep_hours  = data.get('sleep_hours',  entry.sleep_hours)
    entry.water_litres = data.get('water_litres', entry.water_litres)
    db.session.commit()

    return jsonify({
        'message': 'Entry updated',
        'entry': entry.to_dict()
    }), 200


@fitness_bp.route('/<int:entry_id>', methods=['DELETE'])
@jwt_required()
def delete_entry(entry_id):
    user_id = int(get_jwt_identity())
    entry = FitnessEntry.query.filter_by(
        id=entry_id, user_id=user_id
    ).first()

    if not entry:
        return jsonify({'error': 'Entry not found'}), 404

    db.session.delete(entry)
    db.session.commit()

    return jsonify({'message': 'Entry deleted'}), 200