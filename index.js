
var defaultActions = [
    {
        name: 'next',
        func: function(req, res, next, data) {
            next();
        }
    },
    {
        name: 'render',
        func: function (req, res, next, data) {
            res.render(data.render.viewPath, data.render.viewData);
        }
    },
    {
        name: 'json',
        func: function (req, res, next, data) {
            res.send(data.json);
        }
    },
    {
        name: 'redirect',
        func: function (req, res, next, data) {
            res.redirect(data.redirect);
        }
    }
];

function RouteManager(opts) {

    this._app = opts.app;
    this._customActions = opts.actions;
    this._authenticated = opts.authenticated;
    this._checkRole = opts.checkRole;
}

RouteManager.prototype.set = function set(routeData){

    var app = routeData.app || this._app,
        method,
        routePath = routeData.route,
        actions = routeData.actions,
        authenticated = !!routeData.authenticated,
        role = routeData.role,
        args = [];

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
        args.push(this._authenticated);
    }

    // User has to have a specific role
    if(role) {
        args.push(this._checkRole);
    }

    if(actions && actions.length) {

        actions.forEach(function (action) {

            args.push(generateControllerAction(action));
        });
    }

    method.apply(app, args);
};

function generateControllerAction(controllerAction) {

    return function (req, res, next) {

        // Controller must return a promise
        controllerAction(req).then(function (result) {

            var i,
                len = defaultActions.length,
                routeAction;

            // Loop through the Route Manager actions
            for(i = 0; i < len; i = i + 1) {

                routeAction = defaultActions[i];

                // If the controller returns an object with that property, execute the function
                if(result[routeAction.name]) {

                    routeAction.func(req, res, next, result);
                }
            }
        });
    };
}

module.exports = RouteManager;
