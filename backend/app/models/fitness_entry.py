from app import db
from datetime import datetime, date

class FitnessEntry(db.Model):
    __tablename__ = 'fitness_entries'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    entry_date = db.Column(db.Date, nullable=False, default=date.today)
    steps = db.Column(db.Integer, default=0)
    calories = db.Column(db.Integer, default=0)
    sleep_hours = db.Column(db.Float, default=0.0)
    water_litres = db.Column(db.Float, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<FitnessEntry user={self.user_id} date={self.entry_date}>'

    def to_dict(self):
        return {
            'id': self.id,
            'entry_date': str(self.entry_date),
            'steps': self.steps,
            'calories': self.calories,
            'sleep_hours': self.sleep_hours,
            'water_litres': self.water_litres,
        }