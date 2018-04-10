// https://github.com/Macseam
app.bringToFront();

// checking if width/height are numbers
function checkIfNumber(value) {
	return !isNaN(parseInt(value))
}

// setting options for JPEG export
function saveJPEG( doc, saveFile, qty, width, height ) {  
	var saveOptions = new JPEGSaveOptions();
	saveOptions.embedColorProfile = false;
	saveOptions.formatOptions = FormatOptions.STANDARDBASELINE;
	saveOptions.matte = MatteType.NONE;
	saveOptions.quality = qty;
	doc.saveAs( saveFile, saveOptions, true );
}

// creating dialog window
var myWindow = new Window('dialog', 'Enter width/height || Введите ширину и высоту', [100,100,500,200]);
myWindow.okbutton = myWindow.add('button', [10,66,190,90], 'Choose folder with images || Выберите папку с файлами', {name: 'ok'});
var myWidth = myWindow.add('edittext', [10,10,190,30], 'Width (px) || Ширина (px)');
var myHeight = myWindow.add('edittext', [200,10,380,30], 'Height (px) || Высота (px)');
myWindow.show();
var myFolder = Folder.selectDialog("Choose folder with images ||  Выберите папку с файлами");

// where the magic happens
if (myFolder && (checkIfNumber(myWidth.text) || checkIfNumber(myHeight.text))) {

	// accepting only most common image formats
	var fileList = myFolder.getFiles(/.+\.(?:gif|jpe?g|tiff?|psd|bmp|png)$/i);
	for(var i=0; i < fileList.length; i++) {
		var myDoc = app.open(fileList[i]);

		// if only width or only height is set, resize will be based only on that existing parameter
		// e.g if you set width 500, but leave height empty, image will be resized by its width only

		if (checkIfNumber(myWidth.text) && checkIfNumber(myHeight.text)) {
			if (checkIfNumber(myHeight.text) && (myDoc.width > myDoc.height) && (myHeight.text < myDoc.height)) {
				myDoc.resizeImage(null,UnitValue(myHeight.text,"px"),null,ResampleMethod.BICUBIC);
			} else if (checkIfNumber(myWidth.text) && (myWidth.text < myDoc.width)) {
				myDoc.resizeImage(UnitValue(myWidth.text,"px"),null,null,ResampleMethod.BICUBIC);
			}
		} else if (checkIfNumber(myWidth.text) && (myWidth.text < myDoc.width)) {
			myDoc.resizeImage(UnitValue(myWidth.text,"px"),null,null,ResampleMethod.BICUBIC);
		} else if (checkIfNumber(myHeight.text) && (myHeight.text < myDoc.height)) {
			myDoc.resizeImage(null,UnitValue(myHeight.text,"px"),null,ResampleMethod.BICUBIC);
		}

		// cropping only if both width and height are set (and if set width/height is smaller than source document's width/height)
		if (checkIfNumber(myWidth.text) && checkIfNumber(myHeight.text) && ((myHeight.text < myDoc.height) || (myWidth.text < myDoc.width))) {
			myDoc.resizeCanvas(new UnitValue(myWidth.text,"px"),new UnitValue(myHeight.text,"px"),AnchorPosition.MIDDLECENTER);
		}

		// saving file
		var myDocName = myDoc.name.split('.').slice(0,-1).join('.');
		saveJPEG( myDoc, new File(myDoc.path + '/_' + myDocName + ' resized to ' + myDoc.width + ' x ' + myDoc.height), 10, myDoc.width, myDoc.height );
		myDoc.close(SaveOptions.DONOTSAVECHANGES);
	}
} else {

	// if folder is not chosen or both width and height are not set, show error
	alert(!myFolder
		? 'Folder not chosen. Run the script again, please. Не выбрана папка. Запустите скрипт ещё раз, не забудьте выбрать папку.'
		: 'Width/height not chosen. Run the script again, please. Не выбраны ширина и высота. Запустите скрипт ещё раз, не забудьте выбрать ширину или высоту.'
	)
}