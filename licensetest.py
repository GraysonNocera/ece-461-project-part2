import sys
import os
from src.metrics import *
import shutil

test_token = os.environ.get('GITHUB_TOKEN')
# test_userId = "nullivex"
# test_repo = "nodist"
testTotal = 4
testSuccess = 0

def testLicenseSuccess(test_userId, test_repo):
    num = get_license(test_userId, test_repo)
    shutil.rmtree(test_repo)
    # print(num)
    if num == "1":
        print(test_userId + test_repo + " passed \n")
        return 1
    else:
        print(test_userId + test_repo + " didn't passed \n")
        return 0

def testNoLicense(test_userId, test_repo):
    num = get_license(test_userId, test_repo)
    shutil.rmtree(test_repo)
    # print(num)
    if num == "0":
        print(test_userId + test_repo + " passed \n")
        return 1
    else:
        print(test_userId + test_repo + " didn't passed \n")
        return 0

#Has word "License" in read me. 
testSuccess += testLicenseSuccess("461-Team-14", "licensetest1")
#Has MIT LICENSE file
testSuccess += testLicenseSuccess("461-Team-14", "licensetest2")
#Has no reference of any license
testSuccess += testNoLicense("461-Team-14", "licensetest3")
#Has LICENSE.txt file
testSuccess += testLicenseSuccess("461-Team-14", "licensetest4")




totalScore = (testSuccess*1.0 / testTotal*1.0)
# coverScore = (testSuccess / testTotal) * 100

# # Total: 10
# # Passed: 2.0
# Coverage: 20.0%
# 2.0/10 test cases passed. 20.0% line coverage achieved.
print(f"Total: {testTotal}")
print(f"Passed: {totalScore}")
# print(f"Coverage: {coverScore}%")
# print(f"{totalScore}/{testTotal} test cases passed. {coverScore}% line coverage achieved.")