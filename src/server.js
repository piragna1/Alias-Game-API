import app from "./app.js";
import { syncDB } from "./models/sequelize/index.js";

const PORT = process.env.PORT || 3000;

(async () => {
  await syncDB();

  app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));
})();
