import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();
const PORT = process.env.PORT || 2358;

// Define __dirname manually
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Function to create a single request
const createRequest = async (userId) => {
  const contract_source_code = fs
    .readFileSync(path.resolve(__dirname, "../test/lib/contract.sol"), "utf8")
    .replace("uint256 public a = 100;", `uint256 public a = ${100 * userId};`);
  const test_source_code = fs
    .readFileSync(
      path.resolve(__dirname, "../test/lib/contract-test.js"),
      "utf8"
    )
    .replace(/100/g, `${100 * userId}`);
  const req = {
    userId: `userId${userId}`,
    language: "hardhat",
    files: [
      { target_path: "contracts/contract.sol", contract_source_code },
      { target_path: "test/contract.test.js", test_source_code },
    ],
    ifTest: true,
  };

  const startTime = Date.now();

  try {
    const response = await fetch(`http://localhost:${PORT}/api/execute`, {
      body: JSON.stringify(req),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();
    const endTime = Date.now();
    console.log(
      `Response for userId${userId} received in ${endTime - startTime} ms`
    );
    console.log(result);
  } catch (err) {
    console.error(`Error for userId${userId}:`, err);
  }
};

// Function to test concurrency
const testConcurrency = async (numRequests) => {
  const promises = [];
  for (let i = 0; i < numRequests; i++) {
    promises.push(createRequest(i + 1));
  }

  // Use Promise.all to execute all requests concurrently
  await Promise.all(promises);
};

// Test with 10 concurrent requests
testConcurrency(10);
