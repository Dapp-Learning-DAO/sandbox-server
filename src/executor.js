import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Define __dirname manually
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function executeCode(
  userId,
  language,
  contractSourceCode,
  testSourceCode
) {
  const tempDir = path.join(
    __dirname,
    "../",
    "sandbox",
    `user-${userId}-${Date.now()}`
  );
  fs.mkdirSync(tempDir, { recursive: true });

  const hardhatBaseDir = path.join(__dirname, "../", "hardhat-base");
  fs.cpSync(hardhatBaseDir, tempDir, { recursive: true });

  // Write the source code to a file
  const contractFilePath = path.join(
    tempDir,
    "contracts",
    "contract.sol"
  );
  console.log("\n\ncontractFilePath", contractFilePath)
  console.log(contractSourceCode)
  fs.writeFileSync(contractFilePath, contractSourceCode);

  if (testSourceCode) {
    const testFilePath = path.join(tempDir, "test", "contract.test.js");
    fs.writeFileSync(testFilePath, testSourceCode);
  }

  // 3. 创建到根目录 node_modules 的软链接
  const nodeModulesLink = path.join(tempDir, "node_modules");
  if (!fs.existsSync(nodeModulesLink)) {
    fs.symlinkSync(
      path.join(__dirname, "node_modules"),
      nodeModulesLink,
      "dir"
    );
  }

  let command = `cd ${tempDir} && npx hardhat compile`;
  if (testSourceCode) command += ` && npx hardhat test`;

  // Execute the Docker command
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      // Clean up the temporary directory
      // fs.rmSync(tempDir, { recursive: true, force: true });

      if (error) {
        return reject({ error: error.message, stderr });
      }
      resolve({ stdout, stderr });
    });
  });
}
