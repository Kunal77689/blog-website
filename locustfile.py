from locust import HttpUser, task, between
import random

class MyAppUser(HttpUser):
    host = "http://localhost:3001"
    wait_time = between(1, 5)  # Wait time between tasks

    @task
    def get_categories(self):
        self.client.get("/api/category/")

    @task
    def create_category(self):
        category_name = f"Category_{random.randint(1, 1000)}"
        self.client.post("/api/category/create", json={"name": category_name})

    @task
    def update_category(self):
        category_id = random.randint(1, 100)  # Adjust according to your data
        new_name = f"UpdatedCategory_{random.randint(1, 1000)}"
        self.client.post(f"/api/category/update/{category_id}", json={"name": new_name})

    @task
    def delete_category(self):
        category_id = random.randint(1, 100)  # Adjust according to your data
        self.client.post(f"/api/category/delete/{category_id}")

    @task
    def get_top_liked_posts(self):
        self.client.get("/api/likes/top-liked-posts")

    @task
    def get_user_liked_posts(self):
        user_id = random.randint(1, 100)  # Adjust according to your data
        self.client.get(f"/api/likes/user/{user_id}")
