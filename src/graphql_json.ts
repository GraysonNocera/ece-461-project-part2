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
    // let data3 = JSON.parse(data2);
    // package_test.num_dev = data3.data.repository.assignableUsers.totalCount;

    // // Check if the repo has issues enabled
    // if (data3.data.repository.hasIssuesEnabled == true) {
    //   // If so, get the number of open issues
    //   package_test.issues_active = data3.data.repository.open_issues.totalCount;
    //   package_test.issues = data3.data.repository.issues.totalCount;
    // } else {
    //   // If not, set the number of open issues to -1
    //   package_test.issues_active = -1;
    //   package_test.issues = -1;
    // }

    // // Get data about the package
    // if (data3.data.repository.defaultBranchRef.target.history.totalCount) {
    //   package_test.total_commits =
    //     data3.data.repository.defaultBranchRef.target.history.totalCount;
    // } else {
    //   package_test.total_commits = 0;
    // }
    // if (data3.data.repository.pullRequests.totalCount) {
    //   package_test.pr_count = data3.data.repository.pullRequests.totalCount;
    // } else {
    //   package_test.pr_count = 0;
    // }
    // if (data3.data.repository.last_pushed_at != null) {
    //   package_test.last_pushed_at = data3.data.repository.last_pushed_at;
    // }
    // if (data3.data.repository.stargazerCount != null) {
    //   package_test.num_stars = data3.data.repository.stargazerCount;
    // } else {
    //   package_test.num_stars = 0;
    // }
    // if (data3.data.repository.licenseInfo != null) {
    //   package_test.license_name = data3.data.repository.licenseInfo.name;
    // } else {
    //   package_test.license_name = "no name";
    // }

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
