const MAX_RETRIES = 1;
var fs = require("fs");
// GraphQL query to get the number of commits in the last year

export async function graphAPIfetch(
  gql_query: string,
  repo: string
): Promise<any> {
  // Fetch data from GraphQL
  // :param gql_query: string query to be passed to GraphQL
  // :param package_test: instance of Package class
  //
  //  Function fetches data from GraphQL and stores it
  //  in the package_test Object
  //
  // :return: data received

  try {
    // Fetch the GraphQL API
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.GITHUB_TOKEN}`,
      },
      body: JSON.stringify({ query: gql_query }),
    });

    const data = await response.json();

    // Get data in usable format
    let data2 = JSON.stringify(data, null, 2);
    fs.writeFile("jsons/graphql" + repo + ".json", data2, (err) => {
      if (err) {
        console.error(err);
      }
    });
    return data;
  } catch (error) {
    console.error(error);
  }
}

export function gql_query(username: string, repo: string) {
  // Query to be passed to graphQL
  // :param username: GitHub username of repository owner
  // :param repo: repository name of GitHub repo
  return `
  {
    repository(owner: "${username}", name: "${repo}") {
      name
      forkCount
      licenseInfo {
        name
      }
      assignableUsers {
        totalCount
      }
      sshUrl
      latestRelease {
        tagName
      }
      hasIssuesEnabled
      issues {
        totalCount
      }
      open_issues: issues(states: OPEN) {
        totalCount
      }
      defaultBranchRef {
        target {
          ... on Commit {
            history {
              totalCount
            }
          }
        }
      }
      pullRequests(states: MERGED) {
        totalCount
      }
      
      last_pushed_at: pushedAt
      
      stargazerCount
      hasVulnerabilityAlertsEnabled
    }
  }
  `;
}
