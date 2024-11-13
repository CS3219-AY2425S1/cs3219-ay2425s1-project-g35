import requests
import pytest
import time
from test_user_service import login
from test_user_service import ENDPOINT as USER_SERVICE_ENDPOINT

BASE_URL = "http://nginx/api/match/matcher"

COUNTER = 0
# Test data
def create_match_request(user_id, socket_id):
    return {
        "userId": user_id,
        "topic": "Algorithms",
        "difficulty": "Medium",
        "socketId": socket_id,
    }


def delete_account(access_token: str, user_id: str):
    resp = requests.delete(
        f"{USER_SERVICE_ENDPOINT}users/{user_id}",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert resp.status_code == 200

def cancel_request(user_id, token):
    response = requests.post(
        f"{BASE_URL}/cancel", json={"userId": user_id}, cookies={"accessToken": token}
    )
    # Don't need to assert as this is just a cleanup function


def create_user(index: int):
    global COUNTER
    endpoint = f"{USER_SERVICE_ENDPOINT}users"
    payload = {
        "username": f"SampleUser{index}{COUNTER}",
        "email": f"sample{index}{COUNTER}@gmail.com",
        "password": "SecurePassword",
    }
    _ = requests.post(endpoint, json=payload)
    resp = login(f"sample{index}{COUNTER}@gmail.com", "SecurePassword")
    COUNTER += 1
    return (resp.json()["data"]["accessToken"], resp.json()["data"]["id"])


@pytest.fixture
def user_data():
    return create_user(1)


@pytest.fixture
def two_users():
    user1 = create_user(1)
    user2 = create_user(2)
    return user1, user2


def test_match_request_unauthenticated():
    """Test match request without authentication"""
    response = requests.post(
        f"{BASE_URL}/match", json=create_match_request("123", "socket123")
    )
    assert response.status_code == 401


def test_match_request_invalid_token():
    """Test match request with invalid token"""
    response = requests.post(
        f"{BASE_URL}/match",
        json=create_match_request("123", "socket123"),
        cookies={"accessToken": "invalid-token"},
    )
    assert response.status_code == 401


@pytest.mark.serial
def test_match_users_same_criteria(two_users):
    """Test matching two users with the same criteria"""
    (token1, user_id1), (token2, user_id2) = two_users

    # First user sends match request
    response1 = requests.post(
        f"{BASE_URL}/match",
        json=create_match_request(user_id1, "socket1"),
        cookies={"accessToken": token1},
    )
    print(response1.json())
    assert response1.status_code == 200
    assert response1.json()["message"] == "Match request sent"

    # Second user sends match request with same criteria
    response2 = requests.post(
        f"{BASE_URL}/match",
        json=create_match_request(user_id2, "socket2"),
        cookies={"accessToken": token2},
    )
    assert response2.status_code == 200
    assert response2.json()["message"] == "Match request sent"

    time.sleep(2)  # Wait briefly to ensure match is made

    # Try sending matching requests again, if 200, it means that the previous one has already been matched
    # First user sends match request
    payload1 = create_match_request(user_id1, "socket1")
    payload1["difficulty"] = (
        "Easy"  # Change this to ensure this and the next request don't match
    )
    payload1["topic"] = (
        "Nonsense"  # Change this to ensure this and the next request don't match
    )
    response1_again = requests.post(
        f"{BASE_URL}/match", json=payload1, cookies={"accessToken": token1}
    )
    assert response1_again.status_code == 200
    assert response1_again.json()["message"] == "Match request sent"

    # Clean up
    # Cancel match request to make sure it doesn't affect the next test
    cancel_request(user_id1, token1)
    cancel_request(user_id2, token2)
    delete_account(token1, user_id1)
    delete_account(token2, user_id2)


@pytest.mark.serial
def test_match_users_different_difficulty(two_users):
    """Test matching users with different difficulty preferences"""
    (token1, user_id1), (token2, user_id2) = two_users

    # First user requests Medium difficulty
    request1 = create_match_request(user_id1, "socket1")
    response1 = requests.post(
        f"{BASE_URL}/match", json=request1, cookies={"accessToken": token1}
    )
    assert response1.status_code == 200

    # Second user requests Easy difficulty
    request2 = create_match_request(user_id2, "socket2")
    request2["difficulty"] = "Easy"
    response2 = requests.post(
        f"{BASE_URL}/match", json=request2, cookies={"accessToken": token2}
    )
    assert response2.status_code == 200

    # Wait briefly to ensure no match is made
    time.sleep(2)
    # Try sending matching requests again, if 200, it means that the previous one has already been matched
    # First user sends match request
    payload1 = create_match_request(user_id1, "socket1")
    payload1["difficulty"] = "Easy"
    payload1["topic"] = "Nonsense"
    response1_again = requests.post(
        f"{BASE_URL}/match", json=payload1, cookies={"accessToken": token1}
    )
    assert response1_again.status_code == 200
    assert response1_again.json()["message"] == "Match request sent"

    # Clean up
    # Cancel match request to make sure it doesn't affect the next test
    cancel_request(user_id1, token1)
    cancel_request(user_id2, token2)
    delete_account(token1, user_id1)
    delete_account(token2, user_id2)


@pytest.mark.serial
def test_cancel_match_during_search(two_users):
    """Test cancelling a match request while searching"""
    (token1, user_id1), (token2, user_id2) = two_users

    # First user sends match request
    response1 = requests.post(
        f"{BASE_URL}/match",
        json=create_match_request(user_id1, "socket1"),
        cookies={"accessToken": token1},
    )
    assert response1.status_code == 200

    # First user cancels their request
    cancel_response = requests.post(
        f"{BASE_URL}/cancel", json={"userId": user_id1}, cookies={"accessToken": token1}
    )
    print(cancel_response.json())
    assert cancel_response.status_code == 200

    time.sleep(1)  # Make sure the request is cancelled

    # Second user sends match request
    response2 = requests.post(
        f"{BASE_URL}/match",
        json=create_match_request(user_id2, "socket2"),
        cookies={"accessToken": token2},
    )
    assert response2.status_code == 200

    # Wait briefly to ensure no match is made
    time.sleep(2)
    # Check if the second user is still in queue
    response2 = requests.post(
        f"{BASE_URL}/match",
        json=create_match_request(user_id2, "socket2"),
        cookies={"accessToken": token2},
    )
    assert response2.status_code == 400

    # Clean up
    # Cancel user 2's match attempt
    cancel_request(user_id1, token1)
    cancel_request(user_id2, token2)
    delete_account(token1, user_id1)
    delete_account(token2, user_id2)


@pytest.mark.serial
def test_multiple_match_requests_same_user(user_data):
    """Test multiple match requests from the same user"""
    token1, user_id1 = user_data

    # First request
    response1 = requests.post(
        f"{BASE_URL}/match",
        json=create_match_request(user_id1, "socket1"),
        cookies={"accessToken": token1},
    )
    assert response1.status_code == 200
    time.sleep(1)
    # Second request from same user
    response2 = requests.post(
        f"{BASE_URL}/match",
        json=create_match_request(user_id1, "socket1"),
        cookies={"accessToken": token1},
    )
    # Should fail as user already has an active request
    assert response2.status_code == 400

    # Clean up
    cancel_request(user_id1, token1)
    delete_account(token1, user_id1)


@pytest.mark.serial
def test_cancel_nonexistent_match(user_data):
    """Test cancelling a match request that doesn't exist"""
    token1, user_id1 = user_data

    response = requests.post(
        f"{BASE_URL}/cancel", json={"userId": user_id1}, cookies={"accessToken": token1}
    )
    assert response.status_code == 400

    # Clean up
    delete_account(token1, user_id1)


@pytest.mark.serial
def test_cancel_match_unauthenticated():
    """Test match cancellation without authentication"""
    response = requests.post(f"{BASE_URL}/cancel", json={"userId": "123"})
    assert response.status_code == 401


@pytest.mark.serial
def test_cancel_match_invalid_token():
    """Test match cancellation with invalid token"""
    response = requests.post(
        f"{BASE_URL}/cancel",
        json={"userId": "123"},
        cookies={"accessToken": "invalid-token"},
    )
    assert response.status_code == 401
