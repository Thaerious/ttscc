import ReadLine from 'readline';
import OS from 'os';
import { Readable } from 'stream';
import { threadId } from 'worker_threads';

/**
 * Removes included text.  Any text between '--->' and '---<' gets removed.
 * Uncomments include directives ('---- #include').
 */
class IncludeCleaner {
    /**
     * 
     * @param {*} includes a map of include -> script
     */
    constructor() {
        this.includeDepth = 0;
    }

    /**
     * Any text that had previously been inserted by the Uploader.fillElementScript
     * method will be removed and replaced with a #include directive.
     * @param {String} string The cleaned incoming script text
     */
    async processString(string){
        let rstring = "";
        await this.readString(string, line => rstring = rstring + line + OS.EOL);
        return rstring;
    }

    /**
     * Workhorse method for 'processString()', kept seperate for testing.
     * Takes in document text and processes it line by line.
     * Will call the 'cb' function on each line to be written out.
     * @param {*} string the document text
     * @param {*} cb cb(string) is called when a line should be written out.
     */
    async readString(string, cb) {
        this.writeLine = cb ?? function(){};

        let rl = ReadLine.createInterface({
            input: Readable.from(string),
            crlfDelay: Infinity
        });

        for await (const line of rl) this.processLine(line);
    }

    includeStart(){
        this.includeDepth = this.includeDepth + 1;
    }

    includeLine(line){
        if (this.includeDepth == 0){
            console.log(line);
            this.writeLine(line);
        } 
        else console.log("SKIP")
    }

    includeEnd(){
        this.includeDepth = this.includeDepth - 1;
    }

    /**
     * @param {String} line 
     */
    processLine(line){        
        // Beginning of include
        if (line.match(/^--->/)) {
            this.includeStart();
        }
        // end of include
        else if (line.match(/^---</)) {
            this.includeEnd();
        }
        else if (line.match(/^---- ?#include/)) {
            if (this.includeDepth <= 0) this.writeLine(line.slice(5));
        }
        else if (this.includeDepth <= 0) {
            this.writeLine(line);
        } 
    }
}

export default IncludeCleaner;