var app = angular.module('app', ['ngRoute', 'appControllers', 'appServices', 'appDirectives', 'LocalStorageModule']);

var appServices = angular.module('appServices', []);
var appControllers = angular.module('appControllers', []);
var appDirectives = angular.module('appDirectives', []);

var options = {};
options.api = {};
options.api.base_url = "http://localhost:3000/api/v1";

var redirectIfAuthenticated = function(route) {
    return function($location, $q, SessionService) {

        var deferred = $q.defer();

        if (SessionService.getIsAuthenticated() == 'true' && SessionService.getToken() != 'false') {
            deferred.reject()
            $location.path(route);
        } else {
            deferred.resolve()
        }

        return deferred.promise;
    }
}

var loginRequired = function($location, SessionService, $q, $timeout) {
    var deferred = $q.defer();

    if(SessionService.getIsAuthenticated() == 'false' && SessionService.getToken() == 'false') {
        deferred.reject()
        $location.path('/login');
    } else {
        deferred.resolve()
    }

    return deferred.promise;
}

var refreshToken = function(SessionService, TokenService) {
    if (SessionService.getIsAuthenticated() == 'true' && SessionService.getToken() != 'false') {
        TokenService.refresh().success(function(data) {
            console.log('token successfully refreshed');
        }).error(function(data, status) {
            console.log(data);
            console.log(status);
            console.log('failed to refresh token');
        });
    }
}

app.config(['$locationProvider', '$routeProvider',
    function($location, $routeProvider) {
        $routeProvider.
            when('/', {
                templateUrl: '/js/templates/home.html',
                controller: 'HomeCtrl',
                resolve: { refreshToken: refreshToken }
            }).
            when('/register', {
                templateUrl: '/js/templates/register.html',
                controller: 'UserCtrl',
                resolve: { redirectIfAuthenticated: redirectIfAuthenticated('/todos') }
            }).
            when('/login', {
                templateUrl: '/js/templates/login.html',
                controller: 'UserCtrl',
                resolve: { redirectIfAuthenticated: redirectIfAuthenticated('/todos') }
            }).
            when('/logout', {
                templateUrl: '/js/templates/logout.html',
                controller: 'LogoutCtrl'
            }).
            when('/todos', {
                templateUrl: '/js/templates/todos/index.html',
                controller: 'TodoCtrl',
                resolve: { loginRequired: loginRequired }
            }).
            when('/todos/create', {
                templateUrl: '/js/templates/todos/create.html',
                controller: 'TodoCtrl',
                resolve: { loginRequired: loginRequired }
            }).
            when('/todos/:id/edit', {
                templateUrl: '/js/templates/todos/edit.html',
                controller: 'EditTodoCtrl',
                resolve: { loginRequired: loginRequired }
            }).
            otherwise({
                redirectTo: '/'
            });
    }
]);

app.config(function ($httpProvider) {
    $httpProvider.interceptors.push('TokenInterceptor');
});