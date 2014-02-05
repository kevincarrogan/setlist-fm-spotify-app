import os
import json
import requests
import gevent
import gevent.monkey
from gevent.pywsgi import WSGIServer
gevent.monkey.patch_all()

from flask import Flask, abort, jsonify, request


app = Flask(__name__)
app.debug = True

SETLIST_SEARCH_URL = 'http://api.setlist.fm/rest/0.1/search/setlists.json'
ARTIST_SEARCH_URL = SETLIST_SEARCH_URL + '?artistName=%s'


def get_results(query):
    search_data = requests.get(ARTIST_SEARCH_URL % query)
    return json.loads(search_data.content)


def get_artist_name(setlist):
    return setlist['artist']['@name']


def get_venue(setlist):
    return setlist['venue']


def get_venue_name(setlist):
    return get_venue(setlist)['@name']


def get_city_name(setlist):
    return get_venue(setlist)['city']['@name']


def get_date(setlist):
    return '-'.join(reversed(setlist['@eventDate'].split('-')))


def get_tracks(setlist):
    sets = setlist['sets']
    tracks = []
    if sets:
        songs = sets['set']
        if isinstance(songs, list):
            songs = songs[0]

        tracks = [track['@name'] for track in songs['song']]

    return tracks


def get_setlist(setlist):
    return {
        'artist': {
            'name': get_artist_name(setlist),
        },
        'venue': {
            'name': get_venue_name(setlist),
            'city': get_city_name(setlist),
        },
        'date': get_date(setlist),
        'tracks': get_tracks(setlist),
    }


@app.route('/search/')
def search():
    query = request.args.get('q')
    search_results = get_results(query)

    setlists = search_results['setlists']['setlist']

    response_value = {
        'setlists': [get_setlist(setlist) for setlist in setlists],
    }

    response = jsonify(response_value)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    http_server = WSGIServer(('0.0.0.0', port), app)
    http_server.serve_forever()
