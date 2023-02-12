import sys
import json
import os
import requests
import git

def main():

    if(len(sys.argv) != 4):
        print("Invalid length of arguments")
        return 1 
    
    func = sys.argv[1]
    user = sys.argv[2]
    repo = sys.argv[3]
    token = os.environ.get('GITHUB_TOKEN')
    # open("test.json","w").write(json.dumps(f'Input: {func} {user} {repo}, Token: {token}'))

    if func=="get_downloads":
        result = get_downloads(user, repo, token)
        open("downloads.json","w").write(json.dumps(f'{func}: {result}'))
    elif func=="get_issues":
        result = get_issues(user, repo, token)
        open("issues.json","w").write(json.dumps(f'{func}: {result}'))
    elif func=="get_forks":
        result = get_forks()
        open("forks.json","w").write(json.dumps(f'{func}: {result}'))
    elif func=="get_pulls":
        result = get_pulls()
        open("pulls.json","w").write(json.dumps(f'{func}: {result}'))
    elif func=="get_license":
        result = get_license(user, repo)
        open("license.json","w").write(json.dumps(f'{func}: {result}'))
    else:
        result = "invalid input"

    # open("pyout.json","w").write(json.dumps(f'{func}: {result}'))
    # print(result) # Don't print to communicate with TS
    
def get_downloads(user_id, repo, git_token):

    # open("error.json","w").write(json.dumps(f'get_downloads inputs: {user_id} {repo} {git_token}'))
    num_downloads = 0

    # Setting up API
    downloads_url = f"https://api.github.com/repos/{user_id}/{repo}/releases"
    headers = {"Authorization": f"{git_token}"}
    # open("error.json","w").write(json.dumps(f'{downloads_url}'))

    downloads_request = requests.get(downloads_url, headers=headers)
    releases = downloads_request.json()
    num_releases = len(releases)

    # Calculating total number of downloads
    try:
        if downloads_request.status_code == 200 and "download_count" in releases[0]["assets"][0]:
            for i in range(0, num_releases - 1):
                num_downloads += int(releases[i]["assets"][0]["download_count"])
    except:
        num_downloads = 0

    return str(num_downloads)

def get_issues(user_id, repo, git_token):
    total_count = 0

    # Setting up API
    open_issues_url = f"https://api.github.com/search/issues?q=repo:{user_id}/{repo}%20is:issue%20is:open&per_page=1"
    closed_issues_url = f"https://api.github.com/search/issues?q=repo:{user_id}/{repo}%20is:issue%20is:closed&per_page=1"
    headers = {"Authorization": f"{git_token}"}

    open_issues_request = requests.get(open_issues_url, headers=headers)
    closed_issues_request = requests.get(closed_issues_url, headers=headers)

    # Calculating total number of issues
    try:
        if open_issues_request.status_code == 200 and closed_issues_request.status_code == 200:
            total_count = int(open_issues_request.json()["total_count"]) + int(closed_issues_request.json()["total_count"])
    except:
        total_count = 0

    return str(total_count)

def get_forks():
    return "3"
def get_pulls():
    return "4"

def get_license(user_id, repo):
    repo_url = f"https://github.com/{user_id}/{repo}.git"
    
    # Clone the repository
    git.Repo.clone_from(repo_url, repo)

    license_file = os.path.join(repo, "LICENSE.txt")
    readme_file = os.path.join(repo, "README.txt")

    # Read the contents of the license and readme files
    if os.path.exists(license_file):
        return "1"
    elif os.path.exists(readme_file):
        with open(readme_file, "r") as f:
            readme_content = f.read()
            if "License" in readme_content or "Licensing" in readme_content or "licensing" in readme_content:
                return "1"
            else:
                return "0"
    else:
        return "0"

if __name__ == '__main__':
    main()