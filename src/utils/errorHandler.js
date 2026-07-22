/**
 * Middleware global de manejo de errores.
 * Traduce cualquier error lanzado en los controllers a una respuesta JSON coherente.
 */
export default (error, req, res, next) => {
  const status = error.code && Number.isInteger(error.code) ? error.code : 500;
  res.status(status).send({
    status: "error",
    error: error.name || "Error",
    message: error.message || "Internal server error"
  });
};
