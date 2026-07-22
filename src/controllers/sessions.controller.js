import jwt from "jsonwebtoken";
import { usersService } from "../services/index.js";
import CustomError from "../utils/CustomError.js";
import { createHash, passwordValidation } from "../utils/index.js";

const JWT_SECRET = process.env.JWT_SECRET || "tokenSecretJWT";

const register = async (req, res, next) => {
  try {
    const { first_name, last_name, email, password } = req.body;
    if (!first_name || !last_name || !email || !password) {
      throw CustomError.createError({ name: "IncompleteValuesError", message: "Incomplete values", code: 400 });
    }
    const exists = await usersService.getUserByEmail(email);
    if (exists) {
      throw CustomError.createError({ name: "UserAlreadyExists", message: "User already exists", code: 400 });
    }
    const user = await usersService.create({
      first_name,
      last_name,
      email,
      password: createHash(password)
    });
    return res.status(201).send({ status: "success", payload: user._id });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw CustomError.createError({ name: "IncompleteValuesError", message: "Incomplete values", code: 400 });
    }
    const user = await usersService.getUserByEmail(email);
    if (!user || !passwordValidation(user, password)) {
      throw CustomError.createError({ name: "AuthError", message: "Incorrect credentials", code: 400 });
    }
    const token = jwt.sign(
      { _id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    return res
      .cookie("coderCookie", token, { maxAge: 3600000, httpOnly: true })
      .send({ status: "success", message: "Logged in" });
  } catch (error) {
    return next(error);
  }
};

export default { register, login };
