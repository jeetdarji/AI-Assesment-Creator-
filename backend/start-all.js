// Combined entrypoint — starts both the Express API server and the BullMQ worker
// in a single process. Used for deployment on Render (free tier).

require("./dist/index.js");
require("./dist/queues/worker.js");
