import fs from "fs";
import path from "path";
import { connectToMongo, disconnectFromMongo } from "../src/config/config";
import { exportedForTestingApp } from "../src/app";
const { defineServer, startServer } = exportedForTestingApp;
import {logger} from "../src/logging";

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

jest.setTimeout(60 * 1000);

let baseURL: string = "http://localhost:3000/";

beforeAll(() => {
  let app = defineServer();
  startServer(app);
});

afterAll(() => {

});

beforeEach(async () => {
  await connectToMongo();
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
      }
    }).then(async (response) => {
      console.log(response.text());
    }).then(async (data) => {
      console.log(data);
    }).catch((error) => {
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
      })
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
      })
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
        Content: fs.readFileSync(path.join(__dirname, "lodash_base64"), "utf-8"),
        JSProgram: "test",
      })
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
        JSProgram: "console.log('Hello World')"
      })
    });

    expect(response.status).toBe(409);
  });
});