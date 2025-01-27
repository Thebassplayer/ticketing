import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { Order } from "../../models/order";
import { Ticket } from "../../models/ticket";
import { OrderStatus } from "@rldtickets/common";
import { getAuthCookie } from "../../test/setup";
import { natsWrapper } from "../../natsWrapper";

describe("POST /api/orders", () => {
  it("returns an error if the ticket does not exist", async () => {
    const ticketId = new mongoose.Types.ObjectId();

    await request(app)
      .post("/api/orders")
      .set("Cookie", getAuthCookie())
      .send({ ticketId })
      .expect(404);
  });

  it("returns an error if the ticket is already reserved", async () => {
    const ticket = Ticket.build({
      title: "concert",
      price: 20,
    });
    await ticket.save();

    const order = Order.build({
      ticket,
      userId: "randomUserId",
      status: OrderStatus.Created,
      expiresAt: new Date(),
    });
    await order.save();

    await request(app)
      .post("/api/orders")
      .set("Cookie", getAuthCookie())
      .send({ ticketId: ticket.id })
      .expect(400);
  });

  it("reserves a ticket", async () => {
    const ticket = Ticket.build({
      title: "concert",
      price: 20,
    });
    await ticket.save();

    await request(app)
      .post("/api/orders")
      .set("Cookie", getAuthCookie())
      .send({ ticketId: ticket.id })
      .expect(201);
  });

  it("returns an error if an invalid ticketId is provided", async () => {
    await request(app)
      .post("/api/orders")
      .set("Cookie", getAuthCookie())
      .send({ ticketId: "invalidTicketId" })
      .expect(400);
  });

  it("returns an error if no ticketId is provided", async () => {
    await request(app)
      .post("/api/orders")
      .set("Cookie", getAuthCookie())
      .send({})
      .expect(400);
  });

  it("emits an order created event", async () => {
    const ticket = Ticket.build({
      title: "concert",
      price: 20,
    });
    await ticket.save();

    await request(app)
      .post("/api/orders")
      .set("Cookie", getAuthCookie())
      .send({ ticketId: ticket.id })
      .expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });
});
