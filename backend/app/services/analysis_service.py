# backend/app/services/analysis_service.py
# This is where Python/Pandas crunches the fitness data
# and turns raw numbers into useful insights.

import pandas as pd
from app.models.fitness_entry import FitnessEntry
from datetime import date, timedelta

def get_user_insights(user_id: int) -> dict:
    """
    Fetches the last 30 days of data for a user,
    loads it into a Pandas DataFrame, and computes insights.
    A DataFrame is like a spreadsheet table in Python.
    """

    # Get last 30 days of entries from the database
    thirty_days_ago = date.today() - timedelta(days=30)
    entries = FitnessEntry.query.filter(
        FitnessEntry.user_id == user_id,
        FitnessEntry.entry_date >= thirty_days_ago
    ).order_by(FitnessEntry.entry_date.asc()).all()

    # If no data yet, return empty insights
    if not entries:
        return { 'has_data': False }

    # Convert database entries into a Pandas DataFrame
    # Each entry becomes one row in the table
    data = [{
        'date':         e.entry_date,
        'steps':        e.steps,
        'calories':     e.calories,
        'sleep_hours':  e.sleep_hours,
        'water_litres': e.water_litres,
        'day_name':     e.entry_date.strftime('%A'),  # "Monday", "Tuesday" etc.
    } for e in entries]

    df = pd.DataFrame(data)

    # ── Compute averages (only for days that have data > 0) ──
    avg_steps    = round(df[df['steps']    > 0]['steps'].mean(),    0) if (df['steps']    > 0).any() else 0
    avg_calories = round(df[df['calories'] > 0]['calories'].mean(), 0) if (df['calories'] > 0).any() else 0
    avg_sleep    = round(df[df['sleep_hours']  > 0]['sleep_hours'].mean(),  1) if (df['sleep_hours']  > 0).any() else 0
    avg_water    = round(df[df['water_litres'] > 0]['water_litres'].mean(), 1) if (df['water_litres'] > 0).any() else 0

    # ── Best days ──
    best_sleep_row  = df.loc[df['sleep_hours'].idxmax()]  if df['sleep_hours'].max()  > 0 else None
    best_steps_row  = df.loc[df['steps'].idxmax()]        if df['steps'].max()        > 0 else None
    best_water_row  = df.loc[df['water_litres'].idxmax()] if df['water_litres'].max() > 0 else None

    # ── Streaks: how many consecutive days did user hit water goal? ──
    water_goal_days = (df['water_litres'] >= 2.0).tolist()
    water_streak    = _calculate_streak(water_goal_days)

    steps_goal_days = (df['steps'] >= 8000).tolist()
    steps_streak    = _calculate_streak(steps_goal_days)

    # ── Total entries logged ──
    total_entries = len(df)

    return {
        'has_data': True,
        'total_entries': total_entries,
        'averages': {
            'steps':        int(avg_steps)    if avg_steps    else 0,
            'calories':     int(avg_calories) if avg_calories else 0,
            'sleep_hours':  float(avg_sleep)  if avg_sleep    else 0,
            'water_litres': float(avg_water)  if avg_water    else 0,
        },
        'best_days': {
            'sleep': {
                'day':   best_sleep_row['day_name'] if best_sleep_row is not None else None,
                'value': float(best_sleep_row['sleep_hours']) if best_sleep_row is not None else None,
            },
            'steps': {
                'day':   best_steps_row['day_name'] if best_steps_row is not None else None,
                'value': int(best_steps_row['steps']) if best_steps_row is not None else None,
            },
            'water': {
                'day':   best_water_row['day_name'] if best_water_row is not None else None,
                'value': float(best_water_row['water_litres']) if best_water_row is not None else None,
            },
        },
        'streaks': {
            'water': water_streak,
            'steps': steps_streak,
        },
    }


def _calculate_streak(bool_list: list) -> int:
    """
    Counts how many consecutive True values are at the END of the list.
    Example: [True, False, True, True, True] → returns 3
    This tells us the current streak (most recent days).
    """
    streak = 0
    for val in reversed(bool_list):
        if val:
            streak += 1
        else:
            break
    return streak