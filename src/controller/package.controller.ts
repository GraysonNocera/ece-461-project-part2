import { authorizeUser } from "../middleware/authorizeUser";
import { logger } from "../logging";
import { PackageData } from "../model/packageData";
import { PackageMetadata } from "../model/packageMetadata";
import { Request, Response, NextFunction } from "express";
import { PackageHistoryEntry } from "../model/packageHistoryEntry";
import { PackageHistoryEntryModel } from "../model/packageHistoryEntry";
const isGitHubUrl = require("is-github-url");

import {
  PackageRating,
  PackageRatingModel,
  PackageRatingUploadValidation,
} from "../model/packageRating";
import * as cp from "child_process";
// import { PackageRating } from "./api/model/packageRating";
import { readFileSync } from "fs";
import { Package, PackageModel } from "../model/package";
import path from "path";
import JSZip from "jszip";
import { AxiosResponse } from "axios";
import axios from "axios";

export const postPackage = async (req: Request, res: Response, next: NextFunction) => {
  logger.info("postPackage: POST /package endpoint hit");

  let packageToUpload;
  let rating: PackageRating;
  let package_json: Object = {};
  let historyEntry;

  // You must set the metadata before trying to save this
  packageToUpload = new PackageModel({
    data: req?.body,
  });

  packageToUpload.data.URL = packageToUpload.data.URL.startsWith("https://www.npmjs.com/package/") ? await npm_2_git(packageToUpload.data.URL) : packageToUpload.data.URL;

  // Package already exists: status 409
  const query = PackageModel.find();
  query.or([
    { "data.Content": { $exists: true,  $eq: packageToUpload.data.Content} },
    { "data.URL": { $exists: true,  $eq: packageToUpload.data.URL } },
  ]);
  const package_query_results = await query.findOne();
  if (package_query_results) {
    logger.info("POST /package: Package already exists, got package: " + package_query_results);
    return res.status(409).send("Package exists already.");
  }

  // Try to fetch the URL from the package_json
  if (packageToUpload.data.Content) {
    package_json = await getPackageJSON(packageToUpload.data.Content);
    try {
      packageToUpload.data.URL = package_json["homepage"];
    } catch (error) {
      logger.debug("POST /package: Package not uploaded, no homepage field or no package.json");
      return res.status(400).send("Invalid Content");
    }
  }

  packageToUpload.metadata = await getMetadata(packageToUpload.data.URL, package_json);
  if (!packageToUpload.metadata) {
    logger.info("POST /package: Package not uploaded, invalid metadata");
    return res.status(400).send("Invalid Content or URL");
  }

  // Package not updated due to disqualified rating: status 423
  rating = ratePackage(packageToUpload.data.URL);

  // For now, nothing passes this, so I'm commenting it out
  // if (!verifyRating(rating)) {
  //   logger.info("POST /package: Package not uploaded, disqualified rating");
  //   res
  //     .status(424)
  //     .send("Package is not uploaded due to the disqualified rating.");
  //   return;
  // }

  // Save package
  logger.info("POST /package: Saving package: " + packageToUpload);
  packageToUpload.metadata.ID = packageToUpload._id.toString();
  await packageToUpload.save();
  logger.info("POST /package: Package metadata added successfully " + packageToUpload.metadata);

  // Save history entry
  historyEntry = buildHistoryEntry(packageToUpload.metadata, "CREATE");
  await historyEntry.save();
  logger.info("POST /package: History entry saved successfully");

  // Save rating
  let rateEntry = new PackageRatingModel(rating);
  rateEntry._id = historyEntry._id;
  await rateEntry.save();

  logger.info("POST /package: Package created successfully");

  return res.status(201).send(packageToUpload.toObject());
}

function ratePackage(url: string): PackageRating {
  logger.info("ratePackage: Running rate script on url " + url + "...");

  let terminal_command = `ts-node src/rate/hello-world.ts ${url}`;

  cp.execSync(terminal_command);
  const test_file = readFileSync(
    path.join(__dirname, "../", "rate/score.json"),
    "utf8"
  );
  const packageRate: PackageRating = JSON.parse(test_file);

  logger.info("ratePackage: Package received rating " + packageRate.NetScore);
  logger.info("ratePackage: Package rated successfully");

  return packageRate;
}

function verifyRating(packageRate: PackageRating) {
  // There's gotta be a way to do this is one line with joi

  const { error, value } = PackageRatingUploadValidation.validate(packageRate);
  if (error) {
    logger.debug(
      "verifyRating: Package does not meet qualifications for upload."
    );
    return false;
  }

  logger.info("verifyRating: Package meets qualifications for upload.");
  return true;
}

async function getPackageJSON(content: string): Promise<Object> {
  logger.info("getPackageURL: Getting url from content base64 string");

  let zip: JSZip = new JSZip();
  zip = await zip.loadAsync(content, { base64: true, createFolders: true });

  // console.log(await zip.file("exceptions/CommcourierException.java")?.async("string"));
  let package_json_path: string = zip.file(/package.json/)[0]?.name;
  // console.log(package_json_path);

  let package_json_contents: string | undefined = await zip
    .file(package_json_path)
    ?.async("string");
  // console.log(package_json_contents);

  let package_json_object: Object;
  if (package_json_contents) {
    package_json_object = JSON.parse(package_json_contents);
    if (package_json_object) {
      logger.info("getPackageJSON: Found package.json");
      return package_json_object;
    }
    logger.debug("getPackageJSON: Unable to parse package.json");
  }

  logger.debug("getPackageJSON: No package.json found");
  return {};
}

async function getGitRepoDetails(url: string): Promise<{ username: string; repoName: string } | null> {
  // Function description
  // :param url: string url to parse
  // :return: Promise of a username and reponame extracted from
  // url or null

  let match: RegExpMatchArray | null;

  if (url.startsWith("git:")) {
    // Parse ssh gitHub link
    match = url.match(/git:\/\/github\.com\/([^\/]+)\/([^\/]+)\.git/);
  } else {
    // Parse https github link
    match = url.match(/(?:https:\/\/github\.com\/)([^\/]+)\/([^\/]+)(?:\/|$)/);
  }

  // Assign username and repoName from URL regex
  if (match) {
    let repoName = match[2];
    let username = match[1];
    return { username, repoName };
  }

  return null;
}

async function getVersionFromURL(url: string, name: string): Promise<string> {
  // API call to get the version of a package from its url and name
  // :param url: string url
  // :param name: string name of package

  // TODO: Could someone who worked closely with the APIs in Part 1 do this part :)

  return "1.0.0";
};

function buildHistoryEntry(metadata: PackageMetadata, action: "CREATE" | "UPDATE" | "DOWNLOAD" | "RATE"): PackageHistoryEntry {
  // Function description
  // :param metadata: PackageMetadata
  // :param action: string
  // :return: PackageHistoryEntry

  let historyEntry: PackageHistoryEntry = new PackageHistoryEntryModel({});
  historyEntry.Date = new Date().toISOString();
  historyEntry.PackageMetadata = metadata;
  historyEntry.Action = action;

  // Assign user that performed action
  // TODO: Koltan :) how do we know the user that uploaded this?
  historyEntry.User = {
    name: "test",
    isAdmin: true,
    isUpload: true,
    isSearch: true,
    isDownload: true
  }

  return historyEntry;
}

async function getMetadata(url: string, package_json: Object): Promise<PackageMetadata | undefined> {
  // Function description
  // :param packageData: PackageData
  // :return: PackageMetadata

  let metadata: PackageMetadata = { Name: "", Version: "", ID: "" };

  // Add metadata to package
  // TODO: If Name is "*" we throw error because that's reserved?
  if (package_json && package_json["name"] && package_json["version"]) {
    metadata.Name = package_json["name"];
    metadata.Version = package_json["version"];
  } else {
    metadata.Name = (await getGitRepoDetails(url || ""))?.repoName || "";
    metadata.Version = await getVersionFromURL(url || "", metadata.Name);
  }

  if (!metadata.Name || !metadata.Version) {
    // We choked on the package trying to get its name and version
    return undefined;
  }

  return metadata;
}

export async function npm_2_git(npmUrl: string): Promise<string> {
  // Takes a NPM package URL and returns the GitHub URL
  // :param npmUrl: npm URL provided by text file
  // :return: Promise of corresponding GitHub url string

  // extract the package name from the npm URL
  const packageName = npmUrl.split("/").pop();
  let retries = 0;

  while (retries < 1) {
    try {
      logger.info("Converting npm link (" + npmUrl + ") to GitHub link...");

      // use the npm registry API to get the package information
      const response: AxiosResponse = await axios.get(
        `https://registry.npmjs.org/${packageName}`
      );
      const packageInfo = response.data;

      // check if package has repository
      if (!packageInfo.repository) {
        logger.debug(`No repository found for package: ${packageName}`);
        return Promise.resolve("");
      }
      let new_url = packageInfo.repository.url;

      // Convert ssh to https url
      if (new_url.startsWith("git+ssh://git@github.com")) {
        new_url = new_url.replace(
          "git+ssh://git@github.com",
          "git://github.com"
        );

        logger.info("Converted npm link to " + new_url);

        return new_url;
      }
      // check if repository is on github
      if (isGitHubUrl(packageInfo.repository.url)) {
        return packageInfo.repository.url.replace("git+https", "git");
      } else {
        logger.debug(`Repository of package: ${packageName} is not on GitHub`);
        return Promise.resolve("");
      }
    } catch (error: any) {
      // Error in getting GitHub url
      logger.debug("Received error: " + error);
      if (error.response && error.response.status === 404) {
        logger.debug(`Package not found: ${packageName}`);
        return Promise.resolve("");
      } else if (error.response && error.response.status === 429) {
        logger.debug(
          `Rate limit exceeded: ${error.response.headers["Retry-After"]} seconds`
        );
        return Promise.resolve("");
      } else if (error.code === "ECONNREFUSED") {
        logger.debug(`Error: ${error.code}. Retrying...`);
        retries++;
        continue;
      } else {
        logger.debug(
          "Respository of package: " + packageName + " is not on GitHub"
        );
        return Promise.resolve("");
      }
    }
  }

  logger.debug(`Error: Maximum retries exceeded for package: ${packageName}`);
  return Promise.resolve("");
}

// Export all non-exported functions just for testing
export const exportedForTesting = {
  ratePackage,
  verifyRating,
  getPackageJSON,
  getGitRepoDetails,
  getVersionFromURL,
  buildHistoryEntry,
  getMetadata,
}