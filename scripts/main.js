require([
    '$api/models',
    '$api/search',
    '$views/image#Image',
    '$views/throbber#Throbber',
    '$views/list#List',
    'scripts/jquery',
    'scripts/underscore#_',
    'scripts/serializeobject#serializeObject',
    'scripts/templates',
    'scripts/dateutils'
], function (
    models,
    search,
    Image,
    Throbber,
    List,
    jquery,
    _,
    serializeObject,
    templates,
    dateutils
) {
    'use strict';

    var $searchForm = $('#search-form'),
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
                    $setList = $searchResult.find('.setlist'),
                    trackSearchPromises = [],
                    wait,
                    trackCollection;

                searchResults.artists.snapshot(0, 1).done(function (snapshot) {
                    var artist = snapshot.get(0),
                        image = Image.forArtist(artist, {width: 100, height: 100});

                    $searchResult.find('.image').append($(image.node));
                });

                $searchResults.append($searchResult);

                _.each(setlist.tracks, function (name) {
                    var artistName = setlist.artist.name,
                        trackSearchResults = search.Search.search(artistName + ' ' + name);

                    trackSearchPromises.push(trackSearchResults.tracks.snapshot(0, 1));
                });

                wait = models.Promise.join.apply(models.Promise, trackSearchPromises);

                wait.done(function (results) {
                    var uris = [],
                        trackPlaylistPromise,
                        tracks;
                    if (results.length) {
                        _.each(results, function (result) {
                            if (result.get(0)) {
                                uris.push(result.get(0).uri);
                            }
                        });
                        tracks = models.Track.fromURIs(uris);
                        trackPlaylistPromise = models.Playlist.createTemporary(setlist.artist.name + ' - ' + setlist.venue.name);
                        trackPlaylistPromise.done(function (playlist) {
                            playlist.load('tracks').done(function (playlist) {
                                var promise = playlist.tracks.add(tracks);
                                promise.done(function () {
                                    var list = List.forPlaylist(playlist);
                                    $setList.append(list.node);
                                    list.init();
                                });
                            });
                        });
                    }
                });
            });
        });
    });
});
