import { logger } from "../logging";
import { PackageMetadata } from "../model/packageMetadata";
import { Request, Response, NextFunction } from "express";
import {
  deleteUnzippedFolder,
  getContentFromUrl,
  getPackageJSON,
  getReadme,
  getUrlFromContent,
} from "../service/zip";
import { getGitRepoDetails, npm_2_git } from "../service/misc";
import {
  PackageRating,
  PackageRatingModel,
  PackageRatingUploadValidation,
} from "../model/packageRating";
import { PackageModel } from "../model/package";
import { unzipContent } from "../service/zip";
import { ratePackage, verify } from "../service/rate";
import { uploadFileToMongo } from "../config/config";
import path from "path";
import axios from "axios";
let isGitHubUrl = require("is-github-url");

export const postPackage = async (req: Request, res: Response) => {
  logger.info("\npostPackage: POST /package endpoint hit");

  let packageToUpload;
  let rating: PackageRating;
  let package_json: Object = {};
  let github_url: string;
  let temp: string;
  let didUploadURL: boolean = false;
  let basePath: string = ""; // Base path to the unzipped folder
  if (res.locals.upload) {
    // You must set the metadata before trying to save this
    packageToUpload = new PackageModel({
      data: req?.body,
    });

    if (packageToUpload.data.Content && packageToUpload.data.URL) {
      logger.info("postPackage: Package has both Content + URL, returning 400");
      return res.status(400).send("Invalid request data");
    } else if (!packageToUpload.data.Content && !packageToUpload.data.URL) {
      logger.info("postPackage: Package has no Content nor URL, returning 400");
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
        `POST /package: Package already exists, got package: ${package_query_results}, returning 409`
      );
      return res.status(409).send("Package exists already.");
    }

    // Try to fetch the URL from the package_json
    if (!didUploadURL) {
      const urlFromContent = await getUrlFromContent(
        packageToUpload.data.Content
      );
      if (!urlFromContent) {
        logger.info(
          "POST /package: Package not uploaded, invalid content, returning 400"
        );
        return res.status(400).send("Invalid Content or URL");
      }

      basePath = urlFromContent.basePath;
      packageToUpload.data.URL = urlFromContent.url;
      package_json = urlFromContent.package_json;
    }

    github_url = packageToUpload.data.URL.startsWith(
      "https://www.npmjs.com/package/"
    )
      ? await npm_2_git(packageToUpload.data.URL)
      : packageToUpload.data.URL;

    packageToUpload.metadata = await getMetadata(github_url, package_json);
    if (!packageToUpload.metadata) {
      logger.info(
        "POST /package: Package not uploaded, invalid metadata, returning 400"
      );
      deleteUnzippedFolder(basePath);
      return res.status(400).send("Invalid Content or URL");
    }

    if (packageToUpload.metadata.Name == "*") {
      logger.info(
        "POST /package: Package not uploaded, invalid name, returning 400"
      );
      deleteUnzippedFolder(basePath);
      return res.status(400).send("Invalid Content or URL");
    }

    if (await isNameInDb(packageToUpload.metadata.Name)) {
      logger.info(
        "POST /package: Package not uploaded, name exists, returning 409"
      );
      deleteUnzippedFolder(basePath);
      return res.status(409).send("Package exists already.");
    }

    // Package not updated due to disqualified rating: status 423
    if (didUploadURL) {
      rating = await ratePackage(packageToUpload.data.URL);

      logger.info("POST /package: verifying rating");

      // For now, nothing passes this, so I'm commenting it out
      if (!verify(PackageRatingUploadValidation, rating)) {
        logger.info(
          "POST /package: Package not uploaded, disqualified rating, returning 424"
        );
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

    let fileName: string = `${packageToUpload.metadata.Name}.txt`;
    let filePath: string = path.join(__dirname, "..", "artifacts", fileName);

    if (didUploadURL) {
      // Use URL to get the Content, also writes Content to a file
      logger.info("POST /package: Getting content from URL: " + github_url);
      packageToUpload.data.Content = await getContentFromUrl(github_url);

      basePath = await unzipContent(packageToUpload.data.Content);
      logger.info("POST /package: Got content from URL: " + basePath);

      if (!packageToUpload.data.Content) {
        logger.info(
          "POST /package: Package not uploaded, invalid content, returning 400"
        );
        deleteUnzippedFolder(basePath);
        return res.status(400).send("Invalid Content or URL");
      }
    } else {
      logger.info(
        "POST /package: Writing file to " + filePath + " from content"
      );
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
    deleteUnzippedFolder(basePath);

    logger.info(
      "POST /package: Returning package: " +
        packageToUpload.toObject() +
        " with status 201"
    );
    return res.status(201).send(packageToUpload.toObject());
  } else {
    logger.info(
      "POST /package: Package not uploaded, invalid permissions, returning 401"
    );
    res.status(401).send("Invalid permissions to perform requested action");
  }
};

async function getVersionFromURL(url: string, name: string): Promise<string> {
  // API call to get the version of a package from its url and name
  // :param url: string url (github url)
  // :param name: string name of package

  let apiUrl = "";

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
  getMetadata,
};
