import express from "express";

import cleanBody from "../middlewares/cleanbody.js";
import validateToken from "../middlewares/validateToken.js";

import UsersController from "../controllers/users.controller.js";

const usersRouter = express.Router();

const usersController = new UsersController();

usersRouter.get("/", usersController.greetUser);
usersRouter.post("/signup", cleanBody, usersController.signup);
usersRouter.post("/login", cleanBody, usersController.login);
usersRouter.patch("/activate", cleanBody, usersController.activate);
usersRouter.patch("/forgot", cleanBody, usersController.forgotPassword);
usersRouter.patch("/reset", cleanBody, usersController.resetPassword);
usersRouter.patch("/logout", validateToken, usersController.logout);

export default usersRouter;
