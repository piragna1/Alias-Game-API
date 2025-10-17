import app from "./app.js";
import { syncDB } from "./models/sequelize/index.js";
import { redisClient } from "./config/redis.js";

const PORT = process.env.PORT || 3000;

(async () => {
  await syncDB();
  await redisClient.connectRedis();

  app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));
})();
