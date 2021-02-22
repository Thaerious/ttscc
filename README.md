# tts_watcher
A command line interface for managing 'Tabletop Simulator' script files in an IDE independent manner.

TTS Watchers is written in Node, which is a JavaScript runtime.  Node, and it's subsequent package manager
'npm', can be downloaded from it's website here: https://nodejs.org/en/download/.

To install TTS Watcher from the npm repsitory, open up your terminal (bash or powershell) and type the following:
    npm i -g tts-watcher

You can also install directly from github with the following:
    npm i -g git+ssh://git@github.com/Thaerious/tts_watcher.git

To uninstall type:
    npm uninstall -g tts_watcher

To run TTS Watcher, to to your desired project directory and type:
   watch-tts

This will bring up the command line interface (CLI) and start listening for messages from 'Tabletop Simulator'.
