import { petsService } from "../services/index.js";
import CustomError from "../utils/CustomError.js";

const getAllPets = async (req, res, next) => {
  try {
    const pets = await petsService.getAll();
    return res.status(200).send({ status: "success", payload: pets });
  } catch (error) {
    return next(error);
  }
};

const createPet = async (req, res, next) => {
  try {
    const { name, specie, birthDate } = req.body;
    if (!name || !specie || !birthDate) {
      throw CustomError.createError({
        name: "IncompleteValuesError",
        message: "Incomplete values: name, specie y birthDate son obligatorios",
        code: 400
      });
    }
    const result = await petsService.create({ name, specie, birthDate });
    return res.status(201).send({ status: "success", payload: result });
  } catch (error) {
    return next(error);
  }
};

const updatePet = async (req, res, next) => {
  try {
    const { pid } = req.params;
    const result = await petsService.update(pid, req.body);
    return res.status(200).send({ status: "success", payload: result });
  } catch (error) {
    return next(error);
  }
};

const deletePet = async (req, res, next) => {
  try {
    const { pid } = req.params;
    const result = await petsService.delete(pid);
    return res.status(200).send({ status: "success", payload: result });
  } catch (error) {
    return next(error);
  }
};

export default { getAllPets, createPet, updatePet, deletePet };
