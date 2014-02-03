(function () {
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        getShortMonthName = function (idx) {
            return months[idx];
        };

    exports.getShortMonthName = getShortMonthName;
}());
