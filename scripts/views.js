require([
    '$views/throbber#Throbber',
    'scripts/jquery',
    'scripts/serializeobject#serializeObject',
    'scripts/templates',
    'scripts/dateutils'
], function (Throbber, jquery, serializeObject, templates, dateutils) {

    var View = function (el) {
            this.$el = $(el);
            this.el = this.$el.get(0);

            this.eventRegistry = {}
        },
        FormView = function (el) {
            View.call(this, el);

            this.submit = this.submit.bind(this);

            this.$el.on('submit', this.submit);
            this.action = this.$el.prop('action');
            this.method = this.$el.prop('method');
        },
        SearchFormView = function (el) {
            FormView.call(this, el);

            this.searchResultsView = new SearchResultsView($('#search-results'));

            this.on('searching', this.searchResultsView.displayLoader, this.searchResultsView);
            this.on('results', this.searchResultsView.displayResults, this.searchResultsView);
        },
        SearchResultsView = function (el) {
            View.call(this, el);
        },
        SearchResultView = function (setlist) {
            this.data = setlist;
        };

    View.prototype.on = function (event, func, context) {
        var context = context || this;
        if (!this.eventRegistry[event]) {
            this.eventRegistry[event] = [];
        }
        this.eventRegistry[event].push({
            func: func,
            context: context
        });
    }
    View.prototype.trigger = function (event) {
        var args = Array.prototype.slice.call(arguments, 1);

        if (this.eventRegistry[event].length) {
            this.eventRegistry[event].forEach((function (registeredEvent) {
                var func = registeredEvent['func'],
                    context = registeredEvent['context'];
                func.apply(context, args);
            }).bind(this));
        }
    }

    FormView.prototype = Object.create(View.prototype);
    FormView.prototype.submit = function (evt) {};
    FormView.prototype.serializeObject = function () {
        return serializeObject(this.$el);
    }

    SearchFormView.prototype = Object.create(FormView.prototype);
    SearchFormView.prototype.submit = function (evt) {
        evt.preventDefault();

        this.trigger('searching');

        $.get(this.action, this.serializeObject()).done(
            (function (data) {
                this.trigger('results', data);
            }).bind(this)
        );
    }

    SearchResultsView.prototype = Object.create(View.prototype);
    SearchResultsView.prototype.displayLoader = function () {
        this.throbber = Throbber.forElement(this.el);
    }
    SearchResultsView.prototype.displayResults = function (response) {
        var setlists = response.setlists;

        this.hideLoader();
        this.$el.empty();

        setlists.forEach((function (setlist) {
            var searchResult = new SearchResultView(setlist);

            this.$el.append(searchResult.getNode());
        }).bind(this));
    }
    SearchResultsView.prototype.hideLoader = function () {
        this.throbber.hide();
    }

    SearchResultView.prototype = Object.create(View.prototype);
    SearchResultView.prototype.getNode = function () {
        var date = new Date(this.data.date),
            context = context = {
                artistName: this.data.artist.name,
                venueName: this.data.venue.name,
                venueCity: this.data.venue.city,
                day: date.getDate(),
                month: dateutils.getShortMonthName(date.getMonth())
            };
        
        return $(templates.searchResultTemplate(context));
    }

    exports.SearchFormView = SearchFormView;

});
