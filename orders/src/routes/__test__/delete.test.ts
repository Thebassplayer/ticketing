import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { Order } from "../../models/order";
import { OrderStatus } from "@rldtickets/common";
import { Ticket } from "../../models/ticket";
import { getAuthCookie } from "../../test/setup";
import { natsWrapper } from "../../natsWrapper";

describe("DELETE /api/orders/:orderId", () => {
  it("returns a 404 if the order is not found", async () => {
    const orderId = new mongoose.Types.ObjectId().toHexString();

    await request(app)
      .delete(`/api/orders/${orderId}`)
      .set("Cookie", getAuthCookie())
      .send()
      .expect(404);
  });

  it("returns a 401 if the user is not authorized", async () => {
    const ticket = Ticket.build({
      title: "concert",
      price: 20,
    });
    await ticket.save();

    const order = Order.build({
      ticket,
      userId: "someOtherUserId",
      status: OrderStatus.Created,
      expiresAt: new Date(),
    });
    await order.save();

    await request(app)
      .delete(`/api/orders/${order.id}`)
      .set("Cookie", getAuthCookie())
      .send()
      .expect(401);
  });

  it("returns a 204 and cancels the order if the user is authorized", async () => {
    const ticket = Ticket.build({
      title: "concert",
      price: 20,
    });
    await ticket.save();

    const userId = new mongoose.Types.ObjectId().toHexString();
    const order = Order.build({
      ticket,
      userId,
      status: OrderStatus.Created,
      expiresAt: new Date(),
    });
    await order.save();

    await request(app)
      .delete(`/api/orders/${order.id}`)
      .set("Cookie", getAuthCookie(userId))
      .send()
      .expect(204);

    const updatedOrder = await Order.findById(order.id);
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
  });

  it("emits an order cancelled event", async () => {
    const ticket = Ticket.build({
      title: "concert",
      price: 20,
    });
    await ticket.save();

    const userId = new mongoose.Types.ObjectId().toHexString();
    const order = Order.build({
      ticket,
      userId,
      status: OrderStatus.Created,
      expiresAt: new Date(),
    });
    await order.save();

    await request(app)
      .delete(`/api/orders/${order.id}`)
      .set("Cookie", getAuthCookie(userId))
      .send()
      .expect(204);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });
});
