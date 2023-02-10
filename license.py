import git
import os


def get_license(user_id, repo):
    repo_url = f"https://github.com/{user_id}/{repo}.git"

    # Clone the repository
    git.Repo.clone_from(repo_url, repo)

    license_file = os.path.join(repo, "LICENSE.txt")
    readme_file = os.path.join(repo, "README.txt")

    # Read the contents of the license and readme files
    if os.path.exists(license_file):
        return 1
    elif os.path.exists(readme_file):
        with open(readme_file, "r") as f:
            readme_content = f.read()
            if "License" in readme_content or "Licensing" in readme_content or "licensing" in readme_content:
                return 1
            else:
                return 0
    else:
        return 0
