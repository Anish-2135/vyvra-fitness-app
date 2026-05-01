# backend/app/services/ai_service.py
# This file handles all communication with the Anthropic Claude API.
# It takes the user's fitness data and asks Claude for personalised advice.

import anthropic
import os
from app.services.analysis_service import get_user_insights

# Initialise the Anthropic client using your API key from .env
client = anthropic.Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))


def get_ai_recommendation(user_id: int, user_question: str = None) -> str:
    """
    Fetches the user's fitness insights (from Pandas),
    formats them into a prompt, sends it to Claude,
    and returns a personalised recommendation.

    user_question: optional custom question from the user
                   e.g. "How was my sleep this week?"
    """

    # Step 1: Get the user's fitness data using our existing Pandas service
    insights = get_user_insights(user_id)

    # Step 2: If no data yet, return a helpful message
    if not insights.get('has_data'):
        return (
            "I don't have any fitness data for you yet! "
            "Start by logging your steps, sleep, calories, and water intake "
            "from the dashboard. Once you have a few entries, I can give you "
            "personalised recommendations."
        )

    # Step 3: Format the fitness data into a readable summary for Claude
    avg   = insights['averages']
    best  = insights['best_days']
    streaks = insights['streaks']

    data_summary = f"""
User's 30-day fitness summary:
- Average daily steps: {avg['steps']:,}
- Average daily calories burned: {avg['calories']:,} kcal
- Average sleep per night: {avg['sleep_hours']} hours
- Average daily water intake: {avg['water_litres']} litres

Best performance days:
- Best sleep: {best['sleep']['day']} ({best['sleep']['value']} hours)
- Most steps: {best['steps']['day']} ({best['steps']['value']:,} steps)

Current streaks:
- Hydration goal (2L/day): {streaks['water']} consecutive days
- Steps goal (8,000/day): {streaks['steps']} consecutive days
"""

    # Step 4: Build the question to ask Claude
    if user_question:
        # User asked a specific question
        user_prompt = f"""
Here is my fitness data:
{data_summary}

My question: {user_question}

Please give me a specific, helpful, and encouraging answer based on my data.
Keep it concise — 3 to 5 sentences maximum.
"""
    else:
        # Generate general recommendations
        user_prompt = f"""
Here is my fitness data:
{data_summary}

Based on this data, please:
1. Give me 2-3 specific observations about my fitness habits
2. Suggest 2 actionable improvements I can make this week
3. Highlight what I am doing well

Keep the tone encouraging and friendly.
Format it clearly with short paragraphs.
Maximum 150 words total.
"""

    # Step 5: Call the Claude API
    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=400,
        system=(
            "You are VYVRA's personal fitness AI coach. "
            "You are friendly, encouraging, and give specific advice "
            "based on the user's actual fitness data. "
            "Never be generic — always reference their specific numbers. "
            "Keep responses concise and actionable."
        ),
        messages=[
            {"role": "user", "content": user_prompt}
        ]
    )

    # Step 6: Extract and return the text response
    return message.content[0].text


def get_ai_chat_response(user_id: int, conversation_history: list, new_message: str) -> str:
    """
    Handles a multi-turn chat conversation about the user's fitness.
    conversation_history = list of {"role": "user"/"assistant", "content": "..."}
    new_message = the latest message from the user
    """

    # Get fitness context
    insights = get_user_insights(user_id)

    if insights.get('has_data'):
        avg = insights['averages']
        context = (
            f"User's fitness context: "
            f"{avg['steps']:,} avg daily steps, "
            f"{avg['sleep_hours']}hrs avg sleep, "
            f"{avg['water_litres']}L avg water, "
            f"{avg['calories']} avg calories burned."
        )
    else:
        context = "User has not logged any fitness data yet."

    # Build message history for multi-turn conversation
    messages = conversation_history.copy()
    messages.append({"role": "user", "content": new_message})

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=300,
        system=(
            f"You are VYVRA's personal fitness AI coach. "
            f"You have access to the user's fitness data: {context} "
            f"Be conversational, friendly, and specific. "
            f"Keep responses under 100 words unless the user asks for detail."
        ),
        messages=messages
    )

    return response.content[0].text