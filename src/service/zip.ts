import JSZip, { files } from "jszip";
import { Octokit as OctokitType } from "octokit";
import * as fs from "fs/promises";
import * as fsSync from "fs";
const AdmZip = require("adm-zip");
import { Buffer } from "buffer";
import * as path from "path";
const Octokit = OctokitType as any;
import { getGitRepoDetails } from "./misc";
import { logger } from "../logging";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

// Convert the zip file pulled from github to base64 string
async function zipToBase64(filePath: string): Promise<string> {
  logger.info("zipToBase64: Converting zip file to base64 string");
  const zipFile = await fs.readFile(filePath);
  const zip = await JSZip.loadAsync(zipFile);
  const zipContent = await zip.generateAsync({ type: "base64" });

  return zipContent;
}

async function getPackageZip(owner: string, repo: string) {
  logger.info(
    "Downloading package zip from github with owner: " +
      owner +
      " and repo: " +
      repo
  );

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

  logger.info(
    "Package zip downloaded successfully, wrote to: " +
      path.join(__dirname, "..", "artifacts", `${repo}.zip`)
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

  logger.info("getContentFromUrl: Getting package zip from github");
  await getPackageZip(details.username, details.repoName);

  let zipFilePath: string = path.join(
    __dirname,
    "..",
    "artifacts",
    `${details.repoName}.zip`
  );

  logger.info("getContentFromUrl: Converting zip file to base64 string");
  let content = await zipToBase64(zipFilePath);

  fs.rm(zipFilePath);

  return content;
}

export async function unzipContent(content: string) {
  logger.info("unzipContent: Unzipping content");

  try {
    const buffer = Buffer.from(content, "base64");
    const zip = new AdmZip(buffer);
    let basePath = path.join(__dirname, "..", "artifacts", "unzipped");

    // Keeping this just as an example
    // let zipEntries = zip.getEntries();
    // This folder contains all of the things
    // let folder = zipEntries[0].entryName;
    // zipEntries.forEach((zipEntry) => {
    //   console.log(zipEntry.entryName);
    // });
    // let certain_file = zip.readAsText(zipEntries[1].entryName);
    // console.log(certain_file)

    await zip.extractAllTo(basePath, true);

    let files = zip.getEntries();
    let folder = files[0].entryName;
    let parentDir = "";
    if (folder.includes("/")) {
      folder = folder.split("/")[0];
      parentDir = folder;
      files.forEach((file) => {
        if (!file.entryName.startsWith(folder)) {
          parentDir = "";
        }
      });
    }

    logger.info("Base path to repo: " + path.join(basePath, parentDir));

    return path.join(basePath, parentDir);
  } catch (err) {
    logger.error("unzipContent: Error unzipping content");
    logger.error(err);
    return "";
  }
}

export async function getInfoFromContent(
  content: string
): Promise<{ package_json: Object; readme: string }> {
  logger.info("getInfoFromContent: Getting package_json and readme");

  let basePath = await unzipContent(content);
  if (!basePath) {
    logger.debug("getInfoFromContent: Could not get base path");
    return { package_json: {}, readme: "" };
  }

  let package_json = await getPackageJSON(basePath);
  let readme = await getReadme(basePath);

  fs.rm(basePath, { recursive: true });

  return { package_json, readme };
}

export async function getReadme(basePath: string): Promise<string> {
  logger.info(
    "getReadme: Getting readme from content base64 string, basePath: " +
      basePath
  );

  // Search for string case insensitive
  let readme_regex: RegExp = /readme\..+/i;
  let readme_name: string = "";

  let files = await fs.readdir(basePath);
  await Promise.all(
    files.map((file) => {
      if (readme_regex.test(file)) {
        readme_name = file;
      }
    })
  );

  if (!readme_name) {
    logger.debug("getReadme: No readme found");
    return "";
  }

  let readme_path: string = path.join(basePath, readme_name);
  let readme_data: string = await fs.readFile(readme_path, "utf8");

  logger.info("getReadme: Found readme");

  return readme_data.substring(0, 250);
}

export async function getPackageJSON(basePath: string): Promise<Object> {
  // This function assumes the folder is unzipped

  logger.info("getPackageJSON: Getting url from content base64 string");

  try {
    let package_json_path: string = path.join(basePath, "package.json");
    let package_json_contents: string = await fs.readFile(
      package_json_path,
      "utf8"
    );

    let package_json_object = await getPackageJSONObject(package_json_contents);

    return package_json_object;
  } catch (err) {
    logger.debug("getPackageJSON: Could not get package.json");
    return {};
  }
}

async function getPackageJSONObject(package_json_contents: string) {
  logger.info("getPackageJSONObject: Getting package.json object");

  let package_json_object: Object;
  if (package_json_contents) {
    package_json_object = JSON.parse(package_json_contents);
    if (package_json_object) {
      logger.info("getPackageJSONObject: Found package.json");
      return package_json_object;
    }
    logger.debug("getPackageJSONObject: Unable to parse package.json");
  }

  logger.debug("getPackageJSONObject: No package.json found");
  return {};
}

export async function deleteUnzippedFolder(basePath: string) {
  logger.info("deleteUnzippedFolder: Deleting unzipped folder");

  // Delete the unzipped folder
  if (fsSync.existsSync(basePath)) {
    try {
      fs.rm(basePath, { recursive: true });
    } catch (err) {
      logger.debug("deleteUnzippedFolder: Error deleting unzipped folder");
    }
  }

  logger.info("deleteUnzippedFolder: Deleted unzipped folder");
}

export async function deleteBase64File(base64FilePath: string) {
  logger.info("deleteBase64File: Deleting base64 file");

  // Delete the base64 file
  if (fsSync.existsSync(base64FilePath)) {
    try {
      fs.rm(base64FilePath);
    } catch (err) {
      logger.debug("deleteBase64File: Error deleting base64 file");
    }
  }

  logger.info("deleteBase64File: Deleted base64 file");
}
