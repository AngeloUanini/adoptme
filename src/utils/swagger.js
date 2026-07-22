import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.1",
    info: {
      title: "AdoptMe API",
      version: "1.0.0",
      description: "Documentacion de la API de adopcion de mascotas"
    }
  },
  apis: ["./src/routes/*.js"]
};

export default swaggerJsdoc(options);
