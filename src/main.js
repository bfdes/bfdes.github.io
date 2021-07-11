import fs from "fs/promises";
import path from "path";
import { RepoReader } from "./fileReaders";
import FileWriter from "./fileWriter";
import Router from "./Router";

const repoReader = new RepoReader(fs);
const fileWriter = new FileWriter(fs);

const markupPath = path.join(__dirname, "posts");

async function main() {
  const repo = await repoReader.read(markupPath);
  const fileOrDir = Router(repo);
  await fileWriter.write(".", fileOrDir);
}

main();
