var m = angular.module('nvapp', ['ui.router']);

angular.element(document).ready(function () {
    angular.bootstrap(document, ['nvapp']);
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
m.factory('app', ['$http', '$rootScope', function ($http, $rootScope) {
    var entity_commands = function (entityName) {
        var self = this;
        self.list = function (params, next) {
            var url = "/entity/" + entityName;
            $rootScope.pendingRequest = true;
            $http.get(url, {params: params}).success(function (data, status) {
                $rootScope.pendingRequest = false;
                next(null, {data: data, status: status});
            }).error(function (data, status) {
                $rootScope.pendingRequest = false;
                next({data: data, status: status}, null);
            })
        };
        self.get = function (resourceId, next) {
            var url = "/entity/" + entityName + '/' + resourceId;
            $rootScope.pendingRequest = true;
            $http.get(url).success(function (data, status) {
                $rootScope.pendingRequest = false;
                next(null, {data: data, status: status});
            }).error(function (data, status) {
                $rootScope.pendingRequest = false;
                next({data: data, status: status}, null);
            })
        };
        self.edit = function (resourceId, params, next) {
            var url = "/entity/" + entityName + '/' + resourceId;
            $rootScope.pendingRequest = true;
            $http.put(url, params).success(function (data, status) {
                $rootScope.pendingRequest = false;
                next(null, {data: data, status: status});
            }).error(function (data, status) {
                $rootScope.pendingRequest = false;
                next({data: data, status: status}, null);
            });
        };
        self['delete'] = function (resourceId, next) {
            var url = "/entity/" + entityName + '/' + resourceId;
            $rootScope.pendingRequest = true;
            $http['delete'](url).success(function (data, status) {
                $rootScope.pendingRequest = false;
                next(null, {data: data, status: status});
            }).error(function (data, status) {
                $rootScope.pendingRequest = false;
                next({data: data, status: status}, null);
            });
        };
        self.add = function (params, next) {
            var url = "/entity/" + entityName;
            $rootScope.pendingRequest = true;
            $http.post(url, params).success(function (data, status) {
                $rootScope.pendingRequest = false;
                next(null, {data: data, status: status});
            }).error(function (data, status) {
                $rootScope.pendingRequest = false;
                next({data: data, status: status}, null);
            });
        };
        self.call = function (method, command, params, next) {
            var url = "/entity/" + entityName + "/_/" + command;
            $rootScope.pendingRequest = true;
            $http[method](url, params).success(function (data, status) {
                $rootScope.pendingRequest = false;
                next(null, {data: data, status: status});
            }).error(function (data, status) {
                $rootScope.pendingRequest = false;
                next({data: data, status: status}, null);
            });
        }
    };
    var Application = function () {
        var self = this;
        self.call = function (command, request, cb) {
            request.command = command;
            if (!request.entity) {
                console.log("please specify the entity name in app service call method");
                cb({status: 400, data: 'please specify the entity name in app service call method'});
                return;
            }
            var entity = new entity_commands(request.entity);
            switch (command) {
                case 'list':
                    if (!request.query) {
                        request.query = {};
                    }
                    entity.list(request.query, function (err, response) {
                        cb(err, response);
                    });
                    break;
                case 'get':
                    if (!request.resourceId) {
                        console.log("please specify the resourceID in app service get method");
                        cb({status: 400, data: 'please specify the resourceID in app service get method'});
                        return;
                    }
                    entity.get(request.resourceId, function (err, response) {
                        cb(err, response);
                    });
                    break;
                case 'edit':
                    if (!request.resourceId || !request.data) {
                        console.log("please specify the resourceId and data in app service edit method");
                        cb({
                            status: 400,
                            data: 'please specify the resourceId and data in app service edit method'
                        });
                        return;
                    }
                    entity.edit(request.resourceId, {data: request.data}, function (err, response) {
                        cb(err, response);
                    });
                    break;
                case 'delete':
                    if (!request.resourceId) {
                        console.log("please specify the resourceID in app service delete method");
                        cb({status: 400, data: 'please specify the resourceID in app service delete method'});
                        return;
                    }
                    entity.delete(request.resourceId, function (err, response) {
                        cb(err, response);
                    });
                    break;
                case 'add':
                    if (!request.data) {
                        console.log("please specify the data in app service add method");
                        cb({status: 400, data: 'please specify the data in app service add method'});
                        return;
                    }
                    entity.add({data: request.data}, function (err, response) {
                        cb(err, response);
                    });
                    break;
                default:
                    var method = 'post';
                    if (request.method) {
                        if (request.method.toLowerCase() == 'get') {
                            method = 'get';
                        } else if (request.method.toLowerCase() == 'put') {
                            method = 'put';
                        }
                    }
                    if (!request.data) {
                        request.data = {};
                    }
                    entity.call(method, command, {data: request.data}, function (err, response) {
                        cb(err, response);
                    });
                    break;
            }
        };
        self.add = function (request, next) {
            self.call('add', request, next);
        };
        self.list = function (request, next) {
            self.call('list', request, next);
        };
        self.get = function (request, next) {
            self.call('get', request, next);
        };
        self.update = function (request, next) {
            self.call('edit', request, next);
        };
        self.del = function (request, next) {
            self.call('delete', request, next);
        };
    };
    return new Application();
}]);
m.config(['$stateProvider', '$urlRouterProvider', '$httpProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $httpProvider, $locationProvider) {
    $locationProvider.html5Mode({enabled: true}).hashPrefix('!');
    $urlRouterProvider.when('', '/');
    $urlRouterProvider.otherwise('/');
    if (session.role == 'fitness_user') {
        $stateProvider.state('home', {
            url: '/',
            templateUrl: '/pages/main/user_dashboard.html',
            controller: function ($state) {
                if (location.pathname == '/')
                    $state.transitionTo('home.dashboard');
            }
        });
        $stateProvider.state('home.classes_info', {
            url: 'class/:id',
            templateUrl: '/pages/main/classes.html',
            controller: function ($stateParams, $scope, app, $rootScope, $http) {
                var request = {
                    entity: 'nv.classes',
                    resourceId: $stateParams.id
                };
                app.get(request, function (err, response) {
                    $scope.class_info = response.data;
                });
                var windowRefernce;
                $scope.book_class = function () {
                    $rootScope.pendingRequest = true;
                    var html = '<body style="text-align:center; margin-top:20%">' +
                        '<div class="container">' +
                        '<link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css" rel="stylesheet">' +
                        '<style>' +
                        '.glyphicon-refresh-animate {' +
                        '-animation: spin .7s infinite linear;' +
                        '-webkit-animation: spin2 .7s infinite linear;' +
                        '}' +

                        '@-webkit-keyframes spin2 {' +
                        'from { -webkit-transform: rotate(0deg);}' +
                        'to { -webkit-transform: rotate(360deg);}' +
                        '}' +

                        '@keyframes spin {' +
                        'from { transform: scale(1) rotate(0deg);}' +
                        'to { transform: scale(1) rotate(360deg);}' +
                        '}' +
                        '</style>' +
                        '<button class="btn btn-lg btn-success"><span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span> Loading...</button>' +
                        "</div>" +
                        "</body>";
                    windowRefernce = window.open("", "mywindow1", "location=1,status=1,scrollbars=1,height=1200,width=1200");
                    windowRefernce.document.write(html);
                    $http.post('/payment/class', {
                        class_id: $stateParams.id,
                        class_group_id: $scope.class_info.class_group_id
                    }).success(function (data, status) {
                        $rootScope.pendingRequest = false;
                        windowRefernce.close();
                        windowRefernce = window.open("", "mywindow1", "location=1,status=1,scrollbars=1,height=1200,width=1200");
                        windowRefernce.document.write(data);
                    }).error(function (data, status) {
                        windowRefernce.close();
                        $scope.payment_error = data;
                        $rootScope.pendingRequest = false;
                    })
                }
            }
        });
        $stateProvider.state('home.gym_info', {
            url: 'gym/:id',
            templateUrl: '/pages/main/gym.html',
            controller: function ($stateParams, $scope, app, $http, $rootScope) {
                var request = {
                    entity: 'nv.users',
                    resourceId: $stateParams.id
                };
                app.get(request, function (err, response) {
                    $scope.gym_info = response.data;
                });
                $scope.payment_error = null;
                var windowRefernce;
                $scope.book_gym = function () {
                    $rootScope.pendingRequest = true;
                    var html = '<body style="text-align:center; margin-top:20%">' +
                        '<div class="container">' +
                        '<link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css" rel="stylesheet">' +
                        '<style>' +
                        '.glyphicon-refresh-animate {' +
                        '-animation: spin .7s infinite linear;' +
                        '-webkit-animation: spin2 .7s infinite linear;' +
                        '}' +

                        '@-webkit-keyframes spin2 {' +
                        'from { -webkit-transform: rotate(0deg);}' +
                        'to { -webkit-transform: rotate(360deg);}' +
                        '}' +

                        '@keyframes spin {' +
                        'from { transform: scale(1) rotate(0deg);}' +
                        'to { transform: scale(1) rotate(360deg);}' +
                        '}' +
                        '</style>' +
                        '<button class="btn btn-lg btn-success"><span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span> Loading...</button>' +
                        "</div>" +
                        "</body>";
                    windowRefernce = window.open("", "mywindow1", "location=1,status=1,scrollbars=1,height=1200,width=1200");
                    windowRefernce.document.write(html);
                    $http.post('/payment/gym', {gym_id: $stateParams.id}).success(function (data, status) {
                        $rootScope.pendingRequest = false;
                        windowRefernce.close();
                        windowRefernce = window.open("", "mywindow1", "location=1,status=1,scrollbars=1,height=1200,width=1200");
                        windowRefernce.document.write(data);
                    }).error(function (data, status) {
                        windowRefernce.close();
                        $scope.payment_error = data;
                        $rootScope.pendingRequest = false;
                    })
                }
            }
        });
        $stateProvider.state('home.dashboard', {
            url: 'dashboard',
            templateUrl: '/pages/main/dashboard.html',
            controller: function ($scope, app, $rootScope) {
                $scope.mobileView = false;
                function showMap(data) {
                    navigator.geolocation.getCurrentPosition(showPosition);
                    function showPosition(position) {
                        $scope.error = null;
                        var request = {
                            entity: 'nv.classes',
                            data: {
                                latitude: position.coords.latitude,
                                longitude: position.coords.longitude
                            }
                        };
                        if (data) {
                            Object.keys(data).forEach(function (d) {
                                request.data[d] = data[d];
                            });
                        }
                        app.call('getClasses', request, function (err, response) {
                            var records = response.data.data.records;
                            var classes = records.classes;
                            var gym = records.gym;
                            var latitude = [];
                            var longitude = [];
                            classes.forEach(function (classs) {
                                latitude.push(parseFloat(classs.latitude));
                                longitude.push(parseFloat(classs.longitude))
                            });
                            gym.forEach(function (classs) {
                                latitude.push(parseFloat(classs.latitude));
                                longitude.push(parseFloat(classs.longitude))
                            });
                            latitude.sort();
                            longitude.sort();
                            if (!latitude.length) {
                                $scope.error = "No Class Found";
                                latitude.push(28);
                            }
                            if (!longitude.length) {
                                longitude.push(77);
                            }
                            console.log(latitude[0], longitude[0]);
                            var mapOptions = {
                                zoom: 4,
                                center: new google.maps.LatLng(latitude[0], longitude[0]),
                                mapTypeId: google.maps.MapTypeId.ROADMAP
                            };
                            $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);
                            classes.forEach(function (classs) {
                                var position1 = {
                                    latitude: parseFloat(classs.latitude),
                                    longitude: parseFloat(classs.longitude),
                                    name: classs.class_name,
                                    _id: classs._id,
                                    instructor_class: true
                                };
                                createMarker(position1);
                            });
                            gym.forEach(function (classs) {
                                var position1 = {
                                    latitude: parseFloat(classs.latitude),
                                    longitude: parseFloat(classs.longitude),
                                    name: classs.name,
                                    _id: classs._id,
                                    instructor_class: false
                                };
                                createMarker(position1);
                            });
                        })
                    }
                }

                if (window.innerWidth < 768) {
                    $scope.mobileView = true;
                }
                var data = {
                    day: [String(new Date().getDay())]
                };
                if (new Date().getDay() == 6) {
                    data.day.push(String(0));
                } else {
                    data.day.push(String(new Date().getDay() + 1));
                }
                showMap(data);
                var infoWindow = new google.maps.InfoWindow();
                $scope.error = 'Please Enable Location';
                var mapOptions = {
                    zoom: 4,
                    center: new google.maps.LatLng(28, 77),
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                };
                $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);
                function createMarker(city) {
                    var marker = new google.maps.Marker({
                        map: $scope.map,
                        position: new google.maps.LatLng(city.latitude, city.longitude)
                    });
                    var showClass = "show_class('" + city._id + "'," + city.instructor_class + ")";
                    var content = "<h4>" + city.name.toUpperCase() + "</h4><button class='btn btn-info' onClick=" + showClass + ">Show Class</button>"
                    google.maps.event.addListener(marker, 'click', function () {
                        infoWindow.setContent(content);
                        infoWindow.open($scope.map, marker);
                    });
                }

                $scope.search = function () {
                    var data = {
                        day: [String(new Date().getDay())],
                        keywords: $scope.searchText
                    };
                    if (new Date().getDay() == 6) {
                        data.day.push(String(0));
                    } else {
                        data.day.push(String(new Date().getDay() + 1));
                    }
                    if ($rootScope.pendingRequest) {
                        return;
                    }
                    showMap(data);
                }
            }
        });
        $stateProvider.state('home.profile', {
            url: 'profile',
            templateUrl: '/pages/main/user_profile.html',
            controller: function ($scope, $rootScope, app) {
                $scope.showEdit = false;
                $scope.showEditForm = function () {
                    $scope.showEdit = true;
                    $scope.data = $rootScope.nv.user;
                };
                $scope.saveUserProfile = function () {
                    var data = {
                        first_name: $scope.data.first_name,
                        last_name: $scope.data.last_name,
                        gender: $scope.data.gender
                    };
                    var request = {
                        entity: 'nv.users',
                        resourceId: $rootScope.nv.user._id,
                        data: data
                    };
                    app.update(request, function (err, response) {
                        window.location.reload();
                    })
                }
            }
        });
        $stateProvider.state('home.edit_user', {
            url: 'user/:id',
            templateUrl: '/pages/main/user_edit.html',
            controller: function ($scope, $rootScope, app) {
                var request = {
                    entity: 'nv.users',
                    resourceId: $rootScope.nv.user._id
                };
                app.get(request, function (err, response) {
                    console.log(response, '======err=====', err)
                })
            }
        });
        $stateProvider.state('home.classes', {
            url: 'classes',
            templateUrl: '/pages/main/user_classes.html',
            controller: function ($rootScope, app, $scope) {
                var request = {
                    entity: 'nv.classes',
                    data: {
                        user_id: $rootScope.nv.user._id
                    }
                };
                app.call('getAllUserClasses', request, function (err, response) {
                    if (err) {
                        $scope.class_data = [];
                    }
                    var data = response.data.data;
                    $scope.class_data = data;
                });
            }
        });
        $stateProvider.state('home.gym', {
            url: 'gym',
            templateUrl: '/pages/main/user_gym.html',
            controller: function ($rootScope, app, $scope) {
                var request = {
                    entity: 'nv.classes',
                    data: {
                        user_id: $rootScope.nv.user._id,
                        time_zone: "+5:30"
                    }
                };
                app.call('getAllGymClasses', request, function (err, response) {
                    if (err) {
                        $scope.gym_data = [];
                    }
                    var data = response.data.data;
                    $scope.gym_data = data;
                })
            }
        });
        $stateProvider.state('home.payment', {
            url: 'payment',
            templateUrl: '/pages/main/user_payment.html'
        });
        $stateProvider.state('home.class_history', {
            url: 'class_history',
            templateUrl: '/pages/main/user_class_history.html',
            controller: function ($scope, $rootScope, app) {
                var request = {
                    entity: 'nv.classes',
                    data: {
                        user_id: $rootScope.nv.user._id
                    }
                };
                app.call('instructor_history_by_user', request, function (err, response) {
                    $scope.history_data = response.data.data;
                })
            }
        });
        $stateProvider.state('home.history_view', {
            url: 'class_history/:instructor_id/_view',
            templateUrl: '/pages/main/user_history_view.html',
            controller: function ($scope, app, $stateParams, $rootScope) {
                var request = {
                    entity: 'nv.booking',
                    query: {
                        filters: [
                            {field: 'instructor_id', value: $stateParams.instructor_id, operator: 'equal'},
                            {field: 'user_id', value: $rootScope.nv.user._id, operator: 'equal'},
                            {field: 'created_on', value: new Date, operator: 'less_than_or_equal'}
                        ]
                    }
                };
                app.list(request, function (err, response) {
                    $scope.class_data = response.data.records;
                })
            }
        });
        $stateProvider.state('home.gym_history', {
            url: 'gym_history',
            templateUrl: '/pages/main/user_gym_history.html',
            controller: function ($scope, $rootScope, app) {
                var request = {
                    entity: 'nv.classes',
                    data: {
                        user_id: $rootScope.nv.user._id
                    }
                };
                app.call('gym_history_by_user', request, function (err, response) {
                    $scope.history_data = response.data.data;
                })
            }
        });
        $stateProvider.state('home.gym_history_view', {
            url: 'gym_history/:gym_id/_view',
            templateUrl: '/pages/main/gym_history_view_for_user.html',
            controller: function ($scope, app, $stateParams, $rootScope) {
                var request = {
                    entity: 'nv.gym_registration',
                    query: {
                        filters: [
                            {field: 'gym_id', value: $stateParams.gym_id, operator: 'equal'},
                            {field: 'user_id', value: $rootScope.nv.user._id, operator: 'equal'},
                            {field: 'created_on', value: new Date, operator: 'less_than_or_equal'}
                        ]
                    }
                };
                app.list(request, function (err, response) {
                    $scope.class_data = response.data.records;
                })
            }
        });
        $stateProvider.state('home.logout', {
            controller: function (app) {
                var request = {
                    entity: 'nv.users'
                };
                app.call('logout', request, function (err, response) {
                    if (err) {
                        return;
                    }
                    window.location.reload();
                })
            }
        });
    }
    else if (session.role == 'instructor') {
        $stateProvider.state('home', {
            url: '/',
            templateUrl: '/pages/main/instructor_dashboard.html',
            controller: function ($state) {
                if (location.pathname == '/')
                    $state.transitionTo('home.dashboard');
            }
        });
        $stateProvider.state('home.dashboard', {
            url: 'dashboard',
            templateUrl: '/pages/main/instructorDashboard.html',
            controller: function (app, $rootScope, $scope) {
                $scope.class_data = [];
                var request = {
                    entity: 'nv.classes',
                    data: {
                        instructor_id: $rootScope.nv.user._id
                    }
                };
                app.call('getAllClasses', request, function (err, result) {
                    if (err || !result.data || !result.data.data) {
                        //do nothing
                        return
                    }
                    $scope.class_data = result.data.data;
                });

                $scope.delete_class = function (class_id) {
                    var r = true;
                    r = confirm("Are you sure you want to delete this class?");
                    if (!r) {
                        return
                    }
                    var request = {
                        entity: 'nv.classes',
                        data: {
                            instructor_id: $rootScope.nv.user._id,
                            class_id: class_id
                        }
                    };
                    app.call('deleteClass', request, function (err, response) {
                        if (err) {
                            return;
                        }
                        window.location.reload();
                    })
                }
            }
        });

        $stateProvider.state('home.confirmation_log', {
            url: 'class/:class_id',
            templateUrl: '/pages/main/confirmation_log.html',
            controller: function ($scope, app, $stateParams) {
                var request = {
                    entity: 'nv.classes',
                    data: {
                        class_id: $stateParams.class_id
                    }
                };
                app.call('getAllAttendees', request, function (err, response) {
                    $scope.class_data = response.data.data;
                });
            }
        });

        $stateProvider.state('home.edit', {
            url: "class/:class_id/_edit",
            templateUrl: '/pages/main/class_add.html',
            controller: function (app, $stateParams, $scope, $http, $rootScope) {
                var request = {
                    entity: 'nv.classes',
                    resourceId: $stateParams.class_id
                };
                app.get(request, function (err, response) {
                    var url = "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + response.data.latitude + "," + response.data.longitude + "&sensor=true";
                    $http.get(url).success(function (data, status) {
                        if (data.status == 'OK') {
                            response.data.location = data.results[0].formatted_address;
                        }
                        $scope.data = response.data;
                    });
                });

                $scope.saveData = function () {
                    var mandatory = ['class_name', 'class_start_time', 'day', 'latitude', 'longitude', 'duration', 'cost', 'description', 'keywords', 'limit_class_size'];
                    $scope.errors = {};
                    mandatory.forEach(function (man) {
                        if (!$scope.data[man]) {
                            $scope.errors[man] = 'Mandatory Field';
                        }
                    });
                    if (!Object.keys($scope.errors).length) {
                        var request = {
                            entity: 'nv.classes',
                            data: {
                                instructor_id: $rootScope.nv.user._id,
                                class_id: $stateParams.class_id,
                                data: $scope.data
                            }
                        };
                        app.call('updateClass', request, function (err, response) {
                            if (err) {
                                //do nothing
                                return
                            }
                            window.location.href = window.location.origin + '/dashboard';
                        })
                    }
                }
            }
        });

        $stateProvider.state('home.add', {
            url: 'classes/_add',
            templateUrl: '/pages/main/class_add.html',
            controller: function ($scope, app, $rootScope, $http) {
                $scope.data = {};
                $scope.errors = {};
                var save_data = {};
                navigator.geolocation.getCurrentPosition(showPosition);
                function showPosition(position) {
                    save_data.latitude = position.coords.latitude;
                    save_data.longitude = position.coords.longitude;
                    var url = "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + position.coords.latitude + "," + position.coords.longitude + "&sensor=true";
                    $http.get(url).success(function (data, status) {
                        if (data.status == 'OK') {
                            $scope.data.location = data.results[0].formatted_address;
                            save_data.location = data.results[0].formatted_address;
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
                                $scope.data.location = data.results[0].formatted_address;
                                save_data.location = data.results[0].formatted_address;
                            }
                        });
                    }
                };

                $scope.saveData = function () {
                    var mandatory = ['class_name', 'class_start_time', 'day', 'latitude', 'longitude', 'duration', 'cost', 'description', 'keywords', 'limit_class_size'];
                    for (var key in $scope.data) {
                        if (key != location) {
                            save_data[key] = $scope.data[key];
                        }
                    }
                    $scope.errors = {};
                    mandatory.forEach(function (man) {
                        if (!save_data[man]) {
                            $scope.errors[man] = 'Mandatory Field';
                        }
                    });
                    if (!Object.keys($scope.errors).length) {
                        var request = {
                            entity: 'nv.classes',
                            data: {
                                instructor_id: $rootScope.nv.user._id,
                                classRecord: save_data
                            }
                        };
                        app.call('addClass', request, function (err, response) {
                            if (err) {
                                //do nothing
                                return
                            }
                            window.location.href = window.location.origin + '/dashboard';
                        })
                    }
                }
            }
        });

        $stateProvider.state('home.profile', {
            url: 'profile',
            templateUrl: '/pages/main/user_profile.html',
            controller: function ($scope, $rootScope, app) {
                $scope.showEdit = false;
                $scope.showEditForm = function () {
                    $scope.showEdit = true;
                    $scope.data = $rootScope.nv.user;
                };
                $scope.saveUserProfile = function () {
                    var data = {
                        first_name: $scope.data.first_name,
                        last_name: $scope.data.last_name,
                        gender: $scope.data.gender
                    };
                    var request = {
                        entity: 'nv.users',
                        resourceId: $rootScope.nv.user._id,
                        data: data
                    };
                    app.update(request, function (err, response) {
                        window.location.reload();
                    })
                }
            }
        });
        $stateProvider.state('home.payout', {
            url: 'payout',
            templateUrl: '/pages/main/user_payment.html',
            controller: function ($scope, app, $rootScope) {
                var request = {
                    entity: 'nv.classes',
                    data: {
                        instructor_id: $rootScope.nv.user._id
                    }
                };
                app.call('payout', request, function (err, response) {
                    $scope.payout_amount = response.data.data.payout;
                })
            }
        });
        $stateProvider.state('home.history', {
            url: 'history',
            templateUrl: '/pages/main/instructor_history.html',
            controller: function ($scope, app, $rootScope) {
                var request = {
                    entity: 'nv.classes',
                    data: {
                        instructor_id: $rootScope.nv.user._id
                    }
                };
                app.call('instructor_history', request, function (err, response) {
                    $scope.history_data = response.data.data;
                })
            }
        });
        $stateProvider.state('home.history_view', {
            url: 'history/:user_id/_view',
            templateUrl: '/pages/main/instructor_history_view.html',
            controller: function ($scope, app, $stateParams, $rootScope) {
                var request = {
                    entity: 'nv.booking',
                    query: {
                        filters: [
                            {field: 'user_id', value: $stateParams.user_id, operator: 'equal'},
                            {field: 'instructor_id', value: $rootScope.nv.user._id, operator: 'equal'},
                            {field: 'created_on', value: new Date, operator: 'less_than_or_equal'}
                        ]
                    }
                };
                app.list(request, function (err, response) {
                    $scope.class_data = response.data.records;
                })
            }
        });
        $stateProvider.state('home.logout', {
            controller: function (app) {
                var request = {
                    entity: 'nv.users'
                };
                app.call('logout', request, function (err, response) {
                    if (err) {
                        return;
                    }
                    window.location.reload();
                })
            }
        });
    }
    else if (session.role == 'gym_owner') {
        $stateProvider.state('home', {
            url: '/',
            templateUrl: '/pages/main/gym_dashboard.html',
            controller: function ($state) {
                if (location.pathname == '/')
                    $state.transitionTo('home.dashboard');
            }
        });
        $stateProvider.state('home.dashboard', {
            url: 'dashboard',
            templateUrl: '/pages/main/gymDashboard.html',
            controller: function ($scope, app, $rootScope) {
                var request = {
                    entity: 'nv.classes',
                    data: {
                        gym_id: $rootScope.nv.user._id
                    }
                };
                app.call('getAllAttendeesForGym', request, function (err, response) {
                    if (err) {
                        $scope.gym_data = [];
                    }
                    var data = response.data.data;
                    $scope.gym_data = data;
                })
            }
        });

        $stateProvider.state('home.profile', {
            url: 'profile',
            templateUrl: '/pages/main/gym_profile.html',
            controller: function ($scope, $rootScope, app) {
                $scope.showEdit = false;
                $scope.working_days = "";
                $rootScope.nv.user.schedule.forEach(function (sch) {
                    $scope.working_days += $scope.days[sch.schedule_day[0]] + '  ';
                    $scope.working_days += sch.schedule_time + '  ';
                });
                $scope.showEditForm = function () {
                    $scope.data = {
                        name: $rootScope.nv.user.name,
                        phone: $rootScope.nv.user.phone,
                        cost: $rootScope.nv.user.cost,
                        description: $rootScope.nv.user.description
                    };
                    $rootScope.nv.user.schedule.forEach(function (sch) {
                        $scope.data[$scope.days[sch.schedule_day[0]]] = {};
                        $scope.data[$scope.days[sch.schedule_day[0]]].start_time = sch.schedule_time.split('-')[0];
                        $scope.data[$scope.days[sch.schedule_day[0]]].end_time = sch.schedule_time.split('-')[1];
                    });
                    $scope.showEdit = true;
                };
                $scope.submitForm = function () {
                    $scope.errors = {};
                    var mandatory_fields = ['name', 'phone', 'cost', 'description'];
                    mandatory_fields.forEach(function (field) {
                        if (!$scope.data[field]) {
                            $scope.errors[field] = 'Mandatory Field';
                        }
                    });
                    if (Object.keys($scope.errors).length) {
                        return;
                    }
                    var data = $scope.data;
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
                    var request = {
                        entity: 'nv.users',
                        resourceId: $rootScope.nv.user._id,
                        data: $scope.data
                    };
                    app.update(request, function (err, response) {
                        window.location.reload();
                    });
                }
            }
        });
        $stateProvider.state('home.payout', {
            url: 'payout',
            templateUrl: '/pages/main/gym_payout.html',
            controller: function ($scope, app, $rootScope) {
                var request = {
                    entity: 'nv.classes',
                    data: {
                        gym_id: $rootScope.nv.user._id
                    }
                };
                app.call('payout', request, function (err, response) {
                    $scope.payout_amount = response.data.data.payout;
                })
            }
        });
        $stateProvider.state('home.history', {
            url: 'history',
            templateUrl: '/pages/main/gym_history.html',
            controller: function ($scope, $rootScope, app) {
                var request = {
                    entity: 'nv.classes',
                    data: {
                        gym_id: $rootScope.nv.user._id
                    }
                };
                app.call('gym_history', request, function (err, response) {
                    $scope.history_data = response.data.data;
                })
            }
        });
        $stateProvider.state('home.history_view', {
            url: 'history/:user_id/_view',
            templateUrl: '/pages/main/gym_history_view.html',
            controller: function ($scope, app, $stateParams, $rootScope) {
                var request = {
                    entity: 'nv.gym_registration',
                    query: {
                        filters: [
                            {field: 'user_id', value: $stateParams.user_id, operator: 'equal'},
                            {field: 'gym_id', value: $rootScope.nv.user._id, operator: 'equal'},
                            {field: 'created_on', value: new Date, operator: 'less_than_or_equal'}
                        ]
                    }
                };
                app.list(request, function (err, response) {
                    $scope.class_data = response.data.records;
                })
            }
        });
        $stateProvider.state('home.logout', {
            controller: function (app) {
                var request = {
                    entity: 'nv.users'
                };
                app.call('logout', request, function (err, response) {
                    if (err) {
                        return;
                    }
                    window.location.reload();
                })
            }
        });
    }
}]);

m.controller('mainCtrl', ['$scope', '$http', '$state', '$location', function ($scope, $http, $state, $location) {
    $scope.days = {
        0: 'sunday',
        1: 'monday',
        2: 'tuesday',
        3: 'wednesday',
        4: 'thursday',
        5: 'friday',
        6: 'saturday'
    }
}]);