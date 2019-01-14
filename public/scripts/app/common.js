var apiBaseUrl;
apiBaseUrl = "http://api.playinpeel.gotdns.org/";
//var apiBaseUrl = "http://api.opengraf.org/";

apiBaseUrl = "";
var bingKey = 'AuiJ711hYx4DRMmXcz7jzUAh6IXmAwlszWhZ6x7jq1JTCPP0kFPZgX6nWEG8EX0y';
var mapUrlTemplate = "//www.bing.com/maps/?v=2&where1=#LOCATION#";
var directionsTemplate = "//bing.com/maps/default.aspx?v=2&Rtp=pos.#LAT1#_#LNG1#~pos.#LAT2#_#LNG2#";
var distanceTemplate = "//dev.virtualearth.net/REST/V1/Routes/Walking?wp.0=#POINT1#&wp.1=#POINT2#";
$.support.cors = true;

if (!String.prototype.trim) {
    String.prototype.trim = function () {
        return this.replace(/^\s+|\s+$/g, '');
    }
}

if (!String.prototype.trimToLength) {
    String.prototype.trimToLength = function (length) {
        return (this) ? this.substring(0, length) + '...' : '';
    }
}

function displayDate(val){
    return moment(val).format('MMM D, YYYY');
}

function displayTime(val){
    return moment(val).format('h:mm a');
}

function convertToYears(age) {
    return age / 12;
}


$.fn.clearMessage = function () {
    $(this).attr('class', '');
    $(this).html('');
    $(this).hide();
};

$.fn.displaySuccessMessage = function (title, message, hideDelay) {
    var icontag = " ";//had to remove.
    displayMessage($(this), icontag, title, message, hideDelay, "alert alert-dismissable alert-success");
};

$.fn.displayErrorMessage = function (title, message, hideDelay) {
    var icontag = " ";//had to remove.
    displayMessage($(this), icontag, title, message, hideDelay, "alert alert-dismissable alert-error");
};

$.fn.displayInfoMessage = function (title, message, hideDelay) {
    var icontag = " ";//had to remove.
    displayMessage($(this), icontag, title, message, hideDelay, "alert alert-dismissable alert-info");
};

$.fn.displayAlertMessage = function (title, message, hideDelay) {
    var icontag = " ";//had to remove.
    displayMessage($(this), icontag, title, message, hideDelay, "alert alert-dismissable alert-warning");
};

function displayMessage(obj, icontag, title, message, hideDelay, cssClass) {
    $(obj).clearMessage();
    if (cssClass != null && cssClass.length > 0) {
        $(obj).addClass(cssClass);
    }
    var closeButton = ' <button type="button" class="close">×</button>';
    var display = message;
    if (title != null && title.length > 0) {
        display = '<h4>' + title + '</h4> ' + display;
    }
    display = icontag + closeButton + display;
    $(obj).html(display);
    if (hideDelay != null && hideDelay > 0) {
        $(obj).show().delay(hideDelay).fadeOut('slow', function () { $(obj).clearMessage() });
    }
    else {
        $(obj).show();
    }
    //now bind the close
    $(obj).find(".close").click(function () {
        $(obj).clearMessage();
    });
}

ko.bindingHandlers['class'] = {
    'update': function (element, valueAccessor) {
        if (element['__ko__previousClassValue__']) {
            $(element).removeClass(element['__ko__previousClassValue__']);
        }
        var value = ko.utils.unwrapObservable(valueAccessor());
        $(element).addClass(value);
        element['__ko__previousClassValue__'] = value;
    }
};

ko.bindingHandlers.popover = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var cssSelectorForPopoverTemplate = ko.utils.unwrapObservable(valueAccessor());
        var popOverTemplate = "<div id='addressSuggestion'>" + $(cssSelectorForPopoverTemplate).html() + "</div>";
        $(element).popover({
            content: popOverTemplate,
            html: true,
            trigger: 'manual',
            placement: 'bottom'
        });
    }
};