import {
  Publisher,
  Subjects,
  ExpirationCompleteEvent,
} from "@rldtickets/common";

import { Stan } from "node-nats-streaming";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;

  constructor(client: Stan) {
    super(client);
  }
}
