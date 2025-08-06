import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['ts', 'js', 'json'],
  rootDir: '.',
  testMatch: ['<rootDir>/test/**/*.spec.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'node',
};

export default config;

/* 
moduleNameMapper	Привязывает alias @/ к src/ — чтобы импорты типа @/auth/auth.service работали в тестах
transform	Преобразует TypeScript в JS при тестировании
testMatch	Указывает, где лежат тесты 
testEnvironment	Указывает среду выполнения тестов (node) 
*/