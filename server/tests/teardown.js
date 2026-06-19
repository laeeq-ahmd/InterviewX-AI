// tests/teardown.js — global teardown: stop MongoDB after all tests
import mongoose from "mongoose";

export default async function teardown() {
  await mongoose.disconnect();
  if (global.__MONGOD__) {
    await global.__MONGOD__.stop();
  }
}
