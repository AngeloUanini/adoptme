import { adoptionsService, petsService, usersService } from "../services/index.js";
import CustomError from "../utils/CustomError.js";
import { isValidObjectId } from "../utils/index.js";

/**
 * GET /api/adoptions
 * Devuelve el listado completo de adopciones registradas.
 */
const getAllAdoptions = async (req, res, next) => {
  try {
    const result = await adoptionsService.getAll();
    return res.status(200).send({ status: "success", payload: result });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/adoptions/:aid
 * Devuelve una adopcion puntual por su id.
 */
const getAdoption = async (req, res, next) => {
  try {
    const { aid } = req.params;

    if (!isValidObjectId(aid)) {
      throw CustomError.createError({
        name: "InvalidIdError",
        message: "El id de adopcion enviado no tiene un formato valido",
        code: 400
      });
    }

    const adoption = await adoptionsService.getBy({ _id: aid });
    if (!adoption) {
      throw CustomError.createError({
        name: "NotFoundError",
        message: "Adoption not found",
        code: 404
      });
    }

    return res.status(200).send({ status: "success", payload: adoption });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/adoptions/:uid/:pid
 * Registra la adopcion de la mascota :pid por parte del usuario :uid.
 */
const createAdoption = async (req, res, next) => {
  try {
    const { uid, pid } = req.params;

    if (!isValidObjectId(uid) || !isValidObjectId(pid)) {
      throw CustomError.createError({
        name: "InvalidIdError",
        message: "Los ids de usuario y mascota deben tener formato valido",
        code: 400
      });
    }

    const user = await usersService.getUserById(uid);
    if (!user) {
      throw CustomError.createError({
        name: "NotFoundError",
        message: "User Not found",
        code: 404
      });
    }

    const pet = await petsService.getBy({ _id: pid });
    if (!pet) {
      throw CustomError.createError({
        name: "NotFoundError",
        message: "Pet not found",
        code: 404
      });
    }

    if (pet.adopted) {
      throw CustomError.createError({
        name: "AlreadyAdoptedError",
        message: "Pet is already adopted",
        code: 400
      });
    }

    user.pets.push({ _id: pet._id });
    await usersService.update(user._id, { pets: user.pets });
    await petsService.update(pet._id, { adopted: true, owner: user._id });
    const adoption = await adoptionsService.create({ owner: user._id, pet: pet._id });

    return res.status(200).send({
      status: "success",
      message: "Pet adopted",
      payload: adoption
    });
  } catch (error) {
    return next(error);
  }
};

export default {
  getAllAdoptions,
  getAdoption,
  createAdoption
};
