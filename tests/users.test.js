const request = require("supertest");
const app = require("../app");
const db = require("./setup");

beforeAll(async () => await db.connect());
afterAll(async () => await db.closeDatabase());
afterEach(async () => await db.clearDatabase());

describe("Users API", () => {
  test("POST /boo/users creates a user", async () => {
    const res = await request(app)
      .post("/boo/users")
      .send({ name: "Alice" });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
  });
});
