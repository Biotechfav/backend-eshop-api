const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const list = catchAsync(async (req, res, next) => {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
  });
  res.json(categories);
});

const create = catchAsync(async (req, res, next) => {
  const { name } = req.body;

  const exists = await prisma.category.findUnique({ where: { name } });
  if (exists) throw new AppError(400, "La categoría ya existe");

  const category = await prisma.category.create({ data: { name } });
  res.status(201).json(category);
});

module.exports = { list, create };