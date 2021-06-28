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
  it("resolves files by path", async () => {
    const fileContents = `console.log("Hello, World!")`;
    const stubFs = {
      async readFile(filePath) {
        if (filePath === "helloWorld.js") {
          return fileContents;
        }
        throw new Error();
      },
    };
    const fileReader = new FileReader(stubFs);

    await expect(fileReader.read("helloWorld.js")).resolves.toBe(fileContents);
  });

  it("fails when file is missing", async () => {
    const stubFs = {
      async readFile() {
        throw new Error();
      },
    };
    const moduleReader = new FileReader(stubFs);

    await expect(moduleReader.read("helloWorld.js")).rejects.toThrow(
      FileReadError
    );
  });
});

describe("DirReader", () => {
  it("resolves directories by path", async () => {
    const fileNames = ["my-first-post.md", "my-second-post.md"];
    const stubFs = {
      async readdir(dirPath) {
        if (dirPath == "posts") {
          return fileNames;
        }
        throw new Error();
      },
    };
    const dirReader = new DirReader(stubFs);
    const filePaths = fileNames.map((name) => path.join("posts", name));

    await expect(dirReader.read("posts")).resolves.toEqual(filePaths);
  });

  it("fails when directory is missing", async () => {
    const stubFs = {
      async readdir() {
        throw new Error();
      },
    };
    const dirReader = new DirReader(stubFs);

    await expect(dirReader.read("posts")).rejects.toThrow(FileReadError);
  });
});

describe("RepoReader", () => {
  it("resolves posts", async () => {
    const stubFs = {
      async readFile(filePath) {
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
      async readdir(dirPath) {
        if (dirPath == "posts") {
          return ["my-first-post.md", "my-second-post.md"];
        }
        throw new Error();
      },
    };
    const repoReader = new RepoReader(stubFs);
    const repo = await repoReader.read("posts");

    expect(repo).toBeInstanceOf(Repo);
    expect(repo.posts).toHaveLength(2);
    expect(repo.tags).toEqual(new Set(["Python", "API", "Testing"]));
  });

  it("only reads markdown files", async () => {
    const stubFs = {
      async readFile() {
        throw new Error();
      },
      async readdir(dirPath) {
        if (dirPath == "posts") {
          return ["my-first-post.txt"];
        }
        throw new Error();
      },
    };
    const repoReader = new RepoReader(stubFs);
    const repo = await repoReader.read("posts");

    expect(repo).toBeInstanceOf(Repo);
    expect(repo.posts).toHaveLength(0);
  });

  it("fails when posts are missing", async () => {
    const stubFs = {
      async readdir() {
        throw new Error();
      },
    };
    const repoReader = new RepoReader(stubFs);

    await expect(repoReader.read("posts")).rejects.toThrow(FileReadError);
  });

  it("fails when a post cannot be parsed", async () => {
    const stubFs = {
      async readFile(filePath) {
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
      async readdir(dirPath) {
        if (dirPath == "posts") {
          return ["my-first-post.md"];
        }
        throw new Error();
      },
    };
    const repoReader = new RepoReader(stubFs);

    await expect(repoReader.read("posts")).rejects.toThrow(
      MissingMetadataError
    );
  });
});
