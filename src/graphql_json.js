"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gql_query = exports.graphAPIfetch = void 0;
// const MAX_RETRIES = 1;
var fs = require("fs");
// GraphQL query to get the number of commits in the last year
var node_fetch_1 = require("node-fetch");
function graphAPIfetch(gql_query, repo) {
    return __awaiter(this, void 0, void 0, function () {
        var response, data, data2, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, (0, node_fetch_1.default)("https://api.github.com/graphql", {
                            method: "POST",
                            headers: {
                                Authorization: "Token ".concat(process.env.GITHUB_TOKEN),
                            },
                            body: JSON.stringify({ query: gql_query }),
                        })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    data2 = JSON.stringify(data, null, 2);
                    fs.writeFile("jsons/graphql" + repo + ".json", data2, function (err) {
                        if (err) {
                            console.error(err);
                        }
                    });
                    return [2 /*return*/, data];
                case 3:
                    error_1 = _a.sent();
                    console.error(error_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.graphAPIfetch = graphAPIfetch;
function gql_query(username, repo) {
    // Query to be passed to graphQL
    // :param username: GitHub username of repository owner
    // :param repo: repository name of GitHub repo
    return "\n  {\n    repository(owner: \"".concat(username, "\", name: \"").concat(repo, "\") {\n      name\n      forkCount\n      licenseInfo {\n        name\n      }\n      assignableUsers {\n        totalCount\n      }\n      sshUrl\n      latestRelease {\n        tagName\n      }\n      hasIssuesEnabled\n      issues {\n        totalCount\n      }\n      open_issues: issues(states: OPEN) {\n        totalCount\n      }\n      defaultBranchRef {\n        target {\n          ... on Commit {\n            history {\n              totalCount\n            }\n          }\n        }\n      }\n      pullRequests(states: MERGED) {\n        totalCount\n      }\n      \n      last_pushed_at: pushedAt\n      \n      stargazerCount\n      hasVulnerabilityAlertsEnabled\n    }\n  }\n  ");
}
exports.gql_query = gql_query;
