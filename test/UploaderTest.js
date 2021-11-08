import assert from "assert";
import loadJSON from "../src/include/loadJSON.js";
import Path from "path";
import FS from "fs";
import Injector from "../src/Injector.js";
import Uploader from "../src/Uploader.js";

describe("Uploader Test", () => {
      describe("creates a message from an Injector", ()=>{
            it("#buildMessage returns a messgae object", ()=>{
                  const game = new Injector().inject("test/mock1/project");
                  const script = game["LuaScript"];
                  const uploader = new Uploader();
                  const message = uploader.buildMessage(game);
console.log(message);
                  assert.notStrictEqual(undefined, message);
            });
      });
});
