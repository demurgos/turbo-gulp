import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import fs from "fs";
import path from "path";
import { toPosix } from "../../lib/project";
import { execFile, ExecFileError, ExecFileResult, readText } from "../../lib/utils/node-async";
import meta from "./meta.js";

chai.use(chaiAsPromised);
const assert: typeof chai.assert = chai.assert;

const PROJECT_ROOT: string = path.posix.join(toPosix(meta.dirname), "project");
const RESOURCES_ROOT: string = path.posix.join(toPosix(meta.dirname), "test-resources");

describe("Project node-lib", function (this: Mocha.Suite) {
  before("Install npm dependencies", async function (this: Mocha.Context) {
    this.timeout(5 * 60 * 1000);
    await execFile("yarn", ["install"], {cwd: PROJECT_ROOT});
    try {
      await fs.promises.symlink("../../../../lib", path.posix.join(PROJECT_ROOT, "node_modules", "turbo-gulp"), "dir");
    } catch (err) {
      if (err.code !== "EEXIST") {
        throw err;
      }
    }
  });

  describe("tasks", function (this: Mocha.Suite): void {
    it("should return an error when the task is unknown", async function (this: Mocha.Context) {
      this.timeout(60 * 1000);
      const result: Promise<ExecFileResult> = execFile("gulp", [":unknown-task"], {cwd: PROJECT_ROOT});
      return assert.isRejected(result, ExecFileError);
    });
  });

  describe(":lint", function (this: Mocha.Suite): void {
    it("should not report any error", async function (this: Mocha.Context) {
      this.timeout(60 * 1000);
      await execFile("gulp", [":lint"], {cwd: PROJECT_ROOT});
    });
  });

  describe("lib:build", function (this: Mocha.Suite): void {
    before("Run `gulp lib:build`", async function (this: Mocha.Context) {
      this.timeout(60 * 1000);
      await execFile("gulp", ["lib:build"], {cwd: PROJECT_ROOT});
    });

    it("should output runnable typescript files", async function (this: Mocha.Context): Promise<void> {
      const result: ExecFileResult = await execFile("node", ["build/lib/hello-world.js"], {cwd: PROJECT_ROOT});

      const actualOutput: string = result.stdout.toString("UTF-8");
      const expectedOutput: string = "Hello, World!\n";

      assert.equal(actualOutput, expectedOutput);
    });
  });

  describe("lib:dist", function (this: Mocha.Suite): void {
    before("Run `gulp lib:dist`", async function (this: Mocha.Context) {
      this.timeout(60 * 1000);
      await execFile("gulp", ["lib:dist"], {cwd: PROJECT_ROOT});
    });

    it("should output runnable typescript files", async function (this: Mocha.Context): Promise<void> {
      const result: ExecFileResult = await execFile("node", ["dist/lib/hello-world.js"], {cwd: PROJECT_ROOT});

      const actualOutput: string = result.stdout.toString("UTF-8");
      const expectedOutput: string = "Hello, World!\n";

      assert.equal(actualOutput, expectedOutput);
    });
  });

  describe("lib:tsconfig.json", function (this: Mocha.Suite): void {
    before("Run `gulp lib:tsconfig.json`", async function (this: Mocha.Context) {
      this.timeout(60 * 1000);
      await execFile("gulp", ["lib:tsconfig.json"], {cwd: PROJECT_ROOT});
    });

    it(
      "should output the expected tsconfig.json file in src/lib",
      async function (this: Mocha.Context): Promise<void> {
        const [actual, expected]: [string, string] = <[string, string]> await Promise.all([
          readText(path.posix.join(PROJECT_ROOT, "src/lib/tsconfig.json")),
          readText(path.posix.join(RESOURCES_ROOT, "lib._tsconfig.json")),
        ]);
        assert.equal(actual, expected);
      },
    );
  });

  describe("lib:test", function (this: Mocha.Suite): void {
    it("should not report any error", async function (this: Mocha.Context) {
      this.timeout(60 * 1000);
      await execFile("gulp", ["test"], {cwd: PROJECT_ROOT});
    });
  });
});
