from locust import HttpUser, task, between
from prometheus_client import start_http_server, Summary, Counter, Gauge
import random
import time

# Create Prometheus metrics
REQUEST_TIME = Summary('request_processing_seconds', 'Time spent processing request')
REQUESTS = Counter('http_requests_total', 'Total number of HTTP requests')
FAILED_REQUESTS = Counter('http_requests_failed_total', 'Total number of failed HTTP requests')

class MyAppUser(HttpUser):
    host = "http://localhost:8050"
    wait_time = between(1, 5)  # Wait time between tasks

    def on_start(self):
        """Perform login to get the authentication token."""
        response = self.client.post("/api/users/login", json={"email": "kunal_sikk0a@mun.ca", "password": "1234"})
        if response.status_code == 200:
            self.token = response.json().get("token")
        else:
            self.token = None  # Handle login failure

    @task
    def get_top_liked_posts(self):
        if self.token:
            with REQUEST_TIME.time():
                response = self.client.get("/api/likes/top-liked-posts", headers={"Authorization": f"Bearer {self.token}"})
                if response.status_code == 200:
                    REQUESTS.inc()
                else:
                    FAILED_REQUESTS.inc()

    @task
    def get_user_liked_posts(self):
        if self.token:
            user_id = random.randint(1, 100)  # Adjust according to your data
            with REQUEST_TIME.time():
                response = self.client.get(f"/api/likes/user/{user_id}", headers={"Authorization": f"Bearer {self.token}"})
                if response.status_code == 200:
                    REQUESTS.inc()
                else:
                    FAILED_REQUESTS.inc()

# Start Prometheus client
if __name__ == "__main__":
    start_http_server(8050)  # Prometheus metrics will be available at http://localhost:8000/metrics
    import locust
    locust.main()
