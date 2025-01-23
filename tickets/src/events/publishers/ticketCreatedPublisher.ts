import { Publisher, Subjects, TicketCreatedEvent } from "@rldtickets/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
