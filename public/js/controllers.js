appControllers.controller('HomeCtrl', ['$scope', '$routeParams', '$sce',
    function HomeCtrl($scope, $routeParams, $sce) {
        console.log('render home view');
    }
]);

appControllers.controller('UserCtrl', ['$scope', '$location', '$window', 'UserService', 'SessionService', 'UtilsService',
    function UserCtrl($scope, $location, $window, UserService, SessionService, UtilsService) {
        $scope.loginForm = {};
        $scope.data = {};

        $scope.register = function register(formIsValid, username, password, passwordConfirm) {
            UserService.register(username, password, passwordConfirm).success(function(data) {
                $location.path("/login");
            }).error(function(data, status) {
                console.log(data);
                console.log(status);
                $scope.errors = UtilsService.parseErrors(data.errors);
            });
        }

        $scope.signIn = function signIn(email, password) {
            UserService.signIn(email, password).success(function(data, status) {
                SessionService.setToken(data.token);
                $location.path("/todos");
            }).error(function(data, status) {
                console.log(data);
                console.log(status);

                if (status == 401) {
                    $scope.loginForm.invalidCredentials = true;
                    $scope.data.email = '';
                    $scope.data.password = '';
                }
            });
        }
    }
]);

appControllers.controller('TodoCtrl', ['$scope', '$location', '$window', 'UserService', 'SessionService', 'TodoService', 'UtilsService',
    function TodoCtrl($scope, $location, $window, UserService, SessionService, TodoService, UtilsService) {
        $scope.todos = [];

        TodoService.findAll().success(function(data) {
            $scope.todos = data;
        });

        $scope.create = function(name) {
            TodoService.create(name).success(function(data) {
                $location.path('/todos');
            }).error(function(data, status) {
                console.log(data);
                console.log(status);
                $scope.errors = UtilsService.parseErrors(data.errors);
            });
        }

        $scope.delete = function(id) {
            TodoService.delete(id).success(function(data) {
                $location.path('/todos');
            }).error(function(status, data) {
                console.log(status);
                console.log(data);
            });
        }
    }
]);

appControllers.controller('EditTodoCtrl', ['$scope', '$location', '$window', 'UserService', 'SessionService', 'TodoService', '$routeParams', 'UtilsService',
    function EditTodoCtrl($scope, $location, $window, UserService, SessionService, TodoService, $routeParams, UtilsService) {

        $scope.todo = null;

        TodoService.findOne($routeParams.id).success(function(data) {
            $scope.todo = data;
        }).error(function(data, status) {
            console.log(data);
            console.log(status);
        });

        $scope.update = function(id, name) {
            TodoService.update(id, name).success(function(data) {
                $location.path('/todos');
            }).error(function(data, status) {
                console.log(data);
                console.log(status);
                $scope.errors = UtilsService.parseErrors(data.errors);
            });
        }
    }
]);

appControllers.controller('HeaderCtrl', ['$scope', '$location', '$window', 'UserService', 'SessionService',
    function HeaderCtrl($scope, $location, $window, UserService, SessionService) {
        $scope.SessionService = SessionService; // important! to make the watch code below work
        $scope.$watch('SessionService.getIsAuthenticated()', function(newVal) {
            $scope.isLoggedIn = newVal;
        });
    }
]);

appControllers.controller('LogoutCtrl', ['$scope', '$location', '$window', 'UserService', 'SessionService',
    function LogoutCtrl($scope, $location, $window, UserService, SessionService) {
        SessionService.setToken(null);
        $location.path("/login");
    }
]);

