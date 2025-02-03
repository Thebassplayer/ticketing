import { Listener, OrderCreatedEvent, Subjects } from "@rldtickets/common";
import { queueGroupName } from "./queueGroupName";
import { Message } from "node-nats-streaming";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    console.log("Event data!", data);

    msg.ack();
  }
}
