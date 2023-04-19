import { exportedForTesting } from "../src/controller/package.controller";
const {
  ratePackage,
  getGitRepoDetails,
  getVersionFromURL,
  buildHistoryEntry,
  getMetadata,
} = exportedForTesting;

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
      expected: { Name: "", Version: "1.0.0", ID: "" },
    },
  ])("should test getting metadata", async ({ url, package_json, expected }) => {
    let result = await getMetadata(url, package_json);
    expect(result).toEqual(expected);
  });

  // Write unit test for buildHistoryEntry
  // Write unit test for getVersionFromURL
  // Write unit test for getGitRepoDetails
  // Write unit test for ratePackage
});
