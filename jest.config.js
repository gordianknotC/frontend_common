/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */

module.exports = {
  // jsdom
  // https://github.com/kulshekhar/ts-jest/issues/3843
  // https://github.com/kulshekhar/ts-jest/issues/3843#issuecomment-1284309976
  testEnvironment: "jsdom",
  extensionsToTreatAsEsm: ['.ts'], // this is required in Jest doc https://jestjs.io/docs/next/configuration#extensionstotreatasesm-arraystring
  transform: {
    "^.+\.m?[tj]sx?$": [
      "ts-jest",
      {
        useESM: true, // this tells `ts-jest` ready to transform files to ESM syntax
      },
    ],
  },
  testRegex: ["(/__tests__/.*|(\\.|/)(test|spec))\\.[jt]sx?$"],
  testPathIgnorePatterns: ["/node_modules/", "/__tests__/__mocks__/.*"],
  roots: [
    "<rootDir>",
  ],
  modulePaths: [
    "<rootDir>/src"
  ],
  moduleDirectories: [
    "node_modules",
    "<rootDir>/src"
  ],
  moduleNameMapper: {
    "@/(.*)": [
      "<rootDir>/src/$1",
    ],
    "~/(.*)": [
      "<rootDir>/src/$1",
    ]
  },
  globals: {
  }
};
