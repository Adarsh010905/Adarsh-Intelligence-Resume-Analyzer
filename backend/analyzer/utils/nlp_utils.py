import re
import logging
from typing import List, Dict

logger = logging.getLogger(__name__)

TECH_SKILLS = {
    'python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'go', 'rust',
    'php', 'ruby', 'swift', 'kotlin', 'scala', 'r', 'matlab', 'perl',
    'react', 'angular', 'vue', 'django', 'flask', 'fastapi', 'spring',
    'express', 'node.js', 'nodejs', 'next.js', 'nextjs', 'nuxt',
    'rails', 'laravel', 'asp.net',
    'postgresql', 'mysql', 'mongodb', 'redis', 'sqlite', 'oracle',
    'elasticsearch', 'cassandra', 'dynamodb', 'firebase',
    'aws', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes',
    'terraform', 'ansible', 'jenkins', 'github actions', 'ci/cd',
    'linux', 'nginx', 'apache',
    'machine learning', 'deep learning', 'tensorflow', 'pytorch',
    'scikit-learn', 'pandas', 'numpy', 'matplotlib', 'keras',
    'nlp', 'computer vision', 'data science', 'big data',
    'spark', 'hadoop', 'airflow',
    'git', 'github', 'gitlab', 'jira', 'confluence', 'slack',
    'postman', 'figma', 'photoshop',
    'agile', 'scrum', 'kanban', 'rest api', 'graphql', 'microservices',
    'tdd', 'bdd', 'oop', 'functional programming',
}

_nlp_model = None
_sentence_model = None

def get_nlp():
    global _nlp_model
    if _nlp_model is None:
        try:
            import spacy
            _nlp_model = spacy.load('en_core_web_sm')
        except OSError:
            logger.warning("spaCy model not found. Run: python -m spacy download en_core_web_sm")
            _nlp_model = None
    return _nlp_model

def get_sentence_model():
    global _sentence_model
    if _sentence_model is None:
        try:
            from sentence_transformers import SentenceTransformer
            _sentence_model = SentenceTransformer('all-MiniLM-L6-v2')
        except Exception as e:
            logger.error(f"Failed to load sentence transformer: {e}")
            _sentence_model = None
    return _sentence_model

def extract_skills(text: str) -> List[str]:
    if not text:
        return []

    text_lower = text.lower()
    found_skills = set()

    for skill in TECH_SKILLS:
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            found_skills.add(skill)

    return sorted(list(found_skills))

def extract_keywords(text: str, top_n: int = 20) -> List[str]:
    keywords = set()
    nlp = get_nlp()

    if nlp:
        doc = nlp(text[:10000])
        for entity in doc.ents:
            if entity.label_ in ['ORG', 'PRODUCT', 'WORK_OF_ART']:
                keywords.add(entity.text.lower().strip())
        for chunk in doc.noun_chunks:
            clean_chunk = chunk.text.lower().strip()
            if 2 <= len(clean_chunk) <= 50 and not chunk.root.is_stop:
                keywords.add(clean_chunk)
    else:
        words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
        stop_words = {
            'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all',
            'can', 'had', 'her', 'was', 'one', 'our', 'out', 'they',
            'have', 'will', 'with', 'this', 'that', 'from', 'your'
        }
        keywords = {w for w in words if w not in stop_words}

    return sorted(list(keywords))[:top_n]

def calculate_similarity_score(text1: str, text2: str) -> float:
    model = get_sentence_model()

    if model is None:
        return _keyword_overlap_score(text1, text2)

    try:
        import numpy as np
        embeddings = model.encode([text1[:5000], text2[:5000]])
        vec1, vec2 = embeddings[0], embeddings[1]
        cosine_sim = np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))
        return min(max(float(cosine_sim) * 100, 0), 100)
    except Exception as e:
        logger.error(f"Similarity calculation failed: {e}")
        return _keyword_overlap_score(text1, text2)

def _keyword_overlap_score(text1: str, text2: str) -> float:
    words1 = set(re.findall(r'\b\w{3,}\b', text1.lower()))
    words2 = set(re.findall(r'\b\w{3,}\b', text2.lower()))
    if not words2:
        return 0.0
    return min((len(words1.intersection(words2)) / len(words2)) * 100, 100.0)

def analyze_resume_nlp(resume_text: str, job_description: str) -> Dict:
    resume_skills = extract_skills(resume_text)
    jd_skills = extract_skills(job_description)

    resume_skills_set = set(resume_skills)
    jd_skills_set = set(jd_skills)

    matched_skills = list(resume_skills_set.intersection(jd_skills_set))
    missing_skills = list(jd_skills_set - resume_skills_set)

    resume_keywords = set(extract_keywords(resume_text))
    jd_keywords = set(extract_keywords(job_description))
    keywords_matched = list(resume_keywords.intersection(jd_keywords))

    semantic_score = calculate_similarity_score(resume_text, job_description)
    skill_coverage = (len(matched_skills) / len(jd_skills)) * 100 if jd_skills else 50.0
    final_score = round(min(max((semantic_score * 0.6) + (skill_coverage * 0.4), 0), 100), 2)

    return {
        'match_score': final_score,
        'semantic_score': round(semantic_score, 2),
        'skill_coverage_score': round(skill_coverage, 2),
        'skills_found': resume_skills,
        'skills_in_jd': jd_skills,
        'matched_skills': matched_skills,
        'missing_skills': missing_skills,
        'keywords_matched': keywords_matched[:15],
    }