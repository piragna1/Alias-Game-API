import { User } from "../models/sequelize/index.js"; // Sequelize model

async function findByEmail(email) {
  return await User.findOne({ where: { email } });
}

async function create({ email, name, password }) {
  return await User.create({ email, name, password });
}

export default { findByEmail, create };
