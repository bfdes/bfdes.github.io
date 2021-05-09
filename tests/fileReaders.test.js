import path from "path";
import {
  DirReader,
  FileReader,
  FileReadError,
  RepoReader,
} from "src/fileReaders";
import { MissingMetadataError } from "src/md";
import Repo from "src/repo";

describe("FileReader", () => {
  it("resolves files by path", () => {
    const fileContents = `console.log("Hello, World!")`;
    const stubFs = {
      readFileSync(filePath) {
        if (filePath === "helloWorld.js") {
          return fileContents;
        }
        throw new Error();
      },
    };
    const fileReader = new FileReader(stubFs);

    expect(fileReader.read("helloWorld.js")).toBe(fileContents);
  });

  it("fails when file is missing", () => {
    const stubFs = {
      readFileSync() {
        throw new Error();
      },
    };
    const moduleReader = new FileReader(stubFs);

    expect(() => moduleReader.read("helloWorld.js")).toThrow(FileReadError);
  });
});

describe("DirReader", () => {
  it("resolves directories by path", () => {
    const fileNames = ["my-first-post.md", "my-second-post.md"];
    const stubFs = {
      readdirSync(dirPath) {
        if (dirPath == "posts") {
          return fileNames;
        }
        throw new Error();
      },
    };
    const dirReader = new DirReader(stubFs);
    const filePaths = fileNames.map((name) => path.join("posts", name));

    expect(new Set(dirReader.read("posts"))).toEqual(new Set(filePaths));
  });

  it("fails when directory is missing", () => {
    const stubFs = {
      readdirSync() {
        throw new Error();
      },
    };
    const dirReader = new DirReader(stubFs);

    expect(() => dirReader.read("posts")).toThrow(FileReadError);
  });
});

describe("RepoReader", () => {
  it("resolves posts", () => {
    const stubFs = {
      readFileSync(filePath) {
        if (filePath == path.join("posts", "my-first-post.md")) {
          return [
            "---",
            "title: My first post",
            "tags: [Python, API]",
            "created: 2018-07-22",
            "summary: Lorem ipsum delorum sit amet",
            "---",
            "# My first post",
            "Lorem ipsum delorum sit amet",
          ].join("\n");
        }
        if (filePath == path.join("posts", "my-second-post.md")) {
          return [
            "---",
            "title: My second post",
            "tags: [Python, Testing]",
            "created: 2018-07-22",
            "summary: Lorem ipsum delorum sit amet",
            "---",
            "# My second post",
            "Lorem ipsum delorum sit amet",
          ].join("\n");
        }
        throw new Error();
      },
      readdirSync(dirPath) {
        if (dirPath == "posts") {
          return ["my-first-post.md", "my-second-post.md"];
        }
        throw new Error();
      },
    };
    const repoReader = new RepoReader(stubFs);
    const repo = repoReader.read("posts");

    expect(repo).toBeInstanceOf(Repo);
    expect(repo.posts).toHaveLength(2);
    expect(repo.tags).toEqual(new Set(["Python", "API", "Testing"]));
  });

  it("only reads markdown files", () => {
    const stubFs = {
      readFileSync() {
        throw new Error();
      },
      readdirSync(dirPath) {
        if (dirPath == "posts") {
          return ["my-first-post.txt"];
        }
        throw new Error();
      },
    };
    const repoReader = new RepoReader(stubFs);
    const repo = repoReader.read("posts");

    expect(repo).toBeInstanceOf(Repo);
    expect(repo.posts).toHaveLength(0);
  });

  it("fails when posts are missing", () => {
    const stubFs = {
      readdirSync() {
        throw new Error();
      },
    };
    const repoReader = new RepoReader(stubFs);

    expect(() => repoReader.read("posts")).toThrow(FileReadError);
  });

  it("fails when a post cannot be parsed", () => {
    const stubFs = {
      readFileSync(filePath) {
        if (filePath == path.join("posts", "my-first-post.md")) {
          return [
            "---",
            "---",
            "# My first post",
            "Lorem ipsum delorum sit amet",
          ].join("\n");
        }
        throw new Error();
      },
      readdirSync(dirPath) {
        if (dirPath == "posts") {
          return ["my-first-post.md"];
        }
        throw new Error();
      },
    };
    const repoReader = new RepoReader(stubFs);

    expect(() => repoReader.read("posts")).toThrow(MissingMetadataError);
  });
});
