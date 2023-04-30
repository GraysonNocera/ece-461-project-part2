import { Router } from "express";
import { authorizeUser } from "../middleware/authorizeUser";
import { logger } from "../logging";
import { Request, Response } from "express";
import { PackageQuery, PackageQueryValidation } from "../model/packageQuery";
import { Validate } from "../middleware/validate";
import { PackageModel } from "../model/package";

const express = require("express");
export const packagesRouter: Router = express.Router();

// Create a package when POST /packages is called
packagesRouter.post("/", authorizeUser, async (req: Request, res: Response) => {
  logger.info("POST /packages");

  let offset: number;
  let packages: any[] = [];
  let verionsToSearch: string[];
  let arr: PackageQuery[] = [];
  try {
    if (typeof req.query?.offset != "string") {
      offset = 1;
    } else {
      offset = parseInt(req.query?.offset) || 1;
    }

    logger.info("package offset: " + offset);

    arr = req.body;

    // Manually validate each package query
    arr.forEach((packageQuery) => {
      let { error, value } = PackageQueryValidation.validate(packageQuery);
      if (error) {
        logger.info("Invalid package query" + error);
        
        throw new Error("Invalid package query for POST /packages  " + packageQuery);
      }
    });

    logger.info("POST /packages: Received " + arr);

    await Promise.all(
      arr.map(async (packageQuery) => {
        verionsToSearch = getVersions(packageQuery.Version || "");

        logger.info("Versions to search: " + verionsToSearch);
        logger.info("Name: " + packageQuery.Name);

        if (packageQuery.Name == "*") {
          logger.info("Searching for all packages");
          packages = await getAllPackages(packages, offset);
          return res.status(200).send(packages);
        }

        // For each version to search, search the database for a package
        // with that version number and name
        await Promise.all(
          verionsToSearch.map(async (version) => {
            packages = await getPackagesByVersionName(
              version,
              packageQuery.Name,
              packages,
              offset
            );
          })
        );
      })
    );

    logger.info("Packages: " + packages);

    return res.status(200).send(packages);
  } catch {
    // Request body is not valid JSON
    logger.info("Invalid JSON for POST /packages");
    return res.status(400).send("Invalid Request Body");
  }
});

// Regex to get the version numbers from a string like this:
// Exact (1.2.3) Bounded range (1.2.3-2.1.0) Carat (^1.2.3) Tilde (~1.2.0)
// Return a list of the version numbers
// The output of this would be ["1.2.3", "1.2.3-2.1.0", "^1.2.3", "~1.2.0"] (include the ^, ~, etc)

function getVersions(versionString: string): string[] {
  logger.info("Version string: " + versionString);

  const regex = /^(~|\^)?(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)(?:-((?:0|[1-9][0-9]*|[0-9]*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9][0-9]*|[0-9]*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
  var matches = versionString.match(regex);
  if (matches === null) {
    const bounded_version_regex = /^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)-(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$/;
    matches = versionString.match(bounded_version_regex);
    if (matches === null) {
      return [];
    }
  }

  return matches.map((match) => match.slice(1, -1));
}


async function getAllPackages(packages: any[], offset: number): Promise<any[]> {
  logger.info("Getting all packages");

  // Search the database for all packages
  let results: any[] = await PackageModel.find({})
    .select({ metadata: { Name: 1, Version: 1 } })
    .exec();

  // Add the packages to the list of packages
  packages = addResultToPackages(results, packages);

  return packages.slice((offset - 1) * 30, offset * 30);
}

async function getPackagesByVersionName(
  version: string,
  name: string,
  packages: any[],
  offset: number
): Promise<any[]> {
  logger.info("Getting packages by version and name: " + version + " " + name);

  // Search the database for all packages
  let results: any[] = await PackageModel.find({
    "metadata.Name": name,
    "metadata.Version": version,
  })
    .select({ metadata: { Name: 1, Version: 1 } })
    .exec();

  // Add the packages to the list of packages
  packages = addResultToPackages(results, packages);

  return packages.slice((offset - 1) * 30, offset * 30);
}

function addResultToPackages(results: any[], packages: any[]): any[] {
  if (results.length == 0) {
    return packages;
  }

  logger.info("Adding result to packages: " + results);

  results.forEach((result) => {
    packages.push({
      Name: result.metadata.Name,
      Version: result.metadata.Version,
    });
  });

  return packages;
}

// Export all non-exported functions just for testing
export const exportedForTesting = {
  addResultToPackages,
  getPackagesByVersionName,
  getVersions,
};
