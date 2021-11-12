import assert from "assert";
import Extractor from "../src/Extractor.js";
import loadJSON from "../src/include/loadJSON.js";
import Path from "path";
import FS from "fs";

describe("Extractor Test - src/Extractor.js", function () {
    describe("#extract()", function () {
        describe("should return a list of all objects", function () {
            it("returns 1 object when the game only has the root object", function () {
                const extractor = new Extractor();
                const json = loadJSON("test/mock1/simple_empty.json");
                const library = extractor.extract(json);
                assert.strictEqual(Object.keys(library).length, 1);
            });
            it("returns 2 objects when the game has the root and another object", function () {
                const extractor = new Extractor();
                const json = loadJSON("test/mock1/simple_double.json");
                const library = extractor.extract(json);
                assert.strictEqual(Object.keys(library).length, 2);
            });
            it("returns nested objects as well as root objects", function () {
                const extractor = new Extractor();
                const json = loadJSON("test/mock1/simple_nested.json");
                const library = extractor.extract(json);
                assert.strictEqual(Object.keys(library).length, 6);
            });
        });
    });
    describe("#writeOut()", function () {
        this.beforeEach(() => {
            const path = Path.join("deleteme");
            if (FS.existsSync(path)) {
                FS.rmSync(path, { recursive: true });
            }
        });
        
        this.afterEach(() => {
            const path = Path.join("deleteme");
            if (FS.existsSync(path)) {
                FS.rmSync(path, { recursive: true });
            }
        });

        describe("empty scripts only in the empty directory, non-empty scripts only in the script directory", function(){
            this.beforeEach(() => {
                const extractor = new Extractor();
                const json = loadJSON("test/mock1/simple_nested.json");
                const library = extractor.extract(json);
                extractor.writeOut("deleteme");   
            });

            describe("global.tua", function(){
                it("is not in the empty directory", function(){
                    const scriptPath = Path.join("deleteme", "tts-src", "empty", "global.tua");
                    const actual = FS.existsSync(scriptPath);
                    const expected = false;
                    assert.strictEqual(actual, expected);                    
                });
                it("is in the script directory", function(){
                    const scriptPath = Path.join("deleteme", "tts-src", "script", "global.tua");
                    const actual = FS.existsSync(scriptPath);
                    const expected = true;
                    assert.strictEqual(actual, expected);                    
                });
            });
            describe("e6db0c.tua", function(){
                it("is not in the empty directory", function(){
                    const scriptPath = Path.join("deleteme", "tts-src", "empty", "Action_Card", "e6db0c.tua");
                    const actual = FS.existsSync(scriptPath);
                    const expected = false;
                    assert.strictEqual(actual, expected);                    
                });
                it("is in the script directory", function(){
                    const scriptPath = Path.join("deleteme", "tts-src", "script", "Action_Card", "e6db0c.tua");
                    const actual = FS.existsSync(scriptPath);
                    const expected = true;
                    assert.strictEqual(actual, expected);                    
                });
            });      
            describe("a1f0bc.tua (empty script)", function(){
                it("is in the empty directory", function(){
                    const scriptPath = Path.join("deleteme", "tts-src", "empty", "Action_Card", "a1f0bc.tua");
                    const actual = FS.existsSync(scriptPath);
                    const expected = true;
                    assert.strictEqual(actual, expected);                    
                });
                it("is not in the script directory", function(){
                    const scriptPath = Path.join("deleteme", "tts-src", "script", "Action_Card", "a1f0bc.tua");
                    const actual = FS.existsSync(scriptPath);
                    const expected = false;
                    assert.strictEqual(actual, expected);                    
                });
            });                    
        });

        describe("writes all scripts into the 'tts-src/script' directory", function () {
            it("creates the script directory if it doesn't exist", function () {
                const extractor = new Extractor();
                const json = loadJSON("test/mock1/mock_game_01.json");
                extractor.extract(json);
                extractor.writeOut("deleteme/");

                const exists = FS.existsSync(
                    Path.join("deleteme", "tts-src", "script")
                );
                assert.strictEqual(exists, true);
            });
            it("creates the empty script directory if it doesn't exist", function () {
                const extractor = new Extractor();
                const json = loadJSON("test/mock1/simple_empty.json");
                extractor.extract(json);
                extractor.writeOut("deleteme/");

                const exists = FS.existsSync(
                    Path.join("deleteme", "tts-src", "empty")
                );
                assert.strictEqual(exists, true);
            });
            it("creates project files directory", function () {
                const extractor = new Extractor();
                const json = loadJSON("test/mock1/mock_game_01.json");
                extractor.extract(json);
                extractor.writeOut("deleteme/");

                const exists = FS.existsSync(
                    Path.join("deleteme", "ttscc-files")
                );
                assert.strictEqual(exists, true);
            });
            it("creates stripped game file", function () {
                const extractor = new Extractor();
                const json = loadJSON("test/mock1/mock_game_01.json");
                extractor.extract(json);
                extractor.writeOut("deleteme/");

                const exists = FS.existsSync(
                    Path.join("deleteme", "ttscc-files", "game.json")
                );
                assert.strictEqual(exists, true);
            });
        });

        describe("putting scripts into subdirectories based on nick name", function () {
            it("the root object doesn't go into a subdirectory", function () {
                const extractor = new Extractor();
                const json = loadJSON("test/mock1/simple_nested.json");
                const library = extractor.extract(json);
                extractor.writeOut("deleteme");

                const exists = FS.existsSync(
                    Path.join("deleteme", "tts-src", "script", "global.tua")
                );
                assert.strictEqual(exists, true);                
            });

            it("objects in the root get a subdirectory", function () {
                const extractor = new Extractor();
                const json = loadJSON("test/mock1/simple_nested.json");
                const library = extractor.extract(json);
                extractor.writeOut("deleteme");

                const exists = FS.existsSync(
                    Path.join("deleteme", "tts-src", "script", "Action_Card", "e6db0c.tua")
                );
                assert.strictEqual(exists, true);                
            });

            it("objects in other objects get a subdirectory", function () {
                const extractor = new Extractor();
                const json = loadJSON("test/mock1/simple_nested.json");
                const library = extractor.extract(json);
                extractor.writeOut("deleteme");

                const exists = FS.existsSync(
                    Path.join("deleteme", "tts-src", "script", "Point_Card", "f5d270.tua")
                );
                assert.strictEqual(exists, true);                
            });            

            it("will not overwrite global file already there", function(){
                const scriptPath = Path.join("deleteme", "tts-src", "script", "global.tua");
                FS.mkdirSync(Path.dirname(scriptPath), { recursive: true });
                FS.writeFileSync(scriptPath, "did not overwrite");

                const extractor = new Extractor();
                const json = loadJSON("test/mock1/simple_nested.json");
                const library = extractor.extract(json);
                extractor.writeOut("deleteme");    
                
                const globalContents = FS.readFileSync(scriptPath, "utf-8");
                assert.strictEqual(globalContents, "did not overwrite");  
            });  
            
            it("will not overwrite object file already there", function(){
                const scriptPath = Path.join("deleteme", "tts-src", "script", "Point_Card", "f5d270.tua")
                FS.mkdirSync(Path.dirname(scriptPath), { recursive: true });
                FS.writeFileSync(scriptPath, "did not overwrite");

                const extractor = new Extractor();
                const json = loadJSON("test/mock1/simple_nested.json");
                const library = extractor.extract(json);
                extractor.writeOut("deleteme");    
                
                const globalContents = FS.readFileSync(scriptPath, "utf-8");
                assert.strictEqual(globalContents, "did not overwrite");  
            });                    
        });
    });
});
