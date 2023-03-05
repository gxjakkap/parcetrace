import easyocr
import cv2
import numpy as np
import requests
import wget
from PIL import ImageDraw, Image

def downloadimage(link):
    l = wget.download(link, out="download/")
    return l

def getTextResults(raw):
    ans = []
    for i in raw:
        ans.append(i[1])
    return ans

imageLink = "https://i.ibb.co/sJsvHZd/download.png"

reader = easyocr.Reader(['th', 'en'])

image = cv2.imread(downloadimage(imageLink))

result = reader.readtext(image)

print(result)



image2 = Image.fromarray(image)

draw = ImageDraw.Draw(image2)
for i in range(0, len(result)):
    p0, p1, p2, p3 = result[i][0]
    draw.line([*p0, *p1, *p2, *p3, *p0], fill='red', width=1)

imnamearr = imageLink.split('/')

image2.save(f"res/bb_{imnamearr[len(imnamearr) - 1]}")

with open(f'res/{imnamearr[len(imnamearr) - 1][:-4]}.txt', 'w', encoding="UTF-8") as f:
    f.write(f"[{', '.join(getTextResults(result))}]")