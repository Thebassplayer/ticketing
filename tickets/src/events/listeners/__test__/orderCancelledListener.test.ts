import mongoose from "mongoose";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../natsWrapper";
import { OrderCancelledListener } from "../orderCancelledListener";
import { OrderCancelledEvent } from "@rldtickets/common";
import { Message } from "node-nats-streaming";

describe("Order Cancelled Listener", () => {
  const setup = async () => {
    // Create an instance of the listener
    const listener = new OrderCancelledListener(natsWrapper.client);
    // Create an orderId
    const orderId = new mongoose.Types.ObjectId().toHexString();
    // Create and save a ticket
    const ticket = Ticket.build({
      title: "concert",
      price: 99,
      userId: new mongoose.Types.ObjectId().toHexString(),
    });
    ticket.set({ orderId });
    await ticket.save();
    // Create the fake data event
    const data: OrderCancelledEvent["data"] = {
      id: new mongoose.Types.ObjectId().toHexString(),
      version: 0,
      ticket: {
        id: ticket.id,
      },
    };
    // Create the fake message object
    // @ts-ignore
    const msg: Message = {
      ack: jest.fn(),
    };

    return { listener, ticket, data, msg, orderId };
  };
  it("updates the ticket, publishes an event, and acks the message", async () => {
    const { listener, ticket, data, msg, orderId } = await setup();
    await listener.onMessage(data, msg);
    const updatedTicket = await Ticket.findById(ticket.id);
    expect(updatedTicket!.orderId).not.toBeDefined();
    expect(msg.ack).toHaveBeenCalled();
    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });
});
