import request from "supertest";
import { app } from "../../app";

describe("POST /api/users/signout", () => {
  it("clears the cookie after signing out", async () => {
    // First, signup a user
    await request(app)
      .post("/api/users/signup")
      .send({
        email: "test@test.com",
        password: "password",
      })
      .expect(201);

    // Then, sign out
    const response = await request(app)
      .post("/api/users/signout")
      .send({})
      .expect(200);

    // Ensure the cookie is cleared

    const cookie = response.get("Set-Cookie");
    expect(cookie).toBeDefined();
    if (cookie) {
      // Check that the cookie contains attributes indicating a cleared session
      expect(cookie[0]).toContain("session=;");
      expect(cookie[0]).toContain("expires=");
    }
  });
});
