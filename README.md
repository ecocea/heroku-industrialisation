# @ecocea/heroku-industrialisation
Collection of Heroku Industrialisation scripts for Node.JS  
  
Execute a list of actions contained in plugins. Some plugins are provided, and you have the ability to create your own.

### Prerequisites
Tested on Node.js 8+  
Requires ES6 compatibility  
Designed for Heroku Release Phase.

### Installation
```sh
npm install @ecocea/heroku-industrialisation --save
```

### Initialisation
```javascript
//Configuration object containing a key for each plugin (configName). Use of @ecocea/config-loader is recommanded.
//During Release Phase, Heroku has access to the Config Vars.
const config = {/*...*/};

//List of custom plugins (object). Optional parameter.
const customPlugins = [/*...*/];

//Import the package
const herokuIndustrialisation = require('@ecocea/heroku-industrialisation');

//Call Logic of the package
herokuIndustrialisation(config, customPlugins);
```

### Plugin
A plugin is an object containing following fields:
- __name__: _(String)_ Name of the plugin. Should be unique, and not begin by _ (reserved for official plugins)
- __configName__: _(String)_ Name of the property of the Configuration Object passed as first argument of main function of @ecocea/heroku-industrialisation
- __dependent__: _(Array<String>) optional_ List of name of other plugins that should be executed before this one. If the plugin is not found, or disabled, he is ignored. This field can be overwritten in Configuration Object
- __process__: _(Function)_ Main Logic of the plugin, takes two parameters:
  - config: _(Object)_ Specific configuration for this plugin
  - dependenciesData: _(Array\<Object>)_ Contains the data returned by plugins, in the order they are declared 
  
### Configuration
A global Object containing Plugin Configuration Object. Each key should be associated to a plugin configName.  

The key "DEBUG" set to true allows to display debug logs displayed.  

If the config of a plugin is not found, this plugin won't be executed. Adding a property "disabled" to true in Plugin Configuration Object allow to disable a plugin without deleting the configuration.

Adding a property "dependent" allow to override the dependent property of the plugin. Be careful ! Modifying dependent field may break the logic of a plugin. This function is designed to delay some plugins, allowing them to be executed after some others, but without managing response of these plugins.
