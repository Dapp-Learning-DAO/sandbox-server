import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();
const PORT = process.env.PORT || 2358;

// Define __dirname manually
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const req = {
  userId: "userId01",
  language: "hardhat",
  contractSourceCode: fs.readFileSync(
    path.resolve(__dirname, "test/lib/contract.sol"),
    "utf8"
  ).replace(
    /100/g,
    `${100 * 5}`
  ),
  testSourceCode: fs.readFileSync(
    path.resolve(__dirname, "test/lib/contract-test.js"),
    "utf8"
  ).replace(
    /100/g,
    `${100 * 5}`
  ),
};

fetch(`http://localhost:${PORT}/api/execute`, {
  body: JSON.stringify(req),
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
})
  .then((res) => res.json())
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    console.error(err);
  });
