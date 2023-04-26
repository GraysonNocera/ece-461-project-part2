import { logger } from "../logging";
const isGitHubUrl = require("is-github-url");
import { AxiosResponse } from "axios";
import axios from "axios";

export async function getGitRepoDetails(
  url: string
): Promise<{ username: string; repoName: string } | null> {
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

    logger.info("getGitRepoDetails: Extracted username: " + username + " and repoName: " + repoName);

    return { username, repoName };
  }

  logger.info("Invalid URL provided")

  return null;
}
export async function npm_2_git(npmUrl: string): Promise<string> {
  // Takes a NPM package URL and returns the GitHub URL
  // :param npmUrl: npm URL provided by text file
  // :return: Promise of corresponding GitHub url string

  logger.info("Converting npm link (" + npmUrl + ") to GitHub link...");

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
          "https://github.com"
        );

        logger.info("Converted npm link to " + new_url);

        return new_url;
      }
      // check if repository is on github
      if (isGitHubUrl(packageInfo.repository.url)) {
        logger.info("Converted npm link to " + packageInfo.repository.url);
        return packageInfo.repository.url.replace("git+https", "https");
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
