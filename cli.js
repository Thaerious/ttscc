import Readline from 'readline';
import Uploader from "./uploader.js"
import {WatchTTS, get} from "./ttsl.js";

class CLI{
    constructor(){
        const RL = Readline.createInterface(process.stdin, process.stdout);
        RL.setPrompt('TTSL> ');
        RL.prompt();

        RL.on('line', function(line) {
            try {
                this.command(line);
            }catch(err){
                console.log("CLI error");
                console.log(err);
            }
            RL.prompt();
        }.bind(this));

        RL.on('close', function() {
            process.exit(0);
        });
    }   

    start(){
        let watchTTS = new WatchTTS().listen();
    }

    command(line){
        let split = line.split();

        switch (split[0]){
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