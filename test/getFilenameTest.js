import getFilename from "../src/include/getFilename.js";
import assert from "assert";

describe("Get File Name - src/include/getFilename.js", function () {
      it("empty string throws error", function () {
            assert.throws(()=>getFilename(""), {name : 'SyntaxError'});
      });

      it("if the object has no GUID root filename (see constants.js),", function () {
            assert.strictEqual("global.tua", getFilename({}));
      });

      it("if the object has a GUID but no nickname return only the [GUID].tua as filename,", function () {
            const obj = {GUID : "aabb01e"};
            assert.strictEqual("aabb01e.tua", getFilename(obj));
      });
      
      it("if the object has a GUID and a nickname prepend the nickname as a path (with underscores in place of spaces),", function () {
            const obj = {
                  GUID : "aabb01e",
                  Nickname : "yellow cube"
            };

            assert.strictEqual("yellow_cube/aabb01e.tua", getFilename(obj));
      });      
});
