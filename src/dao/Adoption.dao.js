import adoptionModel from "./models/Adoption.js";

export default class Adoption {
  get = (params = {}) => adoptionModel.find(params);
  getBy = (params) => adoptionModel.findOne(params);
  save = (doc) => adoptionModel.create(doc);
  update = (id, doc) => adoptionModel.findByIdAndUpdate(id, { $set: doc }, { new: true });
  delete = (id) => adoptionModel.findByIdAndDelete(id);
}
