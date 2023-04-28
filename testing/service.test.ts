
import { npm_2_git } from "../src/service/misc";
import mockAxios from "axios";


describe("Test service functions", () => {
  
  test.each([
    {
      npm_link: "https://www.npmjs.com/package/cloudinary",
      github_link: "https://github.com/cloudinary/cloudinary_npm",
      expected: "https://github.com/cloudinary/cloudinary_npm"
    },
    {
      npm_link: "https://www.npmjs.com/package/express",
      github_link: "https://github.com/expressjs/express",
      expected: "https://github.com/expressjs/express"
    },
    {
      npm_link: "https://www.npmjs.com/package/express",
      github_link: "git+ssh://git@github.com/expressjs/express",
      expected: "https://github.com/expressjs/express"
    },
    {
      npm_link: "https://github.com/browserify/browserify",
      github_link: "git+https://github.com/browserify/browserify",
      expected: "https://github.com/browserify/browserify",
    },
    {
      npm_link: "invalid_url",
      github_link: "invalid_url",
      expected: "",
    }
  ])("test npm_2_git", async ({ npm_link, github_link, expected }) => {
    mockAxios.get = jest
      .fn()
      .mockReturnValue({ data: { repository: { url: github_link } } });
    expect(await npm_2_git(npm_link)).toEqual(expected);
  });
})