#!/usr/bin/env bash
set -o errexit

echo "==> Building React frontend..."
cd ../frontend
npm install
npm run build
echo "==> React build complete."

echo "==> Setting up Django backend..."
cd ../backend
pip install --upgrade pip
pip install -r requirements.txt
python -m spacy download en_core_web_sm
python manage.py collectstatic --noinput
python manage.py migrate
echo "==> Django setup complete."
