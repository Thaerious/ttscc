import assert from "assert";
import loadJSON from "../src/include/loadJSON.js";
import Path from "path";
import FS from "fs";
import Injector from "../src/Injector.js";
import Uploader from "../src/Uploader.js";
import bfsObject from "../src/include/bfsObject.js";

describe("Uploader Test", () => {
      describe("creates a message from an Injector", ()=>{
            it("#buildMessage returns a message object", ()=>{
                  const game = new Injector().inject("test/mock1/project");
                  const script = game["LuaScript"];
                  const uploader = new Uploader();
                  const message = uploader.buildMessage(game);

                  assert.strictEqual(1, message["messageID"]);
            });

            it("mesage object has scriptStates parameter", ()=>{
                  const game = new Injector().inject("test/mock1/project");
                  const script = game["LuaScript"];
                  const uploader = new Uploader();
                  const message = uploader.buildMessage(game);

                  assert.notStrictEqual(undefined, message["scriptStates"]);
            });
            
            it("mesage has fields for each object", ()=>{
                  const game = new Injector().inject("test/mock1/project");
                  const script = game["LuaScript"];
                  const uploader = new Uploader();
                  const message = uploader.buildMessage(game);

                  assert.notStrictEqual(undefined, bfsObject(message["scriptStates"], "guid", "e6db0c"));
                  assert.notStrictEqual(undefined, bfsObject(message["scriptStates"], "guid", "f6dac0"));
                  assert.strictEqual(undefined, bfsObject(message["scriptStates"], "guid", "f5d270")); // inside a deck, not included
                  assert.strictEqual(undefined, bfsObject(message["scriptStates"], "guid", "f8d280")); // inside a deck, not included
            });                
      });
});
