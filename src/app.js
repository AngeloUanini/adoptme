import express from "express";
import cookieParser from "cookie-parser";
import swaggerUiExpress from "swagger-ui-express";

import usersRouter from "./routes/users.router.js";
import petsRouter from "./routes/pets.router.js";
import adoptionsRouter from "./routes/adoption.router.js";
import sessionsRouter from "./routes/sessions.router.js";
import errorHandler from "./utils/errorHandler.js";
import specs from "./utils/swagger.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/health", (req, res) => res.status(200).send({ status: "ok" }));

app.use("/api/users", usersRouter);
app.use("/api/pets", petsRouter);
app.use("/api/adoptions", adoptionsRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/api/docs", swaggerUiExpress.serve, swaggerUiExpress.setup(specs));

app.use(errorHandler);

export default app;
