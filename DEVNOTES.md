main entry point: index.js calls new CLI.start()

- includes without dot-prefixes will look in the project include directory
- extracting includes without dot-prefixes will overwrite the include file
- includes with dot-prefixes will not be over written
- includes in the TTS save file will be as follows:
  ---> #include INCLUDEFILENAME ... stuff ... ---< #include INCLUDEFILENAME