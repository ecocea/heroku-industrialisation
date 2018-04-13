'use strict';

//Node.js Dependencies

//NPM Dependencies

//Internal Dependencies
const vanillaPlugins = require('./plugins');

//Module Vars
let DEBUG = false;

//Module Logic

const HerokuIndustrialisation = function (config, customPlugins) {

  if (config.DEBUG === true) {
    DEBUG = true;
  }

  let allPlugins;
  if (customPlugins && customPlugins instanceof Array) {
    allPlugins = vanillaPlugins.concat(customPlugins);
  } else {
    allPlugins = vanillaPlugins;
  }

  let validPluginNameList = [];
  let validPluginList = [];

  //Sanity check of plugins
  //Order execution of plugins
  allPlugins.forEach((plugin) => {

    if (!plugin.name || typeof plugin.name !== 'string') {
      console.log('Invalid plugin. Must contains a String named "name"');
      return;
    }

    if (!plugin.configName || typeof plugin.configName !== 'string') {
      console.log('Invalid plugin. Must contains a String named "configName"');
      return;
    }

    if (!plugin.process || typeof plugin.process !== 'function') {
      console.log('Invalid plugin. Must contains a Function named "process"');
      return;
    }

    if (plugin.dependent && (!plugin.dependent instanceof Array || (plugin.dependent instanceof Array && plugin.dependent.indexOf(plugin.name) >= 0))) {
      console.log('Invalid plugin. Dependent field, if defined, must contains an Array of plugin name, and not its own name');
      return;
    }

    if (!config[plugin.configName]) {
      debug('No config found for plugin ' + plugin.name);
      return;
    }

    if (config[plugin.configName].disabled === true) {
      debug('Plugin ' + plugin.name + ' is disabled by config.');
      return;
    }

    if (config[plugin.configName].dependent && (!config[plugin.configName].dependent instanceof Array || (config[plugin.configName].dependent instanceof Array && config[plugin.configName].dependent.indexOf(plugin.name) >= 0))) {
      console.log('Invalid plugin configuration. Dependent field, if defined, must contains an Array of plugin name, and not its own name');
      return;
    }

    //Override dependencies of plugin via config
    if (config[plugin.configName].dependent) {
      plugin.dependent = config[plugin.configName].dependent;
    }

    debug('Plugin ' + plugin.name + ' is valid.');
    validPluginNameList.push(plugin.name);
    validPluginList.push(plugin);
  });

  //Remove bad dependencies, and execute un-dependent plugins
  validPluginList.forEach((plugin) => {

    if (plugin.dependent) {
      plugin.dependent = plugin.dependent.filter((pluginDependentOfName) => {
        return validPluginNameList.indexOf(pluginDependentOfName) >= 0;
      });
      if (plugin.dependent.length === 0) {
        delete plugin.dependent;
      }
    }

    if (!plugin.dependent) {
      executePlugin(plugin);
    }

  });

  let pluginDataResponse = {};

  //Start Execution of a plugin - call process and handle response
  function executePlugin(plugin, dependenciesData) {
    debug('Plugin ' + plugin.name + ' - Start');
    //Start function process of the plugin
    plugin.process(config[plugin.configName], dependenciesData).then((dataResponse) => {
      if (dataResponse === undefined) {
        dataResponse = null;
      }
      debug('Plugin ' + plugin.name + ' - End');
      //Store response of plugin in a map
      pluginDataResponse[plugin.name] = dataResponse;

      //If all plugins have finished, force the end of process of the script (to avoid timeout of release phase, if a plugin is still waiting for actions)
      if (Object.keys(pluginDataResponse).length === validPluginList.length) {
        endIndustrialisation();
      }

      //For all valid plugins not already finished and that are dependent
      validPluginList.forEach((plugin) => {
        if (pluginDataResponse[plugin.name] === undefined && plugin.dependent) {
          let dependenciesData = [];
          //For all dependentOf plugin of a plugin, check if they are finished or not
          for (let dependentOfPluginName of plugin.dependent) {
            if (pluginDataResponse[dependentOfPluginName] === undefined) {
              debug('Plugin ' + plugin.name + ' - Still missing end of ' + dependentOfPluginName);
            } else {
              dependenciesData.push(pluginDataResponse[dependentOfPluginName.name]);
            }
          }
          //If all are finished, execute this plugin
          if (dependenciesData.length === plugin.dependent.length) {
            executePlugin(plugin, dependenciesData);
          }
        }
      });

    }).catch((err) => {
      console.log('Plugin ' + plugin.name + ' - Error');
      console.log(err);
      cancelIndustrialisation();
    });
  }

};

function cancelIndustrialisation() {
  console.log("Release phase ended with error.");
  process.exit(1);
}

function endIndustrialisation() {
  console.log("Release phase is successful.");
  process.exit(0);
}

function debug(msg) {
  if (DEBUG) {
    console.log(msg);
  }
}

module.exports = HerokuIndustrialisation;
