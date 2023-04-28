import { exportedForTestingPackageController } from "../src/controller/package.controller";
const { getVersionFromURL, buildHistoryEntry, getMetadata } =
  exportedForTestingPackageController;
import { ratePackage } from "../src/service/rate";
import { getGitRepoDetails } from "../src/service/misc";

import axios from "axios";

jest.mock("axios");

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
  ])(
    "should test getting metadata",
    async ({ url, package_json, expected }) => {
      let result = await getMetadata(url, package_json);
      expect(result).toEqual(expected);
    }
  );

  // Write unit test for getGitRepoDetails
  // Write unit test for ratePackage
});

// Write unit test for getVersionFromURL
describe("getVersionFromURL", () => {
  it("should return the latest version for a GitHub repository URL", async () => {
    const owner = "expressjs";
    const repo = "express";
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/releases`;
    const response = {
      data: [
        {
          tag_name: "v3.0.0",
        },
        {
          tag_name: "v2.0.0",
        },
      ],
    };

    (axios.get as jest.MockedFunction<typeof axios.get>).mockResolvedValue(response);

    const url = `https://github.com/${owner}/${repo}`;
    const version = await getVersionFromURL(url, repo);

    expect((axios.get as jest.MockedFunction<typeof axios.get>)).toHaveBeenCalledWith(apiUrl);
    expect(version).toBe("v3.0.0");
  });

  it("should return the default version for an invalid URL", async () => {
    const url = "invalid-url";
    const packageName = "my-package";
    const version = await getVersionFromURL(url, packageName);

    expect(version).toBe("1.0.0");
  });

  it("should return the default version if unable to get version from API", async () => {
    const url = "https://www.npmjs.com/package/my-package";
    const packageName = "my-package";

    (axios.get as jest.MockedFunction<typeof axios.get>).mockRejectedValue(new Error("Unable to get releases"));

    const version = await getVersionFromURL(url, packageName);

    expect(version).toBe("1.0.0");
  });
});
