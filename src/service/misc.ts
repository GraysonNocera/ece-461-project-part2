
export async function getGitRepoDetails(url: string): Promise<{ username: string; repoName: string } | null> {
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