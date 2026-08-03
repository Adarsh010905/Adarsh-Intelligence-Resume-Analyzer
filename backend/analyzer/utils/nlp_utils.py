import re

TECH_SKILLS = [
    "python", "django", "flask", "fastapi", "javascript", "typescript", "react",
    "vue", "angular", "node.js", "express", "html", "css", "sql", "postgresql",
    "mysql", "mongodb", "redis", "docker", "kubernetes", "aws", "azure", "gcp",
    "git", "github", "ci/cd", "linux", "bash", "rest", "api", "graphql",
    "machine learning", "deep learning", "tensorflow", "pytorch", "scikit-learn",
    "pandas", "numpy", "matplotlib", "java", "c++", "c#", "go", "rust", "php",
    "ruby", "swift", "kotlin", "r", "scala", "spark", "hadoop", "kafka",
    "elasticsearch", "nginx", "terraform", "ansible", "jenkins", "jira",
    "agile", "scrum", "microservices", "devops", "nlp", "computer vision",
    "data science", "statistics", "excel", "tableau", "power bi", "figma",
    "photoshop", "illustrator", "next.js", "nuxt.js", "svelte", "tailwind",
    "bootstrap", "sass", "webpack", "vite", "jest", "pytest", "selenium",
    "playwright", "postman", "firebase", "supabase", "heroku", "vercel",
    "netlify", "render", "github actions", "bitbucket", "gitlab",
    "openai", "langchain", "hugging face", "fasthtml", "celery", "rabbitmq",
]

def extract_skills(text):
    text_lower = text.lower()
    found = []
    for skill in TECH_SKILLS:
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            found.append(skill)
    return list(set(found))

def find_missing_skills(resume_skills, job_skills):
    resume_set = {s.lower() for s in resume_skills}
    return [s for s in job_skills if s.lower() not in resume_set]

def extract_keywords(text, top_n=20):
    stop_words = {
        "the", "a", "an", "and", "or", "but", "in", "on", "at", "to",
        "for", "of", "with", "by", "from", "is", "are", "was", "were",
        "be", "been", "have", "has", "had", "do", "does", "did", "will",
        "would", "could", "should", "may", "might", "must", "can", "this",
        "that", "these", "those", "we", "you", "it", "as", "not", "than",
        "more", "also", "our", "your", "their", "its", "any", "all",
    }
    words = re.findall(r'\b[a-zA-Z][a-zA-Z+#.]*\b', text.lower())
    freq = {}
    for w in words:
        if w not in stop_words and len(w) > 2:
            freq[w] = freq.get(w, 0) + 1
    return sorted(freq, key=freq.get, reverse=True)[:top_n]

def calculate_keyword_overlap(resume_text, job_text):
    resume_words = set(extract_keywords(resume_text, 50))
    job_words = set(extract_keywords(job_text, 50))
    if not job_words:
        return 0.0
    overlap = resume_words & job_words
    return round((len(overlap) / len(job_words)) * 100, 1)

def calculate_skill_coverage(resume_skills, job_skills):
    if not job_skills:
        return 100.0
    matched = sum(1 for s in job_skills if s.lower() in {r.lower() for r in resume_skills})
    return round((matched / len(job_skills)) * 100, 1)

def analyze_resume_nlp(resume_text, job_description):
    resume_skills = extract_skills(resume_text)
    job_skills = extract_skills(job_description)
    missing_skills = find_missing_skills(resume_skills, job_skills)
    matched_skills = [s for s in resume_skills if s in job_skills]
    keywords_matched = list(set(extract_keywords(resume_text, 30)) & set(extract_keywords(job_description, 30)))
    keyword_score = calculate_keyword_overlap(resume_text, job_description)
    skill_coverage = calculate_skill_coverage(resume_skills, job_skills)
    match_score = round((keyword_score * 0.5) + (skill_coverage * 0.5), 1)
    match_score = max(0.0, min(100.0, match_score))
    return {
        'match_score': match_score,
        'skills_found': resume_skills,
        'missing_skills': missing_skills,
        'matched_skills': matched_skills,
        'keywords_matched': keywords_matched,
        'semantic_score': keyword_score,
        'skill_coverage_score': skill_coverage,
    }