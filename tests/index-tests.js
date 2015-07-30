var q = require('q'),
    _ = require('lodash'),
    chai = require('chai'),
    expect = chai.expect,
    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),
    RouteManager = require('../index');

describe('express-route-manager tests: ', function () {

    describe('RouteManager constructor', function () {

        it('initializes the app', function () {

            var app = 'fake express app',
                routeManager = new RouteManager({app: app});

            expect(routeManager._app).to.equal(app);
        });

        it('initializes the authenticated function', function () {

            var authenticated = 'fake authenticated function',
                routeManager = new RouteManager({authenticated: authenticated});

            expect(routeManager._authenticated).to.equal(authenticated);
        });

        it('initializes the checkRole function', function () {

            var checkRole = 'fake checkRole function',
                routeManager = new RouteManager({checkRole: checkRole});

            expect(routeManager._checkRole).to.equal(checkRole);
        });

        it('adds actions to the default list of actions', function () {

            var defaultActions = new RouteManager()._customActions,
                customActions = {custom1: 'custom1', custom2: 'custom2'},
                routeManager = new RouteManager({actions: customActions});

            _.forIn(defaultActions, function (value, key) {

                expect(routeManager._customActions[key]).to.be.ok;
            });

            expect(routeManager._customActions.custom1).to.equal(customActions.custom1);
            expect(routeManager._customActions.custom2).to.equal(customActions.custom2);
        });

        it('overrides a default action if the property name is the same', function () {

            var defaultActions = new RouteManager()._customActions,
                customActions = {redirect: 'overridden redirect'},
                routeManager = new RouteManager({actions: customActions});

            expect(defaultActions.redirect).to.be.ok;
            expect(defaultActions.redirect).to.not.equal(customActions.redirect);
            expect(routeManager._customActions.redirect).to.equal(customActions.redirect);
        });
    });
});