process.env.DATABASE_URL =
  "mysql://favio:eshop_pass@localhost:3306/eshop_test_db";
process.env.JWT_SECRET = "test-secret";

const request = require("supertest");
const { PrismaClient } = require("@prisma/client");
const app = require("../src/app");

const prisma = new PrismaClient();

beforeAll(async () => {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Autenticación", () => {
  test("POST /auth/register crea un usuario", async () => {
    const res = await request(app).post("/auth/register").send({
      name: "Favio",
      email: "favio@test.com",
      password: "secret123",
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.email).toBe("favio@test.com");
    expect(res.body.password).toBeUndefined();
  });

  test("POST /auth/register rechaza email duplicado (400)", async () => {
    const res = await request(app).post("/auth/register").send({
      name: "Otro",
      email: "favio@test.com",
      password: "secret123",
    });
    expect(res.statusCode).toBe(400);
  });

  test("POST /auth/login devuelve token", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "favio@test.com",
      password: "secret123",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeTruthy();
  });

  test("POST /auth/login con contraseña incorrecta da 401", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "favio@test.com",
      password: "incorrecta",
    });
    expect(res.statusCode).toBe(401);
  });
});