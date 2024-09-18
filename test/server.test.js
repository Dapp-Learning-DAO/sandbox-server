import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { exec, execSync } from "child_process";
import { expect } from "chai";
import dotenv from "dotenv";

dotenv.config();
const PORT = process.env.PORT || 2358;

// Define __dirname manually
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Server process reference
let serverProcess;

// Function to create a single request
const createRequest = async (userId) => {
  const req = {
    userId: `userId${userId}`,
    language: "hardhat",
    contractSourceCode: fs
      .readFileSync(path.resolve(__dirname, "../test/lib/contract.sol"), "utf8")
      .replace(
        "uint256 public a = 100;",
        `uint256 public a = ${100 * userId};`
      ),
    testSourceCode: fs
      .readFileSync(
        path.resolve(__dirname, "../test/lib/contract-test.js"),
        "utf8"
      )
      .replace(/100/g, `${100 * userId}`),
  };
  // console.log(req);

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
    return result;
  } catch (err) {
    console.error(`Error for userId${userId}:`, err);
    throw err;
  }
};

describe("Hardhat API Server", function () {
  this.timeout(30000);

  this.beforeAll(async () => {
    console.log("    Starting server...");
    if (serverProcess) return;
    serverProcess = exec(
      `node ${path.join(__dirname, "../src/app.js")}`,
      (error) => {
        if (error) {
          console.error(`Error starting server: ${error.message}`);
          return;
        }
      }
    );
    // Wait for a few seconds to ensure server has started
    await sleep(3000);
  });

  this.afterAll(() => {
    console.log("\n Stopping server...");
    if (serverProcess) serverProcess.kill();
    process.exit();
  });

  it("execute one user", (done) => {
    createRequest(1)
      .then((res) => {
        console.log(res);
        expect(res.stdout, "should compile successfully.").to.include(
          "Compiled 1 Solidity file successfully"
        );
        expect(res.stdout, "should all test case pass.").to.include(
          "1 passing"
        );
        done();
      })
      .catch((err) => {
        console.error(err);
        done(err);
      });
  });

  // it("should handle 10 concurrent requests successfully", async function () {
  //   const numRequests = 10;
  //   const promises = [];
  //   for (let i = 0; i < numRequests; i++) {
  //     promises.push(createRequest(i + 1));
  //   }

  //   // Use Promise.all to execute all requests concurrently
  //   const results = await Promise.all(promises);

  //   // Use Chai to assert that all requests were successful
  //   results.forEach((res) => {
  //     expect(res.stdout, "should compile successfully.").to.include(
  //       "Compiled 1 Solidity file successfully"
  //     );
  //     expect(res.stdout, "should all test case pass.").to.include("1 passing");
  //   });

  // });
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}