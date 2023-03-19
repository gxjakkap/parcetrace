/**
 * Credits: Botnoi Group
 * Soruces:
 *     - https://youtu.be/lSlWKM_nz10
 *     - https://bit.ly/3J5zZc9
 **/

function doGet(request) {
  var imageurl = request.parameter.imageurl;
  var result = textfromimage(imageurl);
  console.log(result);
  var result = JSON.stringify(result);
  return ContentService.createTextOutput(result).setMimeType(
    ContentService.MimeType.JSON
  );
}

function textfromimage(imageurl) {
  var imageBlob = UrlFetchApp.fetch(imageurl).getBlob();
  var resource = {
    title: imageBlob.getName(),
    mimeType: imageBlob.getContentType(),
  };
  var options = {
    ocr: true,
  };
  var docFile = Drive.Files.insert(resource, imageBlob, options);
  var doc = DocumentApp.openById(docFile.id);
  var text = doc.getBody().getText();
  Drive.Files.remove(docFile.id);
  return text;
}
