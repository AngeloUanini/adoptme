export default class CustomError extends Error {
  constructor(name, message, code) {
    super(message);
    this.name = name;
    this.code = code;
  }

  static createError({ name = "Error", message, code = 500 }) {
    return new CustomError(name, message, code);
  }
}
