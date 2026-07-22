import userModel from "./models/User.js";

export default class Users {
  get = (params = {}) => userModel.find(params);
  getBy = (params) => userModel.findOne(params);
  save = (doc) => userModel.create(doc);
  update = (id, doc) => userModel.findByIdAndUpdate(id, { $set: doc }, { new: true });
  delete = (id) => userModel.findByIdAndDelete(id);
}
