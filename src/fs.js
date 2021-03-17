import fs from "fs";
import path from "path";

export class File {
  constructor(name, contents) {
    this.name = name;
    this.contents = contents;
  }

  write(rootPath) {
    const filePath = path.join(rootPath, this.name);
    try {
      fs.writeFileSync(filePath, this.contents);
    } catch (_) {
      console.error(`Could not write to ${filePath}`)
    }
  }

  static read(filePath) {
    try {
      const contents = fs.readFileSync(filePath).toString()
      const name = path.parse(filePath).base
      return new File(name, contents)
    } catch (_) {
      console.error(`Could not read ${filePath}`)
    }
  }
}

export class Dir {
  constructor(name, contents) {
    this.name = name;
    this.contents = contents;
  }

  write(rootPath) {
    const dirPath = path.join(rootPath, this.name);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }
    this.contents.forEach((file) => file.write(dirPath));
  }

  static read(dirPath) {
    const toAbsPath = (fileName) => path.join(dirPath, fileName)

    function isFileOrDir(filePath) {
      const stats = fs.lstatSync(filePath)
      return stats.isFile() || stats.isDirectory()
    }

    function toFileOrDir(filePath) {
      const stats = fs.lstatSync(filePath)
      if(stats.isFile()) {
        return File.read(filePath)
      }
      return Dir.read(filePath)
    }
    try {
      return fs
        .readdirSync(dirPath)
        .map(toAbsPath)
        .filter(isFileOrDir)
        .map(toFileOrDir)
    } catch (_) {
      console.error(`Could not read ${dirPath}`)
    }
  }
}
