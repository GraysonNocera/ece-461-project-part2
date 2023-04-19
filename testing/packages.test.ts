// Write tests for the functions found in ../src/route/packages.route.ts
import { exportedForTesting } from "../src/route/packages.route";
const { addResultToPackages, getVersions } = exportedForTesting;

describe("Test for packages route", () => {

  it("should test the function getRandomResults", () => {
    let packages: any[] = [];
    let results: any[] = [];

    results = getRandomResults();
    packages = addResultToPackages(results, packages);

    packages.forEach((package_, index) => {

      expect(package_.Name).toBeDefined();
      expect(package_.Version).toBeDefined();
      expect(package_.Description).toBeUndefined();
      expect(package_.Name).toBe(results[index].metadata.Name);
      expect(package_.Version).toBe(results[index].metadata.Version);
    })
  });

  test('returns the versions in parentheses', () => {
    const versionString = 'Exact (1.2.3) Bounded range (1.2.3-2.1.0) Carat (^1.2.3) Tilde (~1.2.0)';
    const expected = ['1.2.3', '1.2.3-2.1.0', '^1.2.3', '~1.2.0'];
    const result = getVersions(versionString);
    expect(result).toEqual(expected);
  });

  test('returns an empty array for a string with no parentheses', () => {
    const versionString = 'No parentheses';
    const expected: string[] = [];
    const result = getVersions(versionString);
    expect(result).toEqual(expected);
  });
});

function getRandomResults(): any[] {

  let results: any[] = [];

  for (let i = 0; i < 10; i++) {
    results.push({
      metadata: {
        Name: getRandomString(Math.random() * 10),
        Version: getRandomString(Math.random() * 10),
        ID: getRandomString(Math.random() * 10),
      }
    });
  }

  return results;
}

// Get a random string of a given length using the seed and return the string
function getRandomString(length: number): string {
  let result = "";
  let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}
