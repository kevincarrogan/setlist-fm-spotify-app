require([
    '$api/models',
    'scripts/jquery',
    'scripts/underscore'
], function (models, jquery, underscore) {
    'use strict';

    var _ = underscore._,
        $searchForm = $('#search-form'),
        action = $searchForm.prop('action'),
        $searchResults = $('#search-results'),
        serializeObject = function ($el) {
            var arr = $el.serializeArray(),
                data = {};

            _.each(arr, function (kv) {
                data[kv.name] = kv.value;
            });

            return data;
        };

    $searchForm.on('submit', function (evt) {
        var data = serializeObject($(this));

        evt.preventDefault();

        $.get(action, data).done(function (data) {
            _.each(data.setlists.setlist, function (setlist) {
                $searchResults.append($('<li>' + setlist.artist['@name'] + '</li>'));
            });
        });
    });
});
