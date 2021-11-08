import assert from "assert";
import bfsObject from "../src/include/bfsObject.js";

describe("bfsObject() - test function", () => {
    it("retrieves parent", () => {
        const parent = { guid: "e6db0c" };

        const result = bfsObject(parent, "guid", "e6db0c");
        assert.strictEqual(parent, result);
    });

    it("retrieves depth = 1 child", () => {
        const parent = { guid: "abc123" };
        const expected = (parent.child = { guid: "e6db0c" });

        const result = bfsObject(parent, "guid", "e6db0c");
        assert.strictEqual(expected, result);
    });

    it("retrieves depth = 2 child", () => {
        const parent = { guid: "abc123" };
        const depth1 = (parent.child = { guid: "xyz789" });
        const expected = (depth1.child = { guid: "e6db0c" });

        const result = bfsObject(parent, "guid", "e6db0c");
        assert.strictEqual(expected, result);
    });

    it("retrieves root when child and root have same key:value", () => {
        const parent = { guid: "e6db0c" };
        const depth1 = (parent.child = { guid: "xyz789" });
        const depth2 = (depth1.child = { guid: "e6db0c" });

        const result = bfsObject(parent, "guid", "e6db0c");
        assert.strictEqual(parent, result);
    });

    it("returns undefined when key:value not found", () => {
      const parent = { guid: "abc123" };
      const depth1 = (parent.child = { guid: "xyz789" });
      const depth2 = (depth1.child = { guid: "bcd456" });

      const result = bfsObject(parent, "guid", "e6db0c");
      assert.strictEqual(undefined, result);
  });    
});
