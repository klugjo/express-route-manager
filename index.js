
var _ = require('lodash');

/**
 * Initialize the Route Manager
 * @param opts initialization options
 * @param opts.app express app
 * @param opts.authenticated used to check if the user is authenticated. fn(req, res, next) {..} -> call next if authenticated.
 * @param opts.checkRole used to check the role. fn(role) { return fn(req, res, next) {..}} -> call next of role is OK.
 * @constructor
 */
function RouteManager(opts) {

    var defaultActions = {

        // Encapsulation of the next callback in express routes
        next: function(req, res, next, data) {
            next();
        },
        // Render view
        render: function (req, res, next, data) {
            res.render(data.render.viewPath, data.render.viewData);
        },
        // Send back json
        json: function (req, res, next, data) {
            res.send(data.json);
        },
        // Redirect to URL
        redirect: function (req, res, next, data) {
            res.redirect(data.redirect);
        }
    };

    // Default authenticated function
    var defaultAuthenticated = function (req, res, next) {

        console.warn('No authentication function setup');

        next();
    };

    // This function should return a express route function.
    var defaultCheckRole = function (role) {

        return function (req, res, next) {

            console.warn('No check role function setup');

            next();
        };
    };


    opts = opts || {};

    this._app = opts.app;
    this._customActions = defaultActions;
    this._authenticated = opts.authenticated || defaultAuthenticated;
    this._checkRole = opts.checkRole || defaultCheckRole;

    if(opts.actions) {

        _.merge(this._customActions, opts.actions);
    }
}

/**
 * @name routeAction
 * @function
 * @param {Object} req - Request as sent by Express
 */

/**
 * set a new route
 * @param {Object} routeData - route options
 * @param {Object} routeData.app - express app if not set during init or using a different app
 * @param {string} routeData.route - Url path
 * @param {boolean} routeData.authenticated - Check if the user is authenticated
 * @param {string} routeData.role - Check if the user is in the current role
 * @param {routeAction[]} routeData.actions - Array of routeActions that will be executed in order
 */
RouteManager.prototype.set = function set(routeData){

    var app = routeData.app || this._app,
        method,
        routePath = routeData.route,
        actions = routeData.actions,
        authenticated = !!routeData.authenticated,
        role = routeData.role,
        args = [],
        self = this;

    if(!app) {
        throw new Error('No express application specified in Express Route Manager');
    }

    if(app[routeData.method] && typeof app[routeData.method] === 'function') {
        method = app[routeData.method];
    } else {
        throw new Error("Error configuring routes for " + routePath + " : method " + routeData.method + " not found.");
    }

    if(routePath) {
        args.push(routePath);
    } else {
        throw new Error("Route path not found, impossible to configure route.");
    }

    // User has to be authenticated
    if(authenticated) {
        args.push(self._authenticated);
    }

    // User has to have a specific role
    if(role) {
        args.push(self._checkRole(role));
    }

    if(actions && actions.length) {

        actions.forEach(function (action) {

            args.push(self._generateControllerAction(action));
        });
    }

    method.apply(app, args);
};

RouteManager.prototype._generateControllerAction = function generateControllerAction(controllerAction) {

    var self = this;

    return function (req, res, next) {

        // Controller must return a promise
        controllerAction(req).then(function (result) {

            // Loop through the Route Manager actions
            _.forIn(self._customActions, function (func, key) {

                // If the controller returns an object with that property, execute the function
                if(result[key]) {
                    func(req, res, next, result);
                }
            });
        });
    };
};

module.exports = RouteManager;

