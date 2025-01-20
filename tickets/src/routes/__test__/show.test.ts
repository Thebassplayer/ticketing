import request from "supertest";
import { app } from "../../app";
import { getAuthCookie } from "../../test/setup";

describe("GET /api/tickets/:id", () => {
  it("returns a 404 if the ticket is not found", async () => {
    const response = await request(app)
      .get("/api/tickets/12345")
      .send()
      .expect(404);
  });
  it("returns the ticket if the ticket is found", async () => {
    const title = "concert";
    const price = 20;

    const response = await request(app)
      .post("/api/tickets")
      .set("Cookie", getAuthCookie())
      .send({
        title,
        price,
      })
      .expect(201);

    const ticketId = response.body.id;

    const ticketResponse = await request(app)
      .get(`/api/tickets/${ticketId}`)
      .send()
      .expect(200);

    expect(ticketResponse.body.title).toEqual(title);
    expect(ticketResponse.body.price).toEqual(price);
  });
});
