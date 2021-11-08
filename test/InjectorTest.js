import assert from "assert";
import loadJSON from "../src/include/loadJSON.js";
import Path from "path";
import FS from "fs";
import Injector from "../src/Injector.js";

function getObjectByGUID(obj, guid) {
    if (obj?.GUID === guid) return obj;

    const childStates = obj["ContainedObjects"] ?? obj["ObjectStates"];

    if (childStates) {
        for (const child of childStates) {
            const result = getObjectByGUID(child, guid);
            if (result) return result;
        }
    }

    return undefined;
}

describe("getObjectByGUID() - test function", () => {
    it("retrieves object depth = 1", () => {
        const json = loadJSON("test/mock1/simple_nested.json");
        const obj = getObjectByGUID(json, "e6db0c");
        assert.strictEqual("depth 1 - only no children", obj["Description"]);
    });
    it("retrieves object depth = 2", () => {
        const json = loadJSON("test/mock1/simple_nested.json");
        const obj = getObjectByGUID(json, "f8d280");
        assert.strictEqual("depth 2 - first object", obj["Description"]);
    });
    it("retrieves object depth = 2", () => {
        const json = loadJSON("test/mock1/simple_nested.json");
        const obj = getObjectByGUID(json, "000000");
        assert.strictEqual(undefined, obj);
    });
});

describe("Injector Test - src/Injector.js", function () {
    this.afterEach(() => {
        const path = Path.join("deleteme");
        if (FS.existsSync(path)) {
            FS.rmSync(path, { recursive: true });
        }
    });

    this.beforeEach(() => {
        const path = Path.join("deleteme");
        if (FS.existsSync(path)) {
            FS.rmSync(path, { recursive: true });
        }
    });

    describe("#inject()", function () {
        it("The script from global.tua get's injected into the root of the game object", () => {
            const game = new Injector().inject("test/mock1/project");
            const script = game["LuaScript"];
            const srcScript = FS.readFileSync("test/mock1/project/tts-src/script/global.tua", { encoding: "utf-8" });
            assert.strictEqual(srcScript.trim(), script.trim());
        });

        it("The script from e6db0c.tua get's injected into the e6db0c game object", () => {
            const game = new Injector().inject("test/mock1/project");
            const script = getObjectByGUID(game, "e6db0c")["LuaScript"];
            assert.strictEqual("--- rem statement 1", script.trim());
        });

        it("The script from f8d280.tua get's injected into the f8d280 game object", () => {
            const game = new Injector().inject("test/mock1/project");
            const script = getObjectByGUID(game, "f8d280")["LuaScript"];
            assert.strictEqual("--- rem statement 3", script.trim());
        });

        it("The script from f5d270.tua (which is in the wrong directory) get's injected into the f5d270 game object", () => {
            const game = new Injector().inject("test/mock1/project");
            const script = getObjectByGUID(game, "f5d270")["LuaScript"];
            assert.strictEqual("--- rem statement 4", script.trim());
        });

        // f5d270 is in the wrong directory, still injects
    });
    describe("verify include statements (mock2)", function () {
        describe("root script", function () {
            it("comments out the include statement", () => {
                const injector = new Injector();
                injector.addIncludePath("test/mock2/include");
                injector.addIncludePath("test/mock2/alt-include");
                const game = injector.inject("test/mock2/project");
                const script = game["LuaScript"];
                assert.notStrictEqual(script.indexOf(`---- #include "keys.tua"`), -1);
            });
            it("has opening tag for include block", () => {
                const injector = new Injector();
                injector.addIncludePath("test/mock2/include");
                injector.addIncludePath("test/mock2/alt-include");
                const game = injector.inject("test/mock2/project");
                const script = game["LuaScript"];
                assert.notStrictEqual(script.indexOf(`---> keys.tua`), -1);
            });
            it("has contents of include file", () => {
                const injector = new Injector();
                injector.addIncludePath("test/mock2/include");
                injector.addIncludePath("test/mock2/alt-include");
                const game = injector.inject("test/mock2/project");
                const script = game["LuaScript"];
                assert.notStrictEqual(script.indexOf(`board = "88e31a"`), -1);
            });
            describe("allows for multiple include locations", function () {
                it("comments out the include statement", () => {
                    const injector = new Injector();
                    injector.addIncludePath("test/mock2/include");
                    injector.addIncludePath("test/mock2/alt-include");
                    const game = injector.inject("test/mock2/project");
                    const script = game["LuaScript"];
                    assert.notStrictEqual(script.indexOf(`---- #include "foo.tua"`), -1);
                });
                it("has opening tag for include block", () => {
                    const injector = new Injector();
                    injector.addIncludePath("test/mock2/include");
                    injector.addIncludePath("test/mock2/alt-include");
                    const game = injector.inject("test/mock2/project");
                    const script = game["LuaScript"];
                    assert.notStrictEqual(script.indexOf(`---> foo.tua`), -1);
                });
                it("has contents of include file", () => {
                    const injector = new Injector();
                    injector.addIncludePath("test/mock2/include");
                    injector.addIncludePath("test/mock2/alt-include");
                    const game = injector.inject("test/mock2/project");
                    const script = game["LuaScript"];
                    assert.notStrictEqual(script.indexOf(`ima foo four ewe`), -1);
                });
            });
        });
        describe("child script", function () {
            it("(here) comments out the include statement", () => {
                const injector = new Injector();
                injector.addIncludePath("test/mock2/include");
                injector.addIncludePath("test/mock2/alt-include");
                const game = injector.inject("test/mock2/project");
                const script = getObjectByGUID(game, "f6dac0")["LuaScript"];
                assert.notStrictEqual(script.indexOf(`---- #include "keys.tua"`), -1);
            });
            it("has opening tag for include block", () => {
                const injector = new Injector();
                injector.addIncludePath("test/mock2/include");
                injector.addIncludePath("test/mock2/alt-include");
                const game = injector.inject("test/mock2/project");
                const script = getObjectByGUID(game, "f6dac0")["LuaScript"];
                assert.notStrictEqual(script.indexOf(`---> keys.tua`), -1);
            });
            it("has contents of include file", () => {
                const injector = new Injector();
                injector.addIncludePath("test/mock2/include");
                injector.addIncludePath("test/mock2/alt-include");
                const game = injector.inject("test/mock2/project");
                const script = getObjectByGUID(game, "f6dac0")["LuaScript"];
                assert.notStrictEqual(script.indexOf(`board = "88e31a"`), -1);
            });
            describe("allows for multiple include locations", function () {
                it("comments out the include statement", () => {
                    const injector = new Injector();
                    injector.addIncludePath("test/mock2/include");
                    injector.addIncludePath("test/mock2/alt-include");
                    const game = injector.inject("test/mock2/project");
                    const script = getObjectByGUID(game, "f6dac0")["LuaScript"];
                    assert.notStrictEqual(script.indexOf(`---- #include "foo.tua"`), -1);
                });
                it("has opening tag for include block", () => {
                    const injector = new Injector();
                    injector.addIncludePath("test/mock2/include");
                    injector.addIncludePath("test/mock2/alt-include");
                    const game = injector.inject("test/mock2/project");
                    const script = getObjectByGUID(game, "f6dac0")["LuaScript"];
                    assert.notStrictEqual(script.indexOf(`---> foo.tua`), -1);
                });
                it("has contents of include file", () => {
                    const injector = new Injector();
                    injector.addIncludePath("test/mock2/include");
                    injector.addIncludePath("test/mock2/alt-include");
                    const game = injector.inject("test/mock2/project");
                    const script = getObjectByGUID(game, "f6dac0")["LuaScript"];
                    assert.notStrictEqual(script.indexOf(`ima foo four ewe`), -1);
                });
            });
            describe("injector creates a debug script in project files directory (ttscc-files/packed)", function () {
                it("creates the file for a child script", () => {
                    const injector = new Injector();
                    injector.addIncludePath("test/mock2/include");
                    injector.addIncludePath("test/mock2/alt-include");
                    injector.inject("test/mock2/project");
                    injector.writeDebugFiles("deleteme");

                    const script = FS.readFileSync("deleteme/ttscc-files/packed/f6dac0.tua");
                    assert.notStrictEqual(script.indexOf(`---- #include "keys.tua"`), -1);
                });
            });
            describe("#filemap retrieves the non-reflective filename to file location dictionary", function () {
                it("retrieves a map", () => {
                    const injector = new Injector();
                    injector.addIncludePath("test/mock2/include");
                    injector.addIncludePath("test/mock2/alt-include");
                    injector.inject("test/mock2/project");
                    assert.notStrictEqual(undefined, injector.filemap);
                });
                it("map is non-reflective", () => {
                    const injector = new Injector();
                    injector.addIncludePath("test/mock2/include");
                    injector.addIncludePath("test/mock2/alt-include");
                    injector.inject("test/mock2/project");
                    const filemap = injector.filemap;
                    filemap.a = "not relfected";
                    assert.strictEqual(undefined, injector.filemap.a);
                });

            });            
        });
    });
});
