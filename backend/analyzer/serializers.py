from rest_framework import serializers
from .models import ResumeAnalysis

class AnalyzeRequestSerializer(serializers.Serializer):
    resume_file = serializers.FileField(required=False, allow_null=True)
    resume_text = serializers.CharField(required=False, allow_blank=True)
    job_description = serializers.CharField(required=True)
    job_title = serializers.CharField(required=False, max_length=200, allow_blank=True, default='')
    company_name = serializers.CharField(required=False, max_length=200, allow_blank=True, default='')

    def validate(self, attrs):
        resume_file = attrs.get('resume_file')
        resume_text = attrs.get('resume_text', '').strip()
        if not resume_file and not resume_text:
            raise serializers.ValidationError({'resume': 'Please provide either a resume PDF file or resume text.'})
        if resume_text and len(resume_text) < 100:
            raise serializers.ValidationError({'resume_text': 'Resume text must be at least 100 characters.'})
        return attrs

class ResumeAnalysisSerializer(serializers.ModelSerializer):
    score_category = serializers.SerializerMethodField()
    user_email = serializers.SerializerMethodField()

    class Meta:
        model = ResumeAnalysis
        fields = [
            'id', 'user_email', 'job_title', 'company_name', 'match_score',
            'score_category', 'ai_feedback', 'skills_found', 'missing_skills',
            'keywords_matched', 'improvement_suggestions', 'strengths',
            'created_at', 'updated_at',
        ]
        read_only_fields = fields

    def get_score_category(self, obj):
        return obj.get_score_category()

    def get_user_email(self, obj):
        return obj.user.email

class ResumeAnalysisListSerializer(serializers.ModelSerializer):
    score_category = serializers.SerializerMethodField()

    class Meta:
        model = ResumeAnalysis
        fields = ['id', 'job_title', 'company_name', 'match_score', 'score_category', 'created_at']
        read_only_fields = fields

    def get_score_category(self, obj):
        return obj.get_score_category()