var m = angular.module('login', ['ui.router']);
angular.element(document).ready(function () {
    angular.bootstrap(document, ['login']);
});
if (!window.console) {
    window.console = {
        log: function () {

        }
    }
}

m.run(['$rootScope', function ($rootScope) {
    $rootScope.nv = {};
    $rootScope.nv.user = session;
}]);

m.config(['$stateProvider', '$urlRouterProvider', '$httpProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $httpProvider, $locationProvider) {
    $locationProvider.html5Mode({enabled: true}).hashPrefix('!');
    $urlRouterProvider.when('', '/');
    if (session && session.role == 'instructor') {
        $urlRouterProvider.otherwise('/register');
        $stateProvider.state('register', {
            url: '/register',
            templateUrl: '/pages/login/instructor_register.html',
            controller: function ($scope, $http) {
                $scope.fields = {};
                $scope.errors = {};
                $scope.register = function () {
                    $scope.errors = {};
                    var data = $scope.fields;
                    var mandatory_fields = ['mobile_number', 'bio', 'payout_method'];
                    mandatory_fields.forEach(function (field) {
                        if (!data[field]) {
                            $scope.errors[field] = 'Mandatory Field';
                        }
                    });
                    if (Object.keys($scope.errors).length) {
                        return;
                    }
                    $http.put('/entity/nv.users/' + session._id, {data: data}).success(function (data, status) {
                        window.location.reload();
                    }).error(function (data, status) {
                        $scope.errors.error = data;
                    })
                }
            }
        });
    } else {
        $urlRouterProvider.otherwise('/');
        $stateProvider.state('home', {
            url: '/',
            templateUrl: '/pages/login/home.html',
            controller: function ($scope, $http) {
                $scope.route_login = function () {
                    window.location.href = window.location.origin + '/login';
                };
                $scope.route_register = function () {
                    window.location.href = window.location.origin + '/register';
                };
                $scope.data = {};
                $scope.errors = {};
                $scope.messageSend = false;
                $scope.sendEnquiry = function () {
                    $scope.errors = {};
                    var mandatory = ['name', 'email', 'message'];
                    mandatory.forEach(function (mand) {
                        if (!$scope.data[mand]) {
                            $scope.errors[mand] = 'Missing mandatory field';
                        }
                    });
                    var request = {
                        entity: 'nv.classes',
                        data: $scope.data
                    };
                    $http.post('/entity/nv.classes/_/sendEnquiry', {data: $scope.data}).success(function (data, status) {
                        console.log('=====data=====', data);
                        $scope.data = {};
                        $scope.messageSend = true;
                    });
                }
            }
        });
        $stateProvider.state('login', {
            url: '/login',
            templateUrl: '/pages/login/login.html',
            controller: function ($scope, $http) {
                $scope.fields = {};
                $scope.fields.type = 'fitness_user';
                $scope.facebook_login = function () {
                    window.open('/auth/facebook?role=' + $scope.fields.type, 'facebook', 'height=500,width=500');
                };
                $scope.login = function () {
                    $scope.errors = {};
                    var data = $scope.fields;
                    if (!data.email) {
                        $scope.errors.email = 'Mandatory Field';
                    }
                    if (!data.password) {
                        $scope.errors.password = 'Mandatory Field';
                    }
                    if (Object.keys($scope.errors).length) {
                        return;
                    }
                    data.role = 'gym_owner';
                    $http.post('/entity/nv.users/_/login_new?login=true', {data: data}).success(function (data, status) {
                        window.location.reload();
                    }).error(function (data, status) {
                        $scope.errors.error = data;
                    })
                };
            }
        });
        $stateProvider.state('register', {
            url: '/register',
            templateUrl: '/pages/login/register.html',
            controller: function ($scope, $http, $rootScope) {
                $scope.fields = {};
                $scope.errors = {};
                $scope.fields = {};
                $scope.fields['monday'] = {};
                $scope.fields['tuesday'] = {};
                $scope.fields['wednesday'] = {};
                $scope.fields['thursday'] = {};
                $scope.fields['friday'] = {};
                $scope.fields['saturday'] = {};
                $scope.fields['sunday'] = {};
                $scope.errors.error = 'Please enable location';
                navigator.geolocation.getCurrentPosition(showPosition);
                var save_data = {};
                $scope.selected_location = {};
                function showPosition(position) {
                    delete $scope.errors.error;
                    save_data.latitude = position.coords.latitude;
                    save_data.longitude = position.coords.longitude;
                    $scope.latlng = true;
                    var url = "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + position.coords.latitude + "," + position.coords.longitude + "&sensor=true";
                    $http.get(url).success(function (data, status) {
                        if (data.status == 'OK') {
                            $scope.fields.address = data.results[0].formatted_address;
                            save_data.address = data.results[0].formatted_address;
                        }
                    });
                }

                function initMap() {
                    var map = new google.maps.Map(document.getElementById('map'), {
                        zoom: 4,
                        center: {
                            lat: save_data.latitude ? save_data.latitude : 28.38173504322308,
                            lng: save_data.longitude ? save_data.longitude : 76.96609497070312
                        },
                        mapTypeId: google.maps.MapTypeId.ROADMAP
                    });
                    /*    var listener = $scope.$watch('latlng', function (newVal, oldVal) {
                     listener();
                     console.log('======here================', newVal, oldVal);
                     setTimeout(function () {
                     console.log(new google.maps.LatLng($scope.latlng.latitude, $scope.latlng.longitude), '======save_data.longitude', $scope.latlng.longitude)
                     placeMarkerAndPanTo(new google.maps.LatLng($scope.latlng.latitude, $scope.latlng.longitude), map);
                     }, 100);
                     });*/
                    map.addListener('click', function (e) {
                        $scope.selected_location = {
                            longitude: e.latLng.lng(),
                            latitude: e.latLng.lat()
                        };
                        markers.forEach(function (marker) {
                            marker.setMap(null);
                        });
                        placeMarkerAndPanTo(e.latLng, map);
                    });
                }

                var markers = [];

                function placeMarkerAndPanTo(latLng, map) {
                    var marker = new google.maps.Marker({
                        position: latLng,
                        map: map
                    });
                    markers.push(marker);
                    map.panTo(latLng);
                }

                $scope.initialize = function () {
                    console.log('======here===========');
                    initMap();
                };
                $scope.set_location = function () {
                    if ($scope.selected_location && $scope.selected_location.latitude && $scope.selected_location.longitude) {
                        var url = "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + $scope.selected_location.latitude + "," + $scope.selected_location.longitude + "&sensor=true";
                        $http.get(url).success(function (data, status) {
                            if (data.status == 'OK') {
                                $scope.fields.address = data.results[0].formatted_address;
                                save_data.address = data.results[0].formatted_address;
                            }
                        });
                    }
                };
                $scope.register = function () {
                    $scope.errors = {};
                    var data = $scope.fields;
                    var mandatory_fields = ['name', 'email', 'password', 'confirm_password', 'phone', 'description', 'cost_per_session', 'payout_method', 'address'];
                    mandatory_fields.forEach(function (field) {
                        if (!data[field]) {
                            $scope.errors[field] = 'Mandatory Field';
                        }
                    });
                    if (Object.keys($scope.errors).length) {
                        return;
                    }
                    var flag = false;
                    var days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                    days.forEach(function (day, index) {
                        if (!data[day]) {
                            data[day] = {};
                        }
                        if (data[day].start_time && data[day].end_time) {
                            if (parseFloat(data[day].start_time.replace(':', '')) >= parseFloat(data[day].end_time.replace(':', ''))) {
                                $scope.errors.error = 'Start time should not be greater than or equal to end time';
                                return;
                            }
                            flag = true;
                            if (!data.schedule) {
                                data.schedule = [];
                            }
                            data.schedule.push({
                                schedule_day: [String(index)],
                                schedule_time: data[day].start_time + '-' + data[day].end_time
                            })
                        }
                        delete data[day];
                    });
                    if ($scope.errors.error) {
                        return;
                    }
                    if (!flag) {
                        $scope.errors.select_working_days = 'Mandatory Field';
                    }
                    if (data.password != data.confirm_password) {
                        $scope.errors.confirm_password = 'Password and confirm password donot match';
                    }
                    data.latitude = save_data.latitude;
                    data.longitude = save_data.longitude;
                    data.address = save_data.address;
                    if (Object.keys($scope.errors).length) {
                        return;
                    }
                    data['role'] = 'gym_owner';
                    $rootScope.pendingRequest = true;
                    $http.post('/entity/nv.users/_/register_new', {data: data}).success(function (data, status) {
                        $rootScope.pendingRequest = false;
                        window.location.reload();
                    }).error(function (data, status) {
                        $rootScope.pendingRequest = false;
                        $scope.errors.error = data;
                    })
                }
            }
        });
    }
}]);

m.controller('loginCtrl', ['$scope', '$http', '$rootScope', function ($scope, $http, $rootScope) {
    function isLogged() {
        $http.get('/entity/nv.users/_/isLoggedIn').success(function (data) {
            //ms_store.user = data;
            //todo : default user hack to be removed
            window.location.reload();
        }).error(function () {
            console.log('user is not logged in');
        });
        if (!$rootScope.$$phase) {
            $rootScope.$apply();
            //AngularJS 1.1.4 fix
        }
    }

    $scope.show_header = true;
    window.afterLogin = function () {
        isLogged();
    };
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
        if (toState.url == '/') {
            $scope.show_header = false;
        } else {
            $scope.show_header = true;
        }
    })
}]);
