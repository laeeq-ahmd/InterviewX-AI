// tests/setup.js — global setup: start in-memory MongoDB before all tests
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongod;

export default async function setup() {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  process.env.MONGODB_URL = uri;
  await mongoose.connect(uri);
  global.__MONGOD__ = mongod;
}
