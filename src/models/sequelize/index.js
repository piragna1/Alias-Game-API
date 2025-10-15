import sequelize from "../../config/db.js";
import User from "./User.js";

export const syncDB = async () => {
  try {
    await sequelize.sync({ alter: true, force: true });
    console.log("All tables synced");
  } catch (err) {
    console.error("Failed to sync DB:", err);
  }
};

export { User };
