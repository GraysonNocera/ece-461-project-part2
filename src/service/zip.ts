import { readFile } from 'fs/promises';
import * as JSZip from 'jszip';
import { Octokit as OctokitType } from "octokit";
import * as fs from 'fs/promises';
import * as path from 'path';
const Octokit = OctokitType as any;
import { getGitRepoDetails } from './misc';
import { logger } from '../logging';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
})

// Convert the zip file pulled from github to base64 string
async function zipToBase64(filePath: string): Promise<string> {
  const zipFile = await readFile(filePath);
  const zip = await JSZip.loadAsync(zipFile);
  const zipContent = await zip.generateAsync({ type: 'base64' });
  return zipContent;
}

async function getPackageZip(owner: string, repo: string) {

  let result = await octokit.request(`GET /repos/${owner}/${repo}/zipball`, {
    owner: owner,
    repo: repo,
    headers: {
      'Accept': 'application/vnd.github+json'
    }
  });

  await fs.writeFile(path.join(__dirname, 'file.zip'), new Array(result.data))
  
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
  let content = await zipToBase64(path.join(__dirname, 'file.zip'))

  fs.rm(path.join(__dirname, 'file.zip'));

  return content;
}