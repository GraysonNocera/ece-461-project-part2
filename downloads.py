import requests
import os

token = os.environ.get('GITHUB_TOKEN')


def get_downloads(user_id, repo, git_token):
    num_downloads = 0

    # Setting up API
    downloads_url = f"https://api.github.com/repos/{user_id}/{repo}/releases"
    headers = {"Authorization": f"{git_token}"}

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

    return num_downloads

