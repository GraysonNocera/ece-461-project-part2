import fs from "fs";
import path from "path";
import { connectToMongo, disconnectFromMongo } from "../src/config/config";
import { exportedForTestingApp } from "../src/app";
const { defineServer, startServer } = exportedForTestingApp;

jest.mock("../src/middleware/authorizeUser", () => {
  const originalModule = jest.requireActual("../src/middleware/authorizeUser");

  // Mock the default export and named export authorizeUser
  // Basically, I'm skipping auth for these tests
  return {
    __esModule: true,
    ...originalModule,
    authorizeUser: jest.fn().mockImplementation((req, res, next) => {
      next();
    }),
  };
});

// const data = {
//   Content: fs.readFileSync(path.join(__dirname, "lodash_base64"), "base64"),
//   JSProgram: "hi",
// };

// fetch("http://localhost:3000/package", {
//   method: "POST",
//   headers: {
//     "Content-Type": "application/json",
//     "X-Authorization":
//       "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7IlVzZXIiOnsibmFtZSI6ImVjZTQ2MWRlZmF1bHRhZG1pbnVzZXIiLCJpc0FkbWluIjp0cnVlLCJpc1VwbG9hZCI6dHJ1ZSwiaXNEb3dubG9hZCI6dHJ1ZSwiaXNTZWFyY2giOnRydWV9LCJTZWNyZXQiOnsicGFzc3dvcmQiOiJjb3JyZWN0aG9yc2ViYXR0ZXJ5c3RhcGxlMTIzKCFfXytAKiooQeKAmeKAnWA7RFJPUCBUQUJMRSBwYWNrYWdlczsifX0sImlhdCI6MTY4MjI4MTUyNiwiZXhwIjoxNjgyMzE3NTI2fQ.w6Rs9wmZtZ7XhJsrQUiGNBLyJui9mSPhlevfV-nyLJ8",
//   },
//   body: JSON.stringify(data),
// })
//   .then(async (response) => fs.writeFileSync("response.json", await response.text()))
//   .then(async (data) => console.log(data))
//   .catch((error) => console.error(error));

// Set timeout to 10 minutes
jest.setTimeout(10 * 60 * 1000);

let baseURL: string = "http://localhost:3000/";
let token: string;
let app: any;

beforeAll(() => {
  app = defineServer();
  app = startServer(app);
});

afterAll(() => {
  app.close();
});

beforeEach(async () => {
  await connectToMongo();
  // token = await authenticate();
});

afterEach(async () => {
  await disconnectFromMongo();
});

describe("Testing endpoints (integration tests)", () => {
  test.skip("GET /", async () => {
    await fetch(baseURL, {
      method: "GET",
      headers: {
        "Content-Type": "",
      },
    })
      .then(async (response) => {
        console.log(response.text());
      })
      .then(async (data) => {
        console.log(data);
      })
      .catch((error) => {
        console.error(error);
      });
  });

  test("POST /package, both content and url supplied", async () => {
    let response = await fetch(path.join(baseURL, "package"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        URL: "https://www.npmjs.com/package/lodash",
        Content: "test",
        JSProgram: "test",
      }),
    });

    expect(response.status).toBe(400);
  });

  test("POST /package, neither content nor url supplied", async () => {
    let response = await fetch(path.join(baseURL, "package"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        JSProgram: "test",
      }),
    });

    expect(response.status).toBe(400);
  });

  test("POST /package, only content supplied, but lodash has no url", async () => {
    let response = await fetch(path.join(baseURL, "package"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Content: fs.readFileSync(
          path.join(__dirname, "lodash_base64"),
          "utf-8"
        ),
        JSProgram: "test",
      }),
    });

    expect(response.status).toBe(400);
  });

  test("POST /package, package already exists", async () => {
    let response = await fetch(path.join(baseURL, "package"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        URL: "https://www.npmjs.com/package/react",
        JSProgram: "console.log('Hello World')",
      }),
    });

    expect(response.status).toBe(409);
  });

  test.skip("POST /package, package uploaded successfully", async () => {
    let url = "https://www.npmjs.com/package/express";
    let JSProgram = "console.log('Hello World')";

    let response = await fetch(path.join(baseURL, "package"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Authorization": token,
      },
      body: JSON.stringify({
        URL: url,
        JSProgram: JSProgram,
      }),
    });

    expect(response.status).toBe(200);

    let object = await response.json();

    expect(object).toHaveProperty("data");
    expect(object).toHaveProperty("metadata");

    let data = object.data;
    let metadata = object.metadata;

    expect(data.Content).toBeDefined();
    expect(data.URL).toEqual(url);
    expect(data.JSProgram).toEqual(JSProgram);

    expect(metadata.Name).toEqual("express");
    expect(metadata.Version).toBeDefined();
    expect(metadata.ID).toBeDefined();
  });

  test("POST /packages", async () => {
    let response = await fetch(path.join(baseURL, "packages"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Authorization": token,
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

    let object = JSON.parse(await response.text());
    object.forEach((element: any) => {
      expect(element).toHaveProperty("Name");
      expect(element).toHaveProperty("Version");
      expect(element.Version).toEqual("1.0.0");
    });
  });

  test("GET /package/:id", async () => {
    let response = await fetch(
      path.join(baseURL, "package/6444b32de2ad5457d16b647e"),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Authorization": token,
        },
      }
    );

    expect(response.status).toBe(200);

    let object = await response.json();

    expect(object).toHaveProperty("data");
    expect(object).toHaveProperty("metadata");

    let data = object.data;
    let metadata = object.metadata;

    expect(data.Content).toBeDefined();
    expect(data.URL).toBeDefined();
    expect(data.JSProgram).toBeDefined();

    expect(metadata.Name).toEqual("react");
    expect(metadata.Version).toBeDefined();
    expect(metadata.ID).toBeDefined();
  });
});

async function authenticate(): Promise<string> {
  let response = await fetch(path.join(baseURL, "authenticate"), {
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
        password:
          "correcthorsebatterystaple123(!__+@**(A’”`;DROP TABLE packages;",
      },
    }),
  });

  console.log(await response.json());

  return (await response.json()).Token;
}
