import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import {
  connectToMongo,
  disconnectFromMongo,
  startServer,
  defineServer,
} from "../src/config/config";
import { exportedForTestingApp } from "../src/app";

let baseURL = "http://localhost:3000";
let token;

describe("Authentication Endpoint Tests", () => {
  test("Test authenticating a user", async () => {
    try {
        let response = await fetch("http://localhost:3000/authenticate", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            User: {
            name: "ece30861defaultadminuser",
            isAdmin: true,
            isUpload: true,
            isDownload: true,
            isSearch: true,
            },
            Secret: {
            password: "correcthorsebatterystaple123(!__+@**(A'\"`;DROP TABLE packages;",
            },
        }),
        });
        console.log("Response status:", response.status);
        console.log(response.header);
        console.log(response.Token);
        expect(response.status).toBe(200);
        token = await response.json();
        console.log("Response data:", token);
        // Additional assertions on the response data if needed
    } catch (error) {
        console.error("Error occurred during authentication:", error);
        throw error; // Rethrow the error to fail the test
    }
    });


  test("Test authenticating a user with missing fields", async () => {
    const response = await fetch(`${baseURL}/authenticate`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        User: {
          name: "ece30861defaultadminuser",
        },
      }),
    });

    expect(response.status).toBe(400);
  });

  test("Test authenticating a user with incorrect credentials", async () => {
    const response = await fetch(`${baseURL}/authenticate`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        User: {
          name: "ece30861defaultadminuser",
          isAdmin: true,
        },
        Secret: {
          password: "peen",
        },
      }),
    });

    expect(response.status).toBe(401);
  });

  test("Test authenticating a user with unsupported authentication method", async () => {
    const response = await fetch(`${baseURL}/authenticate`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/xml",
      },
      body: JSON.stringify({
        User: {
          name: "ece30861defaultadminuser",
          isAdmin: true,
          isUpload: true,
          isDownload: true,
          isSearch: true,
        },
        Secret: {
          password: "correcthorsebatterystaple123(!__+@**(A'\"`;DROP TABLE packages;",
        },
      }),
    });

    expect(response.status).toBe(501);
  });
});

describe("Packages Endpoint Tests", () => {
  test("Test successful request", async () => {
    const response = await fetch(`${baseURL}/packages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Authorization": token, // Include the authentication token
      },
      body: JSON.stringify([
        {
          Name: "express",
          Version: "Exact (4.4.4)",
        },
        {
          Name: "express",
          Version:
            "Exact (1.0.0) Bounded range (1.2.3-2.1.0) Carat (^1.2.3) Tilde (~1.2.0)",
        },
        {
          Name: "react",
          Version:
            "Exact (1.0.0) Bounded range (1.2.3-2.1.0) Carat (^1.2.3) Tilde (~1.2.0)",
        },
      ]),
    });

    expect(response.status).toBe(200);

    const packages = await response.json();
    expect(Array.isArray(packages)).toBeTruthy();
    expect(packages.length).toBeGreaterThan(0);
  });

  test("Test missing or invalid request body", async () => {
    const response = await fetch(`${baseURL}/packages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Authorization": token, // Include the authentication token
      },
      body: JSON.stringify([
        {

        }
      ]),
    });

    expect(response.status).toBe(400);
  });

  test.skip("Test request body exceeding size limit", async () => {
    // TODO: Add test case for request body exceeding size limit
  });
});

describe("Package Endpoint Tests", () => {
  let packageId; // Variable to store the package ID

  test("Test uploading a new package", async () => {
    const response = await fetch(`${baseURL}/package`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Authorization": token, // Include the authentication token
      },
      body: JSON.stringify({
        URL: "https://www.npmjs.com/package/express",
        JSProgram: "console.log('Hello World')",
      }),
    });

    expect(response.status).toBe(201);

    const { metadata } = await response.json();
    expect(metadata).toBeDefined();
    expect(metadata.ID).toBeDefined();

    packageId = metadata.ID; // Save the package ID for further testing
  });

  test("Test uploading a package with missing fields", async () => {
    const response = await fetch(`${baseURL}/package`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Authorization": token, // Include the authentication token
      },
      body: JSON.stringify({
        URL: "https://www.npmjs.com/package/express",
      }),
    });

    expect(response.status).toBe(400);
  });

  test("Test uploading a package that already exists", async () => {
    const response = await fetch(`${baseURL}/package`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Authorization": token, // Include the authentication token
      },
      body: JSON.stringify({
        URL: "https://www.npmjs.com/package/express",
        JSProgram: "console.log('Hello World')",
      }),
    });

    expect(response.status).toBe(409);
  });

  test.skip("Test uploading a package with invalid dependencies", async () => {
    // TODO: Add test case for uploading a package with invalid dependencies
  });

  // TODO: Add test case for package disqualified rating (response 424)
});

describe("Package ID Endpoint Tests", () => {
  test("Test existing package ID", async () => {
    const response = await fetch(`${baseURL}/package/${packageId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Authorization": token, // Include the authentication token
      },
    });

    expect(response.status).toBe(200);

    const packageData = await response.json();
    expect(packageData).toBeDefined();
    expect(packageData.Content).toBeDefined();
  });

  test("Test non-existing package ID", async () => {
    const response = await fetch(`${baseURL}/package/123456789`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Authorization": token, // Include the authentication token
      },
    });

    expect(response.status).toBe(404);
  });

  test("Test malformed request", async () => {
    const response = await fetch(`${baseURL}/package/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Authorization": token, // Include the authentication token
      },
    });

    expect(response.status).toBe(400);
  });
});

describe("Update Package Endpoint Tests", () => {
  test("Test updating an existing package", async () => {
    const response = await fetch(`${baseURL}/package/${packageId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Authorization": token, // Include the authentication token
      },
      body: JSON.stringify({
        metadata: {
          Name: "",
          Version: "",
          ID: "",
        },
        data: {
          Content: "",
          URL: "",
          JSProgram: "",
        },
      }),
    });

    expect(response.status).toBe(200);

    // TODO: Add assertions for updated version
  });

  test("Test updating a non-existing package", async () => {
    const response = await fetch(`${baseURL}/package/123456789`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Authorization": token, // Include the authentication token
      },
      body: JSON.stringify({
        metadata: {
          Name: "test_package",
          Version: "1.0.0",
          ID: "1234",
        },
        data: {
          Content: "test",
          URL: "test",
          JSProgram: "test",
        },
      }),
    });

    expect(response.status).toBe(404);
  });

  test("Test malformed request", async () => {
    const response = await fetch(`${baseURL}/package/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Authorization": token, // Include the authentication token
      },
      body: JSON.stringify({
        metadata: {
          Name: "test_package",
          Version: "1.0.0",
        },
        data: {
          Content: "test",
          URL: "test",
          JSProgram: "test",
        },
      }),
    });

    expect(response.status).toBe(400);
  });
});

describe("Get Package by Name Endpoint Tests", () => {
  test("Test getting a package by name", async () => {
    const response = await fetch(`${baseURL}/package/byName/express`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Authorization": token, // Include the authentication token
      },
    });

    expect(response.status).toBe(200);

    const packageHistory = await response.json();
    expect(packageHistory).toBeDefined();
    // Add assertions for the package history data
  });

  test("Test getting a package by name with missing name parameter", async () => {
    const response = await fetch(`${baseURL}/package/byName/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Authorization": token, // Include the authentication token
      },
    });

    expect(response.status).toBe(400);
  });

  test("Test getting a package by name that does not exist", async () => {
    const response = await fetch(`${baseURL}/package/byName/nonExistingPackage`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Authorization": token, // Include the authentication token
      },
    });

    expect(response.status).toBe(404);
  });
});

describe("Search Packages by Regular Expression Endpoint Tests", () => {
  test("Test searching for packages fitting a regular expression", async () => {
    const response = await fetch(`${baseURL}/package/byRegEx`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Authorization": token, // Include the authentication token
      },
      body: JSON.stringify({
        PackageRegEx: "exp?res*",
      }),
    });

    expect(response.status).toBe(200);

    const packages = await response.json();
    expect(Array.isArray(packages)).toBeTruthy();
    // Add assertions for the returned packages
  });

  test("Test searching for packages with missing request body", async () => {
    const response = await fetch(`${baseURL}/package/byRegEx`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Authorization": token, // Include the authentication token
      },
    });

    expect(response.status).toBe(400);
  });

  test("Test searching for packages with invalid regular expression", async () => {
    const response = await fetch(`${baseURL}/package/byRegEx`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Authorization": token, // Include the authentication token
      },
      body: JSON.stringify({
        PackageRegEx: "(?!.*[A-Za-z]).*",
      }),
    });

    expect(response.status).toBe(400);
  });

  test("Test searching for packages with regular expression that does not match any packages", async () => {
    const response = await fetch(`${baseURL}/package/byRegEx`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Authorization": token, // Include the authentication token
      },
      body: JSON.stringify({
        PackageRegEx: "nonExistingPackage",
      }),
    });

    expect(response.status).toBe(404);
  });
});

describe("Rate Package Endpoint Tests", () => {
  test("Test rating a package", async () => {
    const response = await fetch(`${baseURL}/package/${packageId}/rate`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Authorization": token, // Include the authentication token
      },
    });

    expect(response.status).toBe(200);

    const rating = await response.json();
    expect(rating).toBeDefined();
    // Add assertions for the rating data
  });

  test("Test rating a package with missing fields", async () => {
    const response = await fetch(`${baseURL}/package/rate`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Authorization": token, // Include the authentication token
      },
    });

    expect(response.status).toBe(400);
  });

  test("Test rating a non-existing package", async () => {
    const response = await fetch(`${baseURL}/package/nonexisting-id/rate`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Authorization": token, // Include the authentication token
      },
    });

    expect(response.status).toBe(404);
  });

  test.skip("Test rating a package with internal server error", async () => {
    // TODO: Add test case for rating a package with internal server error (response 500)
  });
});

describe("Delete Package Endpoint Tests", () => {
  test("Test deleting an existing package", async () => {
    const response = await fetch(`${baseURL}/package/${packageId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-Authorization": token, // Include the authentication token
      },
    });

    expect(response.status).toBe(200);
  });

  test("Test deleting a non-existing package", async () => {
    const response = await fetch(`${baseURL}/package/nonexisting-id`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-Authorization": token, // Include the authentication token
      },
    });

    expect(response.status).toBe(404);
  });

  test("Test malformed request", async () => {
    const response = await fetch(`${baseURL}/package/`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-Authorization": token, // Include the authentication token
      },
    });

    expect(response.status).toBe(400);
  });
});

describe("Reset Registry Endpoint Tests", () => {
  test("Test successful request", async () => {
    const response = await fetch(`${baseURL}/reset`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-Authorization": `bearer ${token}`, // Include the valid authentication token
      },
    });

    expect(response.status).toBe(200);
  });

  test("Test missing or invalid token", async () => {
    const response = await fetch(`${baseURL}/reset`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-Authorization": "bearer 123456789", // Include an invalid authentication token
      },
    });

    expect(response.status).toBe(401);
  });

  test("Test request without a token", async () => {
    const response = await fetch(`${baseURL}/reset`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    expect(response.status).toBe(401);
  });

  test("Test malformed request", async () => {
    const response = await fetch(`${baseURL}/reset`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-Authorization": "bearer", // Include a malformed authentication token
      },
    });

    expect(response.status).toBe(400);
  });
});
