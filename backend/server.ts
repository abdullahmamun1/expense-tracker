import "dotenv/config";
import { app } from "./src/app.js";
import { env } from "./src/config/env.js";

app.listen(env.port, () => console.log(`API listening on http://localhost:${env.port}`));
