/*
	A series of functions that create HTML elements. These are
	a counterpart to a set of the same php functions.
*/

function createButton(label, id, clickHandler, cssClass, addSpace) {
    var classText = (cssClass != false) ? " class='" + cssClass + "' " : '';
    var clickHandlerText = (clickHandler != null) ? " onclick='" + clickHandler + "' " : '';
    var elementText = "<a id='" + id + "'" + classText + clickHandlerText + ">" + label + '</a>';
    if(addSpace != undefined && addSpace === true) elementText += '&nbsp;';
    return elementText;
} // End createButton()