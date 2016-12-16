import chai = require("chai");
import chaiAsPromised = require("chai-as-promised");
import {posix as path} from "path";
import {toUnix} from "../../lib/utils/locations";
import {execFile, ExecFileError, ExecFileResult, writeText} from "../../lib/utils/node-async";

chai.use(chaiAsPromised);
const assert: typeof chai.assert = chai.assert;

const PROJECT_ROOT: string = path.join(toUnix(__dirname), "project");
const EXPECTED_ROOT: string = path.join(toUnix(__dirname), "expected");

describe("Project node-lib", function (this: Mocha.ISuite) {
  before("Install npm dependencies", async function(this: Mocha.IContextDefinition) {
    this.timeout(5 * 60 * 1000);
    const buildToolsPath: string = "../../../lib/index";
    await writeText(
      path.join(PROJECT_ROOT, "local-web-build-tools.js"),
      `module.exports = require(${JSON.stringify(buildToolsPath)});\n`
    );
    await execFile("npm", ["prune"], {cwd: PROJECT_ROOT});
    await execFile("npm", ["install"], {cwd: PROJECT_ROOT});
  });

  describe("tasks", async function (this: Mocha.ISuite): Promise<void> {
    it("should return an error when the task is unknown", async function (this: Mocha.ITestDefinition) {
      this.timeout(60 * 1000);
      const result: Promise<ExecFileResult> = execFile("gulp", [":unknown-task"], {cwd: PROJECT_ROOT});
      await assert.isRejected(result, ExecFileError);
    });
  });

  describe(":lint", async function (this: Mocha.ISuite): Promise<void> {
    it("should not report any error", async function (this: Mocha.ITestDefinition) {
      this.timeout(60 * 1000);
      await execFile("gulp", [":lint"], {cwd: PROJECT_ROOT});
    });
  });
});
