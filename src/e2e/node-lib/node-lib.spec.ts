import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import fs from "fs";
import { Furi, join as furiJoin } from "furi";
import { fileURLToPath } from "url";
import { execFile, ExecFileError, ExecFileResult, readText } from "../../lib/utils/node-async";
import meta from "./meta.js";
import ErrnoException = NodeJS.ErrnoException;

chai.use(chaiAsPromised);
const assert: typeof chai.assert = chai.assert;

const PROJECT_ROOT: Furi = furiJoin(meta.dirname, ["project"]);
const PROJECT_ROOT_PATH: string = fileURLToPath(PROJECT_ROOT);
const RESOURCES_ROOT: Furi = furiJoin(meta.dirname, ["test-resources"]);

async function symlink(target: fs.PathLike, path: fs.PathLike, type?: fs.symlink.Type | null): Promise<void> {
  return new Promise((resolve, reject): void => {
    fs.symlink(target, path, type, (err: ErrnoException | null): void => {
      if (err !== null) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

describe("Project node-lib", function (this: Mocha.Suite) {
  before("Install npm dependencies", async function (this: Mocha.Context) {
    this.timeout(5 * 60 * 1000);
    await execFile("yarn", ["install"], {cwd: PROJECT_ROOT_PATH});
    try {
      await symlink("../../../../lib", furiJoin(PROJECT_ROOT, ["node_modules", "turbo-gulp"]), "dir");
    } catch (err) {
      if (err.code !== "EEXIST") {
        throw err;
      }
    }
  });

  describe("tasks", function (this: Mocha.Suite): void {
    it("should return an error when the task is unknown", async function (this: Mocha.Context) {
      this.timeout(60 * 1000);
      const result: Promise<ExecFileResult> = execFile("gulp", [":unknown-task"], {cwd: PROJECT_ROOT_PATH});
      return assert.isRejected(result, ExecFileError);
    });
  });

  describe("lint", function (this: Mocha.Suite): void {
    it("should not report any error", async function (this: Mocha.Context) {
      this.timeout(60 * 1000);
      await execFile("gulp", ["lint"], {cwd: PROJECT_ROOT_PATH});
    });
  });

  describe("lib:build", function (this: Mocha.Suite): void {
    before("Run `gulp lib:build`", async function (this: Mocha.Context) {
      this.timeout(60 * 1000);
      await execFile("gulp", ["lib:build"], {cwd: PROJECT_ROOT_PATH});
    });

    it("should output runnable typescript files", async function (this: Mocha.Context): Promise<void> {
      const result: ExecFileResult = await execFile("node", ["build/lib/hello-world.js"], {cwd: PROJECT_ROOT_PATH});

      const actualOutput: string = result.stdout.toString("UTF-8");
      const expectedOutput: string = "Hello, World!\n";

      assert.equal(actualOutput, expectedOutput);
    });
  });

  describe("lib:dist", function (this: Mocha.Suite): void {
    before("Run `gulp lib:dist`", async function (this: Mocha.Context) {
      this.timeout(60 * 1000);
      await execFile("gulp", ["lib:dist"], {cwd: PROJECT_ROOT_PATH});
    });

    it("should output runnable typescript files", async function (this: Mocha.Context): Promise<void> {
      const result: ExecFileResult = await execFile("node", ["dist/lib/hello-world.js"], {cwd: PROJECT_ROOT_PATH});

      const actualOutput: string = result.stdout.toString("UTF-8");
      const expectedOutput: string = "Hello, World!\n";

      assert.equal(actualOutput, expectedOutput);
    });
  });

  describe("lib:tsconfig.json", function (this: Mocha.Suite): void {
    before("Run `gulp lib:tsconfig.json`", async function (this: Mocha.Context) {
      this.timeout(60 * 1000);
      await execFile("gulp", ["lib:tsconfig.json"], {cwd: PROJECT_ROOT_PATH});
    });

    it(
      "should output the expected tsconfig.json file in src/lib",
      async function (this: Mocha.Context): Promise<void> {
        const [actual, expected]: [string, string] = <[string, string]> await Promise.all([
          readText(furiJoin(PROJECT_ROOT, ["src", "lib", "tsconfig.json"])),
          readText(furiJoin(RESOURCES_ROOT, ["lib._tsconfig.json"])),
        ]);
        assert.equal(actual, expected);
      },
    );
  });

  describe("lib:test", function (this: Mocha.Suite): void {
    it("should not report any error", async function (this: Mocha.Context) {
      this.timeout(60 * 1000);
      await execFile("gulp", ["test"], {cwd: PROJECT_ROOT_PATH});
    });
  });
});
