/*jshint node:true*/

/******************************************************************
* To more easily update this blueprint to the latest ember-cli
* blueprint, it is recommended to diff this against the desired
* version of the ember-cli route blueprint index.js file to see
* what changes were implemented by the ember-cli maintainers.
******************************************************************/

var fs          = require('fs-extra');
var path        = require('path');
var inflection  = require('inflection');
var stringUtils = require('ember-cli/lib/utilities/string');
var EOL         = require('os').EOL;
var EmberRouterGenerator = require('ember-router-generator');
var WildlandStylesGenerator = require('wildland-styles-generator');

module.exports = {
  description: 'Generates a route and registers it with the router.',

  anonymousOptions: [
    'name',
    'attr:type'
  ],

  availableOptions: [
    {
      name: 'path',
      type: String,
      default: ''
    }
  ],

  locals: function(options) {
    var fullResourceName = options.entity.name;
    var resourceName = fullResourceName.split('/').pop();
    var resourceNameDasherized = stringUtils.dasherize(resourceName);
    var singularResourceNameDasherized = inflection.singularize(resourceNameDasherized);
    var resourceNameUnderscored = stringUtils.underscore(resourceNameDasherized);
    var resourceNameHumanized = inflection.humanize(resourceNameUnderscored);
    var resourceAttributes = [];
    var resourceAttributesTh = [];
    var resourceAttributesTd = [];

    var entityOptions = options.entity.options;

    for (var name in entityOptions) {
      var type = entityOptions[name] || '';
      var dasherizedName = stringUtils.dasherize(name);
      var dasherizedNameSingular = inflection.singularize(dasherizedName);
      var underscoredSingularName = stringUtils.underscore(dasherizedName);
      var humanizedSingularName = inflection.humanize(underscoredSingularName);
      var camelizedName = stringUtils.camelize(name);
      var dasherizedType = stringUtils.dasherize(type);

      if (!/has-many|belongs-to/.test(dasherizedType)) {
        resourceAttributes.push({
          type: type,
          dasherizedName: dasherizedName,
          dasherizedNameSingular: dasherizedNameSingular,
          humanizedSingularName: humanizedSingularName,
          camelizedName: camelizedName,
          dasherizedType: dasherizedType,
        });
      }
    }

    // Return custom template variables here.
    return {
      idName: fullResourceName.split('/').join('-'),
      resourceNameHumanized: resourceNameHumanized,
      singularResourceNameDasherized: singularResourceNameDasherized,
      resourceNewRoute: fullResourceName.split('/').join('.') + '.new',
      resourceIndexRoute: fullResourceName.split('/').join('.'),
      resourceShowRoute: fullResourceName.split('/').join('.') + '.show',
      resourceAttributes: resourceAttributes,
    };
  },

  fileMapTokens: function() {
    return {
      __stylesname__: function(options) {
        return options.dasherizedModuleName.split('/').join('-') + '-route';
      },
      __templatepath__: function(options) {
        return 'templates';
      },
      __routepath__: function(options) {
        return 'routes'
      },
      __templatename__: function(options) {
        return options.dasherizedModuleName;
      },
      __templateresourcename__: function(options) {
        return options.dasherizedModuleName;
      },

      __root__: function(options) {
        if (options.inRepoAddon) {
          return path.join('lib', options.inRepoAddon, 'addon');
        }

        if (options.inAddon) {
          return 'addon';
        }

        return 'app';
      }
    };
  },

  shouldTouchRouter: function(name) {
    var isIndex = name === 'index';
    var isBasic = name === 'basic';
    var isApplication = name === 'application';

    return !isBasic && !isIndex && !isApplication;
  },

  afterInstall: function(options) {
    var entity  = options.entity;

    if (this.shouldTouchRouter(entity.name) && !options.dryRun && !options.project.isEmberCLIAddon() && !options.inRepoAddon) {
      addRouteToRouter(entity.name, {
        root: options.project.root,
        path: options.path
      });

      addRouteToStyles(entity.name, {
        root: options.project.root,
        path: options.path
      });
    }
  },

  afterUninstall: function(options) {
    var entity  = options.entity;

    if (this.shouldTouchRouter(entity.name) && !options.dryRun && !options.project.isEmberCLIAddon() && !options.inRepoAddon) {
      removeRouteFromRouter(entity.name, {
        root: options.project.root
      });

      removeRouteFromStyles(entity.name, {
        root: options.project.root
      });
    }
  }
};

function removeRouteFromRouter(name, options) {
  var routerPath = path.join(options.root, 'app', 'router.js');
  var source = fs.readFileSync(routerPath, 'utf-8');

  var routes = new EmberRouterGenerator(source);
  var newRoutes = routes.remove(name);

  fs.writeFileSync(routerPath, newRoutes.code());
}

function addRouteToRouter(name, options) {
  var routerPath = path.join(options.root, 'app', 'router.js');
  var source = fs.readFileSync(routerPath, 'utf-8');

  var routes = new EmberRouterGenerator(source);
  var newRoutes = routes.add(name, options);

  fs.writeFileSync(routerPath, newRoutes.code());
}

function addRouteToStyles(name, options) {
  var appStylesPath = path.join(options.root, 'app', 'styles', 'app.less');
  var source = fs.readFileSync(appStylesPath, 'utf-8');

  var styles = new WildlandStylesGenerator(source);
  var newAppStyles = styles.addRouteSheetImport(name);

  fs.writeFileSync(appStylesPath, newAppStyles.code());
}

function removeRouteFromStyles(name, options) {
  var appStylesPath = path.join(options.root, 'app', 'styles', 'app.less');
  var source = fs.readFileSync(appStylesPath, 'utf-8');

  var styles = new WildlandStylesGenerator(source);
  var newAppStyles = styles.removeRouteSheetImport(name);

  fs.writeFileSync(appStylesPath, newAppStyles.code());
}
