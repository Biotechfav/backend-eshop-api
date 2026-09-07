process.env.DATABASE_URL =
  "mysql://favio:eshop_pass@localhost:3306/eshop_test_db";
process.env.JWT_SECRET = "test-secret";

const request = require("supertest");
const { PrismaClient } = require("@prisma/client");
const app = require("../src/app");

const prisma = new PrismaClient();
let token;
let product;

async function login() {
  const res = await request(app).post("/auth/login").send({
    email: "favio@test.com",
    password: "secret123",
  });
  token = res.body.token;
}

beforeAll(async () => {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  await request(app).post("/auth/register").send({
    name: "Favio",
    email: "favio@test.com",
    password: "secret123",
  });
  await login();

  const category = await prisma.category.create({ data: { name: "Tecnología" } });
  product = await prisma.product.create({
    data: {
      name: "Teclado mecánico",
      description: "Producto de prueba",
      price: 150.5,
      stock: 5,
      categoryId: category.id,
    },
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Flujo de compra", () => {
  test("agregar producto al carrito", async () => {
    const res = await request(app)
      .post("/cart")
      .set("Authorization", `Bearer ${token}`)
      .send({ productId: product.id, quantity: 2 });
    expect(res.statusCode).toBe(201);
    expect(res.body.quantity).toBe(2);
  });

  test("checkout crea la orden y descuenta stock (transacción)", async () => {
    const before = await prisma.product.findUnique({ where: { id: product.id } });
    expect(before.stock).toBe(5);

    const res = await request(app)
      .post("/orders/checkout")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(201);
    expect(res.body.items.length).toBe(1);
    expect(parseFloat(res.body.total)).toBe(301);

    const after = await prisma.product.findUnique({ where: { id: product.id } });
    expect(after.stock).toBe(3);
  });

  test("el carrito queda vacío tras el checkout", async () => {
    const res = await request(app)
      .get("/cart")
      .set("Authorization", `Bearer ${token}`);
    expect(res.body.length).toBe(0);
  });

  test("checkout sin carrito da 400", async () => {
    const res = await request(app)
      .post("/orders/checkout")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(400);
  });
});