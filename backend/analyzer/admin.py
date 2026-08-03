"""
analyzer/admin.py — Register analyzer models in Django Admin
"""

from django.contrib import admin
from .models import ResumeAnalysis

@admin.register(ResumeAnalysis)
class ResumeAnalysisAdmin(admin.ModelAdmin):
    """Admin configuration for ResumeAnalysis model."""

    list_display = [
        'id', 'user', 'job_title', 'company_name',
        'match_score', 'created_at'
    ]
    list_filter = ['created_at']
    search_fields = ['user__email', 'job_title', 'company_name']
    ordering = ['-created_at']
    readonly_fields = [
        'resume_text', 'job_description', 'skills_found',
        'missing_skills', 'keywords_matched', 'ai_feedback',
        'strengths', 'improvement_suggestions', 'created_at', 'updated_at'
    ]

    fieldsets = (
        ('User & Job', {
            'fields': ('user', 'job_title', 'company_name', 'resume_file')
        }),
        ('Analysis Results', {
            'fields': ('match_score', 'skills_found', 'missing_skills', 'keywords_matched')
        }),
        ('AI Feedback', {
            'fields': ('ai_feedback', 'strengths', 'improvement_suggestions'),
            'classes': ('collapse',)
        }),
        ('Raw Text', {
            'fields': ('resume_text', 'job_description'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
        }),
    )