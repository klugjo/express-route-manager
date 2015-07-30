# express-route-manager

Allows you to setup expressJS routes and use easy to test controllers.

## Basic example

### Setup route

This is how you setup your routes using the route manager

```javascript
routeManager.set({
    method: 'get', // Method can be any of the methods supported by express
    route: '/test-json', // The route as you would set it up in Express
    authenticated: true, // If the user should be authenticated (Optional)
    role: 'admin', // If the user should be of a specific role (Optional)
    actions: [controller.returnJson] // The controller actions to be executed
});
```
### Setup controller

This is what your controller method should look like

```javascript
// No res or next here
exports.returnJson = function (req) {

// Or use any other promise framework
var deferred = Q.defer();

// Do anything async here
setTimeout(function () {

    deferred.resolve({
        // The res will be generated based on the 
        // name of the object returned.
        // Here JSON
        json: {
            test: 'test'
        }
    });
}, 500);

return deferred.promise;
};
```

This controller is easier to test because you only have to mock the request. To facilitate development in general, the controller should always return promises.

### Result

This is what will be returned when hitting `/test-json`

```javascript
{
    test: "test"
}
```

## How it works

### Response types

There are 4 default response types:

- `json`: returns a JSON object
- `render`: renders a view
- `redirect`: redirects to a different URL
- `next`: invoked the next controller action in the list

Based on the name of the object returned by the controller, the route manager will pick the right method and generate the express route callback function.

#### Example: JSON:

This is what the default json route manager action looks like:

```javascript
json: function (req, res, next, data) {
    res.send(data.json);
}
```

If the controller returns `{json: { // Object to return ... }}`, the route manager will execute `res.send({ // Object to return ... });`

Keep in mind that controllers should always return promises.

#### Example: Render a view

This is what the default render route manager action looks like:

```javascript
render: function (req, res, next, data) {
    res.render(data.render.viewPath, data.render.viewData);
}
```

If the controller returns `{render: {viewPath: '/path/to/view', viewData: obj}}`, the route manager will execute `res.render('/path/to/view', obj);`

### Custom actions

You can override the default actions or add new one when initializing the route manager.

### Authentication and roles

You can specify an `authenticated` function and a `checkRole` function when initializing the route manager. Checking if a certain user is allowed then become as simple as:

```javascript
    routeManager.set({
        method: 'get',
        route: '/test-json',
        authenticated: true, // User has to be authenticated
        role: 'admin', // User has to be in the admin role
        actions: [ctrl.jsonTest]
    });
```

