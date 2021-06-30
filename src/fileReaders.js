import path from "path";
import * as md from "./md";
import Repo from "./repo";

class NotImplementedError extends Error {}

export class FileReadError extends Error {
  constructor(filePath, ...args) {
    const msg = `Could not read from ${filePath}`;
    super(msg, ...args);
  }
}

class Reader {
  constructor(fs) {
    this.fs = fs;
  }

  async read() {
    throw new NotImplementedError();
  }
}

export class FileReader extends Reader {
  async read(filePath) {
    try {
      const file = await this.fs.readFile(filePath);
      return file;
    } catch (_) {
      throw new FileReadError(filePath);
    }
  }
}

export class DirReader extends Reader {
  async read(dirPath) {
    try {
      const children = await this.fs.readdir(dirPath);
      return children.map((fileName) => path.join(dirPath, fileName));
    } catch (_) {
      throw new FileReadError(dirPath);
    }
  }
}

export class RepoReader extends Reader {
  constructor(fs) {
    super(fs);
    this.fileReader = new FileReader(fs);
    this.dirReader = new DirReader(fs);
  }

  async read(dirPath) {
    const children = await this.dirReader.read(dirPath);
    const promises = children
      .filter((filePath) => path.extname(filePath) == ".md")
      .map((filePath) => this.fileReader.read(filePath));
    const fileContents = await Promise.all(promises);
    const posts = fileContents.map(md.parse);
    return new Repo(posts);
  }
}
