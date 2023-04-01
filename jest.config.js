module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json'
    }
  },
  testMatch: ["**/?(*.)+(spec|test).ts", "**/apitests.ts"],
  testPathIgnorePatterns: ["/node_modules/", "/src/angular_autogen/"],
  transformIgnorePatterns: ['/node_modules/(?!@angular)']
};
