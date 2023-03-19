# -*- coding: utf-8 -*-

from flask import Flask, redirect, url_for, request, jsonify
import pytesseract
import platform
import easyocr
import imutils

app = Flask(__name__)
app.config["DEBUG"] = True
app.config['JSON_AS_ASCII'] = False

if platform.system() == "Windows":
    pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract'

reader = easyocr.Reader(['th', 'en'])

def eocr_getTextResults(raw):
    ans = []
    for i in raw:
        ans.append(i[1])
    return ans

def eocr_imageSizeCap(dim):
    h = dim[0]
    w = dim[1]
    return (h > 500 or w > 500)

def tsr_getTextResults(raw):
    tarr = raw.removesuffix('\n').split('\n')
    return tarr

@app.route('/easyocr', methods=['POST'])
def eocr():
    print(request)
    data = request.json
    image = imutils.url_to_image(data['image'])
    if eocr_imageSizeCap(image.shape):
        if image.shape[0] > image.shape[1]:
            image = imutils.resize(image, height=500)
        else:
            image = imutils.resize(image, width=500)
    result = reader.readtext(image)
    print(result)
    return jsonify(status=200, data=eocr_getTextResults(result))

@app.route('/tesseract', methods=['POST'])
def tesseract():
    print(request)
    data = request.json
    image = imutils.url_to_image(data['image'])
    if eocr_imageSizeCap(image.shape):
        if image.shape[0] > image.shape[1]:
            image = imutils.resize(image, height=500)
        else:
            image = imutils.resize(image, width=500)
    result = pytesseract.image_to_string(image, lang='tha+eng')
    print(result)
    return jsonify(status=200, data=tsr_getTextResults(result))

@app.route('/', methods=['GET'])
def helloworld():
    return jsonify(msg="Hello, world.")

if __name__ == "__main__":
    from waitress import serve
    serve(app, port=3487)