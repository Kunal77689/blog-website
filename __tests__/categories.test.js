const request = require("supertest");
const express = require("express");
const categoriesRouter = require("../routes/categories");
const { getAuthToken } = require("./authHelper");
const app = express();
app.use(express.json());
app.use("/categories", categoriesRouter);

let token;

beforeAll(async () => {
  // Replace with valid email and password
  token = await getAuthToken("ksikka@mun.ca", "1234");
});

describe("Categories API", () => {
  test("GET /categories should return all categories", async () => {
    const response = await request(app)
      .get("/categories")
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });

  test("POST /categories/create should create a category", async () => {
    const response = await request(app)
      .post("/categories/create")
      .send({ name: "Test Category" })
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toBe(201);
    expect(response.body.name).toBe("Test Category");
  });

  test("POST /categories/update/:categoryid should update a category", async () => {
    const response = await request(app)
      .post("/categories/update/1") // replace 1 with an existing category ID
      .send({ name: "Updated Category" })
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.name).toBe("Updated Category");
  });

  test("POST /categories/delete/:categoryid should delete a category", async () => {
    const response = await request(app)
      .post("/categories/delete/1") // replace 1 with an existing category ID
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Category deleted successfully");
  });
});
