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


@app.route('/search/')
def search():
    search = request.args.get('q')
    search_data = requests.get(
        'http://api.setlist.fm/rest/0.1/search/setlists.json?artistName=%s' % search,
    )
    search_results = json.loads(search_data.content)
    response_value = {
        'setlists': [
            {
                'artist': {
                    'name': setlist['artist']['@name'],
                },
                'venue': {
                    'name': setlist['venue']['@name'],
                    'city': setlist['venue']['city']['@name'],
                },
                'date': '-'.join(reversed(setlist['@eventDate'].split('-'))),
                'tracks': [
                    track['@name'] for track in search_results['setlists']['setlist'][0]['sets']['set']['song']
                ],
            } for setlist in search_results['setlists']['setlist']
        ]
    }
    response = jsonify(response_value)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    http_server = WSGIServer(('0.0.0.0', port), app)
    http_server.serve_forever()
