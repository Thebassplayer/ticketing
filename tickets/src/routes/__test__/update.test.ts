import request from "supertest";
import { app } from "../../app";
import { getAuthCookie } from "../../test/setup";
import mongoose from "mongoose";
import { natsWrapper } from "../../natsWrapper";
import { Ticket } from "../../models/ticket";

describe("PUT /api/tickets/:id", () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  it("returns a 404 if the provided id does not exist", async () => {
    await request(app)
      .put(`/api/tickets/${id}`)
      .set("Cookie", getAuthCookie())
      .send({
        title: "concert",
        price: 20,
      })
      .expect(404);
  });

  it("returns a 401 if the user is not authenticated", async () => {
    await request(app)
      .put(`/api/tickets/${id}`)
      .send({
        title: "concert",
        price: 20,
      })
      .expect(401);
  });

  it("returns a 401 if the user does not own the ticket", async () => {
    const response = await request(app)
      .post("/api/tickets")
      .set("Cookie", getAuthCookie())
      .send({
        title: "concert",
        price: 20,
      });

    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set("Cookie", getAuthCookie("5678"))
      .send({
        title: "new title",
        price: 1000,
      })
      .expect(401);
  });
  it("returns a 400 if the user provides an invalid title or price", async () => {
    const cookie = getAuthCookie();

    const response = await request(app)
      .post("/api/tickets")
      .set("Cookie", cookie)
      .send({
        title: "concert",
        price: 20,
      });

    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set("Cookie", cookie)
      .send({
        title: "",
        price: 20,
      })
      .expect(400);

    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set("Cookie", cookie)
      .send({
        title: "concert",
        price: -20,
      })
      .expect(400);
  });
  it("updates the ticket provided valid inputs", async () => {
    const cookie = getAuthCookie();

    const response = await request(app)
      .post("/api/tickets")
      .set("Cookie", cookie)
      .send({
        title: "concert",
        price: 20,
      });

    const newTitle = "new title";
    const newPrice = 1000;

    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set("Cookie", cookie)
      .send({
        title: newTitle,
        price: newPrice,
      })
      .expect(200);

    const ticketResponse = await request(app)
      .get(`/api/tickets/${response.body.id}`)
      .send()
      .expect(200);

    expect(ticketResponse.body.title).toEqual(newTitle);
    expect(ticketResponse.body.price).toEqual(newPrice);
  });

  it("publishes an event", async () => {
    const cookie = getAuthCookie();

    const response = await request(app)
      .post("/api/tickets")
      .set("Cookie", cookie)
      .send({
        title: "concert",
        price: 20,
      });

    const newTitle = "new title";
    const newPrice = 1000;

    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set("Cookie", cookie)
      .send({
        title: newTitle,
        price: newPrice,
      })
      .expect(200);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });
  it("rejects updates if the ticket is reserved", async () => {
    const cookie = getAuthCookie();

    const response = await request(app)
      .post("/api/tickets")
      .set("Cookie", cookie)
      .send({
        title: "concert",
        price: 20,
      });

    const ticket = await Ticket.findById(response.body.id);
    ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
    await ticket!.save();

    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set("Cookie", cookie)
      .send({
        title: "new title",
        price: 1000,
      })
      .expect(400);
  });
});
