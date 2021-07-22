import Joi from "joi";
import dotenv from "dotenv";
dotenv.config();
import { v4 as uuid } from "uuid";

import generateJWT from "./helpers/generateJWT.js";
import sendEmail from "./helpers/mailer.js";
import hashPassword from "./helpers/hashPassword.js";
import comparePasswords from "./helpers/comparePasswords.js";

const userSchema = Joi.object().keys({
  username: Joi.string().required().min(4),
  email: Joi.string().email({ minDomainSegments: 2 }),
  password: Joi.string().required().min(4),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
});

class UsersController {
  greetUser(req, res) {
    const user = req.body.username;
    res.send(`Hello ${user}`);
  }

  async signup(req, res) {
    try {
      const result = userSchema.validate(req.body);
      if (result.error) {
        console.log(result.error.message);
        return res.status(400).json({
          error: true,
          status: 400,
          message: result.error.message,
        });
      }

      let user = await User.findOne({
        email: result.value.email,
      });

      if (user) {
        return res.json({
          error: true,
          status: 400,
          message: "Email is already in use",
        });
      }

      const hash = await hashPassword(result.value.password);

      const id = uuid();
      result.value.userId = id;

      delete result.value.confirmPassword;
      result.value.password = hash;

      let code = Math.floor(100000 + Math.random() * 900000);
      let expiry = Date.now() + 60 * 1000 * 15;

      const sendCode = await sendEmail(result.value.email, code);

      if (sendCode.error) {
        return res.status(500).json({
          error: true,
          message: "Couldn't send verification email.",
        });
      }
      result.value.emailToken = code;
      result.value.emailTokenExpires = new Date(expiry);
      const newUser = new User(result.value);
      await newUser.save();

      return res.status(200).json({
        success: true,
        message: "Registration Success",
      });
    } catch (error) {
      console.error("signup-error", error);
      return res.status(500).json({
        error: true,
        message: "Cannot Register",
      });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          error: true,
          message: "Cannot authorize user.",
        });
      }

      let user = await User.findOne({ email });

      if (!user) {
        user = await User.findOne({ username: email });
      }

      if (!user) {
        return res.status(404).json({
          error: true,
          message: "Account not found",
        });
      }

      if (!user.active) {
        return res.status(400).json({
          error: true,
          message: "You must verify your email to active your account",
        });
      }

      const isValid = await comparePasswords(password, user.password);

      if (!isValid) {
        return res.status(400).json({
          error: true,
          message: "Invalid credentials",
        });
      }

      const { error, token } = await generateJWT(user.email, user.userId);
      if (error) {
        return res.status(500).json({
          error: true,
          message: "Couldn't create access token. Please try again later",
        });
      }

      user.accessToken = token;

      await user.save();

      return res.send({
        success: true,
        message: "User logged in successfully",
        accessToken: token,
        username: user.username,
      });
    } catch (err) {
      console.error(`Login error ${err}`);
      return res.status(500).json({
        error: true,
        message: "Couldn't login. Please try again later.",
      });
    }
  }

  async activate(req, res) {
    try {
      const { email, code } = req.body;
      if (!email || !code) {
        return res.json({
          error: true,
          status: 400,
          message: "Please make a valid request",
        });
      }
      const user = await User.findOne({
        email: email,
        emailToken: code,
        emailTokenExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(400).json({
          error: true,
          message: "Invalid details",
        });
      } else {
        if (user.active)
          return res.send({
            error: true,
            message: "Account already activated",
            status: 400,
          });

        user.emailToken = "";
        user.emailTokenExpires = null;
        user.active = true;

        await user.save();

        return res.status(200).json({
          success: true,
          message: "Account activated.",
        });
      }
    } catch (error) {
      console.error("activation-error", error);
      return res.status(500).json({
        error: true,
        message: error.message,
      });
    }
  }

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.send({
          status: 400,
          error: true,
          message: "Cannot be processed",
        });
      }
      const user = await User.findOne({
        email: email,
      });

      let code = Math.floor(100000 + Math.random() * 900000);
      let response = await sendEmail(user.email, code);

      if (response.error) {
        return res.status(500).json({
          error: true,
          message: "Couldn't send mail. Please try again later.",
        });
      }

      let expiry = Date.now() + 60 * 1000 * 15;
      user.resetPasswordToken = code;
      user.resetPasswordExpires = expiry; // 15 minutes

      await user.save();

      return res.send({
        success: true,
        message: "Please check your email inbox for the reset code",
      });
    } catch (error) {
      console.error("forgot-password-error", error);
      return res.status(500).json({
        error: true,
        message: error.message,
      });
    }
  }

  async resetPassword(req, res) {
    try {
      const { token, newPassword, confirmPassword } = req.body;
      if (!token || !newPassword || !confirmPassword) {
        return res.status(403).json({
          error: true,
          message:
            "Couldn't process request. Please provide all mandatory fields",
        });
      }
      const user = await User.findOne({
        resetPasswordToken: req.body.token,
        resetPasswordExpires: { $gt: Date.now() },
      });
      if (!user) {
        return res.send({
          error: true,
          message: "Password reset token is invalid or has expired.",
        });
      }
      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          error: true,
          message: "Passwords don't match",
        });
      }
      const hash = await hashPassword(req.body.newPassword);
      user.password = hash;
      user.resetPasswordToken = null;
      user.resetPasswordExpires = "";

      await user.save();

      return res.send({
        success: true,
        message: "Password has been changed",
      });
    } catch (error) {
      console.error("reset-password-error", error);
      return res.status(500).json({
        error: true,
        message: error.message,
      });
    }
  }

  async logout(req, res) {
    try {
      const { id } = req.decoded;

      let user = await User.findOne({ userId: id });

      user.accessToken = "";

      await user.save();

      return res.send({ success: true, message: "User Logged out" });
    } catch (error) {
      console.error("user-logout-error", error);
      return res.stat(500).json({
        error: true,
        message: error.message,
      });
    }
  }
}

export default UsersController;
