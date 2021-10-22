import ReadLine from 'readline';
import OS from 'os';
import { Readable } from 'stream';
import { timingSafeEqual } from 'crypto';

/**
 * Removes included text.  Any text between '--->' and '---<' gets removed.
 * Uncomments include directives ('---- #include' becomes '#inlclude').
 */
class IncludeCleaner {
    clean(string){
        this.includeDepth = 0;
        this.linesOut = [];
        const split = string.split(/\r?\n/);
        for (const line of split) this.processLine(line);
        return this.linesOut.join("\n");
    }

    writeLine(line){
        this.linesOut.push(line);
    }

    processLine(line){        
        if (line.match(/^--->/)) {
            this.includeDepth++;
        }
        else if (line.match(/^---</)) {
            this.includeDepth > 0 ? this.includeDepth-- : this.writeLine(line);
        }
        else if (line.match(/^---- ?#include/)) {
            if (this.includeDepth <= 0) this.writeLine(line.slice(5));
        }
        else if (this.includeDepth <= 0) {
            this.writeLine(line);
        } 
        else {
            // inside include, do nothing
        }
    }
}

export default IncludeCleaner;