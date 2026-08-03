from django.db import models
from django.conf import settings

class ResumeAnalysis(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='analyses',
        verbose_name='User'
    )
    resume_file = models.FileField(upload_to='resumes/', blank=True, null=True)
    resume_text = models.TextField(verbose_name='Extracted Resume Text')
    job_description = models.TextField(verbose_name='Job Description')
    job_title = models.CharField(max_length=200, blank=True, default='')
    company_name = models.CharField(max_length=200, blank=True, default='')
    match_score = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    skills_found = models.JSONField(default=list)
    missing_skills = models.JSONField(default=list)
    keywords_matched = models.JSONField(default=list)
    ai_feedback = models.TextField(blank=True, default='')
    improvement_suggestions = models.JSONField(default=list)
    strengths = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Resume Analysis'
        verbose_name_plural = 'Resume Analyses'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
        ]

    def __str__(self):
        return f"{self.user.email} — {self.job_title or 'Analysis'} ({self.match_score}%)"

    def get_score_category(self):
        score = float(self.match_score)
        if score >= 80:
            return {'label': 'Excellent Match', 'color': 'green'}
        elif score >= 60:
            return {'label': 'Good Match', 'color': 'blue'}
        elif score >= 40:
            return {'label': 'Fair Match', 'color': 'yellow'}
        else:
            return {'label': 'Poor Match', 'color': 'red'}