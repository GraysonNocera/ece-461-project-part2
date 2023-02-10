import sys
import json
import os
import requests

# RAMP_UP: get_downloads
# CORRECTNESS_SCORE: get_issues
# BUS_FACTOR: get_collaborators or get_contributors
# RESPONSIVE_MAINTAINER: get_collaborators or has_downloads or get_pulls
# LICENSE: get_license

git_token = os.environ.get('GITHUB_TOKEN')

def main():
    # if(len(sys.argv) != 3):
    #     print("Invalid length of arguments")
    #     return 1 
    
    func = sys.argv[1]
    # argv2 = sys.argv[2]
    # argv3 = sys.argv[3]

    if func=="get_downloads":
        print(func)
        result = get_downloads()
        open("downloads.json","w").write(json.dumps(f'{func}: {result}'))
    elif func=="get_issues":
        result = get_issues()
        open("issues.json","w").write(json.dumps(f'{func}: {result}'))
    elif func=="get_collaborators":
        result = get_collaborators()
        open("collaborators.json","w").write(json.dumps(f'{func}: {result}'))
    elif func=="get_contributors":
        result = get_contributors()
        open("contributors.json","w").write(json.dumps(f'{func}: {result}'))
    elif func=="has_downloads":
        result = has_downloads()
        open("has_downloads.json","w").write(json.dumps(f'{func}: {result}'))
    elif func=="get_pulls":
        result = get_pulls()
        open("pulls.json","w").write(json.dumps(f'{func}: {result}'))
    elif func=="get_license":
        result = get_license()
        open("license.json","w").write(json.dumps(f'{func}: {result}'))
    else:
        result = "invalid input"

    # open("pyout.json","w").write(json.dumps(f'{func}: {result}'))
    # print(result) # Don't print to communicate with TS
    
def get_downloads():
    # num_downloads = 0

    # # Setting up API
    # downloads_url = f"https://api.github.com/repos/{user_id}/{repo}/releases"
    # headers = {"Authorization": f"{git_token}"}

    # downloads_request = requests.get(downloads_url, headers=headers)
    # releases = downloads_request.json()
    # num_releases = len(releases)

    # # Calculating total number of downloads
    # if downloads_request.status_code == 200 and "download_count" in releases[0]["assets"][0]:
    #     for i in range(0, num_releases - 1):
    #         num_downloads += int(releases[i]["assets"][0]["download_count"])

    return "1"

def get_issues():
    return "2"
def get_collaborators():
    return "3"
def get_contributors():
    return "4"
def has_downloads():
    return "5"
def get_pulls():
    return "6"
def get_license():
    return "7"

if __name__ == '__main__':
    main()