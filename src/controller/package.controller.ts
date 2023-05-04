import { logger } from "../logging";
import { PackageMetadata } from "../model/packageMetadata";
import { Request, Response, NextFunction } from "express";
import { PackageHistoryEntry } from "../model/packageHistoryEntry";
import { PackageHistoryEntryModel } from "../model/packageHistoryEntry";
import {
  deleteBase64File,
  deleteUnzippedFolder,
  getContentFromUrl,
  getPackageJSON,
  getReadme,
} from "../service/zip";
import { getGitRepoDetails, npm_2_git } from "../service/misc";
import {
  PackageRating,
  PackageRatingModel,
  PackageRatingUploadValidation,
} from "../model/packageRating";
import { PackageModel } from "../model/package";
import { getInfoFromContent, unzipContent } from "../service/zip";
import { ratePackage, verify } from "../service/rate";
import { uploadFileToMongo } from "../config/config";
import path from "path";
import fs from "fs";
import axios from "axios";
let isGitHubUrl = require("is-github-url");

export const postPackage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.info("postPackage: POST /package endpoint hit");

  let packageToUpload;
  let rating: PackageRating;
  let package_json: Object = {};
  let github_url: string;
  let temp: string;
  let dataFromContent: any = {};
  let didUploadURL: boolean = false;
  let basePath: string = ""; // Base path to the unzipped folder
  if (res.locals.upload) {
    // You must set the metadata before trying to save this
    packageToUpload = new PackageModel({
      data: req?.body,
    });

    if (packageToUpload.data.Content && packageToUpload.data.URL) {
      logger.info("postPackage: Package has both Content and URL, returning 400");
      return res.status(400).send("Invalid request data");
    } else if (!packageToUpload.data.Content && !packageToUpload.data.URL) {
      logger.info("postPackage: Package has neither Content nor URL, returning 400");
      return res.status(400).send("Invalid request data");
    }

    didUploadURL = packageToUpload.data.URL ? true : false;
    logger.info("postPackage: didUploadURL: " + didUploadURL);

    // Package already exists: status 409
    const query = PackageModel.find();
    query.or([
      { "data.Content": { $exists: true, $eq: packageToUpload.data.Content } },
      { "data.URL": { $exists: true, $eq: packageToUpload.data.URL } },
    ]);
    const package_query_results = await query.findOne();
    if (package_query_results) {
      logger.info(
        "POST /package: Package already exists, got package: " +
          package_query_results + ", returning 409"
      );
      return res.status(409).send("Package exists already.");
    }

    // Try to fetch the URL from the package_json
    if (!didUploadURL) {
      basePath = await unzipContent(packageToUpload.data.Content);
      logger.info("postPackage: basePath: " + basePath);

      package_json = await getPackageJSON(basePath);
      try {
        packageToUpload.data.URL = package_json["homepage"];
        if (!packageToUpload.data.URL) {
          logger.debug(
            "POST /package: Package not uploaded, no homepage field, returning 400"
          );
          deleteUnzippedFolder(basePath);
          return res.status(400).send("Invalid Content (could not find url)");
        }
        logger.info(
          "postPackage: packageToUpload.data.URL from package_json['hompage']: " +
            packageToUpload.data.URL
        );
      } catch (error) {
        logger.debug(
          "POST /package: Package not uploaded, no homepage field or no package.json, returning 400"
        );
        deleteUnzippedFolder(basePath);
        return res.status(400).send("Invalid Content");
      }
    }

    github_url = packageToUpload.data.URL.startsWith(
      "https://www.npmjs.com/package/"
    )
      ? await npm_2_git(packageToUpload.data.URL)
      : packageToUpload.data.URL;

    packageToUpload.metadata = await getMetadata(github_url, package_json);
    if (!packageToUpload.metadata) {
      logger.info("POST /package: Package not uploaded, invalid metadata, returning 400");
      deleteUnzippedFolder(basePath);
      return res.status(400).send("Invalid Content or URL");
    }

    if (packageToUpload.metadata.Name == "*") {
      logger.info("POST /package: Package not uploaded, invalid name, returning 400");
      deleteUnzippedFolder(basePath);
      return res.status(400).send("Invalid Content or URL");
    }

    if (await isNameInDb(packageToUpload.metadata.Name)) {
      logger.info("POST /package: Package not uploaded, name exists, returning 409");
      deleteUnzippedFolder(basePath);
      return res.status(409).send("Package exists already.");
    }

    // Package not updated due to disqualified rating: status 423
    if (didUploadURL) {
      rating = await ratePackage(packageToUpload.data.URL);

      logger.info("POST /package: verifying rating");

      // For now, nothing passes this, so I'm commenting it out
      if (!verify(PackageRatingUploadValidation, rating)) {
        logger.info("POST /package: Package not uploaded, disqualified rating");
        res
          .status(424)
          .send("Package is not uploaded due to the disqualified rating.");
        return;
      }

      // Save rating
      logger.info("POST /package: Saving rating");
      let rateEntry = new PackageRatingModel(rating);
      rateEntry._id = packageToUpload._id;
      rateEntry.save().then((result) => {
        logger.info("POST /package: Saved rating: " + result);
      });
    }

    let filePath: string = path.join(
      __dirname,
      "..",
      "artifacts",
      `${packageToUpload.metadata.Name}.txt`
    );
    let fileName: string = `${packageToUpload.metadata.Name}.txt`;

    if (didUploadURL) {
      // Use URL to get the Content, also writes Content to a file
      logger.info("POST /package: Getting content from URL: " + github_url);
      packageToUpload.data.Content = await getContentFromUrl(github_url);

      basePath = await unzipContent(packageToUpload.data.Content);
      logger.info("POST /package: Got content from URL: " + basePath);

      if (!packageToUpload.data.Content) {
        logger.info("POST /package: Package not uploaded, invalid content, returning 400");
        deleteUnzippedFolder(basePath);
        return res.status(400).send("Invalid Content or URL");
      }
    } else {
      logger.info(
        "POST /package: Writing file to " + filePath + " from content"
      );
      fs.writeFileSync(filePath, packageToUpload.data.Content);
    }

    // Get readme
    packageToUpload.data.Readme = await getReadme(basePath);
    if (!packageToUpload.data.Readme) {
      logger.info("POST /package: invalid readme, still uploading");
    }

    // Save package
    logger.info("POST /package: Saving package: " + packageToUpload);
    packageToUpload.metadata.ID = packageToUpload._id.toString();

    // This can be async because this is a separate collection in MongoDB
    // that can be uploaded as we are finishing the rest of the logic
    uploadFileToMongo(packageToUpload.data.Content, packageToUpload._id);

    // Utter stupidity so that I don't have to research how to not upload the current Content
    temp = packageToUpload.data.Content;
    packageToUpload.data.Content = fileName;

    await packageToUpload.save();
    logger.info(
      "POST /package: Package metadata added successfully " +
        packageToUpload.metadata
    );

    packageToUpload.data.Content = temp;

    logger.info("POST /package: Package created successfully");

    // Clean up artifacts, we are letting the mongo upload take care of the text file deletion
    // deleteBase64File(filePath);
    deleteUnzippedFolder(basePath);

    logger.info("POST /package: Returning package: " + packageToUpload.toObject() + " with status 201");
    return res.status(201).send(packageToUpload.toObject());
  } else {
    logger.info("POST /package: Package not uploaded, invalid permissions, returning 401");
    res.status(401).send("Invalid permissions to perform requested action");
  }
};

async function getVersionFromURL(url: string, name: string): Promise<string> {
  // API call to get the version of a package from its url and name
  // :param url: string url (github url)
  // :param name: string name of package

  let apiUrl = "";
  // // chekcing if url is gh or npm
  // if (url.startsWith("https://www.npmjs.com/package/")) {
  //   const packageName = url.split("/").pop();
  //   try {
  //     const npmResponse = await axios.get(
  //       `https://registry.npmjs.org/${packageName}`
  //     );
  //     const repositoryUrl = npmResponse.data.repository.url;

  //     // maybe check here that the url is *actually* a gh url?
  //     apiUrl = `https://api.github.com/repos/${repositoryUrl.split("/")[3]}/${
  //       repositoryUrl.split("/")[4]
  //     }/releases`;
  //   } catch (error) {
  //     logger.debug("Error fetching GitHub URL from npm URL:", error);
  //     return "1.0.0"; // default
  //   }
  // } else if (url.startsWith("https://github.com/")) {
  //   apiUrl = `https://api.github.com/repos/${url.split("/")[3]}/${
  //     url.split("/")[4]
  //   }/releases`;
  // } else {
  //   logger.info("Invalid URL provided");
  //   return "1.0.0"; // default
  // }

  if (!isGitHubUrl(url)) {
    logger.info("Invalid URL provided");
    return "1.0.0"; // default
  }

  apiUrl = `https://api.github.com/repos/${url.split("/")[3]}/${
    url.split("/")[4]
  }/releases`;

  try {
    const response = await axios.get(apiUrl);
    const releases = response.data;

    if (releases.length > 0) {
      const latestRelease = releases[0];

      logger.info(
        "getVersionFromURL: latest release: ",
        latestRelease.tag_name
      );
      return latestRelease.tag_name;
    } else {
      logger.info(
        "getVersionFromURL: No releases found, returning 1.0.0 as the version"
      );
      return "1.0.0"; // default
    }
  } catch (error) {
    logger.info("getVersionFromURL: Unable to get version from URL: ", error);
    return "1.0.0"; // default
  }
}

function buildHistoryEntry(
  metadata: PackageMetadata,
  action: "CREATE" | "UPDATE" | "DOWNLOAD" | "RATE"
): PackageHistoryEntry {
  // Function description
  // :param metadata: PackageMetadata
  // :param action: string
  // :return: PackageHistoryEntry

  let historyEntry: PackageHistoryEntry = new PackageHistoryEntryModel({});
  historyEntry.Date = new Date().toISOString();
  historyEntry.PackageMetadata = metadata;
  historyEntry.Action = action;

  return historyEntry;
}

async function getMetadata(
  url: string,
  package_json: Object
): Promise<PackageMetadata | undefined> {
  // Function description
  // :param packageData: PackageData
  // :return: PackageMetadata

  logger.info("getMetadata: Getting metadata from package");

  let metadata: PackageMetadata = { Name: "", Version: "", ID: "" };

  // Add metadata to package
  if (package_json && package_json["name"] && package_json["version"]) {
    logger.info("getMetadata: Getting metadata from package.json");
    metadata.Name = package_json["name"];
    metadata.Version = package_json["version"];
  } else {
    logger.info("getMetadata: Getting metadata from URL");
    metadata.Name = (await getGitRepoDetails(url || ""))?.repoName || "";
    metadata.Version = await getVersionFromURL(url || "", metadata.Name);
  }

  if (!metadata.Name || !metadata.Version) {
    // We choked on the package trying to get its name and version
    logger.info("Unable to get metadata from package");
    return undefined;
  }

  logger.info(
    "Successfully got metadata from package: name: " +
      metadata.Name +
      " version: " +
      metadata.Version
  );
  return metadata;
}

async function isNameInDb(name: string): Promise<Number | null> {
  // Search database for the name, return 1 if it is in the db, 0 otherwise
  // :param name: string name of package
  // :return: Number

  logger.info("Checking if package name is in database");

  return (await PackageModel.findOne({ "metadata.Name": name })) ? 1 : 0;
}

// Export all non-exported functions just for testing
export const exportedForTestingPackageController = {
  getVersionFromURL,
  buildHistoryEntry,
  getMetadata,
};
