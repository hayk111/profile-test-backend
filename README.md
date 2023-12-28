## Description

NestJS API for the profile test app

## Installation

```bash
$ yarn install
```

## Setting up a local database

Before running the app, you need to set up a PostgreSQL database. You can do this by starting a Docker container with the following command:

```bash
$ docker run --name postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=profile-test -p 5432:5432 -d postgre
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
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```
