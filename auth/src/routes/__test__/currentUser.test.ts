import request from "supertest";
import { app } from "../../app";

describe("GET /api/users/currentuser", () => {
  it("responds with details about the current user", async () => {
    const cookie = await (global as any).getAuthCookie();
    console.log("-------Cookie: ", cookie);
    expect(cookie).toBeDefined();

    if (cookie) {
      const response = await request(app)
        .get("/api/users/currentuser")
        .set("Cookie", cookie)
        .send()
        .expect(200);

      expect(response.body.currentUser.email).toEqual("test@email.com");
    }
  });
});
