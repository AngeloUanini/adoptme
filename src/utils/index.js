import mongoose from "mongoose";
import { createHash as nodeCreateHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
export default __dirname;

/** Valida que un string tenga formato de ObjectId de MongoDB */
export const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/** Hashea una contraseña con scrypt (modulo nativo de Node, sin dependencias externas) */
export const createHash = (password) => {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
};

/** Compara una contraseña plana contra el hash almacenado */
export const passwordValidation = (user, password) => {
  const [salt, key] = String(user.password).split(":");
  if (!salt || !key) return false;
  const hash = scryptSync(password, salt, 64);
  return timingSafeEqual(Buffer.from(key, "hex"), hash);
};

export const md5 = (value) => nodeCreateHash("md5").update(value).digest("hex");
