import { OrderCreatedListener } from "../orderCreatedListener";
import { natsWrapper } from "../../../natsWrapper";
import { Ticket } from "../../../models/ticket";
import mongoose from "mongoose";
import { OrderCreatedEvent, OrderStatus } from "@rldtickets/common";
import { Message } from "node-nats-streaming";

describe("Order Created Listener", () => {
  const setup = async () => {
    // Create an instance of the listener
    const listener = new OrderCreatedListener(natsWrapper.client);
    // Create and save a ticket
    const ticket = Ticket.build({
      title: "concert",
      price: 99,
      userId: new mongoose.Types.ObjectId().toHexString(),
    });
    await ticket.save();
    // Create the fake data event
    const data: OrderCreatedEvent["data"] = {
      id: new mongoose.Types.ObjectId().toHexString(),
      version: 0,
      status: OrderStatus.Created,
      userId: new mongoose.Types.ObjectId().toHexString(),
      expiresAt: "random",
      ticket: {
        id: ticket.id,
        price: ticket.price,
      },
    };
    // Create the fake message object
    // @ts-ignore
    const msg: Message = {
      ack: jest.fn(),
    };
    return { listener, ticket, data, msg };
  };

  it("sets the userId of the ticket", async () => {
    const { listener, ticket, data, msg } = await setup();
    await listener.onMessage(data, msg);
    const updatedTicket = await Ticket.findById(ticket.id);
    expect(updatedTicket!.orderId).toEqual(data.id);
  });

  it("acks the message", async () => {
    const { listener, ticket, data, msg } = await setup();
    await listener.onMessage(data, msg);
    expect(msg.ack).toHaveBeenCalled();
  });
  it("publishes a ticket updated event", async () => {
    const { listener, ticket, data, msg } = await setup();
    await listener.onMessage(data, msg);
    expect(natsWrapper.client.publish).toHaveBeenCalled();
    const ticketUpdatedData = JSON.parse(
      (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
    );
    expect(data.id).toEqual(ticketUpdatedData.orderId);
  });
});
