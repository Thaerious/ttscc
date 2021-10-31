import assert from "assert";
import Extractor from "../src/Extractor.js";
import loadJSON from "../src/include/loadJSON.js";
import Path from "path";
import FS from "fs";
import Injector from "../src/Injector.js";

function getObjectByGUID(obj, guid){
    if (!guid || guid == '-1') return game;
    const childStates = obj.objectState["ContainedObjects"] ?? obj.objectState["ObjectStates"];

    if (childStates){
        for(const childState of childStates){
            if (childState["GUID"] === guid) return childState;
        }
    }
}

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

        it("root script get's injected", () => {
            const game = new Injector().inject("test/mock/project");
            const script = game['LuaScript'];
            const srcScript = FS.readFileSync('test/mock/project/tts-src/script/global.tua', {encoding: "utf-8"});
            assert.strictEqual(srcScript.trim(), script.trim());
        });


        // f5d270 is in the wrong directory, still injects
    });
});
