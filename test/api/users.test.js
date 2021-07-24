import request from "supertest";
import { expect } from "chai";
import dotenv from "dotenv";
dotenv.config();

import app from "../../app.js";

import User from "../../models/user.model.js";

const tempUser = {
  username: process.env.USER_TEST,
  password: process.env.USER_TEST_PASSWORD,
};

let tempToken;

before(function (done) {
  this.timeout(3000);
  setTimeout(done, 2000);
});

describe("POST users", () => {
  it("should register new user with valid credentials", (done) => {
    request(app)
      .post("/users/signup")
      .send(tempUser)
      .expect(201)
      .then((res) => {
        expect(res.body.username).to.be.eql(process.env.USER_TEST);
        done();
      })
      .catch((err) => done(err));
  });

  it("shouldn't accept the username that already exists in the database", (done) => {
    request(app)
      .post("/users/signup")
      .send(tempUser)
      .expect(400)
      .then((res) => {
        expect(res.body.message).to.be.eql("Username is already in use");
        done();
      })
      .catch((err) => done(err));
  });
});

describe("PATCH users", () => {
  it("should accept correct credentials", (done) => {
    request(app)
      .patch("/users/login")
      .send(tempUser)
      .expect(200)
      .then((res) => {
        expect(res.body.message).to.be.eql("User logged in successfully");
        tempToken = `Bearer ${res.body.accessToken}`;
        done();
      })
      .catch((err) => done(err));
  });

  it("shouldn't accept invalid password", (done) => {
    tempUser.password = process.env.USER_TEST_PASSWORD + "asdf";
    request(app)
      .patch("/users/login")
      .send(tempUser)
      .expect(400)
      .then((res) => {
        expect(res.body.message).to.be.eql("Invalid password");
        done();
      })
      .catch((err) => done(err));
  });

  it("shouldn't accept non-exisiting username", (done) => {
    tempUser.username = process.env.USER_TEST + "asdf";
    request(app)
      .patch("/users/login")
      .send(tempUser)
      .expect(404)
      .then((res) => {
        expect(res.body.message).to.be.eql("Account not found");
        done();
      })
      .catch((err) => done(err));
  });

  it("should log out users with valid token", (done) => {
    request(app)
      .patch("/users/logout")
      .set({
        Authorization: tempToken,
      })
      .expect(200)
      .then((res) => {
        expect(res.body.message).to.be.eql("User logged out");
        done();
      })
      .catch((err) => done(err));
  });
});

after(async () => {
  try {
    await User.deleteOne({ username: process.env.USER_TEST });
  } catch (err) {
    console.error(err);
  }
});
