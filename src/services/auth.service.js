import userRepository from "../repositories/user.repository.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

async function register({ email, password }) {
  const existing = await userRepository.findByEmail(email);
  if (existing) throw new Error("Email already exists");

  const hash = await bcrypt.hash(password, 10);
  const user = await userRepository.create({ email, password: hash });

  return { id: user.id, email: user.email };
}

async function getUserByEmail(email) {
  const user = await userRepository.findByEmail(email);
  return user ? user.email : null;
}

async function authenticateUser(email, password) {
  const user = await userRepository.findByEmail(email);
  if (!user) return null;

  const isValid = await bcrypt.compare(password, user.password);
  return isValid ? { id: user.id, email, role: user.role } : null;
}

async function createNewTokens(id, role) {
  return { accessToken: role, refreshToken: role };
}

async function revokeRefreshToken() {}

async function validateAndRotateToken(token) {
  return { accessToken: token, refreshToken: token };
}

export default { register };
