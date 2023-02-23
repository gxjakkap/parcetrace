from PIL import Image
import pytesseract

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract'

res = pytesseract.image_to_string(Image.open('img/1.png'), lang='tha+eng')

print(res.removesuffix('\n').split(' '))

with open('res.txt', 'w', encoding="UTF-8") as f:
    f.write(res)