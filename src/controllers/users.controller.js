import { usersService } from "../services/index.js";
import CustomError from "../utils/CustomError.js";
import { isValidObjectId } from "../utils/index.js";

const getAllUsers = async (req, res, next) => {
  try {
    const users = await usersService.getAll();
    return res.status(200).send({ status: "success", payload: users });
  } catch (error) {
    return next(error);
  }
};

const getUser = async (req, res, next) => {
  try {
    const { uid } = req.params;
    if (!isValidObjectId(uid)) {
      throw CustomError.createError({ name: "InvalidIdError", message: "Invalid user id", code: 400 });
    }
    const user = await usersService.getUserById(uid);
    if (!user) {
      throw CustomError.createError({ name: "NotFoundError", message: "User not found", code: 404 });
    }
    return res.status(200).send({ status: "success", payload: user });
  } catch (error) {
    return next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { uid } = req.params;
    const updateBody = req.body;
    const user = await usersService.getUserById(uid);
    if (!user) {
      throw CustomError.createError({ name: "NotFoundError", message: "User not found", code: 404 });
    }
    const result = await usersService.update(uid, updateBody);
    return res.status(200).send({ status: "success", payload: result });
  } catch (error) {
    return next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { uid } = req.params;
    const result = await usersService.delete(uid);
    return res.status(200).send({ status: "success", payload: result });
  } catch (error) {
    return next(error);
  }
};

export default { getAllUsers, getUser, updateUser, deleteUser };
