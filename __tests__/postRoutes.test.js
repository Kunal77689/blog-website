const request = require("supertest");
const app = require("../app"); // Import the app without starting the server
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

// Mock the database pool
jest.mock("pg", () => {
  const mPool = {
    query: jest.fn(),
  };
  return { Pool: jest.fn(() => mPool) };
});

const pool = new Pool();

describe("Post Routes", () => {
  let token;

  beforeAll(async () => {
    // Set up a test user and get an auth token
    const hashedPassword = await bcrypt.hash("testpassword", 10);
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, email: "test@example.com", password: hashedPassword }],
    });

    const response = await request(app)
      .post("/api/users/login")
      .send({ email: "test@example.com", password: "testpassword" });

    console.log("Login Response:", response.body); // Log response body
    console.log("Login Status:", response.status); // Log status code

    if (response.status === 200) {
      token = response.body.token;
    } else {
      throw new Error(`Login failed with status: ${response.status}`);
    }
  });

  test("GET / should return all posts", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, title: "Test Post", content: "This is a test post." }],
    });
    const response = await request(app)
      .get("/api/posts/")
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      { id: 1, title: "Test Post", content: "This is a test post." },
    ]);
  });

  test("POST /create should create a new post", async () => {
    const newPost = {
      title: "New Post",
      content: "This is a new post.",
      user_id: 1,
      post_image: "image-url",
    };
    pool.query.mockResolvedValueOnce({ rows: [newPost] });
    const response = await request(app)
      .post("/api/posts/create")
      .set("Authorization", `Bearer ${token}`)
      .send(newPost);
    expect(response.status).toBe(201);
    expect(response.body).toEqual(newPost);
  });

  test("POST /update/:postId should update post details", async () => {
    const updatedPost = {
      title: "Updated Post",
      content: "This post has been updated.",
    };
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1, ...updatedPost }] });
    const response = await request(app)
      .post("/api/posts/update/1")
      .set("Authorization", `Bearer ${token}`)
      .send(updatedPost);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("title", "Updated Post");
  });
});
