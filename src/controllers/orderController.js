const { PrismaClient } = require("@prisma/client");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const prisma = new PrismaClient();

const checkout = catchAsync(async (req, res, next) => {
  const cartItems = await prisma.cartItem.findMany({
    where: { userId: req.user.id },
    include: { product: true },
  });

  if (cartItems.length === 0) throw new AppError(400, "El carrito está vacío");

  // 1. Validar stock de todos los productos antes de tocar la base
  for (const item of cartItems) {
    if (item.quantity > item.product.stock) {
      throw new AppError(400, `Stock insuficiente para ${item.product.name}`);
    }
  }

  // 2. Todo dentro de una TRANSACCIÓN: si algo falla, MySQL hace ROLLBACK
  const order = await prisma.$transaction(async (tx) => {
    for (const item of cartItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    const total = cartItems.reduce(
      (acc, item) => acc + parseFloat(item.product.price) * item.quantity,
      0
    );

    return tx.order.create({
      data: {
        userId: req.user.id,
        total,
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      },
      include: { items: true },
    });
  });

  // 3. Solo si la transacción fue exitosa, vacío el carrito
  await prisma.cartItem.deleteMany({ where: { userId: req.user.id } });

  res.status(201).json(order);
});

const listOrders = catchAsync(async (req, res, next) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user.id },
    include: { items: { include: { product: true } } },
    orderBy: { id: "desc" },
  });
  res.json(orders);
});

const getOrder = catchAsync(async (req, res, next) => {
  const id = parseInt(req.params.id, 10);

  const order = await prisma.order.findFirst({
    where: { id, userId: req.user.id },
    include: { items: { include: { product: true } } },
  });
  if (!order) throw new AppError(404, "Orden no encontrada");

  res.json(order);
});

module.exports = { checkout, listOrders, getOrder };