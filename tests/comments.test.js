const request = require("supertest");
const app = require("../app");
const db = require("./setup");

let userId;

beforeAll(async () => {
  await db.connect();

  const user = await request(app)
    .post("/boo/users")
    .send({ name: "Test User" });

  userId = user.body.id;
});

afterAll(async () => await db.closeDatabase());
afterEach(async () => await db.clearDatabase());

describe("Comments API", () => {
  test("POST /boo/comments creates a comment", async () => {
    const res = await request(app)
      .post("/boo/comments")
      .send({
        userId,
        text: "Hello world"
      });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
  });

  test("POST reply comment", async () => {
    const parent = await request(app)
      .post("/boo/comments")
      .send({ userId, text: "Parent comment" });

    const res = await request(app)
      .post("/boo/comments")
      .send({
        userId,
        text: "Child comment",
        parentId: parent.body.id
      });

    expect(res.status).toBe(201);
  });

  test("Like / Unlike toggle", async () => {
    const comment = await request(app)
      .post("/boo/comments")
      .send({ userId, text: "Like me" });

    const id = comment.body.id;

    const like = await request(app)
      .post(`/boo/comments/${id}/like`)
      .send({ userId });

    expect(like.status).toBe(200);
    expect(like.body.likesCount).toBe(1);

    const unlike = await request(app)
      .post(`/boo/comments/${id}/like`)
      .send({ userId });

    expect(unlike.status).toBe(200);
    expect(unlike.body.likesCount).toBe(0);
  });
});
