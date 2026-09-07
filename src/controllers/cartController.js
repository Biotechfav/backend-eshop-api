const { PrismaClient } = require("@prisma/client");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const prisma = new PrismaClient();

const addItem = catchAsync(async (req, res, next) => {
  const { productId, quantity } = req.body;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new AppError(404, "Producto no encontrado");

  const existing = await prisma.cartItem.findUnique({
    where: { userId_productId: { userId: req.user.id, productId } },
  });

  if (existing) {
    const updated = await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
      include: { product: true },
    });
    return res.json(updated);
  }

  const item = await prisma.cartItem.create({
    data: { userId: req.user.id, productId, quantity },
    include: { product: true },
  });
  res.status(201).json(item);
});

const listCart = catchAsync(async (req, res, next) => {
  const items = await prisma.cartItem.findMany({
    where: { userId: req.user.id },
    include: { product: true },
  });
  res.json(items);
});

const updateQuantity = catchAsync(async (req, res, next) => {
  const id = parseInt(req.params.id, 10);

  const item = await prisma.cartItem.findFirst({
    where: { id, userId: req.user.id },
  });
  if (!item) throw new AppError(404, "Ítem del carrito no encontrado");

  const updated = await prisma.cartItem.update({
    where: { id },
    data: { quantity: req.body.quantity },
    include: { product: true },
  });
  res.json(updated);
});

const removeItem = catchAsync(async (req, res, next) => {
  const id = parseInt(req.params.id, 10);

  const item = await prisma.cartItem.findFirst({
    where: { id, userId: req.user.id },
  });
  if (!item) throw new AppError(404, "Ítem del carrito no encontrado");

  await prisma.cartItem.delete({ where: { id } });
  res.status(204).end();
});

module.exports = { addItem, listCart, updateQuantity, removeItem };