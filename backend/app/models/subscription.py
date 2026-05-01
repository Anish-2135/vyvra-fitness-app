# backend/app/models/subscription.py
from app import db
from datetime import datetime

class Subscription(db.Model):
    __tablename__ = 'subscriptions'

    id         = db.Column(db.Integer, primary_key=True)
    user_id    = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True, nullable=False)

    # 'free' or 'pro'
    plan       = db.Column(db.String(20), default='free', nullable=False)

    # How many AI requests used today (resets daily)
    ai_requests_today = db.Column(db.Integer, default=0)

    # Date of last AI request (used to reset counter daily)
    last_request_date = db.Column(db.Date, nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Free plan limit
    FREE_DAILY_LIMIT = 5

    def can_use_ai(self) -> bool:
        """
        Returns True if the user is allowed to make an AI request.
        Pro users: always True
        Free users: True if they haven't used 5 requests today
        """
        from datetime import date
        if self.plan == 'pro':
            return True

        # Reset counter if it's a new day
        today = date.today()
        if self.last_request_date != today:
            self.ai_requests_today = 0
            self.last_request_date = today
            db.session.commit()

        return self.ai_requests_today < self.FREE_DAILY_LIMIT

    def use_ai_request(self):
        """Increments the daily AI request counter."""
        from datetime import date
        today = date.today()
        if self.last_request_date != today:
            self.ai_requests_today = 0
        self.ai_requests_today += 1
        self.last_request_date = today
        db.session.commit()

    def to_dict(self):
        return {
            'plan': self.plan,
            'ai_requests_today': self.ai_requests_today,
            'ai_requests_remaining': (
                999 if self.plan == 'pro'
                else max(0, self.FREE_DAILY_LIMIT - self.ai_requests_today)
            ),
            'daily_limit': 999 if self.plan == 'pro' else self.FREE_DAILY_LIMIT,
        }