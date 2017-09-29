(function () {
    "use strict";

    var app = angular.module("nearbyPlaces");
    app.controller("placesCtrl", ["geoLocationService",
        "nearbySearchResource",
        placesCtrl]);

    function placesCtrl(geoLocationService, nearbySearchResource) {
        var vm = this;

        vm.currentPage = 0;
        vm.error = false;
        vm.pageSize = 5;
        //initial bind, to change available types see googleTypes.js
        if (!vm.types) { vm.types = googleTypes; vm.radius = 1000 };

        var captureUserLocation = function () {
            geoLocationService.getCurrentPosition().then(onUserLocationFound);
        }
        //after getting location from user, call api and populate scope
        function onUserLocationFound(position) {

            vm.position = position;
            var lat = position.coords.latitude;
            var lng = position.coords.longitude;
            var cureentLocation = `${lat},${lng}`;
            var radiusQuery = vm.radius;
            var keywordQuery = vm.keyword;

            var typesArray = [];
            //creates array from selected checkboxes, converts to string
            if (isAnyTypeChecked) {
                Object.keys(vm.types).forEach(function (key) {
                    if (vm.types[key] == true) { typesArray.push(key) }
                });
                var typesQuery = typesArray.join('|');
            }

            //call to web api
            //*multiple type query might not work in the future
            nearbySearchResource.query({ location: cureentLocation, radius: radiusQuery, types: typesQuery, keyword: keywordQuery }, function (data) {
                vm.places = data;

                if (data.status == "ZERO_RESULTS") {
                    vm.error = true; vm.errorMessage = "No data!"
                } else { vm.error = false }

                //use local js library for map manipulation
                var map = new google.maps.Map(document.getElementById('map'), {
                    center: { lat, lng },
                    zoom: 16, styles: styleConfig["mapStyle"] //to use default style remove param
                });
                createMarkers(data.results, map);

            }, (function (error) {
                if (error.status == -1) {
                    vm.error = true; vm.errorMessage = "Connection refused!";
                }
                }));
            //creates icons on map
            function createMarkers(places, map) {

                var bounds = new google.maps.LatLngBounds();

                for (var i = 0, place; place = places[i]; i++) {
                    var image = {
                        url: place.icon,
                        size: new google.maps.Size(71, 71),
                        origin: new google.maps.Point(0, 0),
                        anchor: new google.maps.Point(17, 34),
                        scaledSize: new google.maps.Size(25, 25)
                    };

                    var marker = new google.maps.Marker({
                        map: map,
                        icon: image,
                        title: place.name,
                        position: place.geometry.location
                    });
                    bounds.extend(place.geometry.location);
                }
                //reposition map
                map.fitBounds(bounds);
            }
        }
        //call on startup
        captureUserLocation();
        //call on search refresh
        vm.refreshSearch = function () { captureUserLocation(); };

        //checkboxes helpers
        vm.checkAll = function () {
            toggleTypesValue(true);
        };
        vm.uncheckAll = function () {
            toggleTypesValue(false);

        };
        function toggleTypesValue(bool) {
            Object.keys(vm.types).forEach(function (key) {
                if (vm.types[key] == !bool) { vm.types[key] = bool }
            });
        }
        function isAnyTypeChecked() {
            Object.keys(vm.types).forEach(function (key) {
                if (vm.types[key] == true) { return true; }
            });
        }

        //paging helper
        vm.numberOfPages = function () {
            return Math.ceil(vm.places.results.length / vm.pageSize);
        }
    }
    //paging helper
    app.filter('startFrom', function () {
        return function (input, start) {
            start = +start;
            return input.slice(start);
        }
    });

}());
