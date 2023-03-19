FROM python:3.9
EXPOSE 3487
WORKDIR /code
COPY requirements.txt .
RUN pip install -r requirements.txt --no-cache-dir
COPY src/ .
CMD ["python3", "./main.py"]

