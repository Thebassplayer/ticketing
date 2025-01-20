import request from "supertest";
import { app } from "../../app";
import { getAuthCookie } from "../../test/setup";
import { Ticket } from "../../models/ticket";

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

    const response = await request(app)
      .post("/api/tickets")
      .set("Cookie", cookie)
      .send({});

    expect(response.status).not.toEqual(401);
  });
  it("return an error if an invalid title is provided", async () => {
    await request(app)
      .post("/api/tickets")
      .set("Cookie", getAuthCookie())
      .send({
        title: "",
        price: 10,
      })
      .expect(400);

    await request(app)
      .post("/api/tickets")
      .set("Cookie", getAuthCookie())
      .send({
        price: 10,
      })
      .expect(400);
  });
  it("return an error if an invalid price is provided", async () => {
    await request(app)
      .post("/api/tickets")
      .set("Cookie", getAuthCookie())
      .send({
        title: "concert",
        price: -10,
      })
      .expect(400);

    await request(app)
      .post("/api/tickets")
      .set("Cookie", getAuthCookie())
      .send({
        title: "concert",
      })
      .expect(400);
  });
  it("create a ticket with valid inputs", async () => {
    // add in a check to make sure a ticket was saved
    let tickets = await Ticket.find({});
    expect(tickets.length).toEqual(0);

    const title = "concert";
    const price = 20;

    await request(app)
      .post("/api/tickets")
      .set("Cookie", getAuthCookie())
      .send({
        title,
        price,
      })
      .expect(201);

    tickets = await Ticket.find({});
    expect(tickets.length).toEqual(1);
    expect(tickets[0].price).toEqual(price);
    expect(tickets[0].title).toEqual(title);
  });
});
