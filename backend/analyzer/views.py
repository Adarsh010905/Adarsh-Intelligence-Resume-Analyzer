from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import ResumeAnalysis
from .serializers import AnalyzeRequestSerializer, ResumeAnalysisSerializer, ResumeAnalysisListSerializer
from .utils.pdf_parser import extract_text_from_pdf, validate_pdf
from .utils.nlp_utils import analyze_resume_nlp
from .utils.ai_analyzer import get_ai_feedback
import logging

logger = logging.getLogger(__name__)

class AnalyzeResumeView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request):
        logger.info(f"Analysis request from: {request.user.email}")

        input_serializer = AnalyzeRequestSerializer(data=request.data)
        if not input_serializer.is_valid():
            return Response(input_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        validated_data = input_serializer.validated_data
        resume_file = validated_data.get('resume_file')
        resume_text = validated_data.get('resume_text', '')
        job_description = validated_data.get('job_description')
        job_title = validated_data.get('job_title', '')
        company_name = validated_data.get('company_name', '')

        if resume_file:
            validation = validate_pdf(resume_file)
            if not validation['valid']:
                return Response({'error': validation['error']}, status=status.HTTP_400_BAD_REQUEST)

            extracted_text = extract_text_from_pdf(resume_file)
            if not extracted_text or len(extracted_text.strip()) < 100:
                return Response({
                    'error': 'Could not extract text from PDF. Ensure it is a text-based PDF or paste text directly.'
                }, status=status.HTTP_400_BAD_REQUEST)

            final_resume_text = extracted_text
        else:
            final_resume_text = resume_text

        nlp_results = analyze_resume_nlp(final_resume_text, job_description)
        ai_results = get_ai_feedback(
            resume_text=final_resume_text,
            job_description=job_description,
            nlp_results=nlp_results,
            job_title=job_title,
            company_name=company_name
        )

        analysis = ResumeAnalysis.objects.create(
            user=request.user,
            resume_file=resume_file,
            resume_text=final_resume_text,
            job_description=job_description,
            job_title=job_title,
            company_name=company_name,
            match_score=nlp_results['match_score'],
            skills_found=nlp_results['skills_found'],
            missing_skills=nlp_results['missing_skills'],
            keywords_matched=nlp_results['keywords_matched'],
            ai_feedback=ai_results.get('feedback', ''),
            strengths=ai_results.get('strengths', []),
            improvement_suggestions=ai_results.get('suggestions', []),
        )

        response_data = ResumeAnalysisSerializer(analysis).data
        response_data['missing_skills_advice'] = ai_results.get('missing_skills_advice', '')
        response_data['formatting_tips'] = ai_results.get('formatting_tips', '')
        response_data['interview_tips'] = ai_results.get('interview_tips', '')
        response_data['score_breakdown'] = {
            'semantic_similarity': nlp_results.get('semantic_score', 0),
            'skill_coverage': nlp_results.get('skill_coverage_score', 0),
            'overall': nlp_results['match_score']
        }

        logger.info(f"Analysis saved ID: {analysis.id}, score: {analysis.match_score}%")
        return Response(response_data, status=status.HTTP_201_CREATED)

class AnalysisHistoryView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ResumeAnalysisListSerializer

    def get_queryset(self):
        return ResumeAnalysis.objects.filter(user=self.request.user).order_by('-created_at')

class AnalysisDetailView(generics.RetrieveDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ResumeAnalysisSerializer

    def get_queryset(self):
        return ResumeAnalysis.objects.filter(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({'message': 'Analysis deleted successfully.'}, status=status.HTTP_200_OK)

class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from django.db.models import Avg, Max, Count
        user_analyses = ResumeAnalysis.objects.filter(user=request.user)
        stats = user_analyses.aggregate(
            total=Count('id'),
            avg_score=Avg('match_score'),
            highest_score=Max('match_score'),
        )
        recent = user_analyses.order_by('-created_at')[:3]
        return Response({
            'total_analyses': stats['total'] or 0,
            'average_score': round(float(stats['avg_score'] or 0), 1),
            'highest_score': round(float(stats['highest_score'] or 0), 1),
            'recent_analyses': ResumeAnalysisListSerializer(recent, many=True).data,
        }, status=status.HTTP_200_OK)