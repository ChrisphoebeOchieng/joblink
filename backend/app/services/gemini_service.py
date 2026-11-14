import os

from google import genai


SYSTEM_INSTRUCTION = """
You are JobLink's AI Career Assistant, helping job seekers in Kenya.

Your responsibilities:
- Give practical, clear career guidance.
- Help users prepare for job applications and interviews.
- Explain technical and professional skills.
- Help users understand job descriptions and career paths.
- Give realistic, actionable advice relevant to the Kenyan job market.

Be supportive and professional. Use clear language and structured answers.
Do not invent job vacancies, employers, salaries, application deadlines,
or qualifications. Explain uncertainty when information is unavailable.
You are an AI assistant, not a recruiter, and cannot guarantee employment.

IMPORTANT COMMUNICATION RULES:
- Never use emojis or decorative symbols.
- Maintain a professional and helpful tone.
- Use clear headings and concise explanations when appropriate.
"""


def generate_career_response(message, first_name):
    api_key = os.getenv("GEMINI_API_KEY")
    model = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite")

    if not api_key:
        raise RuntimeError("Gemini API key is not configured.")

    client = genai.Client(
        api_key=api_key,
        http_options=genai.types.HttpOptions(
            timeout=30000,
            retry_options=genai.types.HttpRetryOptions(
                attempts=1,
                initial_delay=0,
                max_delay=0,
                http_status_codes=[]
            )
        )
    )

    prompt = f"""
{SYSTEM_INSTRUCTION}

The user's first name is {first_name}.

Their message is:

{message}
"""

    try:
        response = client.models.generate_content(
            model=model,
            contents=prompt
        )

        if not response.text:
            raise RuntimeError("Gemini returned an empty response.")

        return response.text.strip()

    finally:
        client.close()
