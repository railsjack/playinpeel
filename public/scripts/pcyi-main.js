var model;
$(function () {
    model = new appMainModel();
    ko.applyBindings(model);
    setNavigation();

    var distances = ['1', '2', '3', '5', '10', '25', '50'];
    $("#radius").slider({
        value: 3, min: 0, max: 6, step: 1, stop: function (event, ui) {
            model.searchOptions().radius(distances[ui.value]);
        }
    });

    $("#ageRange").slider({
        range: true, values: [0, 55], min: 0, max: 55, step: 1, stop: function (event, ui) {
            model.searchOptions().ageFrom(ui.values[0]);
            model.searchOptions().ageTo(ui.values[1]);
        }
    });

    $('#dateFrom ~ .input-group-addon').click(function () { $('#dateFrom').focus(); });
    $('#dateFrom').datepicker({ format: "mm-dd-yyyy" })
         .on('changeDate', function (ev) {
             model.searchOptions().dateFrom(moment(ev.date).format('MM-DD-YYYY'));
             $(this).datepicker('hide')
         });

    $('#dateTo ~ .input-group-addon').click(function () { $('#dateTo').focus(); });
    $('#dateTo').datepicker({ format: "mm-dd-yyyy" })
         .on('changeDate', function (ev) {
             model.searchOptions().dateTo(moment(ev.date).format('MM-DD-YYYY'));
             $(this).datepicker('hide')
         });

    $("#search-tooltip").tooltip({ placement: "top", trigger: "hover", animation: true, title: "Adjust these search options to narrow or widen your results..." });

    $("#expand-search-options").click(function (e) {
        if ($("#all-search-options").is(":visible")) {
            $("#all-search-options").hide();
            $("#expand-search-options").removeClass("glyphicon-minus").addClass("glyphicon-plus");
        }
        else {
            $("#all-search-options").show();
            $("#expand-search-options").removeClass("glyphicon-plus").addClass("glyphicon-minus");
        }
    });

    $(".dummy-readonly").click(function () {
        $(this).closest("div").find(":checkbox").click();
    });

    $(window).resize(function () {
        if ($("#all-search-options").is(":visible")) {
            $("#expand-search-options").removeClass("glyphicon-plus").addClass("glyphicon-minus");
        }
        else {

            $("#expand-search-options").removeClass("glyphicon-minus").addClass("glyphicon-plus");
        }
    });

    ////infinite scrolling
    $(window).scroll(function (data) {
        //var elem = event.target.body;
        if ($(window).scrollTop() == $(document).height() - $(window).height()) {
            model.isScrolling = true;
            model.getData();

        }
    });
});