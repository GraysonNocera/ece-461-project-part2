import requests
import base64
import re
from bs4 import BeautifulSoup

def get_repo_from_nongithub_url(url):
    # Get the content of the website at the URL
    response = requests.get(url)
    if response.status_code == 200:
        soup = BeautifulSoup(response.text, "html.parser")

        # Find the link to the GitHub repository
        for link in soup.find_all("a"):
            href = link.get("href")
            if href and re.search(r"github.com/[^/]+/[^/]+", href):
                return href.split("/")[-2] + "/" + href.split("/")[-1]

    return None


def get_license(repo):
    print(repo)
    url = f"https://api.github.com/repos/{repo}/license"
    response = requests.get(url)

    if response.status_code == 200:
        license = response.json()["content"]
        return base64.b64decode(license).decode()
    else:
        return None


url = "https://www.npmjs.com/package/express"
if "github.com" in url:
    repo = url[19:]
else:
    repo = get_repo_from_nongithub_url(url)

if repo:
    license = get_license(repo)
    if license:
        print(license)
    else:
        print("Could not retrieve license")
else:
    print("Invalid URL")
