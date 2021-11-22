import assert from "assert";
import Path from "path";
import FS from "fs";
import Injector from "../src/Injector.js";
import constants from "../src/include/constants.js";
import bfsObject from "../src/include/bfsObject.js";

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
        it("The field 'XmlUI' in global contains the xml from tts-src/ui/global.xml", () => {
            const injector = new Injector();
            injector.field = "XmlUI";
            injector.extension = ".xml";
            injector.transpile = false;

            const game = injector.inject("test/mock1/project", constants.UI_DIR);
            const actual = game["XmlUI"];
            const expected = `<tag attrib="value">TEXT</tag>`;
            assert.strictEqual(actual, expected);
        });
        it("The field 'XmlUI' in child contains the xml from tts-src/ui/global.xml", () => {
            const injector = new Injector();
            injector.field = "XmlUI";
            injector.extension = ".xml";
            injector.transpile = false;

            const game = injector.inject("test/mock1/project", constants.UI_DIR);
            const gameObject = bfsObject(game, "GUID", "f6dac0")
            const actual = gameObject["XmlUI"];
            const expected = `<tag attrib="value">CHILD TEXT</tag>`;
            assert.strictEqual(actual, expected);
        });
    });
});