FROM python:3.12.7-alpine3.20
COPY . /import_questions
WORKDIR /import_questions
RUN pip install -r requirements.txt

CMD ["python3", "import_questions.py"]