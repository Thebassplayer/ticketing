import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { Ticket } from "../../models/ticket";
import { getAuthCookie } from "../../test/setup";

describe("GET /api/orders/:orderId", () => {
  it("returns a 404 if the order is not found", async () => {
    const orderId = new mongoose.Types.ObjectId().toHexString();

    await request(app)
      .get(`/api/orders/${orderId}`)
      .set("Cookie", getAuthCookie())
      .send()
      .expect(404);
  });

  it("returns a 401 if the user is not authorized", async () => {
    const ticket = Ticket.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      title: "concert",
      price: 20,
    });
    await ticket.save();

    const user = getAuthCookie("SomeOtherUserId");

    // Make a request to build an order with this ticket
    const { body: order } = await request(app)
      .post("/api/orders")
      .set("Cookie", user)
      .send({ ticketId: ticket.id })
      .expect(201);

    await request(app)
      .get(`/api/orders/${order.id}`)
      .set("Cookie", getAuthCookie())
      .send()
      .expect(401);
  });

  it("returns the order if the user is authorized", async () => {
    const ticket = Ticket.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      title: "concert",
      price: 20,
    });
    await ticket.save();
    const user = getAuthCookie();

    // Make a request to build an order with this ticket
    const { body: order } = await request(app)
      .post("/api/orders")
      .set("Cookie", user)
      .send({ ticketId: ticket.id })
      .expect(201);

    // Make request to fetch the order
    const { body: fetchedOrder } = await request(app)
      .get(`/api/orders/${order.id}`)
      .set("Cookie", user)
      .send()
      .expect(200);

    expect(fetchedOrder.id).toEqual(order.id);
  });
});
