module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ["**/?(*.)+(spec|test).ts", "**/apitests.ts"],
  testPathIgnorePatterns: ["/node_modules/", "/src/angular_autogen/"],
  transformIgnorePatterns: ['/node_modules/(?!@angular)'],
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  }
};
