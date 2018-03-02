'use strict';

//Node.js Dependencies

//NPM Dependencies

//Internal Dependencies

//Module Vars

//Module Logic

const JiraPlugin = {

    name: '_Jira',

    configName: 'jira',

    dependent: ['_Bitbucket'],

    process(config, dependenciesData) {
        return Promise.resolve();
    }

};

module.exports = JiraPlugin;
