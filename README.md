# Backend (profile-test-backend)

Project Overview:

The "profile-test-backend" serves as the backend for the "profile-test" application. It handles user authentication, registration, and provides API endpoints for fetching and updating user profiles.

## Technologies Used

- NestJS: A progressive Node.js framework for building efficient, reliable and scalable server-side applications.

- PostgreSQL: A powerful, open source object-relational database system.

- Authentication: Implements secure authentication methods (e.g., JWT) for user sessions.

## Installation

```bash
$ yarn install
```

## Setting up a local database

Before running the app, you need to set up a PostgreSQL database. You can do this by starting a Docker container with the following command:

```bash
$ docker run --name postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=profile-test -p 5432:5432 -d postgres
```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Test

```bash
# integration tests
$ yarn run test

# test coverage
$ yarn run test:cov
```
