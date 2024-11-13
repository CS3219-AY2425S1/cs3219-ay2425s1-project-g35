import requests
import pytest
from test_user_service import login
from test_user_service import ENDPOINT as USER_SERVICE_ENDPOINT

BASE_URL = "http://nginx/api/questions"

# Test data
test_question = {
    "id": 200,
    "name": "Sample Test Question",
    "description": "This is a test sample question description.",
    "topics": ["Algorithms", "Data Structures"],
    "leetcode_link": "https://leetcode.com/problem-2",
    "difficulty": "Easy",
}

COUNTER = 0


def delete_account(access_token: str, user_id: str):
    resp = requests.delete(
        f"{USER_SERVICE_ENDPOINT}users/{user_id}",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert resp.status_code == 200


@pytest.fixture
def user_data():
    global COUNTER
    endpoint = f"{USER_SERVICE_ENDPOINT}users"
    payload = {
        "username": f"SampleUserName{COUNTER}",
        "email": f"sample{COUNTER}@gmail.com",
        "password": "SecurePassword",
    }
    _ = requests.post(endpoint, json=payload)
    resp = login(f"sample{COUNTER}@gmail.com", "SecurePassword")
    COUNTER += 1
    return (resp.json()["data"]["accessToken"], resp.json()["data"]["id"])


def test_get_single_question_unauthenticated():
    response = requests.get(f"{BASE_URL}/question?questionId=1")
    assert response.status_code == 401


def test_get_single_question_invalid_token():
    response = requests.get(
        f"{BASE_URL}/question?questionId=1", cookies={"accessToken": "invalid-token"}
    )
    assert response.status_code == 401


@pytest.mark.serial
def test_get_single_question(user_data):
    access_token = user_data[0]
    user_id = user_data[1]
    response = requests.get(
        f"{BASE_URL}/question?questionId=1", cookies={"accessToken": access_token}
    )
    assert response.status_code == 200
    assert response.json().get("Question ID") == 1
    delete_account(access_token, user_id)


@pytest.mark.serial
def test_get_multiple_questions(user_data):
    access_token = user_data[0]
    user_id = user_data[1]
    response = requests.get(
        f"{BASE_URL}/questions?topic=Algorithms&difficulty=Easy",
        cookies={"accessToken": access_token},
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    delete_account(access_token, user_id)


@pytest.mark.serial
def test_get_questions_topic(user_data):
    access_token = user_data[0]
    user_id = user_data[1]
    response = requests.get(
        f"{BASE_URL}/questions?topic=Algorithms", cookies={"accessToken": access_token}
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    delete_account(access_token, user_id)


@pytest.mark.serial
def test_get_questions_difficulty(user_data):
    access_token = user_data[0]
    user_id = user_data[1]
    response = requests.get(
        f"{BASE_URL}/questions?difficulty=Medium", cookies={"accessToken": access_token}
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    delete_account(access_token, user_id)


@pytest.mark.serial
def test_add_question(user_data):
    access_token = user_data[0]
    user_id = user_data[1]
    response = requests.post(
        f"{BASE_URL}/question",
        json=test_question,
        cookies={"accessToken": access_token},
    )
    print(response.json())
    assert response.status_code == 200
    response = requests.get(
        f"{BASE_URL}/question?questionId={test_question['id']}",
        cookies={"accessToken": access_token},
    )
    assert response.status_code == 200
    # assert response.json() == test_question
    delete_account(access_token, user_id)


@pytest.mark.serial
def test_update_question(user_data):
    access_token = user_data[0]
    user_id = user_data[1]
    updated_data = test_question.copy()
    updated_data["description"] = "Updated description."
    response = requests.patch(
        f"{BASE_URL}/question/{test_question['id']}",
        json=updated_data,
        cookies={"accessToken": access_token},
    )
    print(response.json())
    assert response.status_code == 200
    delete_account(access_token, user_id)


@pytest.mark.serial
def test_delete_question(user_data):
    access_token = user_data[0]
    user_id = user_data[1]
    response = requests.delete(
        f"{BASE_URL}/question/{test_question['id']}",
        cookies={"accessToken": access_token},
    )
    assert response.status_code == 200
    delete_account(access_token, user_id)


@pytest.mark.serial
def test_delete_question_invalid_id(user_data):
    access_token = user_data[0]
    user_id = user_data[1]
    response = requests.delete(
        f"{BASE_URL}/question/0", cookies={"accessToken": access_token}
    )
    assert response.status_code == 400
    delete_account(access_token, user_id)
