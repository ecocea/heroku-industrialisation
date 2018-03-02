'use strict';

//Node.js Dependencies

//NPM Dependencies

//Internal Dependencies

//Module Vars

//Module Logic

const HelloPlugin = {

    name: 'Hello',

    configName: 'hello',

    process(config) {
        console.log(config.msg);
        return Promise.resolve();
    }

};

module.exports = HelloPlugin;
