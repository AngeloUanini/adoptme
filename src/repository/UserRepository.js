import GenericRepository from "./GenericRepository.js";

export default class UserRepository extends GenericRepository {
  constructor(dao) {
    super(dao);
  }
  getUserByEmail = (email) => this.getBy({ email });
  getUserById = (id) => this.getBy({ _id: id });
}
