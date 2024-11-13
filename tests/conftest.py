import pytest


def pytest_configure(config):
    config.addinivalue_line("markers", "serial: mark test to be run serially")


@pytest.fixture(scope="session", autouse=True)
def configure_tests():
    """Configure tests to run serially"""
    pytest.mark.serial = pytest.mark.skipif(False, reason="Serial test")
