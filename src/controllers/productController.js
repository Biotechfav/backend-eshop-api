const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const list = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const size = Math.min(parseInt(req.query.size, 10) || 10, 100);
  const categoryId = req.query.category
    ? parseInt(req.query.category, 10)
    : undefined;
  const search = req.query.search;

  const where = {};
  if (categoryId) where.categoryId = categoryId;
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ];
  }

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: { category: true },
      skip: (page - 1) * size,
      take: size,
      orderBy: { id: "desc" },
    }),
  ]);

  res.json({ total, page, size, products });
});

const getById = catchAsync(async (req, res, next) => {
  const product = await prisma.product.findUnique({
    where: { id: parseInt(req.params.id, 10) },
    include: { category: true },
  });
  if (!product) throw new AppError(404, "Producto no encontrado");
  res.json(product);
});

const create = catchAsync(async (req, res, next) => {
  const { name, description, price, stock, categoryId } = req.body;

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) throw new AppError(404, "La categoría no existe");

  const product = await prisma.product.create({
    data: { name, description, price, stock, categoryId },
    include: { category: true },
  });

  res.status(201).json(product);
});

module.exports = { list, getById, create };