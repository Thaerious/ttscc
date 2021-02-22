import ReadLine from 'readline';
import FS from 'fs';
import OS from 'os';
import { Readable } from 'stream';

/**
 * Replace included text with the #include header
 */
class IncludeCleaner {
    constructor() {
        this.lastInclude = null;
    }

    async processString(string){
        let rstring = "";
        await this.readString(string, line => rstring = rstring + line + OS.EOL);
        return rstring;
    }

    async readString(string, cb) {
        cb = cb ?? this.online;

        let rl = ReadLine.createInterface({
            input: Readable.from(string),
            crlfDelay: Infinity
        });

        for await (const line of rl) {
            let processedLine = this.processLine(line);
            if (processedLine !== undefined) cb(processedLine);
        }
    }

    processLine(line){
        if (line.match(/^---[>-] ?#include [a-zA-Z0-9./]+[ \t]*/)) {
            let filename = line.substring(line.indexOf("#")).trim();
            if (this.lastInclude === null) {
                this.lastInclude = filename;
                return `${filename}`;
            }
        }
        else if (line.match(/^---[<-] ?#include [a-zA-Z0-9./]+[ \t]*/)) {
            let filename = line.substring(14).trim();
            if (filename === this.lastInclude) this.lastInclude = null;
        }
        else if (this.lastInclude === null) {
            return(line);
        }
    }
}

export default IncludeCleaner;