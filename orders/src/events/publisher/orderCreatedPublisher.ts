import { Publisher, Subjects, OrderCreatedEvent } from "@rldtickets/common";
import { Stan } from "node-nats-streaming";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject: Subjects.OrderCreated = Subjects.OrderCreated;

  constructor(client: Stan) {
    super(client);
  }
}
