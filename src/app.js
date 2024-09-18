// src/app.js
import express from "express";
import bodyParser from "body-parser";
import routes from "./routes.js";
import dotenv from "dotenv";

dotenv.config();

export const app = express();
export const PORT = process.env.PORT || 2358;

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// Use defined routes
app.use("/api", routes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
