# NEM API

Boilerplate for REST API, that can be used as a starting point for various projects based on REST APIs with users related functions already implemented.

## Technological Stack

The code is based on Node.js, Express and MongoDB. In terms of testing there is also Mocha framework inital configuration added.

### Libraries

- bcrypt
- chai
- dotenv
- express
- jsonwebtoken
- mocha
- mongo-sanitize
- mongoose
- supertest

## Installation

1. Install it globally with command `npm i create-nem-api -g`
2. Create new project with command `npx create-nem-api <nameofyourapp>`

## API Routes

Users routes can be found [here](https://github.com/KowalewskiPawel/NEM-API/wiki/API-Routes)

## Source Code

Source code can be found [here](https://github.com/KowalewskiPawel/NEM-API)

## Configuration

1. After cloning the repository install dependencies with the command `npm install` / `yarn install`
2. Create `.env` file in the main directory
3. Create MongoDB cluster and database.
4. Add your database address to the .env file as `MONGO_URI=<yourDBaddress>`
5. Add test database address to the .env file as `MONGO_URI_TEST=<yourDBaddress>`
6. Add SendInBlue API key to the .env file as `SI_APIKEY=<yourSendInBlueAPIaddress>`
7. Add SendInBlue email address to the .env file as `SI_EMAIL=<yourSendInBlueEmailAddress>`
8. Add SendInBlue SMTP Endpoint, port, and sender addresses as

```
SMTP_ENDPOINT=<smtpEndpoint>
SMTP_PORT=<smtpPort>
SENDER_EMAIL=<email>
```

9. Add JWT secret key (it's up to your personal choice) to the .env file as `JWT_SECRET=<yourJWTsecretKey>`
10. Type in `npm start` to run the server
