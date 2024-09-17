// src/app.js
import express from "express";
import bodyParser from "body-parser";
import routes from "./routes.js";

export const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// Use defined routes
app.use("/api", routes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
