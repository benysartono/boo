const request = require("supertest");
const app = require("../app");
const db = require("./setup");

beforeAll(async () => await db.connect());
afterAll(async () => await db.closeDatabase());
afterEach(async () => await db.clearDatabase());

describe("Profiles API", () => {
  test("POST /boo/profiles creates a profile", async () => {
    const res = await request(app)
      .post("/boo/profiles")
      .send({
        name: "Test Boo",
        title: "Title",
        description: "Hello"
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.id).toBeDefined();
  });

  test("GET /boo/profile/:id returns a profile", async () => {
    const create = await request(app)
      .post("/boo/profiles")
      .send({
        name: "Test Boo",
        title: "T",
        description: "D"
      });

    const id = create.body.id;

    const res = await request(app).get(`/boo/profile/${id}`);
    expect(res.status).toBe(200);
  });
});
