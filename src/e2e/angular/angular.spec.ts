import chai = require("chai");
import chaiAsPromised = require("chai-as-promised");
import {posix as path} from "path";
import {toPosix} from "../../lib/project";
import {execFile, readText, writeText} from "../../lib/utils/node-async";

chai.use(chaiAsPromised);
const assert: typeof chai.assert = chai.assert;

const PROJECT_ROOT: string = path.join(toPosix(__dirname), "project");
const RESOURCES_ROOT: string = path.join(toPosix(__dirname), "test-resources");

describe("Project angular", function (this: Mocha.ISuiteCallbackContext) {
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

  describe.skip("server:build", async function (this: Mocha.ISuiteCallbackContext): Promise<void> {
    before("Run `gulp server:build`", async function(this: Mocha.IHookCallbackContext) {
      this.timeout(60 * 1000);
      await execFile("gulp", ["server:build"], {cwd: PROJECT_ROOT});
    });

    it("should compile typescript files");

    it("should render pug files", async function (this: Mocha.ITestCallbackContext): Promise<void> {
      const [actualIndex, expectedIndex]: [string, string] = <[string, string]> await Promise.all([
        readText(path.join(PROJECT_ROOT, "build/server/static/index.html")),
        readText(path.join(RESOURCES_ROOT, "index.html")),
      ]);
      assert.equal(actualIndex, expectedIndex);
    });

    it("should render sass files", async function (this: Mocha.ITestCallbackContext): Promise<void> {
      const [actualCss, expectedCss]: [string, string] = <[string, string]> await Promise.all([
        readText(path.join(PROJECT_ROOT, "build/server/static/main.css")),
        readText(path.join(RESOURCES_ROOT, "main.css")),
      ]);
      assert.equal(actualCss, expectedCss);
    });
  });

  describe("server:run", async function (this: Mocha.ISuiteCallbackContext): Promise<void> {
    it("should run and serve pages");
  });
});
