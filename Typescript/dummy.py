import sys
import json

# RAMP_UP: get_downloads
# CORRECTNESS_SCORE: get_issues
# BUS_FACTOR: get_collaborators or get_contributors
# RESPONSIVE_MAINTAINER: get_collaborators or has_downloads or get_pulls
# LICENSE: get_license

def main():
    func = sys.argv[1]
    if func=="get_downloads":
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
        open("downloads.json","w").write(json.dumps(f'{func}: {result}'))
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