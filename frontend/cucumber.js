process.env['TS_NODE_PROJECT'] = './tsconfig.cucumber.json';

module.exports = {
    default: {
        paths: ['../features/*.feature'],
        require: ['e2e/support/setup.ts', 'e2e/step-definitions/**/*.ts'],
        requireModule: ['ts-node/esm'],
        format: ['progress-bar', 'html:../reports/frontend/cucumber-report.html'],
    },
};
