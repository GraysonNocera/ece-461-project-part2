import requests
from github import Github
from pprint import pprint
import os

#Installed PyGithub and 
token = os.environ.get('GITHUB_TOKEN')
# url = f"https://github.com/cloudinary/cloudinary_npm"

# # github username
# username = "sdlott"
# # url to request
# url = f"https://github.com/cloudinary/cloudinary_npm"

# # make the request and return the json
# user_data = requests.get(url).json()
# # pretty print JSON data
# pprint(user_data)

def print_repo(repo):
    # repository full name
    print("Full name:", repo.full_name)
    # repository description
    print("Description:", repo.description)
    # the date of when the repo was created
    print("Date created:", repo.created_at)
    # the date of the last git push
    print("Date of last push:", repo.pushed_at)
    # home website (if available)
    print("Home Page:", repo.homepage)
    # programming language
    print("Language:", repo.language)
    # number of forks
    print("Number of forks:", repo.forks)
    # number of stars
    print("Number of stars:", repo.stargazers_count)
    print("-"*50)
    # repository content (files & directories)
    print("Contents:")
    for content in repo.get_contents(""):
        print(content)
    try:
        # repo license
        print("License:", base64.b64decode(repo.get_license().content.encode()).decode())
    except:
        pass

# Github username
username = "sdlott"
# pygithub object
g = Github()
# get that user by username
user = g.get_user(username)

for repo in user.get_repos():
    print(dir(repo))


# search repositories by name
for repo in g.search_repositories("pythoncode tutorials"):
    # print repository details
    print_repo(repo)