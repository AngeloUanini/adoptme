import "dotenv/config";
import mongoose from "mongoose";
import app from "./app.js";

const PORT = process.env.PORT || 8080;
const MONGO_URL = process.env.MONGO_URL;

const startServer = async () => {
  try {
    if (MONGO_URL) {
      await mongoose.connect(MONGO_URL);
      console.log("Conectado a MongoDB");
    } else {
      console.warn("MONGO_URL no definida: el servidor arranca sin conexion a la base de datos");
    }
    app.listen(PORT, () => console.log(`Servidor escuchando en el puerto ${PORT}`));
  } catch (error) {
    console.error("Error al iniciar el servidor:", error.message);
    process.exit(1);
  }
};

startServer();
