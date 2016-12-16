import chai = require("chai");
import chaiAsPromised = require("chai-as-promised");
import {posix as path} from "path";
import {toUnix} from "../../lib/utils/locations";
import {execFile, ExecFileResult, readText, writeText} from "../../lib/utils/node-async";

chai.use(chaiAsPromised);
const assert: typeof chai.assert = chai.assert;

const PROJECT_ROOT: string = path.join(toUnix(__dirname), "project");
const EXPECTED_ROOT: string = path.join(toUnix(__dirname), "expected");

describe("Project angular", function (this: Mocha.ISuite) {
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

  describe("server:build", async function (this: Mocha.ISuite): Promise<void> {
    before("Run `gulp server:build`", async function(this: Mocha.IContextDefinition) {
      this.timeout(60 * 1000);
      await execFile("gulp", ["server:build"], {cwd: PROJECT_ROOT});
    });

    it("should compile typescript files", async function (this: Mocha.ITest): Promise<void> {
      const result: ExecFileResult = await execFile("node", ["build/server/server/main.js"], {cwd: PROJECT_ROOT});

      const actualOutput: string = result.stdout.toString("utf8");
      const expectedOutput: string = "Hello, World!\n";

      assert.equal(actualOutput, expectedOutput);
    });

    it("should render pug files", async function (this: Mocha.ITest): Promise<void> {
      const [actualIndex, expectedIndex]: [string, string] = <[string, string]> await Promise.all([
        readText(path.join(PROJECT_ROOT, "build/server/app/index.html")),
        readText(path.join(EXPECTED_ROOT, "index.html"))
      ]);
      assert.equal(actualIndex, expectedIndex);
    });

    it("should render sass files", async function (this: Mocha.ITest): Promise<void> {
      const [actualIndex, expectedIndex]: [string, string] = <[string, string]> await Promise.all([
        readText(path.join(PROJECT_ROOT, "build/server/app/main.css")),
        readText(path.join(EXPECTED_ROOT, "main.css"))
      ]);
      assert.equal(actualIndex, expectedIndex);
    });
  });
});
