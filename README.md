# API rate limiter

## Context

Corporation X,Y,Z is a tech company that has launched a notification service for sending SMS and
E-mail notifications. They are selling this service to different clients and each client has specific
limits on the number of requests they can send in a month. Because they are a startup they have a
limited amount of infrastructure to serve all clients at peak capacity because their solution has
been very successful. Each client has the ability to pay for more requests per second. Corporation
X,Y,Z is seeing performance issues on their api, because they haven't implemented the limits that
have been set out in the software.

## Requirements

The design question is, how should they try to solve these three issues:

1. Too many requests within the same time window from a client
2. Too many requests from a specific client on a per month basis
3. Too many requests across the entire system

## Points to look for:

- The rate limiting should work for a distributed setup, as the APIs are accessible through a
  cluster of servers.
- How would you handle throttling (soft and hard throttling etc.).

# Solution

## Setup

- Install latest node version https://nodejs.org/en/download/ (Used v16.0.0+)
- Install Redis https://redis.io/docs/getting-started/installation/
- In root folder create a `.env` file

```
    cp .env.example .env
```

Or Manually Create it with the following details/credentials

```
    DATABASE_NAME=./notification-service.sqlite
    DB_USERNAME=sample
    DB_PASSWORD=sample
    DB_HOST=./notification-service.sqlite
    DB_DRIVER=sqlite
    SWAGGER_BASE_URL=
    PORT=3000
    TZ=Africa/Kigali
    EXPIRE_TIME=10d
    SECRET=sampleSecret
    SMTP_HOST=
    SMTP_PORT=
    SMTP_USER=
    SMTP_PASSWORD=
    FRONT_END_BASE_URL=
	  MONTLY_RESET_CRON=0 0 1 * *
    NODE_ENV=development
```

- cd in project root folder, install dependencies, run migrations, start server

  ```
    redis-server
  ```

  ```
    npm install
  ```

  ```
    npm run dev:db-setup
  ```

  ```
    npm run dev:server
  ```

- Testing (make sure migrations have been run and redis is running)

  ```
   npm run test
  ```

## Architecture

- [ERD](https://dbdiagram.io/d/640544d4296d97641d859679)
- Technologies
  - Server: NodeJS, Express Framework
  - Database: Sequelize, Sqlite
  - Style: REST architectural style
- [END-POINTS DOCUMENTATION PUBLISHED](https://documenter.getpostman.com/view/16879881/2s93JnVSnt)
- [END-POINTS DOCUMENTATION (POSTMAN)](https://universal-capsule-39502.postman.co/workspace/5975be7f-a315-4934-bca2-1c2b1e9ea2cc/collection/16879881-c7a6ece8-4ea8-4c19-9abd-e3d83604e9ac?action=share&creator=16879881)

- The project contains an architectural approach to the whole intended core system (models, basic logic, authentication/authorisation).

  - Use https://sqlitebrowser.org/dl/ to investigate the sqllite file

### Models

    - Client: model for an individual or company that intends to use the notification service.
    - Apikey: model for authentication/authorisation keys used by clients to access the api.

### Authentication/Authorisation

- Api Keys in HTTP headers
  - Client-Id
  - Client-key

### Requirements covered

1. Too many requests within the same time window from a client => WINDOW: overseen & calculated in req/min
2. Too many requests from a specific client on a per month basis => MONTH: overseen & calculated in req/month
3. Too many requests across the entire system => GLOBAL: applicable to whole api/cluster, overseen & calculated in req/min

## Documentation

- ![ERD.png](/documentation/erd.png)
- [Presentation Dock](https://docs.google.com/presentation/d/1mekHQsbiDj3mefp5AIrIBRJqLq1BZDqQQkljwqaOqns/edit?usp=sharing)

## Author

[@maxahirwe](https://max.rw)
