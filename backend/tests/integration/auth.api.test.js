import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import dotenv from "dotenv";
import app from "../../src/app.js";
import User from "../../src/models/User.js";

dotenv.config();

let mongo;

beforeAll(async () => {
  process.env.JWT_SECRET = "test_secret";
  process.env.CLIENT_URL = "http://localhost:3000";
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

afterEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

test("POST /api/auth/register creates user and token", async () => {
  const res = await request(app)
    .post("/api/auth/register")
    .send({
      name: "Alex",
      email: "alex@example.com",
      password: "password123"
    });

  expect(res.status).toBe(201);
  expect(res.body.token).toBeDefined();
  expect(res.body.user.email).toBe("alex@example.com");
});

test("POST /api/auth/login returns token for valid credentials", async () => {
  await request(app)
    .post("/api/auth/register")
    .send({
      name: "Alex",
      email: "alex@example.com",
      password: "password123"
    });

  const res = await request(app)
    .post("/api/auth/login")
    .send({
      email: "alex@example.com",
      password: "password123"
    });

  expect(res.status).toBe(200);
  expect(res.body.token).toBeDefined();
});

test("GET /api/projects returns 401 for unauthorized requests", async () => {
  const res = await request(app).get("/api/projects");
  expect(res.status).toBe(401);
});
