export default function cleanIf(root, dir){
      const path = Path.join(root, dir);
      if (FS.existsSync(path)){
          console.log("removing directory: " + path);
          FS.rmSync(path, { recursive: true });
      }
  }