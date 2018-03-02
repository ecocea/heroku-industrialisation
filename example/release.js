'use strict';

//Node.js Dependencies

//NPM Dependencies

//Internal Dependencies
const herokuIndustrialisation = require('../');
const helloPlugin = require('./hello.plugin');

//Module Vars
const IndustrialisationConfig = {
    DEBUG: true,
    hello: {
        msg: 'Hello World !'
    },
    email: {
        disabled: false,
        dependent: ['_Bitbucket','_Jira','Hello']
    },
    bitbucket: {
    },
    jira: {
        disabled: true,
        user: "jiraUser",
        password: "jiraPassword"
    }
};

//Module Logic

herokuIndustrialisation(IndustrialisationConfig, [helloPlugin]);
