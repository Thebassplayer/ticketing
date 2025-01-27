import { Publisher, Subjects, OrderCancelledEvent } from "@rldtickets/common";
import { Stan } from "node-nats-streaming";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject: Subjects.OrderCancelled = Subjects.OrderCancelled;

  constructor(client: Stan) {
    super(client);
  }
}
