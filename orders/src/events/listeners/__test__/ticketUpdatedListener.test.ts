import { TicketUpdatedEvent } from "@rldtickets/common";
import { TicketUpdatedListener } from "../ticketUpdatedListener";
import { natsWrapper } from "../../../natsWrapper";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";

describe("Ticket Updated Listener", () => {
  const setup = async () => {
    // create an instance of the listener
    const listener = new TicketUpdatedListener(natsWrapper.client);
    // create and save a ticket
    const ticket = Ticket.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      title: "concert",
      price: 10,
    });
    await ticket.save();
    // create a fake data event
    const data: TicketUpdatedEvent["data"] = {
      id: ticket.id,
      version: ticket.version + 1,
      title: "new concert",
      price: 20,
      userId: new mongoose.Types.ObjectId().toHexString(),
    };
    // create a fake message object
    //@ts-ignore
    const msg: Message = {
      ack: jest.fn(),
    };
    // return all of this stuff
    return { listener, data, msg, ticket };
  };
  it("finds, updates and saved a ticket", async () => {
    const { listener, data, msg, ticket } = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.price).toEqual(data.price);
    expect(updatedTicket!.version).toEqual(data.version);
  });
  it("acks the message", async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
  });
  it("does not call ack if the event has a skipped version number", async () => {
    const { listener, data, msg } = await setup();

    data.version = 10;

    try {
      await listener.onMessage(data, msg);
    } catch (err) {}

    expect(msg.ack).not.toHaveBeenCalled();
  });
});
