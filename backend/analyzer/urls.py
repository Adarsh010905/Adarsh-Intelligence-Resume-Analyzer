"""
analyzer/urls.py — Analyzer App URL Routes

All these URLs are prefixed with /api/analyzer/
(set in config/urls.py)
"""

from django.urls import path
from . import views

app_name = 'analyzer'

urlpatterns = [
    path('analyze/', views.AnalyzeResumeView.as_view(), name='analyze'),

    path('history/', views.AnalysisHistoryView.as_view(), name='history'),

    path('history/<int:pk>/', views.AnalysisDetailView.as_view(), name='history-detail'),

    path('stats/', views.DashboardStatsView.as_view(), name='stats'),
]