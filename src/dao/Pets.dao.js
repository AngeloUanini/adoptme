import petModel from "./models/Pet.js";

export default class Pet {
  get = (params = {}) => petModel.find(params);
  getBy = (params) => petModel.findOne(params);
  save = (doc) => petModel.create(doc);
  update = (id, doc) => petModel.findByIdAndUpdate(id, { $set: doc }, { new: true });
  delete = (id) => petModel.findByIdAndDelete(id);
}
