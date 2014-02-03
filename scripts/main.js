require([
    '$api/models',
    '$api/search',
    '$views/image#Image',
    '$views/throbber#Throbber',
    'scripts/jquery',
    'scripts/underscore',
    'scripts/serializeobject',
    'scripts/templates',
    'scripts/dateutils'
], function (
    models,
    search,
    Image,
    Throbber,
    jquery,
    underscore,
    serializeObject,
    templates,
    dateutils
) {
    'use strict';

    var serializeObject = serializeObject.serializeObject,
        _ = underscore._,
        $searchForm = $('#search-form'),
        action = $searchForm.prop('action'),
        $searchResults = $('#search-results');

    $searchForm.on('submit', function (evt) {
        var data = serializeObject($(this)),
            throbber = Throbber.forElement($searchResults.get(0));

        evt.preventDefault();

        $.get(action, data).done(function (data) {
            throbber.hide();
            $searchResults.empty();
            _.each(data.setlists, function (setlist) {
                var date = new Date(setlist.date),
                    context = {
                        artistName: setlist.artist.name,
                        venueName: setlist.venue.name,
                        venueCity: setlist.venue.city,
                        day: date.getDate(),
                        month: dateutils.getShortMonthName(date.getMonth())
                    },
                    $searchResult = $(templates.searchResultTemplate(context)),
                    searchResults = search.Search.search(setlist.artist.name),
                    $setList = $searchResult.find('.setlist');

                searchResults.artists.snapshot(0, 1).done(function (snapshot) {
                    var artist = snapshot.get(0),
                        image = Image.forArtist(artist, {width: 100, height: 100});

                    $searchResult.find('.image').append($(image.node));
                });

                $searchResults.append($searchResult);

                _.each(setlist.tracks, function (name) {
                    $setList.append($(templates.setlistItemTemplate({name: name})));
                });
            });
        });
    });
});
