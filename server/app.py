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
    response = jsonify(json.loads(search_data.content))
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    http_server = WSGIServer(('0.0.0.0', port), app)
    http_server.serve_forever()
