import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });

import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { app } from "../app";

let mongo: MongoMemoryServer;

beforeAll(async () => {
  jest.setTimeout(30000);

  if (!process.env.JWT_KEY) {
    process.env.JWT_KEY = "fallback_test_key";
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
