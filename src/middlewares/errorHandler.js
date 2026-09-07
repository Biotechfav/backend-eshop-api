const AppError = require("../utils/AppError");

const notFound = (req, res, next) =>
  next(new AppError(404, `Ruta ${req.method} ${req.originalUrl} no encontrada`));

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || "Error interno del servidor",
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
};

module.exports = { notFound, errorHandler };