module.exports = {
    default: {
        features: ['e2e/features/**/*.feature'],
        require: ['e2e/step-definitions/**/*.ts'],
        requireModule: ['ts-node/register'],
        format: ['progress-bar', 'html:reports/cucumber-report.html'],
        publishQuiet: true,
    },
};
