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
packagesRouter.post(
  "/",
  /* authorizeUser, */ Validate(PackageQueryValidation),
  async (req: Request, res: Response) => {
    logger.info("POST /packages");

    let offset: number;
    let packageQuery: PackageQuery;
    let packages: any[] = [];
    let verionsToSearch: string[];
    try {
      if (typeof req.query?.offset != "string") {
        logger.info("Invalid offset for GET /packages");
        return res.status(400).send("Invalid offset");
      }

      offset = parseInt(req.query?.offset) || 1;
      logger.info("package offset: " + offset);
      packageQuery = req.body;

      verionsToSearch = getVersions(packageQuery.Version || "");

      logger.info("Versions to search: " + verionsToSearch);
      logger.info("Name: " + packageQuery.Name);

      if (packageQuery.Name == "*") {
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

      return res.status(200).send(packages);
    } catch {
      // Request body is not valid JSON
      logger.info("Invalid JSON for POST /packages");
      return res.status(400).send("Invalid JSON");
    }
  }
);

// Regex to get the version numbers from a string like this:
// Exact (1.2.3) Bounded range (1.2.3-2.1.0) Carat (^1.2.3) Tilde (~1.2.0)
// Return a list of whatever is in the parentheses
// The output of this would be ["1.2.3", "1.2.3-2.1.0", "^1.2.3", "~1.2.0"] (include the ^, ~, etc)
function getVersions(versionString: string): string[] {
  const regex = /\((.*?)\)/g;
  const matches = versionString.match(regex);
  if (matches === null) {
    return [];
  }
  return matches.map((match) => match.slice(1, -1));
}

async function getAllPackages(packages: any[], offset: number): Promise<any[]> {
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
}
