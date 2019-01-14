var appMainModel = function () {
    var self = this;
    //params
    self.searchOptions = ko.observable(new searchOptions(this));
    //page data
    self.isListVisible = ko.observable(true);
    self.activities = ko.observableArray([]);
    self.needsGeoCoding = ko.observable(true);
    self.itemCount = 0;
    self.isScrolling = false;
    //selected details
    self.selectedId = 0;
    self.details = ko.observable(new detailsModel(this));
    self.selectedActivity = ko.observable();
    //
    self.submitOnEnter = function (data, event) {
        if (event.keyCode == 13) {
            self.doSearch();
        }
    };
    //search
    self.doSearch = function () {
        self.itemCount = 0;
        self.isScrolling = false;
        $("#page-meessage").clearMessage();
        if (self.searchOptions().address() == "") {
            //please type your address popup
            $("#page-message").displayAlertMessage("Address is required", "Please enter an address to continue.")
        }
        else {
            self.searchOptions().address(self.searchOptions().address().trim());
            if (self.needsGeoCoding()) {
                self.doGeoCoding();
            } else {
                self.getData();
            }
        }
    };

    self.getData = function () {
        $("#page-message").clearMessage();
        $(".btn-search").button('loading');
        $("#page-message").displayInfoMessage("Searching...", "Looking for activities, please wait.");
        if (!self.isScrolling) {
            self.searchOptions().skip(0);
        }
        else {
            self.searchOptions().skip(self.searchOptions().skip() + 1);
        }

        $.ajax({
            type: 'GET',
            dataType: 'jsonp',
            url: apiBaseUrl + '/api/activities?' + self.searchOptions().getQueryString(),
            success: function (entries) {
                if (!self.isScrolling) {
                    self.activities.removeAll();
                    ga('send', 'event', 'user-action', 'scroll', "search", entries.length);
                }
                else {
                    ga('send', 'event', 'user-action', 'button', "search", entries.length);
                }
                ko.utils.arrayForEach(entries, function (activity) {
                    self.activities.push(self.prepareActivity(activity));
                });
                if (self.activities().length == 0) {
                    $("#page-message").displayAlertMessage("Nothing found...", "Try adjusting the search filters.");
                }
                else {
                    $("#page-message").clearMessage();
                }

                $(".btn-search").button('reset');
            },
            error: function () {
                $("#page-message").displayErrorMessage("Ooops", "Well, uhmm... something happened. We have been notified and will look into the issue.");
                $(".btn-search").button('reset');
            }
        });
    };

    self.prepareActivity = function (activity) {
        var dateFrom = new Date(self.searchOptions().dateFrom());
        var dateTo = new Date(self.searchOptions().dateTo());
        //determine the selected time
        var selectedTime;
        $.each(activity.Times, function (index, time) {
            var st = new Date(time.StartDate);
            var et = new Date(time.EndDate);
            if (st.getTime() >= dateFrom.getTime() && et.getTime() <= dateTo.getTime()) {
                var days = true;
                var params = self.searchOptions().days();
                if (!(time.Monday && !params[0].checked || time.Tuesday && !params[1].checked
                    || time.Wednesday && !params[2].checked || time.Thursday && !params[3].checked
                    || time.Friday && !params[4].checked || time.Saturday && !params[5].checked
                    || time.Sunday && !params[6].checked)) {
                    selectedTime = time;
                    return false;
                }
            }
        });
        activity['SelectedTime'] = selectedTime || activity.Times[0];
        return activity;
    };

    //navigation
    self.goToActivity = function (activity, forceLoad) {
        self.selectedId = activity.Id;
        if (forceLoad == true) {
            self.selectedActivity(null);
        }
        else {
            self.selectedActivity(activity);
        }
        ga('send', 'event', 'user-action', 'click', "view-details", activity.Id);
        location.hash = 'Details/' + activity.Id;

    };

    self.goBack = function () {
        location.hash = '';
    };

    //Address
    self.doGeoCoding = function () {
        // Geo-coding                           
        var url = '//dev.virtualearth.net/REST/v1/Locations/' + self.searchOptions().address() + '?userlocation=62.83300018310547,-95.91400146484375&includeNeighborhood=1&maxresults=20&key=' + bingKey;
        $.getJSON(url + '&jsonp=?', null, function (results) {
            if (results.resourceSets[0].resources.length > 0 && results.resourceSets[0].resources[0].point) {
                self.needsGeoCoding(false);
                if (results.resourceSets[0].resources.length > 1) {
                    self.searchOptions().possibleAddresses().length = 0;
                    $.each(results.resourceSets[0].resources, function (i, r) {
                        self.searchOptions().possibleAddresses().push({ name: r.name, coords: { lat: r.point.coordinates[0], lon: r.point.coordinates[1] } });
                    });
                    $("#address").popover('show');
                    var popover = document.getElementById("addressSuggestion");
                    ko.applyBindings(self, popover);
                } else {
                    self.setManualAddress({
                        name: results.resourceSets[0].resources[0].name,
                        coords: {
                            lat: results.resourceSets[0].resources[0].point.coordinates[0],
                            lon: results.resourceSets[0].resources[0].point.coordinates[1]
                        }
                    });
                }

            } else {
                $("#geoAlert").show();
            }

        });
    }

    self.setManualAddress = function (address, doSearch) {
        self.searchOptions().shouldUpdateAddress = false;
        self.searchOptions().lat(address.coords.lat);
        self.searchOptions().lon(address.coords.lon);
        self.searchOptions().address(address.name);
        $("#address").popover('hide');
        self.getData();
        //self.setCenterPin();
    }

    //initiate
    self.searchOptions().discoverLocation();
};