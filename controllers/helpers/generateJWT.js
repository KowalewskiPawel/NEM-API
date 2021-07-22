import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const options = {
  expiresIn: "1h",
};

async function generateJWT(email, userId) {
  try {
    const payload = { email, id: userId };
    const token = await jwt.sign(payload, process.env.JWT_SECRET, options);
    return { error: false, token };
  } catch (error) {
    return { error: true };
  }
}

export default generateJWT;
