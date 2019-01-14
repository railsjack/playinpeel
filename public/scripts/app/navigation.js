function setNavigation() {
    Sammy(function () {
        this.use(Sammy.GoogleAnalytics);
        this.get('#:details/:activityId', function () {
            model.selectedId = this.params.activityId;
            model.details(new detailsModel(model));
            model.isListVisible(false);
            model.details().getData(
                function () {
                    //directions
                    var title = model.details().activity().Name + ' - Play in Peel by @PCYI_Org';
                    $("head > title").html(title);
                    $("#ogTitle").attr("content", title)
                    model.details().getDirections();
                });
            addthis.toolbox(".addthis_toolbox")

        });

        this.get('', function () {
            $("head > title").html('Play in Peel - Recreation Activities App for the cities of Mississauga and the City of Brampton by @PCYI_Org');
            $("#ogTitle").attr("content", 'Play in Peel')
            model.isListVisible(true);
            model.details(null);
            model.selectedActivity(null);
        });

    }).run();
}