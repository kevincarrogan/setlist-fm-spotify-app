require([
    'scripts/underscore',
], function (underscore) {
    var _ = underscore._,
        searchResultTemplate = _.template(
            '<article>' +
                '<h1 class="artist-name"><%= artistName %></h1>' +
                '<div class="venue">' +
                    '<div class="name"><%= venueName %></div>' +
                    '<div class="city"><%= venueCity %></div>' +
                '</div>' +
                '<div class="date">' +
                    '<div class="month"><%= month %></div>' +
                    '<div class="day"><%= day %></div>' +
                '</div>' +
                '<div class="image" />' +
                '<div class="actions">' +
                '</div>' +
                '<ul class="setlist" />' +
            '</article>'),
        setlistItemTemplate = _.template(
            '<li>' +
                '<%= name %>' +
            '</li>'
        );

    exports.searchResultTemplate = searchResultTemplate;
    exports.setlistItemTemplate = setlistItemTemplate;
});
