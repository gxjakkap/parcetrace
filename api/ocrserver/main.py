# -*- coding: utf-8 -*-

from flask import Flask, redirect, url_for, request, jsonify
import easyocr

app = Flask(__name__)
app.config["DEBUG"] = True
app.config['JSON_AS_ASCII'] = False

reader = easyocr.Reader(['th', 'en'])

def eocr_getTextResults(raw):
    ans = []
    for i in raw:
        ans.append(i[1])
    return ans

@app.route('/easyocr', methods=['POST'])
def eocr():
    data = request.json
    result = reader.readtext(data['image'])
    return jsonify(status=200, data=eocr_getTextResults(result))

@app.route('/', methods=['GET'])
def helloworld():
    return jsonify(msg="Hello, world.")

if __name__ == "__main__":
    from waitress import serve
    serve(app, port=3487)