FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app/

EXPOSE 8000
ENV PYTHONBUFFERED 1
ENV DJANGO_SETTINGS_MODULE=bill_split.settings

CMD ["gunicorn", "bill_split.wsgi:application", "--bind", "0.0.0.0:8000"]