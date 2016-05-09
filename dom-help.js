function createXMLHttpRequest()
{
	//holds new XMLHttpRequest object of the appropriate type
	var xmlhttp = false;

	if (window.XMLHttpRequest)
	{// code for IE7+, Firefox, Chrome, Opera, Safari
		xmlhttp = new XMLHttpRequest();
	}
	else
	{// code for IE6, IE5
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}

	//return the appropriate object
	return xmlhttp;
}

DOMHelp =
{
	lastSibling:function(node)
	{
		var tempObj = node.parentNode.lastChild;
		while(tempObj.nodeType != 1 && tempObj.previousSibling != null)
			tempObj = tempObj.previousSibling;
		//if node type is an element, return tempObj
		return (tempObj.nodeType == 1) ? tempObj : false;
	},
	firstSibling:function(node)
	{
		var tempObj = node.firstChild;
		while(tempObj.nodeType != 1 && tempObj.nextSibling != null)
			tempObj = tempObj.nextSibling;
		//if node type is an element, return tempObj
		return (tempObj.nodeType == 1) ? tempObj : false;
	},
	getText:function(node)
	{
		if(!node.hasChildNodes()){ return false; }
		var regEx = /^\s+$/; //Apparently doesn't require being in quotes
		var tempObj = node.firstChild;
		while(tempObj.nodeType != 3 && tempObj.nextSibling != null || regEx.test(tempObj.nodeValue))
			tempObj = tempObj.nextSibling;
		//if node type is text, return nodeValue
		return (tempObj.nodeType == 3) ? tempObj.nodeValue : false;
	},
	setText:function(node, text)
	{
		if(!node.hasChildNodes()){ return false; }
		var regEx = /^\s+$/; //Apparently doesn't require being in quotes
		var tempObj = node.firstChild;
		while(tempObj.nodeType != 3 && tempObj.nextSibling != null || regEx.test(tempObj.nodeValue))
			tempObj = tempObj.nextSibling;
		//if node type is text
		if(tempObj.nodeType == 3) 
			//set node value to the text parameter
			tempObj.nodeValue = text;
		//else return failure
		else return false;
	},
	createLink:function(to, text)
	{
		var tempObj = document.createElement('a');
		tempObj.appendChild(document.createTextNode(text));
		tempObj.setAttribute('href', to);
		return tempObj;
	},
	createTextElement:function(element, text)
	{
		var tempObj = document.createElement(element);
		tempObj.appendChild(document.createTextNode(text));
		return tempObj;
	},
	closestSibling:function(node, direction)
	{
		var tempObj;
		if(direction == -1 && node.previousSibling != null)
		{
			tempObj = node.previousSibling;
			while(tempObj.nodeType != 1 && tempObj.previousSibling)
				tempObj = tempObj.previousSibling;			
		}
		else if (direction == 1 && node.nextSibling != null)
		{
			tempObj = node.nextSibling;
			while(tempObj.nodeType != 1 && tempObj.nextSibling)
				tempObj = tempObj.nextSibling;	
		}
		//if node type is an element, return tempObj
		return (tempObj.nodeType == 1) ? tempObj : false;
	},
	initDebug:function()
	{
		if(DOMHelp.debug){ DOMHelp.stopDebug(); }
		DOMHelp.debug = document.createElement('div');
		DOMHelp.debug.setAttribute('id', DOMHelp.debugWindowId);
		document.body.insertBefore(DOMHelp.debug, document.body.firstChild);
	},
	setDebug:function(bug)
	{
		if(!DOMHelp.debug) { DOMHelp.initDebug(); }
		DOMHelp.debug.innerHTML += bug + '\n';
	},
	stopDebug:function()
	{
		DOMHelp.debug.parentNode.removeChild(DOMHelp.debug);
		DOMHelp.debug = null;
	},
	/*data sent via GET to the supplied urlTokenString
	  and puts the response in targetElement*/
	//TODO: BUG-sometimes canTouch is true first call and not true the next from desktop
	ajaxGET:function(urlTokenString, targetElement, extraFunctionCall) {
		//store element id string
		var elementId = targetElement;
		if(elementId != null && typeof elementId === 'function')
			//change target element from string to the target element
			targetElement = document.getElementById(targetElement);

		//if url token is empty
		if(urlTokenString.length == 0 && typeof elementId === 'function') {
			//empty target element
			targetElement.innerHTML = "";
			//...and abort
			return;
		}

		//create request object
		var xmlhttp = createXMLHttpRequest();

		var result = false;

		//anon function to handle onreadystatechange
		xmlhttp.onreadystatechange = function()
		{
			//if Ajax is complete
			if(xmlhttp.readyState == 4 && xmlhttp.status == 200) {
				if(!canTouch) {
	                //delay touch reenable
	                setTimeout(function(){ 
	                    canTouch = true;
	                    bindTouchToMouse();
		            	if(typeof elementId === 'function')
		            	{
		            		elementId(xmlhttp.responseText);
		            	}
		            	else if(elementId != null)
		            	{          
		            		if(elementId == 'wordspace')
		            			g_editorEnabled = false;
		            		var dataBackup = $("#" + elementId).data();
							//replace the new blurb placeholder div with the response text
							$("#" + elementId).replaceWith(xmlhttp.responseText);
							$("#" + elementId).data(dataBackup);
						}

						if(extraFunctionCall !== undefined) extraFunctionCall();
	                }, touchDelay);
	                return;
            	} //End can't touch

            	bindTouchToMouse();
            	if(typeof elementId === 'function') {
            		elementId(xmlhttp.responseText);
            	}
            	else if(elementId != null) {
            		if(elementId == 'wordspace')
		            	g_editorEnabled = false;
            		var dataBackup = $("#" + elementId).data();
					//replace the new blurb placeholder div with the response text
					$("#" + elementId).replaceWith(xmlhttp.responseText);
					$("#" + elementId).data(dataBackup);
				}

				if(extraFunctionCall !== undefined) extraFunctionCall();
			}

		} //End onreadystatechange delegate

		//setup get request
		xmlhttp.open("GET", urlTokenString, true); //false for synchronous

		//send request
		xmlhttp.send();

	} //End ajaxGET()
} //End Object DOMHelp