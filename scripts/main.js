require([
    '$api/models',
    '$api/search',
    '$views/image#Image',
    'scripts/jquery',
    'scripts/underscore'
], function (models, search, Image, jquery, underscore) {
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
            $searchResults.empty();
            _.each(data.setlists, function (setlist) {
                var artistName = setlist.artist.name,
                    $searchResult = $('<li>' + artistName + '</li>'),
                    searchResults = search.Search.search(artistName);

                searchResults.artists.snapshot(0, 1).done(function (snapshot) {
                    var artist = snapshot.get(0),
                        image = Image.forArtist(artist, {width: 100, height: 100});

                    $searchResult.append($(image.node));
                });

                $searchResults.append($searchResult);
            });
        });
    });
});
