module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testPathIgnorePatterns: ['/node_modules/', '<rootDir>/.docz/'],
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                // ts-jest forces `module: commonjs`, which is incompatible with the
                // `moduleResolution: bundler` / `resolvePackageJsonExports` pair in tsconfig.json.
                tsconfig: {
                    module: 'node16',
                    moduleResolution: 'node16',
                },
            },
        ],
    },
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/__tests__/**',
    ],
    coverageThreshold: {
        global: {
            branches: 100,
            functions: 100,
            lines: 100,
            statements: 100,
        },
    },
};
