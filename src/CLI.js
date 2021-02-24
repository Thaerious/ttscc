import Readline from 'readline';
import Uploader from "./Uploader.js"
import {TTSListener, get, MessageParser} from "./TTSListener.js";
import FileListener from './FileListener.js';
import IncludeScanner from './IncludeScanner.js';

/**
 * Command Line Interface
 * 'CLI.start' is the main entry point for the program as called from 'watch-tts.js'.
 */
class CLI{
    constructor(){
        this.uploader = new Uploader();
        this.includeScanner = new IncludeScanner();
        this.fileListener = new FileListener(this.includeScanner, (guids)=>this.uploader.upload(guids));

        // this.fileListener = new FileListener(this.includeScanner, (guids)=>{
        //     console.log("List of scripts needing updates");
        //     console.log(guids);
        // });

        this.ttsListener = new TTSListener(this.fileListener);
    }

    start(){
        this.ttsListener.listen();
        const RL = Readline.createInterface(process.stdin, process.stdout);
        RL.setPrompt('TTSL> ');
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

    command(line){
        let split = line.split(/[ ]+/);

        switch (split[0].trim()){
            case "get":
                get();
                break;
            break;
            case "put":
                this.uploader.upload();
                break;
            break;
            case "inc":
            case "includes":
                console.log(this.includeScanner.getMap());
                break;
            case "resume":
                this.fileListener.resume();
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