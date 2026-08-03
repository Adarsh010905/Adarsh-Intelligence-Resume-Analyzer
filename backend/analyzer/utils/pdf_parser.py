import pdfplumber
import PyPDF2
import io
import re
import logging

logger = logging.getLogger(__name__)

def extract_text_from_pdf(pdf_file) -> str:
    if hasattr(pdf_file, 'read'):
        pdf_bytes = pdf_file.read()
    else:
        pdf_bytes = pdf_file

    pdf_stream = io.BytesIO(pdf_bytes)
    text = _extract_with_pdfplumber(pdf_stream)

    if text and len(text.strip()) > 100:
        return clean_text(text)

    logger.info("pdfplumber insufficient, trying PyPDF2...")
    pdf_stream.seek(0)
    text = _extract_with_pypdf2(pdf_stream)

    if text:
        return clean_text(text)

    logger.warning("Could not extract meaningful text from PDF")
    return ""

def _extract_with_pdfplumber(pdf_stream) -> str:
    try:
        all_text = []
        with pdfplumber.open(pdf_stream) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    all_text.append(page_text)
        return "\n\n".join(all_text)
    except Exception as e:
        logger.error(f"pdfplumber failed: {e}")
        return ""

def _extract_with_pypdf2(pdf_stream) -> str:
    try:
        all_text = []
        reader = PyPDF2.PdfReader(pdf_stream)
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                all_text.append(page_text)
        return "\n\n".join(all_text)
    except Exception as e:
        logger.error(f"PyPDF2 failed: {e}")
        return ""

def clean_text(text: str) -> str:
    text = re.sub(r' +', ' ', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', text)
    return text.strip()

def validate_pdf(pdf_file) -> dict:
    filename = getattr(pdf_file, 'name', '')
    if not filename.lower().endswith('.pdf'):
        return {'valid': False, 'error': 'File must be a PDF (.pdf extension)'}

    max_size = 10 * 1024 * 1024
    if hasattr(pdf_file, 'size') and pdf_file.size > max_size:
        size_mb = pdf_file.size / (1024 * 1024)
        return {'valid': False, 'error': f'File size {size_mb:.1f}MB exceeds the 10MB limit.'}

    if hasattr(pdf_file, 'read'):
        header = pdf_file.read(4)
        pdf_file.seek(0)
        if not header.startswith(b'%PDF'):
            return {'valid': False, 'error': 'File is not a valid PDF'}

    return {'valid': True}