import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { getAuthCookie } from "../../test/setup";

describe("GET /api/orders", () => {
  it("fetches orders for a particular user", async () => {
    // Create three tickets
    const ticketOne = Ticket.build({
      title: "concert",
      price: 20,
    });
    await ticketOne.save();

    const ticketTwo = Ticket.build({
      title: "movie",
      price: 10,
    });
    await ticketTwo.save();

    const ticketThree = Ticket.build({
      title: "play",
      price: 15,
    });
    await ticketThree.save();

    const userOne = getAuthCookie("User #1");
    const userTwo = getAuthCookie("User #2");

    // Create one order as User #1
    await request(app)
      .post("/api/orders")
      .set("Cookie", userOne)
      .send({ ticketId: ticketOne.id })
      .expect(201);

    // Create two orders as User #2
    const { body: orderOne } = await request(app)
      .post("/api/orders")
      .set("Cookie", userTwo)
      .send({ ticketId: ticketTwo.id })
      .expect(201);

    const { body: orderTwo } = await request(app)
      .post("/api/orders")
      .set("Cookie", userTwo)
      .send({ ticketId: ticketThree.id })
      .expect(201);

    // Make request to get orders for User #2
    const response = await request(app)
      .get("/api/orders")
      .set("Cookie", userTwo)
      .expect(200);

    // Make sure we only got the orders for User #2
    expect(response.body.length).toEqual(2);
    expect(response.body[0].id).toEqual(orderOne.id);
    expect(response.body[1].id).toEqual(orderTwo.id);
    expect(response.body[0].ticket.id).toEqual(ticketTwo.id);
    expect(response.body[1].ticket.id).toEqual(ticketThree.id);
  });
});
