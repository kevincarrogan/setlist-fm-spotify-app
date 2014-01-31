require([
    '$api/models',
    '$api/search',
    '$views/image#Image',
    '$views/throbber#Throbber',
    'scripts/jquery',
    'scripts/underscore'
], function (models, search, Image, Throbber, jquery, underscore) {
    'use strict';

    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        _ = underscore._,
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
        },
        searchResultTemplate = _.template(
            '<li>' +
                '<div class="artist-name"><%= artistName %></div>' +
                '<div class="venue">' +
                    '<div class="name"><%= venueName %></div>' +
                    '<div class="city"><%= venueCity %></div>' +
                '</div>' +
                '<div class="date">' +
                    '<div class="month"><%= month %></div>' +
                    '<div class="day"><%= day %></div>' +
                '</div>' +
                '<div class="image" />' +
                '<ul class="setlist" />' +
            '</li>'),
        setlistItemTemplate = _.template(
            '<li>' +
                '<%= name %>' +
            '</li>'
        );

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
                        month: months[date.getMonth()]
                    },
                    $searchResult = $(searchResultTemplate(context)),
                    searchResults = search.Search.search(setlist.artist.name),
                    $setList = $searchResult.find('.setlist');

                searchResults.artists.snapshot(0, 1).done(function (snapshot) {
                    var artist = snapshot.get(0),
                        image = Image.forArtist(artist, {width: 100, height: 100});

                    $searchResult.find('.image').append($(image.node));
                });

                $searchResults.append($searchResult);

                _.each(setlist.tracks, function (name) {
                    $setList.append($(setlistItemTemplate({name: name})));
                });
            });
        });
    });
});
