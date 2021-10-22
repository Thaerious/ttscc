import assert from "assert";
import Extractor from "../src/Extractor.js";
import loadJSON from "../src/include/loadJSON.js";
import Path from "path";
import FS from "fs";
import Injector from "../src/Injector.js";

describe("Injector Test - src/Injector.js", function () {
    describe("#inject()", function () {
        this.afterEach(() => {
            const path = Path.join("deleteme");
            if (FS.existsSync(path)) {
                // FS.rmSync(path, { recursive: true });
            }
        });

        this.beforeEach(() => {
            const path = Path.join("deleteme");
            if (FS.existsSync(path)) {
                FS.rmSync(path, { recursive: true });
            }
        });        

        // it("fails if input directory not found", () => {
        //     // new Injector().inject("test/mock/project", "deleteme/out.json");
        // });
        // it("fails if input directory doesn't have ttscc-files/game.json file", () => {
        //     // new Injector().inject("test/mock/project", "deleteme/out.json");
        // });        
        it("creates output directory", () => {
            new Injector().inject("test/mock/project", "deleteme/out.json");
            const exists = FS.existsSync(
                Path.join("deleteme")
            );
            assert.strictEqual(exists, true);              
        });
        // it("creates output file", () => {
        //     new Injector().inject("test/mock/project", "deleteme/out.json");
        //     const exists = FS.existsSync(
        //         Path.join("deleteme", "out.json")
        //     );
        //     assert.strictEqual(exists, true);    
        // });
    });
});
