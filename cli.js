import Readline from 'readline';
import Uploader from "./uploader.js"
import {WatchTTS, get, MessageParser} from "./WatchTTS.js";

/**
 * Command Line Interface
 * 'CLI.start' is the main entry point for the program as called from 'watch-tts.js'.
 */
class CLI{
    start(){
        this.watchTTS = new WatchTTS().listen();
        const RL = Readline.createInterface(process.stdin, process.stdout);
        RL.setPrompt('TTSL> ');
        RL.prompt();

        RL.on('line', line => {
            try {
                this.command(line);
            }catch(err){
                console.log("CLI error");
                console.log(err);
            }
            RL.prompt();
        });

        RL.on('close', function() {
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
                let uploader = new Uploader();
                uploader.upload();
                break;
            break;
            case "exit":
            case "x":
                process.exit(0);
                break;
        }
    }
}

export default CLI;