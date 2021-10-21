import assert from "assert";
import Extractor from "../src/Extractor.js";
import loadJSON from "../src/include/loadJSON.js";
import Path from 'path';
import FS from 'fs';

describe("Extractor Test - src/Extractor.js", function () {
    describe("#extract()", function () {
        describe("should return a list of all objects", function () {
            it("returns 1 object when the game only has the root object", function(){
                const extractor = new Extractor();
                const json = loadJSON("test/mock/simple_empty.json");
                const library = extractor.extract(json);
                assert.strictEqual(Object.keys(library).length, 1);
            });
            it("returns 2 objects when the game has the root and another object", function(){
                const extractor = new Extractor();
                const json = loadJSON("test/mock/simple_double.json");
                const library = extractor.extract(json);
                assert.strictEqual(Object.keys(library).length, 2);
            });          
            it("returns nested objects as well as root objects", function(){
                const extractor = new Extractor();
                const json = loadJSON("test/mock/simple_nested.json");
                const library = extractor.extract(json);
                assert.strictEqual(Object.keys(library).length, 5);
            });               
        });
    });
    describe("#writeOut()", function () {
        describe("writes all scripts into the 'tts-src/script' directory", function () {
            this.afterEach(()=>{
                const path = Path.join("deleteme");
                if (FS.existsSync(path)){
                    // FS.rmSync(path, { recursive: true });
                }
            });

            it("creates the script directory if it doesn't exist", function(){
                const extractor = new Extractor();
                const json = loadJSON("test/mock/mock_game_01.json");
                extractor.extract(json);
                extractor.writeOut("deleteme/");

                const exists = FS.existsSync(Path.join("deleteme", "tts-src", "script"));
                assert.strictEqual(exists, true);
            });   
            it("creates the empty script directory if it doesn't exist", function(){
                const extractor = new Extractor();
                const json = loadJSON("test/mock/simple_empty.json");
                extractor.extract(json);
                extractor.writeOut("deleteme/");

                const exists = FS.existsSync(Path.join("deleteme", "tts-src", "empty"));
                assert.strictEqual(exists, true);
            });
            it("<runme> creates the empty script directory if it doesn't exist", function(){
                const extractor = new Extractor();
                const json = loadJSON("test/mock/mock_game_01.json");
                extractor.extract(json);
                extractor.writeOut("deleteme/");
            });            
        });
    });    
});
