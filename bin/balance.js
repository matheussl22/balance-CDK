#!/usr/bin/env node

const cdk = require('aws-cdk-lib');
const { Balance } = require('../lib/balance-stack');

const app = new cdk.App();
new Balance(app, 'Balance', {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION,
    }
});
