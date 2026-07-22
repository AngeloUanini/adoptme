# AdoptMe API

API REST de adopción de mascotas construida con Node.js, Express y MongoDB.
Este repositorio corresponde al entregable final del curso de Backend: incluye
**tests funcionales** de todos los endpoints de `adoption.router.js`, un
**Dockerfile optimizado** y la **imagen publicada en DockerHub**.

---

## Enlaces del proyecto

| Recurso | URL |
|---|---|
| Repositorio | `https://github.com/AngeloUanini/adoptme` |
| Imagen en DockerHub | `https://hub.docker.com/r/wizard382/adoptme` |
| Documentación Swagger | `http://localhost:8080/api/docs` |

---

## Estructura del proyecto

```
adoptme/
├── src/
│   ├── app.js                        # Instancia de Express (sin listen: testeable)
│   ├── server.js                     # Punto de entrada: conecta a Mongo y levanta el server
│   ├── controllers/                  # Lógica de cada endpoint
│   │   ├── adoptions.controller.js
│   │   ├── pets.controller.js
│   │   ├── sessions.controller.js
│   │   └── users.controller.js
│   ├── dao/                          # Acceso a datos (Mongoose)
│   │   ├── Adoption.dao.js
│   │   ├── Pets.dao.js
│   │   ├── Users.dao.js
│   │   └── models/                   # Esquemas de las colecciones
│   ├── repository/                   # Capa intermedia entre controllers y DAOs
│   ├── routes/                       # Definición de rutas
│   │   └── adoption.router.js        # Router evaluado en este entregable
│   ├── services/index.js             # Instancias únicas de los repositorios
│   └── utils/                        # Errores personalizados, hash, swagger
├── test/
│   └── adoption.router.test.js       # Tests funcionales del router de adopciones
├── Dockerfile                        # Build multi-stage optimizado
├── .dockerignore
├── .env.example
└── package.json
```

---

## Endpoints de `/api/adoptions`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/adoptions` | Lista todas las adopciones |
| GET | `/api/adoptions/:aid` | Devuelve una adopción por id |
| POST | `/api/adoptions/:uid/:pid` | Registra la adopción de una mascota por un usuario |

Códigos de respuesta: `200` éxito · `400` id inválido o mascota ya adoptada ·
`404` recurso inexistente · `500` error interno.

---

## Instalación local

```bash
git clone https://github.com/AngeloUanini/adoptme.git
cd adoptme
npm install
cp .env.example .env    # completar MONGO_URL y JWT_SECRET
npm start
```

La API queda disponible en `http://localhost:8080`.

---

## Ejecutar los tests

```bash
npm test
```

Los tests usan **Mocha + Chai + Supertest + Sinon**. No requieren base de datos:
todas las dependencias externas están reemplazadas por *mocks* y *fakes*, por lo
que se ejecutan de forma aislada y repetible.

---

## Docker

### Construir la imagen

```bash
docker build -t wizard382/adoptme:1.0.0 .
```

### Ejecutar el contenedor

```bash
docker run -d --name adoptme -p 8080:8080 --env-file .env wizard382/adoptme:1.0.0
```

Verificación rápida:

```bash
curl http://localhost:8080/health
# {"status":"ok"}
```

### Correr los tests dentro del contenedor

Como la imagen de producción no incluye devDependencies, los tests se corren
sobre una imagen de desarrollo:

```bash
docker run --rm -v "$PWD":/app -w /app node:20-alpine sh -c "npm install && npm test"
```

### Publicar en DockerHub

```bash
docker login
docker tag wizard382/adoptme:1.0.0 wizard382/adoptme:latest
docker push wizard382/adoptme:1.0.0
docker push wizard382/adoptme:latest
```

### Escaneo de seguridad

```bash
docker scout quickview wizard382/adoptme:1.0.0
docker scout cves wizard382/adoptme:1.0.0
```

---

## Decisiones de optimización del Dockerfile

- **Build multi-stage**: las dependencias se resuelven en una etapa aparte y a la
  imagen final solo pasa lo necesario para ejecutar.
- **Imagen base `node:20-alpine`**: alrededor de 50 MB frente a los ~1 GB de la
  imagen `node` completa.
- **Copia de `package*.json` antes del código**: aprovecha la caché de capas, de
  modo que un cambio en el código no reinstala dependencias.
- **`npm ci --omit=dev`**: build reproducible a partir del lockfile y sin
  paquetes de testing en producción.
- **Usuario sin privilegios (`appuser`)**: la aplicación no corre como root.
- **`.dockerignore`**: excluye `node_modules`, `.env`, tests y archivos de
  desarrollo del contexto de build.
- **`HEALTHCHECK`**: Docker monitorea el endpoint `/health` del contenedor.

---

## Evidencia de pruebas

```
  Tests funcionales del router /api/adoptions
    GET /api/adoptions
      ✔ debe responder 200 y devolver el listado completo de adopciones
      ✔ debe responder 200 y un array vacio cuando no hay adopciones registradas
      ✔ debe responder 500 si el servicio de adopciones falla
    GET /api/adoptions/:aid
      ✔ debe responder 200 y devolver la adopcion solicitada
      ✔ debe responder 404 si la adopcion no existe
      ✔ debe responder 400 si el id no tiene formato valido de ObjectId
      ✔ debe responder 500 si el servicio lanza un error inesperado
    POST /api/adoptions/:uid/:pid
      ✔ debe responder 200 y registrar la adopcion cuando los datos son correctos
      ✔ debe agregar la mascota al array pets del usuario
      ✔ debe responder 404 si el usuario no existe
      ✔ debe responder 404 si la mascota no existe
      ✔ debe responder 400 si la mascota ya fue adoptada
      ✔ debe responder 400 si alguno de los ids tiene formato invalido
      ✔ debe responder 500 si falla la creacion de la adopcion
    Rutas no definidas en el router
      ✔ debe responder 404 ante un metodo no soportado sobre /api/adoptions

  15 passing (110ms)
```

---

## Stack

Node.js 20 · Express 4 · MongoDB / Mongoose 8 · Mocha · Chai · Supertest · Sinon · Swagger · Docker
