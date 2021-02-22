import Readline from 'readline';
import Uploader from "./uploader.js"
import {WatchTTS, get, MessageParser} from "./ttsl.js";

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

        console.log(split[0].trim());

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

new CLI().start();

export default CLI;