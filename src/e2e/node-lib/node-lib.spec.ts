import chai = require("chai");
import chaiAsPromised = require("chai-as-promised");
import {posix as path} from "path";
import {toUnix} from "../../lib/utils/locations";
import {execFile, ExecFileError, ExecFileResult, readText, writeText} from "../../lib/utils/node-async";

chai.use(chaiAsPromised);
const assert: typeof chai.assert = chai.assert;

const PROJECT_ROOT: string = path.join(toUnix(__dirname), "project");
const RESOURCES_ROOT: string = path.join(toUnix(__dirname), "test-resources");

describe("Project node-lib", function (this: Mocha.ISuiteCallbackContext) {
  before("Install npm dependencies", async function(this: Mocha.IHookCallbackContext) {
    this.timeout(5 * 60 * 1000);
    const buildToolsPath: string = "../../../lib/index";
    await writeText(
      path.join(PROJECT_ROOT, "local-web-build-tools.js"),
      `module.exports = require(${JSON.stringify(buildToolsPath)});\n`,
    );
    await execFile("npm", ["prune"], {cwd: PROJECT_ROOT});
    await execFile("npm", ["install"], {cwd: PROJECT_ROOT});
  });

  describe("tasks", async function (this: Mocha.ISuiteCallbackContext): Promise<void> {
    it("should return an error when the task is unknown", async function (this: Mocha.ITestCallbackContext) {
      this.timeout(60 * 1000);
      const result: Promise<ExecFileResult> = execFile("gulp", [":unknown-task"], {cwd: PROJECT_ROOT});
      await assert.isRejected(result, ExecFileError);
    });
  });

  describe(":lint", async function (this: Mocha.ISuiteCallbackContext): Promise<void> {
    it("should not report any error", async function (this: Mocha.ITestCallbackContext) {
      this.timeout(60 * 1000);
      await execFile("gulp", [":lint"], {cwd: PROJECT_ROOT});
    });
  });

  describe("lib:build", async function (this: Mocha.ISuiteCallbackContext): Promise<void> {
    before("Run `gulp lib:build`", async function(this: Mocha.IHookCallbackContext) {
      this.timeout(60 * 1000);
      await execFile("gulp", ["lib:build"], {cwd: PROJECT_ROOT});
    });

    it("should output runnable typescript files", async function (this: Mocha.ITestCallbackContext): Promise<void> {
      const result: ExecFileResult = await execFile("node", ["build/lib/lib/hello-world.js"], {cwd: PROJECT_ROOT});

      const actualOutput: string = result.stdout.toString("utf8");
      const expectedOutput: string = "Hello, World!\n";

      assert.equal(actualOutput, expectedOutput);
    });
  });

  describe("lib:dist", async function (this: Mocha.ISuiteCallbackContext): Promise<void> {
    before("Run `gulp lib:dist`", async function(this: Mocha.IHookCallbackContext) {
      this.timeout(60 * 1000);
      await execFile("gulp", ["lib:dist"], {cwd: PROJECT_ROOT});
    });

    it("should output runnable typescript files", async function (this: Mocha.ITestCallbackContext): Promise<void> {
      const result: ExecFileResult = await execFile("node", ["dist/lib/lib/hello-world.js"], {cwd: PROJECT_ROOT});

      const actualOutput: string = result.stdout.toString("utf8");
      const expectedOutput: string = "Hello, World!\n";

      assert.equal(actualOutput, expectedOutput);
    });
  });

  describe("lib:tsconfig.json", async function (this: Mocha.ISuiteCallbackContext): Promise<void> {
    before("Run `gulp lib:tsconfig.json`", async function(this: Mocha.IHookCallbackContext) {
      this.timeout(60 * 1000);
      await execFile("gulp", ["lib:tsconfig.json"], {cwd: PROJECT_ROOT});
    });

    it(
      "should output a tsconfig.json file in src/lib",
      async function (this: Mocha.ITestCallbackContext): Promise<void> {
        const [actual, expected]: [string, string] = <[string, string]> await Promise.all([
          readText(path.join(PROJECT_ROOT, "src/lib/tsconfig.json")),
          readText(path.join(RESOURCES_ROOT, "lib._tsconfig.json")),
        ]);
        assert.equal(actual, expected);
      },
    );
  });

  describe("lib:test", async function (this: Mocha.ISuiteCallbackContext): Promise<void> {
    it("should not report any error", async function (this: Mocha.ITestCallbackContext) {
      this.timeout(60 * 1000);
      await execFile("gulp", ["lib-test"], {cwd: PROJECT_ROOT});
    });
  });
});
