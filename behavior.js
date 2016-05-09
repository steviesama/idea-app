var NewBlurbRequest =
{
    requestCount: new Number(0),
    requests: new Array(), //not in use yet
    getNext:function() {
        this.requestCount++;
        var newRequestTagId = 'NEW_BLURB_' + this.requestCount;
        return newRequestTagId;        
    }
} //End object NewBlurbRequest

var Operation =
{
    current: null,
    sourceId: null,
    source: null,
    sourceList: null,
    targetId: null,
    targetElement: null,
} //End object Operation

var Inquiry = new Object(
{
    blurb: null,
    controls: null,
    prompt: 'Create question prompt:',
    yesLabel: 'Yes',
    noLabel: 'No',
    answer: null,
    init:function() {
        this.prompt = 'Create question prompt:';
        this.yesLabel = 'Yes';
        this.noLabel = 'No';
        this.answer = null;
        // this.yesDelegate = function(){ console.log('this.yesDelegate() not set'); }
        // this.noDelegate = function(){ console.log('this.noDelegate() not set'); }
        this.blurb = null;
        this.controls = null;
    },
    askQuestion:function(prompt, yesLabel, noLabel, blurbId) {
        this.init();        
        this.blurb = $('#' + blurbId);
        this.controls = $('#ui-' + blurbId + '-controls');
        this.prompt = prompt;
        this.yesLabel = yesLabel;
        this.noLabel = noLabel;
        this.renderControls(blurbId);
        g_editorEnabled = true;
        this.blurb.addClass('blurb-move');
    },
    //answer should be set to true/false
    setAnswer:function(answer) {        
        event.stopImmediatePropagation();
        this.answer = answer;
        if(this.answer === true)
            if(this.yesDelegate != null)
                this.yesDelegate();
        else if(this.answer === false)            
            if(this.noDelegate != null)
                this.noDelegate();
        g_editorEnabled = false;
        if(this.blurb.data('controls') != null) {
            this.controls.html(this.blurb.data('controls'));
            this.blurb.removeData('controls');
        }
        resolveDisplay('ui-' + this.blurb.attr('id'));        
        this.controls.removeClass('blurb-error');
    },
    setYesDelegate:function(yesDelegate) {
        this.yesDelegate = yesDelegate;
    },
    setNoDelegate:function(noDelegate) {
        this.noDelegate = noDelegate;
    },
    renderControls:function (blurbId) {
        var promptLabel = "<p>" + this.prompt + "</p>";
        var yesButton = "<li style='display: inline-block'><span role='button' onclick='Inquiry.setAnswer(true)'>" +
                        this.yesLabel + "</span> | </li>";
        var noButton = "<li style='display: inline-block'><span role='button' onclick='Inquiry.setAnswer(false)'>" +
                        this.noLabel + "</span></li>";
        this.blurb.data('controls', this.controls.html());
        this.controls.html(promptLabel + yesButton + noButton);
        this.controls.addClass('blurb-error');
    }
}); //End object Inquiry

//---GLOBAL VARIABLES

//determines whether the an editor is shown, affecting app behavior
var g_editorEnabled = false;
var g_activeUiId = null;
var g_activeEditorId = null;
var g_Mode = false;
var g_activeElementId = null;
var g_currentEvents = null;
var lastTouched = null;
var lastClicked = null;
var touchDelay = 350;
var originalHTML = null;
var canTouch = true;
var g_moveElement = null;
var g_targetId = null;
var g_targetParent = null;
var g_moveType = null;
var g_isVisible = false;
var g_mouseOverElement = false;
var g_mouseover = null;
var g_mouseout = null;
//---blurb params
var g_blurbId = null;
var g_blurbType = null;
var g_blurb = null;
var g_authorId = null;
var g_parentId = null;
var g_subjectId = null;
//---type access
var stringType = "stringType";
var integerType = 1;
var floatType = 1.999;

function bindTouchToMouse() {
    $('li[role="blurb"]').each(function(index, element) {                
        var elementId = '#' + $(element).attr('id');
        $(elementId).unbind('touchstart');
        $(elementId).bind('touchstart', function(){
            //abort on can't touch
            if(!canTouch) return;
            //if lastTouched is set
            if(lastTouched != null) {
                //and it's not this element
                if(lastTouched != elementId) {
                    //trigger onmouseleave for the last touched element
                    $(lastTouched).trigger('onmouseleave');
                }
            }
            //invalidate touch
            canTouch = false;
            $(elementId).trigger('onmouseenter');
        }); //End bind
    });
} //End bindTouchToMouse()

function addDebugMessage(msg) {
    dCon = $('#debug');
    dCon.html(dCon.text() + "<br>" + msg);
} //End addDebugMessage()

function setDebugMessage(msg) {
    dCon = $('#debug');
    dCon.html(msg);
} //End setDebugMessage()

function replaceTagId(tagId, subGroup, newValue) {
    //regex for ui id extraction
    var regex = /^(.*\-)(.*)(_.*\-)(.*)$/;

    //extract active ui id
    return tagId.replace(regex, '$1$2$3' + newValue);
    
} //End replaceTagId

function renderMoveControls(blurbId) {    
    var insertBefore = '';
    var insertAfter = '';
    if(blurbId != 'blurb-0_parentid-0')
    {
        insertBefore = "<li style='display: inline-block'><span role='button' onclick=\"moveElement('BEFORE_BLURB')\">Insert Before</span> | </li>";
        insertAfter = "<li style='display: inline-block'><span role='button' onclick=\"moveElement('AFTER_BLURB')\">Insert After</span> | </li>";
    }
    var insertAsChild = "<li style='display: inline-block'><span role='button' onclick=\"moveElement('CHILD_BLURB')\">Insert As Child</span> | </li>";
    var cancel = "<li style='display: inline-block'><span role='button' onclick=\"moveElement('CANCEL')\">Cancel Move</span></li>";
    var uiControlsId = '#ui-' + blurbId + '-controls';
    $(uiControlsId).html(insertBefore + insertAfter + insertAsChild + cancel);
} //End renderMoveControls()

function extractTagIdArg(tagId, regexArg) {
    return tagId.replace(/^.*\-(.*)_.*\-(.*)$/, regexArg, tagId);
} //End extractTagIdArg()

function getTagFirstChild(tagName) {
	var tag = document.getElementsByTagName(tagName)[0];

	return tag.firstChild;
}

function buildUrlToken(tokenKey, tokenValue) {
    urlToken = '';

    if(tokenKey == null || tokenValue == null)
        return urlToken;

    //---prep token pair
    if(typeof tokenKey == typeof stringType)
        tokenKey = tokenKey.trim();
    if(typeof tokenValue == typeof stringType)
        tokenValue = tokenValue.trim();

    //if token key not empty
    if(tokenKey != '')
        //build url token
        urlToken += "&" + tokenKey + "=" + tokenValue;

    return urlToken;    
} //End buildUrlToken

function buildDataOpUrl(dataOp) {
    var url = "data.php?data-op=" + dataOp;
    url += buildUrlToken("blurb-id", g_blurbId);    
    url += buildUrlToken("blurb-type", g_blurbType);
    url += buildUrlToken("blurb-content", g_blurb);
    url += buildUrlToken("author-id", g_authorId);
    url += buildUrlToken("parent-id", g_parentId); //triggering blurbId will be parent
    url += buildUrlToken("subject-id", g_subjectId);
    url += buildUrlToken("target-id", g_targetId);
    url += buildUrlToken("target-parent-id", g_targetParent);
    url += buildUrlToken("move-type", g_moveType);

    return url;    
} //End buildDataOpUrl()

function moveElement(moveOp) {

    event.stopImmediatePropagation();

    //setDebugMessage('moveOp == ' + moveOp);

    g_blurbId = g_moveElement;
    g_targetId = extractTagIdArg(lastClicked, '$1');
    g_targetParent = extractTagIdArg(lastClicked, '$2');
    g_moveType = moveOp;

    var didCancel = false;

    var dataBackup = null;

    if(moveOp != 'CANCEL')
    {
        //remove the originals
        $('#' + g_moveElement).remove();
        $('#' + g_moveElement + '-list').remove();
        dataBackup = Operation.source.data();
    }

    switch(moveOp)
    {
        case 'BEFORE_BLURB':
            if($('#' + lastClicked).attr('role') != 'ROOT')
                $('#' + lastClicked).before(Operation.source);
            break;
        case 'AFTER_BLURB':
            if($('#' + lastClicked).attr('role') != 'ROOT')
                $('#' + lastClicked + '-list').after(Operation.source);
            break;
        case 'CHILD_BLURB':
            //setDebugMessage('CHILD_BLURB MOVE!');
            //$('#' + g_moveElement).appendTo($('#' + lastClicked + '-list'));
            if($('#' + lastClicked).attr('role') != 'WORDSPACE')
                Operation.source.appendTo($('#' + lastClicked + '-list'));
            break;
        case 'CANCEL':
            didCancel = true;
            break;
        default:
            return false;
            break;
    } //End switch(moveOp)

    if(!didCancel)
    {   
        Operation.source.data(dataBackup);
        //wherever it moved, move the child list after it
        Operation.source.after(Operation.sourceList);
        DOMHelp.ajaxGET(buildDataOpUrl(g_Mode), null);
    }

    //build ui controls id
    var uiControlsId = 'ui-' + g_moveElement + "-controls";
    //show controls
    $('#' + uiControlsId).css('display', '');
    resolveDisplay('ui-' + g_moveElement);
    resolveDisplay('ui-' + lastClicked);

    g_moveType = null;
    g_targetId = null;
    lastClicked = null;
    g_moveElement = null;
    g_Mode = null;

} //End moveElement()

function toggleDisplay(elementId) {

    element = $("#" + elementId);

    //if the visible metadata isn't set
    if(element.data('visible') == null)
        //set it
        element.data('visible', (element.css('display') == 'none') ? false : true);
    //toggle element's visible metadata value
    element.data('visible', jQuery.data(element, 'visible') ? false : true)

    //if editor is enabled
    if(g_editorEnabled)
        //abort
        return false;
    //if display is none, return to previous visibility; otherwise hide it
    element.css('display', element.data('visible') ? '' : 'none');
} //End toggleDisplay()

function getBlurbHoverClass() {
    switch(g_Mode)
    {
        case 'MOVE_BLURB':
            return 'blurb-move-target';
            break;
        default:
            return 'blurb-select';
            break;
    } //End switch(g_mode)
} //End getBlurbHoverClass()

function setDisplay(elementId, isVisible) {

    //if this element is moving
    if(elementId == 'ui-' + g_moveElement)
    {    
        setDebugMessage('current element is move element');
        //abort
        return;
    }
    if(g_Mode == 'MOVE_BLURB')
    {    
        setDebugMessage('g_Mode == MOVE_BLURB')
        if($('#' + elementId, '#' + g_moveElement + '-list').length == 1)
        {//if(jQuery.contains(document.getElementById(elementId), document.getElementById(g_moveElement)))            
            setDebugMessage('current element contained in move element')
            return;
        }
    }

    element = $("#" + elementId);

    g_isVisible = isVisible;
    //toggle element's visible metadata value
    element.data('visible', isVisible);

    //if editor is enabled
    if(g_editorEnabled)    
        //abort
        return false;

    var regex = /^(ui\-)(.*)$/;

    var blurbId = elementId.replace(regex, '$2');

    //for touch wiring
    lastTouched = "#" + blurbId;

    //extract the blurb id and get the element
    var blurb = $("#" + blurbId);

    if(g_Mode == 'MOVE_BLURB')
    {
        //setDebugMessage('moveElement == ' + g_moveElement + '<br>moveTarget == ' + blurbId);
        if(blurb.data('controls') == null && isVisible)
        {
            //store the innerHTML
            blurb.data('controls', element.html());
            originalHTML = element.html();
            //alter innerHTML
            renderMoveControls(blurbId);
        }
        else if(blurb.data('controls') != null && !isVisible)
        {
            //restore old controls
            element.html(blurb.data('controls'));
            blurb.removeData('controls');
        }
    } //End if g_Mode == 'MOVE_BLURB'
    else blurb.removeData('controls');

    g_activeElementId = elementId;

    //if visible
    if(isVisible)
        //add the hover class
        blurb.addClass(getBlurbHoverClass());
    //else remove it
    else blurb.removeClass(getBlurbHoverClass());

    lastClicked = blurbId;

    if(!canTouch)
    {
        //delay touch reenable
        setTimeout(function(){
            element.css('display', isVisible ? '' : 'none');
            canTouch = true;                    
        }, touchDelay);
        return;
    } //End can't touch

    //if display is none, return to previous visibility; otherwise hide it
    element.css('display', isVisible ? '' : 'none');
} //End setDisplay()

//resolves display property based on elementId's visible meta-data
function resolveDisplay(elementId) {
    element = $("#" + elementId);

    //if the visible meta-data isn't set
    if(element.data('visible') == null)
        //set it
        element.data('visible', (element.css('display') == 'none') ? false : true);

    var regex = /^(ui\-)(.*)$/;

    var blurbId = elementId.replace(regex, '$2');
    //extract the blurb id and get the element
    var blurb = $("#" + blurbId);

    //set to strictly invisible
    blurb.removeClass('blurb-select');
    blurb.removeClass('blurb-move');    
    blurb.removeClass('blurb-move-target');
    $('#' + blurbId + '-list').removeClass('blurb-error');

    g_isVisible = false;
    element.data('visible', g_isVisible);

    if(blurb.data('controls') != null)
    {
        //restore old controls
        element.html(blurb.data('controls'));
        blurb.removeData('controls');
    }    

    //if display is none, return to previous visibility; otherwise hide it
    //element.css('display', jQuery.data(element, 'visible') ? '' : 'none');

    //just turn off display for now
    element.css('display', 'none');
} //End resolveDisplay()

function onClickAdd(blurbChildId, editorId, blurbId, authorId, parentId, subjectId) {    
    //if editor is enabled
    if(g_editorEnabled)
        //abort
        return null;

    //enable editor
    g_editorEnabled = true;

    //set blurb params
    g_blurbId = blurbId; //ensure right controls modified
    g_blurb = '';
    g_blurbType = 'BLURB';
    g_authorId = authorId;
    g_subjectId = subjectId;
    //this line would just use the parentId argument in onClickEdit
    g_parentId = extractTagIdArg(blurbId, '$1');

    //set save operation type
    g_Mode = 'ADD_BLURB';


    //---show/focus editor
    $("#" + editorId).slideDown();
    $("#" + editorId).focus();

    //regex for ui id extraction
    var regex = /^(editor\-)(.*)$/;

    //extract active ui id
    g_activeUiId = editorId.replace(regex, '$2');

    //---START ajax stuff

    //build ui controls id
    var uiControlsId = g_activeUiId + "-controls";

    $('#' + uiControlsId).css('display', 'none');
    //render save controls
    DOMHelp.ajaxGET(buildDataOpUrl("RENDER_SAVE_CONTROLS"), uiControlsId);

    //---END ajax stuff
} //End onClickAdd()

function onClickSave(blurbChildId, editorId, blurbId, authorId, parentId, subjectId, blurbType) {
    //if save mode is false
    if(g_Mode === false)
        //abort, invalid save operation
        return false;

    //event.stopImmediatePropagation();

    //may not be necessary
    //var parent = document.getElementById(blurbId);
    var textArea = document.getElementById(editorId);
    var ulList = document.getElementById(blurbChildId);
    textArea.value = textArea.value.trim();
    //if text area is empty, abort 
    if(textArea.value == '') return;

    //default target element to blurb id
    var targetElement = blurbId;
    var url = null;

    g_blurb = encodeURIComponent(textArea.value);

    g_blurbType = blurbType;

    if(g_Mode == 'ADD_BLURB')        
    {            
        targetElement = NewBlurbRequest.getNext();
        var div = DOMHelp.createTextElement('div', "INSERT DATA HERE");
        div.setAttribute('id', targetElement);
        ulList.appendChild(div);
        tempId = g_blurbId;
        g_blurbId = 'NULL';
        url = buildDataOpUrl(g_Mode);
        g_blurbId = tempId;    
    }
    else 
    {
        url = buildDataOpUrl(g_Mode);

        var originalChildList = $('#' + blurbId + '-list');        
        var blurbChildren = originalChildList.children();
        originalChildList.attr('id', 'old-list');

        //wherever it moved, move the child list after it
        if(blurbType == 'WORDSPACE' || blurbType == 'SECTION')
            $('#' + blurbId).after('<div id="' + blurbId + '-list"></div>');
        else if(blurbType == 'BLURB')
            $('#' + blurbId).after('<ul id="' + blurbId + '-list"></ul>');

        blurbChildren.appendTo($('#' + blurbId + '-list'));
        $('#old-list').remove();
    }

    //---START ajax stuff

    //clear text area
    textArea.value = '';   

    //---invalidate editing variables
    g_Mode = false;
    setTimeout(function(){g_editorEnabled = false;}, 100);

    /*indicates blurb isn't saved yet
      will be removed automatically when ajax overwrites it*/
    $('#' + targetElement).addClass('blurb-error');

    DOMHelp.ajaxGET(url, targetElement);

    //---END ajax stuff

    //hide editor
    $("#" + editorId).slideUp();

    //---START ajax stuff

    //build ui controls id
    var uiControlsId = g_activeUiId + "-controls";

    //alert('g_blurbId' == g_blurbId);
    g_parentId = extractTagIdArg(g_blurbId, '$2');

    //hide controls until rerender
    $('#' + uiControlsId).css('display', 'none');

    //render edit controls
    DOMHelp.ajaxGET(buildDataOpUrl(($('#' + lastClicked).attr("role") == 'ROOT') ? 'RENDER_ROOT_CONTROLS' : 'RENDER_EDIT_CONTROLS'), uiControlsId);

    //---END ajax stuff

    //---revert controls display
    $("#" + editorId).blur();
    resolveDisplay(g_activeUiId);
} //End onClickSave()

function onClickEdit(blurbChildId, editorId, blurbId, authorId, parentId, subjectId) {
    //if editor is enabled
    if(g_editorEnabled)
        //abort
        return null;
    //enable editor
    g_editorEnabled = true;

    //set blurb params
    g_blurbId = blurbId; //ensure right controls modified
    g_blurbType = 'BLURB';
    g_blurb = $('#data-' + blurbId).text().trim();
    g_authorId = authorId;    
    g_subjectId = subjectId;
    g_parentId = parentId;

    //set the editor text to the blurb
    document.getElementById(editorId).value = g_blurb;

    //set save operation type
    g_Mode = 'EDIT_BLURB';

    //---show/focus editor
    editor = $("#" + editorId);
    editor.slideDown();
    editor.focus();
    editor.select();

    if(extractTagIdArg(blurbId, '$1') == parentId)
        alert("blurbId == " + blurbId + "!!!\nparentId == " + parentId + "!!!");
    //regex for ui id extraction
    var regex = /^(editor\-)(.*)$/;

    //extract active ui id
    g_activeUiId = editorId.replace(regex, '$2');

    //---START ajax stuff

    //build ui controls id
    var uiControlsId = g_activeUiId + "-controls";    

    $('#' + uiControlsId).css('display', 'none');
    //render save controls
    DOMHelp.ajaxGET(buildDataOpUrl("RENDER_SAVE_CONTROLS"), uiControlsId);

    //---END ajax stuff
} //End onClickEdit()

function onClickMove(blurbChildId, editorId, blurbId, authorId, parentId, subjectId) {
    //if editor is enabled
    if(g_editorEnabled)
        //abort
        return null;

    event.stopImmediatePropagation();

    //set blurb params
    g_blurbId = blurbId; //ensure right controls modified    
    g_blurb = $('#data-' + blurbId).text().trim();
    g_authorId = authorId;
    g_subjectId = subjectId;
    g_parentId = parentId;

    //set save operation type
    g_Mode = 'MOVE_BLURB';
    g_moveElement = blurbId;

    Operation.current = g_Mode;
    Operation.sourceId = blurbId;
    Operation.source = $('#' + blurbId).clone(true);
    Operation.sourceList = $('#' + blurbId + '-list').clone(true);

    //---this entire code block was a shitty idea possibly
    // $('#' + blurbId).unbind('click');
    // //click fires the same time the click
    // setTimeout(
    //     function (){
    //     $('#' + blurbId).one('click', function(){ 
    //         moveElement('CANCEL');
    //     });},
    //     250
    // );

    $('#' + blurbId + '-list').addClass('blurb-error');

    if(extractTagIdArg(blurbId, '$1') == parentId)
        alert("blurbId == " + blurbId + "!!!\nparentId == " + parentId + "!!!");

    //extract the blurb id and get the element
    var blurb = $('#' + blurbId);

    blurb.addClass('blurb-move');

    //regex for ui id extraction
    var regex = /^(editor\-)(.*)$/;

    //extract active ui id
    g_activeUiId = editorId.replace(regex, '$2');

    //---START ajax stuff

    //build ui controls id
    var uiControlsId = g_activeUiId + "-controls";
    //hide controls
    $('#' + uiControlsId).css('display', 'none');
    //render save controls
    //DOMHelp.ajaxGET(buildDataOpUrl("RENDER_SAVE_CONTROLS"), uiControlsId);

    //---END ajax stuff
} //End onClickMove()

function onClickCancel(editorId) {    
    event.stopImmediatePropagation();

    //hide editor
    $('#' + editorId).slideUp();
    document.getElementById(editorId).value = '';

    //---START ajax stuff

    //build ui controls id
    var uiControlsId = g_activeUiId + "-controls";

    //alert('g_blurbId' == g_blurbId);
    g_parentId = extractTagIdArg(g_blurbId, '$2');

    //hide controls until rerender
    $('#' + uiControlsId).css('display', 'none');

    //render edit controls
    var op = $('#' + lastClicked).attr("role") == 'ROOT' ? 'RENDER_ROOT_CONTROLS' : 'RENDER_EDIT_CONTROLS';
    DOMHelp.ajaxGET(buildDataOpUrl(op), uiControlsId);

    //remove the container for the cancelled blurb
    //$('#NEW_BLURB').remove(); //don't THINK this is necessary anymore

    //---END ajax stuff

    //---revert controls display
    $("#" + editorId).blur();
    resolveDisplay(g_activeUiId);

    //---invalidate editing variables
    g_Mode = false;
    g_editorEnabled = false;
} //End onClickCancel()

var removeBlurb;

//Will be used to remove the selected element from the database.
function onClickRemove(blurbId) {
    event.stopImmediatePropagation();

    g_blurbId = extractTagIdArg(blurbId, '$1');;
    g_blurb = '';
    g_authorId = 0;
    g_parentId = 0;
    g_subjectId = 0;

    //define the function that should run on yes click

    Inquiry.yesDelegate = function () {
        var url = buildDataOpUrl("REMOVE_BLURB");

        DOMHelp.ajaxGET(url, blurbId);
        $('#' + blurbId).remove();
        $('#' + blurbId + '-list').remove();
    }

    //set up question controls
    Inquiry.askQuestion('Are you sure you want to permanently remove this Blurb?', 'Yes', 'No', blurbId);

} //End onClickRemove()

//requests a wordspace render of the wordspace whose id is passed
function gotoWordSpace(wordSpaceId) {
    //if editor is enabled
    if(g_editorEnabled)
        //abort
        return null;

    g_editorEnabled = true;

    g_targetId = wordSpaceId;

    $('#ui-' + lastClicked + '-controls').css('display', 'none');

    //---indicate click action received
    $('#wordspace').addClass('blurb-move');

    DOMHelp.ajaxGET(buildDataOpUrl('RENDER_WORDSPACE'), 'wordspace');
} //End gotoWordSpace()

function toggleChildList(elementId) {
    if(g_Mode == 'MOVE_BLURB' || g_editorEnabled)
        return;

    event.stopImmediatePropagation();
    $('#' + elementId).slideToggle();
}