import { exec, execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Define __dirname manually
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Execute code with uploaded source codes.
 *
 * @param {string} userId - The ID of the user executing the code.
 * @param {string} language - The language or framework used for the execution, e.g., 'hardhat'.
 * @param {Array<{target_path: string, source_code: string}>} files - An array of objects, where each object represents a file with the target path and source code.
 * @param {boolean} ifTest - A flag indicating whether to run the test.
 * @param {boolean} ifRun - A flag indicating whether to run the script.
 * @returns {Promise<ExecuteRes>} - A promise that resolves when the execution is complete.
 * ExecuteRes: {
 *  status: 0 未执行 ｜ 1 compile 成功 ｜ 2 compile 失败 ｜ 3 test 成功 ｜ 4 test 失败 | 5 run 成功 | 6 run 失败
 *  compile_res: { stdout?: string, stderr?: string },
 *  test_res: { stdout?: string, stderr?: string },
 *  run_res: { stdout?: string, stderr?: string },
 * }
 */
export function executeCode(
  userId,
  language,
  files,
  ifRun = false,
  ifTest = false
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
  for (let i = 0; i < files.length; i++) {
    const { target_path, source_code } = files[i];
    const filePath = path.join(tempDir, target_path);
    fs.writeFileSync(filePath, source_code);
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

  let response = {
    status: 0,
    error: null,
  };

  const compileRes = safeExecSync(`cd ${tempDir} && npx hardhat compile`);
  if (compileRes.error) {
    response.status = 2;
    response.error = compileRes.error;
    response.compile_res = {
      stderr: compileRes.stderr,
    };
  } else {
    response.status = 1;
    response.compile_res = {
      stdout: compileRes.stdout,
    };

    if (!response.error && ifTest) {
      const testRes = safeExecSync(`cd ${tempDir} && npx hardhat test`);
      if (testRes.error) {
        response.status = 4;
        response.error = testRes.error;
        response.test_res = {
          stderr: testRes.stderr,
        };
      } else {
        response.status = 3;
        response.test_res = {
          stdout: testRes.stdout,
        };
      }
    }

    if (!response.error && ifRun) {
      const runRes = safeExecSync(`cd ${tempDir} && npx hardhat run`);
      if (runRes.error) {
        response.status = 6;
        response.error = runRes.error;
        response.run_res = {
          stderr: runRes.stderr,
        };
      } else {
        response.status = 5;
        response.run_res = {
          stdout: runRes.stdout,
        };
      }
    }

    // Clean up the temporary directory
    fs.rmSync(tempDir, { recursive: true, force: true });

    return response;
  }
}

function safeExecSync(command) {
  try {
    const stdout = execSync(command, { encoding: "utf8" });
    return { stdout, stderr: null, error: null };
  } catch (error) {
    console.log(error);
    return {
      stdout: null,
      stderr: error.stderr
        ? error.stderr.toString()
        : error.stdout
        ? error.stdout
        : null,
      error: error.message,
    };
  }
}
