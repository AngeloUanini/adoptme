import { Router } from "express";
import adoptionsController from "../controllers/adoptions.controller.js";

const router = Router();

/**
 * @swagger
 * /api/adoptions:
 *   get:
 *     summary: Obtiene el listado completo de adopciones
 *     tags: [Adoptions]
 *     responses:
 *       200:
 *         description: Listado de adopciones obtenido correctamente
 *       500:
 *         description: Error interno del servidor
 */
router.get("/", adoptionsController.getAllAdoptions);

/**
 * @swagger
 * /api/adoptions/{aid}:
 *   get:
 *     summary: Obtiene una adopcion por su id
 *     tags: [Adoptions]
 *     parameters:
 *       - in: path
 *         name: aid
 *         required: true
 *         schema:
 *           type: string
 *         description: Id de la adopcion
 *     responses:
 *       200:
 *         description: Adopcion encontrada
 *       400:
 *         description: El id enviado no tiene formato valido
 *       404:
 *         description: Adopcion inexistente
 */
router.get("/:aid", adoptionsController.getAdoption);

/**
 * @swagger
 * /api/adoptions/{uid}/{pid}:
 *   post:
 *     summary: Registra la adopcion de una mascota por parte de un usuario
 *     tags: [Adoptions]
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: string
 *         description: Id del usuario adoptante
 *       - in: path
 *         name: pid
 *         required: true
 *         schema:
 *           type: string
 *         description: Id de la mascota a adoptar
 *     responses:
 *       200:
 *         description: Mascota adoptada correctamente
 *       400:
 *         description: Ids invalidos o mascota ya adoptada
 *       404:
 *         description: Usuario o mascota inexistente
 */
router.post("/:uid/:pid", adoptionsController.createAdoption);

export default router;
