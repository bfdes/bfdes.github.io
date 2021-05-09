export class FileSystem {
  constructor(name, content) {
    this.name = name;
    this.content = content;
  }
}

export class File extends FileSystem {}

export class Dir extends FileSystem {}

export function mk(name, content) {
  if (Array.isArray(content)) {
    return new Dir(name, content);
  }
  return new File(name, content);
}
