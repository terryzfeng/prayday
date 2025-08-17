const { pathsToModuleNameMapper } = require("ts-jest");

module.exports = {
  transform: {'^.+\\.ts?$': 'ts-jest'},
  testEnvironment: 'node',
  testRegex: '/tests/.*\\.(test|spec)?\\.(ts|tsx)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    '^lib/(.*)$': '<rootDir>/src/lib/$1',
    '^utils/(.*)$': '<rootDir>/src/lib/utils/$1'
  }
};