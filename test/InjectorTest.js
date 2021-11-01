import assert from "assert";
import Extractor from "../src/Extractor.js";
import loadJSON from "../src/include/loadJSON.js";
import Path from "path";
import FS from "fs";
import Injector from "../src/Injector.js";

function getObjectByGUID(obj, guid){
    if (obj?.GUID === guid) return obj;

    const childStates = obj["ContainedObjects"] ?? obj["ObjectStates"];

    if (childStates){
        for(const child of childStates){     
            const result = getObjectByGUID(child, guid);       
            if (result) return result;
        }
    }

    return undefined;
}

describe("getObjectByGUID() - test function", ()=>{
    it("retrives object depth = 1", ()=>{
        const json = loadJSON("test/mock1/simple_nested.json");
        const obj = getObjectByGUID(json, "e6db0c");
        assert.strictEqual("depth 1 - only no children", obj["Description"]);
    });
    it("retrives object depth = 2", ()=>{
        const json = loadJSON("test/mock1/simple_nested.json");
        const obj = getObjectByGUID(json, "f8d280");
        assert.strictEqual("depth 2 - first object", obj["Description"]);
    }); 
    it("retrives object depth = 2", ()=>{
        const json = loadJSON("test/mock1/simple_nested.json");
        const obj = getObjectByGUID(json, "000000");
        assert.strictEqual(undefined, obj);
    });          
});

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

        it("The script from global.tua get's injected into the root of the game object", () => {
            const game = new Injector().inject("test/mock1/project");
            const script = game['LuaScript'];
            const srcScript = FS.readFileSync('test/mock1/project/tts-src/script/global.tua', {encoding: "utf-8"});
            assert.strictEqual(srcScript.trim(), script.trim());
        });

        it("The script from e6db0c.tua get's injected into the e6db0c game object", () => {
            const game = new Injector().inject("test/mock1/project");
            const script = getObjectByGUID(game, "e6db0c")['LuaScript'];
            assert.strictEqual("--- rem statement 1", script.trim());
        });

        it("The script from f8d280.tua get's injected into the f8d280 game object", () => {
            const game = new Injector().inject("test/mock1/project");
            const script = getObjectByGUID(game, "f8d280")['LuaScript'];
            assert.strictEqual("--- rem statement 3", script.trim());
        });

        it("The script from f5d270.tua (which is in the wrong directory) get's injected into the f5d270 game object", () => {
            const game = new Injector().inject("test/mock1/project");
            const script = getObjectByGUID(game, "f5d270")['LuaScript'];
            assert.strictEqual("--- rem statement 4", script.trim());
        });

        // f5d270 is in the wrong directory, still injects
    });
    describe("verify include statements", function () {
    });
});
