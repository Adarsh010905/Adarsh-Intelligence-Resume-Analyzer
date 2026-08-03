import os
import json
import logging
from typing import Dict

logger = logging.getLogger(__name__)

def get_ai_feedback(resume_text, job_description, nlp_results, job_title="", company_name="") -> Dict:
    groq_key = os.environ.get('GROQ_API_KEY', '')
    if groq_key and groq_key != 'your_groq_api_key_here':
        result = _get_groq_feedback(resume_text, job_description, nlp_results, job_title, company_name, groq_key)
        if result:
            return result

    openai_key = os.environ.get('OPENAI_API_KEY', '')
    if openai_key and openai_key != 'your_openai_api_key_here':
        result = _get_openai_feedback(resume_text, job_description, nlp_results, job_title, company_name, openai_key)
        if result:
            return result

    logger.warning("No AI API available. Using rule-based feedback.")
    return _get_rule_based_feedback(nlp_results, job_title)

def _build_prompt(resume_text, job_description, nlp_results, job_title, company_name) -> str:
    score = nlp_results.get('match_score', 0)
    matched_skills = nlp_results.get('matched_skills', [])
    missing_skills = nlp_results.get('missing_skills', [])

    return f"""You are an expert resume reviewer and career coach. Analyze this resume and provide actionable, specific feedback.

JOB DETAILS:
- Position: {job_title or 'Not specified'}
- Company: {company_name or 'Not specified'}

RESUME TEXT:
{resume_text[:3000]}

JOB DESCRIPTION:
{job_description[:2000]}

NLP ANALYSIS RESULTS:
- Overall Match Score: {score}%
- Skills Present: {', '.join(matched_skills) if matched_skills else 'None found'}
- Missing Skills: {', '.join(missing_skills) if missing_skills else 'None'}

Respond ONLY with valid JSON in this format:
{{
    "overall_feedback": "2-3 paragraph assessment",
    "strengths": ["strength 1", "strength 2", "strength 3", "strength 4", "strength 5"],
    "improvements": ["improvement 1", "improvement 2", "improvement 3", "improvement 4", "improvement 5"],
    "missing_skills_advice": "advice on missing skills",
    "formatting_tips": "formatting improvements",
    "interview_tips": "2-3 interview tips"
}}"""

def _get_groq_feedback(resume_text, job_description, nlp_results, job_title, company_name, api_key) -> Dict:
    try:
        from groq import Groq
        client = Groq(api_key=api_key)
        prompt = _build_prompt(resume_text, job_description, nlp_results, job_title, company_name)

        response = client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[
                {"role": "system", "content": "You are an expert resume reviewer. Always respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1500,
        )
        return _parse_ai_response(response.choices[0].message.content.strip())
    except Exception as e:
        logger.error(f"Groq API error: {e}")
        return None

def _get_openai_feedback(resume_text, job_description, nlp_results, job_title, company_name, api_key) -> Dict:
    try:
        from openai import OpenAI
        client = OpenAI(api_key=api_key)
        prompt = _build_prompt(resume_text, job_description, nlp_results, job_title, company_name)

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an expert resume reviewer. Always respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1500,
        )
        return _parse_ai_response(response.choices[0].message.content.strip())
    except Exception as e:
        logger.error(f"OpenAI API error: {e}")
        return None

def _parse_ai_response(response_text: str) -> Dict:
    import re
    try:
        return _format_feedback(json.loads(response_text))
    except json.JSONDecodeError:
        pass
    try:
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            return _format_feedback(json.loads(json_match.group()))
    except (json.JSONDecodeError, AttributeError):
        pass
    return {
        'feedback': response_text,
        'strengths': [],
        'suggestions': [],
        'missing_skills_advice': '',
        'formatting_tips': '',
        'interview_tips': ''
    }

def _format_feedback(data: Dict) -> Dict:
    return {
        'feedback': data.get('overall_feedback', 'Analysis complete.'),
        'strengths': data.get('strengths', []),
        'suggestions': data.get('improvements', []),
        'missing_skills_advice': data.get('missing_skills_advice', ''),
        'formatting_tips': data.get('formatting_tips', ''),
        'interview_tips': data.get('interview_tips', ''),
    }

def _get_rule_based_feedback(nlp_results: Dict, job_title: str = "") -> Dict:
    score = float(nlp_results.get('match_score', 0))
    matched_skills = nlp_results.get('matched_skills', [])
    missing_skills = nlp_results.get('missing_skills', [])
    skills_found = nlp_results.get('skills_found', [])

    if score >= 80:
        opening = "Your resume is an excellent match for this position."
        quality = "strong"
    elif score >= 60:
        opening = "Your resume shows a good match for this role with some areas to improve."
        quality = "good"
    elif score >= 40:
        opening = "Your resume partially matches this job description."
        quality = "moderate"
    else:
        opening = "Your resume needs significant improvements to match this position."
        quality = "weak"

    feedback = f"{opening} The overall match score of {score:.0f}% indicates a {quality} alignment. "
    if matched_skills:
        feedback += f"You have {len(matched_skills)} matching skill(s): {', '.join(matched_skills[:5])}. "
    if missing_skills:
        feedback += f"However, {len(missing_skills)} skill(s) are missing: {', '.join(missing_skills[:5])}."

    strengths = []
    if matched_skills:
        strengths.append(f"Strong technical foundation with {len(matched_skills)} matching skills: {', '.join(matched_skills[:3])}")
    if len(skills_found) >= 10:
        strengths.append(f"Diverse technical skill set with {len(skills_found)} technologies")
    if score >= 60:
        strengths.append("Good overall keyword alignment with the job description")
    if len(strengths) < 3:
        strengths.extend(["Resume shows professional experience in the field", "Consider quantifying achievements"])

    suggestions = []
    if missing_skills:
        suggestions.append(f"Add projects demonstrating: {', '.join(missing_skills[:4])}")
    if score < 60:
        suggestions.append("Tailor your resume summary to directly address the job requirements")
    suggestions.extend([
        "Quantify achievements (e.g., 'Increased performance by 40%')",
        "Include relevant certifications for missing technologies",
        "Use action verbs: Developed, Implemented, Led, Optimized",
        "Add a strong summary section tailored to this specific role",
    ])

    return {
        'feedback': feedback,
        'strengths': strengths[:5],
        'suggestions': suggestions[:6],
        'missing_skills_advice': (
            f"Consider taking courses on {', '.join(missing_skills[:3])} on Coursera, Udemy, or freeCodeCamp."
            if missing_skills else "Your skill set aligns well with the requirements."
        ),
        'formatting_tips': "Use a clean, ATS-friendly format. Keep it to 1-2 pages. Save as PDF.",
        'interview_tips': "Prepare STAR method stories. Research the company. Be ready to discuss every skill listed.",
    }