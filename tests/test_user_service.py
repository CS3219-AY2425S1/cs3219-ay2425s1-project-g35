import pytest
import requests

ENDPOINT = "http://nginx/api/users/"


def login(email: str, password: str) -> requests.Response:
    endpoint = f"{ENDPOINT}auth/login"
    payload = {"email": email, "password": password}
    resp = requests.post(endpoint, json=payload)
    return resp


@pytest.mark.serial
def test_create_user():
    endpoint = f"{ENDPOINT}users"
    payload = {
        "username": "SampleUserName",
        "email": "sample@gmail.com",
        "password": "SecurePassword",
    }
    resp = requests.post(endpoint, json=payload)
    print(resp.json())
    assert resp.status_code == 201


@pytest.mark.serial
def test_create_user_same_email_and_username():
    endpoint = f"{ENDPOINT}users"
    payload = {
        "username": "SampleUserName",
        "email": "sample@gmail.com",
        "password": "SecurePassword",
    }
    resp = requests.post(endpoint, json=payload)
    assert resp.status_code == 409


@pytest.mark.serial
def test_login_user_valid():
    resp = login("sample@gmail.com", "SecurePassword")
    assert resp.status_code == 200


@pytest.mark.serial
def test_login_user_invalid():
    resp = login("sample@gmail.com", "WrongPassword")
    assert resp.status_code == 401


@pytest.mark.serial
def test_verify_token_valid():
    resp = login("sample@gmail.com", "SecurePassword")
    token = resp.json()["data"]["accessToken"]
    endpoint = f"{ENDPOINT}auth/verify-token"
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.get(endpoint, headers=headers)
    assert resp.status_code == 200


@pytest.mark.serial
def test_verify_token_no_token():
    endpoint = f"{ENDPOINT}auth/verify-token"
    resp = requests.get(endpoint)
    assert resp.status_code == 401


@pytest.mark.serial
def test_verify_token_invalid():
    endpoint = f"{ENDPOINT}auth/verify-token"
    headers = {"Authorization": f"Bearer wrongToken"}
    resp = requests.get(endpoint, headers=headers)
    assert resp.status_code == 401


@pytest.mark.serial
def test_delete_user():
    login_resp = login("sample@gmail.com", "SecurePassword")
    token = login_resp.json()["data"]["accessToken"]
    user_id = login_resp.json()["data"]["id"]
    resp = requests.delete(
        f"{ENDPOINT}users/{user_id}", headers={"Authorization": f"Bearer {token}"}
    )
    assert resp.status_code == 200
