const request = require("supertest");
const express = require("express");
const { Pool } = require("pg");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { app, server } = require("../app"); // Make sure this points to your Express app

// Mock the database pool
jest.mock("pg", () => {
  const mPool = {
    query: jest.fn(),
  };
  return { Pool: jest.fn(() => mPool) };
});

const pool = new Pool();

describe("User Routes", () => {
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

  test("GET / should return all users", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, username: "testuser" }],
    });
    const response = await request(app)
      .get("/api/users/")
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ id: 1, username: "testuser" }]);
  });

  test("POST /createUser should create a new user", async () => {
    const newUser = {
      username: "newuser",
      email: "newuser@example.com",
      password: "newpassword",
      first_name: "New",
      last_name: "User",
      profile_picture: "",
      bio: "",
    };
    pool.query.mockResolvedValueOnce({ rows: [newUser] });
    const response = await request(app)
      .post("/api/users/createUser")
      .send(newUser);
    expect(response.status).toBe(201);
    expect(response.body).toEqual(newUser);
  });

  test("PUT /updateUser/:id should update user details", async () => {
    const updatedUser = {
      username: "updateduser",
    };
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1, ...updatedUser }] });
    const response = await request(app)
      .put("/api/users/updateUser/1")
      .set("Authorization", `Bearer ${token}`)
      .send(updatedUser);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("username", "updateduser");
  });

  test("GET /getUserId/:email should return user id", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });
    const response = await request(app)
      .get("/api/users/getUserId/test@example.com")
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ user: { id: 1 } });
  });

  test("GET /getUserById/:userId should return user by id", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ username: "testuser" }] });
    const response = await request(app)
      .get("/api/users/getUserById/1")
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ username: "testuser" });
  });

  test("GET /getUserByUsername/:username should return user by username", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, username: "testuser" }],
    });
    const response = await request(app)
      .get("/api/users/getUserByUsername/testuser")
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ id: 1, username: "testuser" });
  });

  test("POST /delete/:id should delete a user", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });
    const response = await request(app)
      .post("/api/users/delete/1")
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty(
      "message",
      "User deleted successfully"
    );
  });

  afterAll(async () => {
    // Assuming `app` starts the server in your test file
    await server.close(); // or any method to properly close the server
  });
});
