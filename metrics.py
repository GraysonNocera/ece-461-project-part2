import sys
import json
import os
import requests
import git
import shutil
import re


def main():
    if len(sys.argv) != 4:
        print("Invalid length of arguments")
        return 1

    func = sys.argv[1]
    user = sys.argv[2]
    repo = sys.argv[3]
    token = os.environ.get("GITHUB_TOKEN")
    # open("test.json","w").write(json.dumps(f'Input: {func} {user} {repo}, Token: {token}'))
    if not os.path.exists("jsons/"):
        os.mkdir("jsons/")


    if func == "get_issues":
        result = get_issues(user, repo, token)
        open(f"jsons/issues{user}.json", "w").write(json.dumps(f"{func}: {result}"))
    elif func == "get_forks":
        result = get_forks(user, repo, token)
        open(f"jsons/forks{user}.json", "w").write(json.dumps(f"{func}: {result}"))
    elif func == "get_contributors":
        result = get_contributors(user, repo, token)
        open(f"jsons/contributors{user}.json", "w").write(json.dumps(f"{func}: {result}"))
    elif func == "get_license":
        result = get_license(repo)
        # shutil.rmtree(repo)
        open(f"jsons/license{user}.json", "w").write(json.dumps(f"{func}: {result}"))
    elif func == "get_clone":
        result = get_clone(user, repo)
    elif func == "get_pinned":
        result = get_pinned(repo)
        open(f"jsons/pinned{user}.json", "w").write(json.dumps(f"{func}: {result}"))
    elif func == "rm_repo":
        shutil.rmtree(repo)
    else:
        result = "invalid input"

    # open("pyout.json","w").write(json.dumps(f'{func}: {result}'))
    # print(result) # Don't print to communicate with TS


def get_clone(user_id: str, repo: str) -> str:
    repo_url = f"https://github.com/{user_id}/{repo}.git"

    if os.path.exists(repo):
        os.system(f"rm -rf {repo}")

    # Clone the repository
    try:
        git.Repo.clone_from(repo_url, repo)
    except:
        return "0"


def get_issues(user_id: str, repo: str, git_token: str) -> str:
    total_count = 0

    # Setting up API
    open_issues_url = f"https://api.github.com/search/issues?q=repo:{user_id}/{repo}%20is:issue%20is:open&per_page=1"
    closed_issues_url = f"https://api.github.com/search/issues?q=repo:{user_id}/{repo}%20is:issue%20is:closed&per_page=1"
    headers = {"Authorization": f"{git_token}"}

    open_issues_request = requests.get(open_issues_url, headers=headers)
    closed_issues_request = requests.get(closed_issues_url, headers=headers)

    # Calculating total number of issues
    try:
        if (
            open_issues_request.status_code == 200
            and closed_issues_request.status_code == 200
        ):
            total_count = int(open_issues_request.json()["total_count"]) + int(
                closed_issues_request.json()["total_count"]
            )
    except:
        total_count = 0

    return str(total_count)


def get_forks(user_id: str, repo: str, git_token: str) -> str:
    # Setting up API
    forks_url = f"https://api.github.com/repos/{user_id}/{repo}"
    headers = {"Authorization": f"{git_token}"}

    forks_request = requests.get(forks_url, headers=headers)
    forks = 0
    if forks_request.status_code == 200:
        forks = int(forks_request.json()["forks_count"])
    return str(forks)


def get_contributors(user_id: str, repo: str, git_token: str) -> str:
    # Setting up API
    contributors_url = f"https://api.github.com/repos/{user_id}/{repo}/contributors"
    headers = {"Authorization": f"{git_token}"}

    contributors_request = requests.get(contributors_url, headers=headers)

    if contributors_request.status_code == 200:
        return str(len(contributors_request.json()))
    else:
        return "0"


def get_license(repo: str) -> str:
    license_file_txt_1 = os.path.join(repo, "LICENSE.txt")
    license_file_txt_2 = os.path.join(repo, "License.txt")
    license_file_1 = os.path.join(repo, "LICENSE")
    license_file_2 = os.path.join(repo, "License")
    readme_file = os.path.join(repo, "README.md")
    # shutil.rmtree(repo)

    # Read the contents of the license and readme files
    if (
        os.path.exists(license_file_txt_1)
        or os.path.exists(license_file_txt_2)
        or os.path.exists(license_file_1)
        or os.path.exists(license_file_2)
    ):
        return "1"

    elif os.path.exists(readme_file):
        with open(readme_file, "r") as f:
            readme_content = f.read()
            if (
                "License" in readme_content
                or "Licensing" in readme_content
                or "licensing" in readme_content
                or "license" in readme_content
            ):
                return "1"
            else:
                return "0"
    else:
        return "0"


def get_pinned(repo: str) -> str:
    # version pinned metric, check if package.json exists
    # if it does parse it to see if it has dependencies
    # else assume no dependencies
    package = os.path.join(repo, "package.json")
    if os.path.exists(package):
        file = open(package, "r")
        parse = json.load(file)
        total = 1
        num = 0
        if "dependencies" in parse:
            for i in parse["dependencies"]:
                if re.search(r"\d\.[1-9]\d*\.", parse["dependencies"][i]):
                    num += 1
            if num > 0:
                total /= num
            return str(total)
        else:
            return "1"
    else:
        return "1"


if __name__ == "__main__":
    main()
