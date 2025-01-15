import request from "supertest";
import { app } from "../../app";
import { getAuthCookie } from "../../test/setup";

describe("POST /api/tickets", () => {
  it("has a route handler listening to /api/tickets for post requests", async () => {
    const response = await request(app).post("/api/tickets").send({});
    expect(response.status).not.toEqual(404);
  });
  it("can only be accessed if the user is signed in", async () => {
    await request(app).post("/api/tickets").send({}).expect(401);
  });
  it("returns a status other than 401 if the user is signed in", async () => {
    const cookie = getAuthCookie();

    console.log("Cookie:", cookie);

    const response = await request(app)
      .post("/api/tickets")
      .set("Cookie", cookie)
      .send({});

    console.log(response.status);
    //print cookie
    console.log("Response Cookie:", response.get("Set-Cookie"));
    expect(response.status).not.toEqual(401);
  });
  it("return an error if an invalid title is provided", async () => {});
  it("return an error if an invalid price is provided", async () => {});
  it("create a ticket with valid inputs", async () => {});
});
