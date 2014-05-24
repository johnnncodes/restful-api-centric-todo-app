// NOTE: localstorage cannot store boolean values so the values will be converted to string,
// it means when we get a record on localstorage, the type of the value is also string
appServices.factory('SessionService', ['localStorageService', function(localStorageService) {
    return {
        setIsAuthenticated: function(val) {
            return localStorageService.set('isAuthenticated', val);
        },

        getIsAuthenticated: function(val) {
            return localStorageService.get('isAuthenticated');
        },
        setToken: function(val) {
            return localStorageService.set('token', val);
        },

        getToken: function(val) {
            return localStorageService.get('token');
        },
    }
}]);

appServices.factory('TokenInterceptor', function ($q, $window, $location, SessionService) {
    return {
        request: function (config) {
            config.headers = config.headers || {};
            if (SessionService.getToken()) {
                config.headers.Authorization = 'Bearer ' + SessionService.getToken();
            }
            return config;
        },

        requestError: function(rejection) {
            return $q.reject(rejection);
        },

        response: function (response) {
            // save new token if there is a new token sent to the client
            if (response.data.token != undefined) {
                SessionService.setToken(response.data.token);
                console.log(SessionService.getToken());
            }

            return response || $q.when(response);
        },

        /* Revoke client authentication if 401 is received */
        // responseError: function(rejection) {
        //     if (rejection != null && rejection.status === 401 && (SessionService.getToken() || SessionService.getIsAuthenticated())) {
        //         //delete $window.sessionStorage.token;
        //         SessionService.setToken(false);
        //         SessionService.setIsAuthenticated(false);
        //         $location.path("/admin/login");
        //     }

        //     return $q.reject(rejection);
        // }
    };
});

appServices.factory('UserService', function ($http) {
    return {
        signIn: function(email, password) {
            return $http.post(options.api.base_url + '/sessions', {email: email, password: password});
        },

        register: function(email, password, passwordConfirmation) {
            return $http.post(options.api.base_url + '/accounts', {email: email, password: password, passwordConfirmation: passwordConfirmation });
        }
    }
});

appServices.factory('TodoService', function($http) {
    return {
        findAll: function() {
            return $http.get(options.api.base_url + '/todos');
        },
        findOne: function(id) {
            return $http.get(options.api.base_url + '/todos/' + id);
        },
        create: function(name) {
            return $http.post(options.api.base_url + '/todos', {'name': name});
        },
        delete: function(id) {
            return $http.delete(options.api.base_url + '/todos/' + id);
        },
        update: function(id, name) {
            return $http.put(options.api.base_url + '/todos/' + id, {'name': name});
        },
    };
});

appServices.factory('UtilsService', function() {
    return {
        parseErrors: function(passedErrors) {
            var errors = [];

            Object.keys(passedErrors).forEach(function (field) {
                console.log(passedErrors[field].message);
                errors.push(passedErrors[field].message);
            });

            return errors;
        }
    };
});

appServices.factory('TokenService', function($http) {
    return {
        refresh: function(id, name) {
            return $http.get(options.api.base_url + '/tokens/refresh');
        }
    };
});