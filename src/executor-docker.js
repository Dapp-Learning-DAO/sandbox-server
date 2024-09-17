// src/executor.js
import { exec, execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Define __dirname manually
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function executeCode(
  language,
  contractSourceCode,
  testSourceCode
) {
  // Create a temporary directory for the code execution
  const tempDir = path.join(__dirname, "temp", `code-${Date.now()}`);
  fs.mkdirSync(tempDir, { recursive: true });

  // Write the source code to a file
  const contractFilePath = path.join(tempDir, "contract.sol");
  fs.writeFileSync(contractFilePath, contractSourceCode);

  if (testSourceCode) {
    const testFilePath = path.join(tempDir, "contract.test.js");
    fs.writeFileSync(testFilePath, testSourceCode);
  }

  // Docker command to run the code
  let dockerCommand = `docker run --rm \
    -v ${tempDir}:/contracts \
    -w /contracts \
    hardhat-docker:latest /bin/sh -c " \
    cp /contracts/contract.sol /hardhat-project/contracts && \
    `;

  if (testSourceCode) {
    dockerCommand += `
    cp /contracts/contract.test.js /hardhat-project/test && \
    cd /hardhat-project && \
    npx hardhat compile && \
    npx hardhat test"`
  } else {
    dockerCommand += `
    cd /hardhat-project && \
    npx hardhat compile"`
  }

  // Execute the Docker command
  return new Promise((resolve, reject) => {
    exec(dockerCommand, (error, stdout, stderr) => {
      // Clean up the temporary directory
      fs.rmSync(tempDir, { recursive: true, force: true });

      if (error) {
        return reject({ error: error.message, stderr });
      }
      resolve({ stdout, stderr });
    });
  });
}
