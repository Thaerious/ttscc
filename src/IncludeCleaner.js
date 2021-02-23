import ReadLine from 'readline';
import OS from 'os';
import { Readable } from 'stream';

/**
 * Replaces included text with the #include directive.

 */
class IncludeCleaner {
    constructor() {
        this.lastInclude = null;
    }

    /**
     * Any text that had previously been inserted by the Uploader.fillElementScript
     * method will be removed and replaced with a #include directive.
     * @param {*} string 
     */
    async processString(string){
        let rstring = "";
        await this.readString(string, line => rstring = rstring + line + OS.EOL);
        return rstring;
    }

    /**
     * Workhorse method for 'processString()', is kept seperate for testing.
     * Takes in document text and processes it line by line.
     * Will call the 'cb' function on each line to be written out.
     * @param {*} string the document text
     * @param {*} cb cb(string) is called when a line should be written out.
     */
    async readString(string, cb) {
        cb = cb ?? function(){};

        let rl = ReadLine.createInterface({
            input: Readable.from(string),
            crlfDelay: Infinity
        });

        for await (const line of rl) {
            let processedLine = this.processLine(line);
            if (processedLine !== undefined) cb(processedLine);
        }
    }

    /**
     * Updates the classes state based on a line of text.
     * If the line is an include start comment, find all text
     * until the matching include end comment and replace it with
     * an #include directive.
     * 
     * This method returs the line that should be written out as a
     * replacement ot the line passed in.  If undefined is returnded,
     * no line should be written.
     * @param {String} line 
     */
    processLine(line){
        if (line.match(/^---[>-] ?#include [a-zA-Z0-9./]+[ \t]*/)) {
            let filename = line.substring(line.indexOf("#") + 8).trim();
            if (this.lastInclude === null) {
                this.lastInclude = filename;
                return `#include ${filename}`;
            }
        }
        else if (line.match(/^---[<-] ?#include [a-zA-Z0-9./]+[ \t]*/)) {
            let filename = line.substring(line.indexOf("#") + 8).trim();
            if (filename === this.lastInclude){
                this.lastInclude = null;
            } 
            return undefined;
        }
        else if (this.lastInclude === null) {
            return(line);
        }
        return undefined;
    }
}

export default IncludeCleaner;