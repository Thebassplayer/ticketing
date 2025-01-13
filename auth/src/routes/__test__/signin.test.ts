import request from "supertest";
import { app } from "../../app";

describe("POST /api/users/signin", () => {
  it("returns a 200 on successful signin", async () => {
    // First, signup a user
    await request(app)
      .post("/api/users/signup")
      .send({
        email: "test@test.com",
        password: "password",
      })
      .expect(201);

    // Then, signin with the same credentials
    await request(app)
      .post("/api/users/signin")
      .send({
        email: "test@test.com",
        password: "password",
      })
      .expect(200);
  });

  it("returns a 400 when an unregistered email is provided", async () => {
    await request(app)
      .post("/api/users/signin")
      .send({
        email: "notfound@test.com",
        password: "password",
      })
      .expect(400);
  });

  it("returns a 400 when an incorrect password is provided", async () => {
    // First, signup a user
    await request(app)
      .post("/api/users/signup")
      .send({
        email: "test@test.com",
        password: "password",
      })
      .expect(201);

    // Then, attempt signin with wrong password
    await request(app)
      .post("/api/users/signin")
      .send({
        email: "test@test.com",
        password: "wrongpassword",
      })
      .expect(400);
  });

  it("returns a 400 with missing email or password", async () => {
    // Missing email
    await request(app)
      .post("/api/users/signin")
      .send({
        password: "password",
      })
      .expect(400);

    // Missing password
    await request(app)
      .post("/api/users/signin")
      .send({
        email: "test@test.com",
      })
      .expect(400);
  });

  it("sets a cookie after successful signin", async () => {
    // First, signup a user
    await request(app)
      .post("/api/users/signup")
      .send({
        email: "test@test.com",
        password: "password",
      })
      .expect(201);

    // Then, signin and check the cookie
    const response = await request(app)
      .post("/api/users/signin")
      .send({
        email: "test@test.com",
        password: "password",
      })
      .expect(200);

    expect(response.get("Set-Cookie")).toBeDefined();
  });
});
