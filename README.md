# tts_watcher
A command line interface for managing 'Tabletop Simulator' script files in an IDE independent manner.

TTS Watchers is written in Node, which is a JavaScript runtime.  Node, and it's subsequent package manager
'npm', can be downloaded from it's website here: https://nodejs.org/en/download/.

The philosophy behind 'watch-tts' is to permit code reuse and seperation by having a include directory where you can easily git your source files.  This is IDE independent in that only the filesystem is manipulated.  You can then easily open and edit the files in your preferred editor.

To install TTS Watcher from the npm repsitory, open up your terminal (bash or powershell) and type the following:
    npm i -g tts-watcher

You can also install directly from github with the following:
    npm i -g git+ssh://git@github.com/Thaerious/tts_watcher.git

To uninstall type:
    npm uninstall -g tts-watcher

To run TTS Watcher, to to your desired project directory and type:
   watch-tts

This will bring up the command line interface (CLI) and start listening for messages from 'Tabletop Simulator'.
The CLI will create 3 subdirectories (tts-data, tts-scripts, tts-ui) to store information between updates.  These will get overwritten everytime you load a new game.  So do not rely on these directories for long term storage.

All the TTS scripts will download into the tts-scripts subdirectory, you can edit these and save them in place.  When you do, they will be sent to the "Tabletop Simulator" program, where they will be saved in your game file.  The same is true for TTS ui files in the tts-ui subdirectory.

You can use the "#include filename" directive to insert external script files into your TTS scripts.  It will insert code verbatim at the location of the #include statement.  Mulitple includes of the same name will be ignored.  Your inlclude files need to be located in a /include subdirectory where you ran the watch-tts program. They can have either the .lua or .ttslua extension.  When including the file in code, do not include the extension, only the root path and filename. 

Example: #include foo
File: include/foo.lua

Example: #include bar/foo
File: include/bar/foo.lua

You can open & edit all files in the tts-scripts and tts-ui directories, but make sure they are uploaded to the TTS program or they may be overwritten.  The watch-tts program will not overwrite any files in the /include directory.  It is advisable to have the only line in your global.lua file be "#include main" and have a "main.lua" file in your include directory.

Using
=====
Start watch-tts in your desired directory in the terminal (powershell).
Load a game in TTS, a "Game Loaded" message will display in your terminal.
Any changes to object scripts in /tts-scripts or include scripts in /include will trigger an update (*1).
Exit the program by typing 'x' or 'exit' on the command line.
You can view all tracked files by typing the 'inc' or 'include' command.
The 'put' command will cause TTS to save and play.
The 'get' command will request download of all object scripts, use when you start watch-tts after TTS is already running (or just reload the game).

(*1) only include scripts which can be traced to a object script will trigger an update.
