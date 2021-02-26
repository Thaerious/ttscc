import Readline from 'readline';
import Uploader from "./Uploader.js"
import {TTSListener, get, MessageParser} from "./TTSListener.js";
import FileListener from './FileListener.js';
import IncludeScanner from './IncludeScanner.js';
import ErrorFinder from './ErrorFinder.js';
import IncludeCleaner from './IncludeCleaner.js';
import FS from "fs";
import Extractor from './Extractor.js';

/**
 * Command Line Interface
 * 'CLI.start' is the main entry point for the program as called from 'watch-tts.js'.
 */
class CLI{
    constructor(){
        this.uploader = new Uploader();
        this.includeScanner = new IncludeScanner();
        this.fileListener = new FileListener(this.includeScanner, (guids)=>this.uploader.upload(guids));
        this.ttsListener = new TTSListener(this.fileListener);
    }

    start(){
        this.ttsListener.listen();
        const RL = Readline.createInterface(process.stdin, process.stdout);
        RL.setPrompt('WTTS> ');
        RL.prompt();

        RL.on('line', line => {
            try {
                this.command(line);
            }catch(err){
                console.log("CLI error");
                console.log(err);
                this.uploader.close();
                this.ttsListener.close();
                process.exit(1);
            }
            RL.prompt();
        });

        RL.on('close', function() {
            if (this.uploader) this.uploader.close();
            if (this.ttsListener) this.ttsListener.close();
            process.exit(0);
        });
    }

    async command(line){
        let split = line.split(/[ ]+/);

        switch (split[0].trim()){
            case "get":
                get();
                break;
            case "put":
                this.uploader.upload();
                break;
            case "inc":
            case "includes":
                if (split.length == 1){
                    console.log(this.includeScanner.getMap());
                } else {
                    console.log(this.includeScanner.getMap()[split[1]]);
                }
                break;
            case "resume":
                this.fileListener.resume();
                break;            
            case "find":
                // used to test error fuctionality
                let ef = new ErrorFinder();
                let r = await ef.seek(split[1], split[2]);
                console.log(r);
                break;
            case "extract":
                // load scripts from the save file
                new Extractor().extract();
                break;
            case "inject":
                // save scripts to the save file
                break;
            case "exit":
            case "x":
                if (this.uploader) this.uploader.close();
                if (this.ttsListener) this.ttsListener.close();
                process.exit(0);
                break;
        }
    }
}

export default CLI;