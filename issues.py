import os
import requests

token = os.environ.get('GITHUB_TOKEN')


def get_issues(user_id, repo, git_token):
    total_count = 0

    # Setting up API
    open_issues_url = f"https://api.github.com/search/issues?q=repo:{user_id}/{repo}%20is:issue%20is:open&per_page=1"
    closed_issues_url = f"https://api.github.com/search/issues?q=repo:{user_id}/{repo}%20is:issue%20is:closed&per_page=1"
    headers = {"Authorization": f"{git_token}"}

    open_issues_request = requests.get(open_issues_url, headers=headers)
    closed_issues_request = requests.get(closed_issues_url, headers=headers)

    # Calculating total number of issues
    if open_issues_request.status_code == 200 and closed_issues_request.status_code == 200:
        total_count = int(open_issues_request.json()["total_count"]) + int(closed_issues_request.json()["total_count"])

    return total_count


