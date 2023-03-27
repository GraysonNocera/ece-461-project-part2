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
        open(f"jsons/contributors{user}.json", "w").write(
            json.dumps(f"{func}: {result}")
        )
    elif func == "get_license":
        result = get_license(repo)
        # shutil.rmtree(repo)
        open(f"jsons/license{user}.json", "w").write(json.dumps(f"{func}: {result}"))
    elif func == "get_clone":
        result = get_clone(user, repo)
    elif func == "get_pinned":
        result = get_pinned(repo)
        open(f"jsons/pinned{user}.json", "w").write(json.dumps(f"{func}: {result}"))
    elif func == "get_engr":
        result = get_engr(user, repo, token)
        open(f"jsons/engr{user}.json", "w").write(json.dumps(f"{func}: {result}"))
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
    gpl_file = f"jsons/graphql{repo}.json"
    if os.path.exists(gpl_file):
        file = open(gpl_file)
        contents = json.load(file)
        if "hasIssuesEnabled" in contents["data"]["repository"]:
            if(contents["data"]["repository"]["hasIssuesEnabled"]):
                return str(contents["data"]["repository"]["open_issues"]["totalCount"] + contents["data"]["repository"]["issues"]["totalCount"])
    else:
        return "-1"


def get_forks(user_id: str, repo: str, git_token: str) -> str:
    # Setting up API
    gpl_file = f"jsons/graphql{repo}.json"
    if os.path.exists(gpl_file):
        file = open(gpl_file)
        contents = json.load(file)
        if "forkCount" in contents["data"]["repository"]:
            return str(contents["data"]["repository"]["forkCount"])
    else:
        return "-1"


def get_contributors(user_id: str, repo: str, git_token: str) -> str:
    # Setting up API
    gpl_file = f"jsons/graphql{repo}.json"
    if os.path.exists(gpl_file):
        file = open(gpl_file)
        contents = json.load(file)
        if "assignableUsers" in contents["data"]["repository"]:
            return str(contents["data"]["repository"]["assignableUsers"]["totalCount"])
    else:
        return "-1"

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
                total += 1
                if re.search(r"\d\.[1-9]\d*\.", parse["dependencies"][i]):
                    num += 1
            if num > 0: 
                num /= total
            return str(num)
        else:
            return "1"
    else:
        return "1"


def get_engr(user_id: str, repo: str, git_token: str) -> str:
    # Setting up API
    engr_url = f"https://api.github.com/search/issues?q=repo:{user_id}/{repo}+is:pr+is:merged+review:approved"
    headers = {"Authorization": f"{git_token}"}
    engr_request = requests.get(engr_url, headers=headers)
    review_pr = engr_request.json()
    if "total_count" in review_pr:
        gpl_file = f"jsons/graphql{repo}.json"
        if os.path.exists(gpl_file):
            file = open(gpl_file)
            contents = json.load(file)
            if "pullRequests" in contents["data"]["repository"]:
                return str(review_pr["total_count"] / contents["data"]["repository"]["pullRequests"]["totalCount"])
        else:
            return "0"  
    else:
        return "0"


if __name__ == "__main__":
    main()
