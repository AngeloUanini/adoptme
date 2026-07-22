import Users from "../dao/Users.dao.js";
import Pets from "../dao/Pets.dao.js";
import Adoption from "../dao/Adoption.dao.js";

import UserRepository from "../repository/UserRepository.js";
import PetRepository from "../repository/PetRepository.js";
import AdoptionRepository from "../repository/AdoptionRepository.js";

export const usersService = new UserRepository(new Users());
export const petsService = new PetRepository(new Pets());
export const adoptionsService = new AdoptionRepository(new Adoption());
