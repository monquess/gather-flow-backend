# GatherFlow API

<div align="center">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff" />
  <img src="https://img.shields.io/badge/Node.js-5FA04E?logo=nodedotjs&logoColor=fff" />
  <img src="https://img.shields.io/badge/Nest.js-E0234E?logo=nestjs&logoColor=fff" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=fff" />
  <img src="https://img.shields.io/badge/Postgres-316192?logo=postgresql&logoColor=fff" />
  <img src="https://img.shields.io/badge/Passport-34E27A?logo=passport&logoColor=fff" />
  <img src="https://img.shields.io/badge/Amazon_S3-232F3E?logo=amazonwebservices&logoColor=fff" />
  <img src="https://img.shields.io/badge/Stripe-635BFF?logo=stripe&logoColor=fff" />
  <img src="https://img.shields.io/badge/Elasticsearch-005571?logo=elastic&logoColor=fff" />
  <img src="https://img.shields.io/badge/OpenAPI-6BA539?logo=openapiinitiative&logoColor=fff" />    
  <img src="https://img.shields.io/badge/Swagger-85EA2D?logo=swagger&logoColor=fff" />
  <img src="https://img.shields.io/badge/Redis-DD0031?logo=redis&logoColor=fff" />
  <img src="https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=fff" />
  <img src="https://img.shields.io/badge/Handlebars.js-000000?logo=handlebarsdotjs&logoColor=fff" />
</div>

## Table of Contents

- [Project setup](#project-setup)
  - [Dependencies](#dependencies)
  - [Installation](#installation)
  - [Database setup](#database-setup)
  - [Running the server](#running-the-server)
- [API Documentation](#api-documentation)
- [License](#license)

## Project setup

### Dependencies

Before starting, ensure the following dependencies are installed on your system:

- [Node.js](https://nodejs.org/en) v18.8 or higher.
- [PostgreSQL](https://www.postgresql.org) v9.6 or higher.
- [Redis](https://redis.io) v2.6 or higher

### Starting the server

#### Installation

1. Clone the project repository to your local machine

```bash
$ git clone https://github.com/monquess/gather-flow-backend.git
```

2. Go to the project directory

```bash
$ cd gather-flow-backend/
```

3. Create a `.env` file by copying the contents of [.env.example](.env.example) to your .env file and fill in the required values

```bash
$ cp .env.example .env
```

4. Start all necessary services using Docker Compose

```bash
$ docker-compose up -d
```

> [!NOTE]
> Make sure you have [Docker](https://www.docker.com) and [Docker Compose](https://docs.docker.com/compose/) installed on your machine.

Once the containers are running, you can use the API directly from the Docker container and skip the next steps for local backend and database setup. Ensure services hostnames match the container names in [docker-compose.yml](docker-compose.yml).

```bash
REDIS_HOST=redis
POSTGRES_HOST=postgres
S3_ENDPOINT=http://minio:9000
ELASTICSEARCH_NODE=http://elasticsearch:${ELASTICSEARCH_PORT}
```

5. Install dependencies

```bash
$ npm ci
```

#### Database setup

1. Migrate the database and generate the Prisma client

```bash
$ npx prisma migrate dev
```

2. Seed the database if required

```bash
$ npx prisma db seed
```

Once the database is seeded, you can log in with any user email and the default password `password`.

#### Running the server

To run the application locally, you'll need to start the server using the following command

```bash
$ npm run start
```

## API documentation

If the server is running locally, you can view the documentation at http://localhost:3000/api/docs. This URL provides access to the API endpoints and methods directly from your server environment, allowing you to test and interact with the API in real-time.

> [!NOTE]
> The port shown in the documentation URL may vary depending on the value you specified in the environment variables.

## License

Project is licensed under [MIT License](LICENSE).
