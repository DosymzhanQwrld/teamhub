import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import User from "../../src/models/User.js";

let mongo;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

test("User model requires name, email, and password", async () => {
  const user = new User({ email: "test@example.com" });

  await expect(user.validate()).rejects.toThrow();
});

test("User model accepts valid data", async () => {
  const user = new User({
    name: "Test User",
    email: "test@example.com",
    password: "password123"
  });

  await expect(user.validate()).resolves.toBeUndefined();
});
