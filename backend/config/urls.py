from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.http import FileResponse, Http404


def serve_react(request, path=''):
    index = settings.REACT_BUILD_DIR / 'index.html'
    if index.exists():
        return FileResponse(open(index, 'rb'), content_type='text/html')
    raise Http404("React build not found. Run: npm run build")


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/analyzer/', include('analyzer.urls')),
    re_path(r'^(?!api/|admin/|static/|media/).*$', serve_react),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)