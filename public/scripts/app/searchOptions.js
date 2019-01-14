var searchOptions = function (model) {
    //default dates
    var from = new Date();
    var to = new Date();
    to.setDate(from.getDate() + 30);
    //params
    var self = this;
    self.parent = model;
    self.shouldUpdateAddress = true;
    self.skip = ko.observable(0);
    self.take = ko.observable(20);
    self.lat = ko.observable(0);
    self.lon = ko.observable(0);
    self.address = ko.observable("");
    self.radius = ko.observable(100);
    self.ageFrom = ko.observable(0);
    self.ageTo = ko.observable(55);
    self.dateFrom = ko.observable(moment(from).format('MM-DD-YYYY'));
    self.dateTo = ko.observable(moment(to).format('MM-DD-YYYY'));
    self.sortBy = ko.observable(1);
    self.activityTypes = ko.observableArray([{ checked: true }, { checked: true }]);
    self.timesOfDay = ko.observableArray([{ checked: true }, { checked: true }]);
    self.days = ko.observableArray([{ checked: true }, { checked: true }, { checked: true }, { checked: true }, { checked: true }, { checked: true }, { checked: true }]);
    self.keywords = ko.observable("");
    self.possibleAddresses = ko.observableArray([]);
    self.displayAgeTo = ko.computed(function () {
        if (self.ageTo() == 55) return "55+";
        else return self.ageTo().toString();
    });

    self.keywordsToQueryString = function () {
        var qstring = '';
        if (self.keywords().length > 0) {
            ko.utils.arrayForEach(self.keywords().split(/[\s,]+/), function (k) {
                if (k.trim().length > 0) qstring = qstring + k + ',';
            });
            qstring = qstring.substr(0, qstring.length - 1);
        }
        return qstring;
    };

    self.boolanArrayToQuerystring = function (arr) {
        var qstring = '';
        ko.utils.arrayForEach(arr, function (k) {
            qstring = qstring + k.checked + ',';
        });
        qstring = qstring.substr(0, qstring.length - 1);
        return qstring;
    };

    self.getQueryString = function () {
        var query = 'lat=' + self.lat() + '&lon=' + self.lon()
                + '&rd=' + self.radius()
                + '&ageFrom=' + self.ageFrom() * 12
                + '&ageTo=' + self.ageTo() * 12
                + '&dateFrom=' + self.dateFrom()
                + '&dateTo=' + self.dateTo()
                + '&k=' + encodeURIComponent(self.keywordsToQueryString())
                + '&days=' + self.boolanArrayToQuerystring(self.days())
                + '&timesOfDay=' + self.boolanArrayToQuerystring(self.timesOfDay())
                + '&activityTypes=' + self.boolanArrayToQuerystring(self.activityTypes())
                + '&sortby=1'
                + '&skip=' + self.skip()
                + '&take=' + self.take()
        
                
        return query;
    }

    self.discoverLocation = function () {
        //HTML 5 Geolocation API usage
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function (position) {
                    //Reverse geo-coding

                    self.lat(position.coords.latitude);
                    self.lon(position.coords.longitude);
                    self.parent.needsGeoCoding(false);
                    var point = self.lat() + ',' + self.lon();
                    var reverseGeoCodingUrl = '//dev.virtualearth.net/REST/v1/Locations/' + point + '?key=' + bingKey;
                    $.getJSON(reverseGeoCodingUrl + '&jsonp=?', null, function (results) {
                        self.address(results.resourceSets[0].resources[0].address.formattedAddress);                        
                        self.parent.doSearch();

                    });

                },
                function (error) {
                    console.log(error);
                });
        }
        else {
            //console.log("Geo location not available");
        }
    };

    //toogles day
    self.toogleDay = function (index) {
        if (self.days()[index].checked == 1) {
            self.days.replace(self.days()[index], { checked: false });
        }
        else {
            self.days.replace(self.days()[index], { checked: true });
        }
    };
    //toogle time of day day    
    self.toogleTimeOfDay = function (index) {
        if (self.timesOfDay()[index].checked == 1) {
            self.timesOfDay.replace(self.timesOfDay()[index], { checked: false });
        }
        else {
            self.timesOfDay.replace(self.timesOfDay()[index], { checked: true });
        }
    };

    self.addressChanged = function () {
        if (self.parent.needsGeoCoding() == true) return;
        if (self.shouldUpdateAddress)
            self.parent.needsGeoCoding(true);
        self.shouldUpdateAddress = true;
    };
};