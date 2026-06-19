// tests/health.test.js
import request from "supertest";
import app from "../app.js";

describe("GET /api/health", () => {
  it("should return 200 with status ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});
