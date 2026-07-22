import { expect } from "chai";
import supertest from "supertest";
import sinon from "sinon";
import mongoose from "mongoose";

import app from "../src/app.js";
import { adoptionsService, petsService, usersService } from "../src/services/index.js";

const requester = supertest(app);

// ---------------------------------------------------------------------------
// FAKES: objetos que imitan los documentos que devolveria MongoDB.
// Nos permiten trabajar con datos predecibles, sin depender de la base real.
// ---------------------------------------------------------------------------
const fakeUserId = new mongoose.Types.ObjectId();
const fakePetId = new mongoose.Types.ObjectId();
const fakeAdoptionId = new mongoose.Types.ObjectId();

const buildFakeUser = (overrides = {}) => ({
  _id: fakeUserId,
  first_name: "Ana",
  last_name: "Gomez",
  email: "ana.gomez@test.com",
  password: "hashed_password",
  role: "user",
  pets: [],
  ...overrides
});

const buildFakePet = (overrides = {}) => ({
  _id: fakePetId,
  name: "Michi",
  specie: "gato",
  birthDate: new Date("2020-05-10"),
  adopted: false,
  owner: null,
  ...overrides
});

const buildFakeAdoption = (overrides = {}) => ({
  _id: fakeAdoptionId,
  owner: fakeUserId,
  pet: fakePetId,
  ...overrides
});

describe("Tests funcionales del router /api/adoptions", function () {
  // Restauramos todos los stubs despues de cada test para que no haya
  // contaminacion entre casos de prueba.
  afterEach(function () {
    sinon.restore();
  });

  // =========================================================================
  // GET /api/adoptions
  // =========================================================================
  describe("GET /api/adoptions", function () {
    it("debe responder 200 y devolver el listado completo de adopciones", async function () {
      const fakeAdoptions = [buildFakeAdoption(), buildFakeAdoption({ _id: new mongoose.Types.ObjectId() })];
      sinon.stub(adoptionsService, "getAll").resolves(fakeAdoptions);

      const { statusCode, body } = await requester.get("/api/adoptions");

      expect(statusCode).to.equal(200);
      expect(body.status).to.equal("success");
      expect(body.payload).to.be.an("array").with.lengthOf(2);
      expect(body.payload[0]).to.have.property("owner");
      expect(body.payload[0]).to.have.property("pet");
    });

    it("debe responder 200 y un array vacio cuando no hay adopciones registradas", async function () {
      sinon.stub(adoptionsService, "getAll").resolves([]);

      const { statusCode, body } = await requester.get("/api/adoptions");

      expect(statusCode).to.equal(200);
      expect(body.payload).to.be.an("array").that.is.empty;
    });

    it("debe responder 500 si el servicio de adopciones falla", async function () {
      sinon.stub(adoptionsService, "getAll").rejects(new Error("Fallo de conexion con la base de datos"));

      const { statusCode, body } = await requester.get("/api/adoptions");

      expect(statusCode).to.equal(500);
      expect(body.status).to.equal("error");
    });
  });

  // =========================================================================
  // GET /api/adoptions/:aid
  // =========================================================================
  describe("GET /api/adoptions/:aid", function () {
    it("debe responder 200 y devolver la adopcion solicitada", async function () {
      const fakeAdoption = buildFakeAdoption();
      const getByStub = sinon.stub(adoptionsService, "getBy").resolves(fakeAdoption);

      const { statusCode, body } = await requester.get(`/api/adoptions/${fakeAdoptionId}`);

      expect(statusCode).to.equal(200);
      expect(body.status).to.equal("success");
      expect(body.payload._id).to.equal(fakeAdoptionId.toString());
      // Verificamos que el controller haya consultado el servicio con el id correcto
      expect(getByStub.calledOnce).to.be.true;
      expect(getByStub.firstCall.args[0]).to.deep.equal({ _id: fakeAdoptionId.toString() });
    });

    it("debe responder 404 si la adopcion no existe", async function () {
      sinon.stub(adoptionsService, "getBy").resolves(null);

      const idInexistente = new mongoose.Types.ObjectId();
      const { statusCode, body } = await requester.get(`/api/adoptions/${idInexistente}`);

      expect(statusCode).to.equal(404);
      expect(body.status).to.equal("error");
      expect(body.message).to.equal("Adoption not found");
    });

    it("debe responder 400 si el id no tiene formato valido de ObjectId", async function () {
      const getByStub = sinon.stub(adoptionsService, "getBy").resolves(null);

      const { statusCode, body } = await requester.get("/api/adoptions/1234-id-invalido");

      expect(statusCode).to.equal(400);
      expect(body.status).to.equal("error");
      // La validacion corta antes de llegar a la capa de datos
      expect(getByStub.called).to.be.false;
    });

    it("debe responder 500 si el servicio lanza un error inesperado", async function () {
      sinon.stub(adoptionsService, "getBy").rejects(new Error("Error inesperado"));

      const { statusCode, body } = await requester.get(`/api/adoptions/${fakeAdoptionId}`);

      expect(statusCode).to.equal(500);
      expect(body.status).to.equal("error");
    });
  });

  // =========================================================================
  // POST /api/adoptions/:uid/:pid
  // =========================================================================
  describe("POST /api/adoptions/:uid/:pid", function () {
    it("debe responder 200 y registrar la adopcion cuando los datos son correctos", async function () {
      const fakeUser = buildFakeUser();
      const fakePet = buildFakePet();

      sinon.stub(usersService, "getUserById").resolves(fakeUser);
      sinon.stub(petsService, "getBy").resolves(fakePet);
      const userUpdateStub = sinon.stub(usersService, "update").resolves(fakeUser);
      const petUpdateStub = sinon.stub(petsService, "update").resolves({ ...fakePet, adopted: true });
      const createStub = sinon.stub(adoptionsService, "create").resolves(buildFakeAdoption());

      const { statusCode, body } = await requester.post(`/api/adoptions/${fakeUserId}/${fakePetId}`);

      expect(statusCode).to.equal(200);
      expect(body.status).to.equal("success");
      expect(body.message).to.equal("Pet adopted");
      expect(body.payload).to.have.property("_id");

      // Efectos colaterales esperados
      expect(userUpdateStub.calledOnce).to.be.true;
      expect(petUpdateStub.calledOnce).to.be.true;
      expect(petUpdateStub.firstCall.args[1]).to.include({ adopted: true });
      expect(createStub.calledOnce).to.be.true;
    });

    it("debe agregar la mascota al array pets del usuario", async function () {
      const fakeUser = buildFakeUser({ pets: [] });
      const fakePet = buildFakePet();

      sinon.stub(usersService, "getUserById").resolves(fakeUser);
      sinon.stub(petsService, "getBy").resolves(fakePet);
      const userUpdateStub = sinon.stub(usersService, "update").resolves(fakeUser);
      sinon.stub(petsService, "update").resolves(fakePet);
      sinon.stub(adoptionsService, "create").resolves(buildFakeAdoption());

      await requester.post(`/api/adoptions/${fakeUserId}/${fakePetId}`);

      const petsEnviadas = userUpdateStub.firstCall.args[1].pets;
      expect(petsEnviadas).to.be.an("array").with.lengthOf(1);
      expect(petsEnviadas[0]._id.toString()).to.equal(fakePetId.toString());
    });

    it("debe responder 404 si el usuario no existe", async function () {
      sinon.stub(usersService, "getUserById").resolves(null);
      const petStub = sinon.stub(petsService, "getBy").resolves(buildFakePet());

      const { statusCode, body } = await requester.post(`/api/adoptions/${fakeUserId}/${fakePetId}`);

      expect(statusCode).to.equal(404);
      expect(body.message).to.equal("User Not found");
      // Si no hay usuario, ni siquiera se busca la mascota
      expect(petStub.called).to.be.false;
    });

    it("debe responder 404 si la mascota no existe", async function () {
      sinon.stub(usersService, "getUserById").resolves(buildFakeUser());
      sinon.stub(petsService, "getBy").resolves(null);
      const createStub = sinon.stub(adoptionsService, "create").resolves(buildFakeAdoption());

      const { statusCode, body } = await requester.post(`/api/adoptions/${fakeUserId}/${fakePetId}`);

      expect(statusCode).to.equal(404);
      expect(body.message).to.equal("Pet not found");
      expect(createStub.called).to.be.false;
    });

    it("debe responder 400 si la mascota ya fue adoptada", async function () {
      sinon.stub(usersService, "getUserById").resolves(buildFakeUser());
      sinon.stub(petsService, "getBy").resolves(buildFakePet({ adopted: true }));
      const createStub = sinon.stub(adoptionsService, "create").resolves(buildFakeAdoption());

      const { statusCode, body } = await requester.post(`/api/adoptions/${fakeUserId}/${fakePetId}`);

      expect(statusCode).to.equal(400);
      expect(body.message).to.equal("Pet is already adopted");
      expect(createStub.called).to.be.false;
    });

    it("debe responder 400 si alguno de los ids tiene formato invalido", async function () {
      const userStub = sinon.stub(usersService, "getUserById").resolves(buildFakeUser());

      const { statusCode, body } = await requester.post(`/api/adoptions/id-invalido/${fakePetId}`);

      expect(statusCode).to.equal(400);
      expect(body.status).to.equal("error");
      expect(userStub.called).to.be.false;
    });

    it("debe responder 500 si falla la creacion de la adopcion", async function () {
      sinon.stub(usersService, "getUserById").resolves(buildFakeUser());
      sinon.stub(petsService, "getBy").resolves(buildFakePet());
      sinon.stub(usersService, "update").resolves(buildFakeUser());
      sinon.stub(petsService, "update").resolves(buildFakePet({ adopted: true }));
      sinon.stub(adoptionsService, "create").rejects(new Error("No se pudo persistir la adopcion"));

      const { statusCode, body } = await requester.post(`/api/adoptions/${fakeUserId}/${fakePetId}`);

      expect(statusCode).to.equal(500);
      expect(body.status).to.equal("error");
    });
  });

  // =========================================================================
  // Rutas inexistentes dentro del router
  // =========================================================================
  describe("Rutas no definidas en el router", function () {
    it("debe responder 404 ante un metodo no soportado sobre /api/adoptions", async function () {
      const { statusCode } = await requester.delete(`/api/adoptions/${fakeAdoptionId}`);
      expect(statusCode).to.equal(404);
    });
  });
});
