from time import sleep
import requests
import csv

USER_ENDPOINT = "http://user-service:3001/"
QUESTION_ENDPOINT = "http://question-service:3000/"
USER_PAYLOAD = {
      "username": "SampleUserName",
      "email": "sample@gmail.com",
      "password": "SecurePassword"
    }


def create_user():
    # sleep(10)  # docker compose doesn't seem to be waiting for user-service to be up
    endpoint = f"{USER_ENDPOINT}users"
    _ = requests.post(endpoint, json=USER_PAYLOAD)


def login():
    endpoint = f"{USER_ENDPOINT}auth/login"
    resp = requests.post(endpoint, json=USER_PAYLOAD)
    return resp

def import_questions():
    create_user()
    login_resp = login()
    user_id = login_resp.json()["data"]["id"]
    access_token = login_resp.json()["data"]["accessToken"]
    with open("sample_questions.csv", "r") as file:
        questions = csv.DictReader(file)
        for question in questions:
            payload = {
                "id": int(question["Question ID"]),
                "name": question["Question ID"],
                "description": question["Question Description"],
                "topics": question["Question Categories"],
                "leetcode_link": question["Link"],
                "difficulty": question["Question Complexity"]
            }
            payload["topics"] = payload["topics"].lstrip("[").rstrip("]").replace('"', "").split(", ")
            response = requests.post(f"{QUESTION_ENDPOINT}/question", json=payload, cookies={"accessToken": access_token})
            print(response.json())
    # Delete user
    resp = requests.delete(f"{USER_ENDPOINT}users/{user_id}", headers={"Authorization": f"Bearer {access_token}"})
    print(resp.json())

if __name__ == "__main__":
    import_questions()