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
  read() {
    throw new NotImplementedError();
  }
}

export class FileReader extends Reader {
  constructor(fs) {
    super();
    this.fs = fs;
  }

  read(filePath) {
    try {
      return this.fs.readFileSync(filePath);
    } catch (_) {
      throw new FileReadError(filePath);
    }
  }
}

export class DirReader extends Reader {
  constructor(fs) {
    super();
    this.fs = fs;
  }

  read(dirPath) {
    try {
      return this.fs
        .readdirSync(dirPath)
        .map((fileName) => path.join(dirPath, fileName));
    } catch (_) {
      throw new FileReadError(dirPath);
    }
  }
}

export class RepoReader extends Reader {
  constructor(fs) {
    super();
    this.fileReader = new FileReader(fs);
    this.dirReader = new DirReader(fs);
  }

  read(dirPath) {
    const posts = this.dirReader
      .read(dirPath)
      .filter((filePath) => path.extname(filePath) == ".md")
      .map((filePath) => this.fileReader.read(filePath))
      .map((fileContent) => md.parse(fileContent));
    return new Repo(posts);
  }
}
