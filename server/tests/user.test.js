// tests/user.test.js — Unit tests for User model
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import User from "../models/user.model.js";

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

afterEach(async () => {
  await User.deleteMany({});
});

describe("User Model", () => {
  it("should default credits to 1000", async () => {
    const user = await User.create({
      name: "Laeeq Ahmed",
      email: "laeeq@test.com",
    });
    expect(user.credits).toBe(1000);
  });

  it("should fail validation when email is missing", async () => {
    const user = new User({ name: "No Email" });
    await expect(user.validate()).rejects.toThrow();
  });

  it("should fail validation when name is missing", async () => {
    const user = new User({ email: "noname@test.com" });
    await expect(user.validate()).rejects.toThrow();
  });
});
