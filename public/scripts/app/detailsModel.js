function detailsModel(parentModel) {
    var self = this;
    self.parent = parentModel;
    self.activity = ko.observable();   
    self.otherActivities = ko.observableArray([]);    
    self.drivingDirectionsUrl = ko.observable("");
    self.walkingDirectionsUrl = ko.observable("");
    self.drivingDistance = ko.observable("");
    self.drivingInstructions = null;
    self.walkingDistance = ko.observable("");
    self.walkingInstructions = null;
    self.displayInstructionsType = ko.observable("");
    self.displayInstructions = ko.observableArray([]);
    self.facilityId = ko.observable(0); //this one is use to minimize the call to the Facility Web Service (only call when it changes)
    self.geoAttempts = 0;
    

    self.getData = function (callback) {
        if (self.parent.selectedActivity() != null) {            
            self.activity(self.parent.selectedActivity());
            self.facilityId(self.activity().Resource.Facility.Id);
            self.getMap();
            callback();
        }
        else {
            //load data
            $.ajax({
                dataType: 'jsonp',
                type: 'GET',
                url: apiBaseUrl + '/api/activities/' + self.parent.selectedId,
                success: function (activity) {
                    if (activity) {
                        //load data
                        self.parent.prepareActivity(activity);
                        self.activity(activity);
                        self.facilityId(self.activity().Resource.Facility.Id);
                        self.getMap();
                        callback();
                    }
                },
                error: function () {
                    console.log('error');
                }
            });
        }
    };

    self.getDirections = function () {
        if (self.parent.searchOptions().lat() != 0 && self.parent.searchOptions().lon() != 0) {
            self.drivingDirectionsUrl(directionsTemplate.replace('#LAT1#', self.parent.searchOptions().lat()).replace('#Lon1#', self.parent.searchOptions().lon()).replace('#LAT2#', self.activity().Resource.Lat).replace('#Lon2#', self.activity().Resource.Lon));
            self.walkingDirectionsUrl(self.drivingDirectionsUrl() + "&mode=W");
            var point2 = self.activity().Resource.Lat + ',' + self.activity().Resource.Lon;
            var point1 = self.parent.searchOptions().lat() + ',' + self.parent.searchOptions().lon();
            var walkingDistanceUrl = distanceTemplate.replace('#POINT1#', point1).replace('#POINT2#', point2) + '&key=' + bingKey;
            //driving
            var drivingDistanceUrl = walkingDistanceUrl.replace('Walking', 'Driving');
            $.getJSON(drivingDistanceUrl + '&jsonp=?', null, function (results) {
                if (results.resourceSets[0].resources[0].travelDistance) {
                    var distance = results.resourceSets[0].resources[0].travelDistance.toFixed(2);
                    var time = Math.floor(results.resourceSets[0].resources[0].travelDuration / 60);
                    self.drivingInstructions = results.resourceSets[0].resources[0].routeLegs[0].itineraryItems;
                    self.drivingDistance(distance + ' kms, ' + time + ' mins');
                }
            });
            //walking
            $.getJSON(walkingDistanceUrl + '&jsonp=?', null, function (results) {
                if (results.resourceSets[0].resources[0].travelDistance) {
                    var distance = results.resourceSets[0].resources[0].travelDistance.toFixed(2);
                    var time = Math.floor(results.resourceSets[0].resources[0].travelDuration / 60);
                    self.walkingInstructions = results.resourceSets[0].resources[0].routeLegs[0].itineraryItems;
                    self.walkingDistance(distance + ' kms, ' + time + ' mins');

                }
            });
        }
        else {
            geoAttempts = 0;
            if (navigator.geolocation && self.geoAttempts < 10) {
                self.geoAttempts++;
                model.searchOptions().discoverLocation();
                setTimeout(self.getDirections, 2000);
            }
        }
    };
    self.showDrivingInstructions = function (data, event) {
        event.preventDefault();
        self.displayInstructions(self.drivingInstructions);
        self.displayInstructionsType("Driving");
        ga('send', 'event', 'user-action', 'button', "view-driving-direction");
        return false;
    };

    self.showWalkingInstructions = function (data, event) {
        event.preventDefault();
        self.displayInstructions(self.walkingInstructions);
        self.displayInstructionsType("Walking");
        ga('send', 'event', 'user-action', 'button', "view-walking-direction");
        return false;
    };

    self.clearInstructions = function (data, event) {
        event.preventDefault();
        self.displayInstructions([]);
        self.displayInstructionsType("");
        return false;
    };

    //subscribing to Facility ID. As long as it changes, I will ask for the other activities.
    self.facilityId.subscribe(function () {
        //load data
        $.ajax({
            dataType: 'jsonp',
            type: 'GET',
            url: apiBaseUrl + '/api/facilities/' + self.facilityId(),
            success: function (facility) {
                var page = 6;
                var count = 0;
                //Other Activities (have to go by resources
                ko.utils.arrayForEach(facility.Resources, function (rec) {
                    ko.utils.arrayForEach(rec.Activities, function (act) {
                        if (count < page) {
                            self.otherActivities.push({
                                Id: act.Id,
                                Url: '/Details/' + act.Id,
                                Name: act.Name,
                                Description: (act.Description) ? act.Description.substring(0, 100) + '...' : ''
                            });
                            count++;
                        }
                    });
                });
                if (count == 0) self.otherActivitiesMessage('No activities found...');
            },
            error: function () {
                self.otherActivitiesMessage('Could not retrieve activities');
            }
        });
    });

    self.getRoadIconClass = function (step) {
        if (step.instruction.maneuverType == "DepartStart" ||
            step.instruction.maneuverType == "ArriveFinish") {
            return 'road-location';
        }
        else if (step.instruction.maneuverType.indexOf('Right') != -1) {
            return 'road-right';
        }
        else if (step.instruction.maneuverType.indexOf('Left') != -1) {
            return 'road-left';
        }
        else if (step.instruction.maneuverType.indexOf('Straight') != -1) {
            return 'road-straight';
        }
        else {
            return '';
        }

    };

    self.appMessage = ko.computed({
        read: function () { return self.appMessage; },
        write: function () {

        }
    });

    self.getMap = function(){    
        var elem = document.getElementById("mapviewer");
        map = new Microsoft.Maps.Map(elem, { credentials: bingKey });
        //set map
        var loc = new Microsoft.Maps.Location(self.activity().Resource.Lat, self.activity().Resource.Lon);
        var pin = new Microsoft.Maps.Pushpin(loc);
        map.entities.push(pin);
        map.setView({ center: loc, zoom: 15 });
    }
}
//end details model
