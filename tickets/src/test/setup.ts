import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });

import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

let mongo: MongoMemoryServer;

beforeAll(async () => {
  jest.setTimeout(30000);

  if (!process.env.JWT_KEY) {
    process.env.JWT_KEY = "testjwtkey";
  }

  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  const collections = mongoose.connection.db?.collections();

  if (collections) {
    for (let collection of await collections) {
      await collection.deleteMany({});
    }
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState) {
    await mongoose.connection.close();
  }

  if (mongo) {
    await mongo.stop();
  }
});

export const getAuthCookie = () => {
  // Build a JWT payload. { id, email }
  const payload = {
    id: "12345",
    email: "test@mail.com",
  };
  // Create the JWT!
  const token = jwt.sign(payload, process.env.JWT_KEY!);
  // Build session Object. { jwt: MY_JWT }
  const session = { jwt: token };
  // Turn that session into JSON
  const sessionJSON = JSON.stringify(session);
  // Take JSON and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString("base64");
  // return a string thats the cookie with the encoded data
  const cookie = [`session=${base64}`];

  return cookie;
};
