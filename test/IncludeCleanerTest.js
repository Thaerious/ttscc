import IncludeCleaner from "../src/IncludeCleaner.js";
import assert from 'assert';

const script1 = `---> this is the start of an include
this is in the include
---< this is the end of the include
this is the actual script`;

const script2 = `---> this is the start of an include
this is in the include
---> nested start
nested
---< nested end
---< this is the end of the include
this is the actual script`;

const script3 = `before
---> this is the start of an include
this is in the include
---< this is the end of the include
after`;

const script4 = `---< this is a comment not an include
after`;

const script5 = `---- #include "ima-include.tua"`;

const script6 = `---> this is the start of an include
this is in the include
---< this is the end of the include
---- #include "ima-include.tua"
after`;

describe("Include Cleaner Test - src/IncludeCleaner.js", ()=> {
      describe("#processString()", ()=> {
            it("removes a single include script at the beginning", ()=>{
                  const clean = new IncludeCleaner().clean(script1);
                  assert.strictEqual(clean, "this is the actual script");
            });
            it("removes nested includes", ()=>{
                  const clean = new IncludeCleaner().clean(script2);
                  assert.strictEqual(clean, "this is the actual script");
            });
            it("include can be within the script", ()=>{
                  const clean = new IncludeCleaner().clean(script3);
                  assert.strictEqual(clean, "before\nafter");
            }); 
            it("unopened includes aren't removed", ()=>{
                  const clean = new IncludeCleaner().clean(script4);
                  assert.strictEqual(clean, "---< this is a comment not an include\nafter");
            });
            it("include statement have the comment part removed", ()=>{
                  const clean = new IncludeCleaner().clean(script5);
                  assert.strictEqual(clean, '#include "ima-include.tua"');
            });                               
      });
});