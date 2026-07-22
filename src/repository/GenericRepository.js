export default class GenericRepository {
  constructor(dao) {
    this.dao = dao;
  }
  getAll = (params) => this.dao.get(params);
  getBy = (params) => this.dao.getBy(params);
  create = (doc) => this.dao.save(doc);
  update = (id, doc) => this.dao.update(id, doc);
  delete = (id) => this.dao.delete(id);
}
