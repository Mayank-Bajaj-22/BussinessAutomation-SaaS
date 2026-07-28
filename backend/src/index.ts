import { app } from "./app.js";
import { PORT } from "./config/env.config.js";
import { logger } from "./config/logger.js";
import "./jobs/index.js";

const port = PORT;

app.listen(port, async () => {
    logger.info(`Server running on port ${port}`);
});