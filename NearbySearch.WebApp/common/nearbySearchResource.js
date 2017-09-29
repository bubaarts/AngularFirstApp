(function () {
    "use strict";

    angular
        .module("common.services")
        .factory("nearbySearchResource",
        ["$resource", "appSettings", nearbySearchResource]);

    function nearbySearchResource($resource, appSettings) {

        var Resource = $resource(appSettings.serverPath + "/api/places/GetNearbySearch", {}, { 'query': { method: 'GET', isArray: false } });

        Resource.query(function (data) {
        }, function (error) {
        });
        return Resource;
    }
}());