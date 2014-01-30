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
    response_value = {
        'setlists': [
            {
                'artist': {
                    'name': 'Mogwai',
                }
            },
        ]
    }
    response = jsonify(response_value)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    http_server = WSGIServer(('0.0.0.0', port), app)
    http_server.serve_forever()
