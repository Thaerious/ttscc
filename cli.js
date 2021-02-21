import RL from 'readline';

class CLI{
    constructor(){
        const rl = readline.createInterface(process.stdin, process.stdout);
        rl.setPrompt('SERVER> ');
        rl.prompt();

        rl.on('line', function(line) {
            try {
                this.command(line);
            }catch(err){
                console.log("CLI error");
                console.log(err);
            }
            rl.prompt();
        }.bind(this));

        rl.on('close', function() {
            process.exit(0);
        });

        this.start();
    }   

    start(){}

    command(line){}
}

export default CLI;