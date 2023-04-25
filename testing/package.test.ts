import { exportedForTestingPackageController } from "../src/controller/package.controller";
const {
  getVersionFromURL,
  buildHistoryEntry,
  getMetadata,
} = exportedForTestingPackageController;
import { ratePackage, verifyRating, didChokeOnRating } from "../src/service/rate";
import { getGitRepoDetails } from "../src/service/misc";

describe("Random Testing", () => {

  // Write unit test get getMetadata
  it.each([
    {
      url: "",
      package_json: { name: "TestProject", version: "2.4.5" },
      expected: { Name: "TestProject", Version: "2.4.5", ID: "" },
    },
    {
      url: "https://github.com/expressjs/express",
      package_json: {},
      expected: { Name: "express", Version: "1.0.0", ID: "" },
    },
    {
      url: "",
      package_json: {},
      expected: undefined,
    },
  ])("should test getting metadata", async ({ url, package_json, expected }) => {
    let result = await getMetadata(url, package_json);
    expect(result).toEqual(expected);
  });

  // Write unit test for getVersionFromURL
  // Write unit test for getGitRepoDetails
  // Write unit test for ratePackage
});
