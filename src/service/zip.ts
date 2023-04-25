import { readFile } from "fs/promises";
import JSZip from "jszip";
import { Octokit as OctokitType } from "octokit";
import * as fs from "fs/promises";
const AdmZip = require('adm-zip');
import { Buffer } from 'buffer';
import * as path from "path";
const Octokit = OctokitType as any;
import { getGitRepoDetails } from "./misc";
import { logger } from "../logging";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

// Convert the zip file pulled from github to base64 string
async function zipToBase64(filePath: string): Promise<string> {
  const zipFile = await readFile(filePath);
  const zip = await JSZip.loadAsync(zipFile);
  const zipContent = await zip.generateAsync({ type: "base64" });
  return zipContent;
}

async function getPackageZip(owner: string, repo: string) {
  let result = await octokit.request(`GET /repos/${owner}/${repo}/zipball`, {
    owner: owner,
    repo: repo,
    headers: {
      Accept: "application/vnd.github+json",
    },
  });

  await fs.writeFile(
    path.join(__dirname, "..", "artifacts", `${repo}.zip`),
    new Array(result.data)
  );
}

export async function getContentFromUrl(url: string): Promise<string | null> {
  // Get content from url
  // :param url: string url
  // :return: Promise of string content

  logger.info("getContentFromUrl: Getting content from url: " + url);

  const details = await getGitRepoDetails(url);
  if (!details || !details.username || !details.repoName) {
    logger.debug("Could not get git repo details from url: " + url);
    return null;
  }

  await getPackageZip(details.username, details.repoName);

  let zipFilePath: string = path.join(
    __dirname,
    "..",
    "artifacts",
    `${details.repoName}.zip`
  );
  let txtFilePath: string = path.join(
    __dirname,
    "..",
    "artifacts",
    `${details.repoName}.txt`
  );

  let content = await zipToBase64(zipFilePath);
  fs.writeFile(txtFilePath, content);
  fs.rm(zipFilePath);

  return content;
}

async function unzipContent(content: string) {

  const buffer = Buffer.from(content, 'base64');
  const zip = new AdmZip(buffer);
  let basePath = path.join(__dirname, "..", "artifacts", "unzipped");
  // let zipEntries = zip.getEntries();
  
  // This folder contains all of the things
  // let folder = zipEntries[0].entryName;
  
  // zipEntries.forEach((zipEntry) => {
  //   console.log(zipEntry.entryName);
  // });
  
  // let certain_file = zip.readAsText(zipEntries[1].entryName);
  // console.log(certain_file)
  
  await zip.extractAllTo(basePath, true);

  return basePath;
}

export async function getPackageJSON(content: string): Promise<Object> {
  logger.info("getPackageJSON: Getting url from content base64 string");

  let basePath = await unzipContent(content);

  logger.info("getPackageJSON: Read base64 string into zip file");

  let package_json_path: string = path.join(basePath, "package.json");
  let package_json_contents: string = await fs.readFile(package_json_path, "utf8");

  let package_json_object: Object;
  if (package_json_contents) {
    package_json_object = JSON.parse(package_json_contents);
    if (package_json_object) {
      logger.info("getPackageJSON: Found package.json");
      fs.rm(basePath, { recursive: true });
      return package_json_object;
    }
    logger.debug("getPackageJSON: Unable to parse package.json");
  }

  logger.debug("getPackageJSON: No package.json found");
  return {};
}

// async function main() {
//   getPackageJSON(await fs.readFile(path.join(__dirname, "..", "..", "lodash_base64"), "utf8"));
// }

// main();