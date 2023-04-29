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
let packageId;

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
      }).then(function (response) {
        expect(response.status).toBe(200);
        return response.text();
      }).then(text => token = text);
        
        
      console.log("Token: ", token);
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
  test("Test uploading a new package", async () => {
    const response = await fetch(`${baseURL}/package`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Authorization": token, // Include the authentication token
      },
      body: JSON.stringify({
        Content: "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",
        JSProgram: "if (process.argv.length === 7) {\nconsole.log('Success')\nprocess.exit(0)\n} else {\nconsole.log('Failed')\nprocess.exit(1)\n}\n",
      }),
    }).then(function (response) {
      expect(response.status).toBe(201);
      return response.json();
    });
    // .then(function (body){
    //   const { metadata } = body;
    //   expect(metadata).toBeDefined();
    //   expect(metadata.ID).toBeDefined();

    //   packageId = metadata.ID; // Save the package ID for further testing
    // })

    console.log(packageId)
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

  test("Test invalid token", async () => {
    const response = await fetch(`${baseURL}/reset`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-Authorization": "bearer 123456789", // Include an invalid authentication token
      },
    });

    expect(response.status).toBe(400);
  });

  test("Test missing token", async () => {
    const response = await fetch(`${baseURL}/reset`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    expect(response.status).toBe(400);
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

  test.skip("Test user without permission to reset the registry", async () => {
    // TODO: Add test case (response 501, consult schema)
  });
});
