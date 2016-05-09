var formData = null;
var formHtml = null;
var canTouch = false;
var touchDelay = 2;
var currentEventId = null;
var currentInstanceId = 0;
var isEditingEvent = false;
var isEditingEventInstance = false;
var isEditingComment = false;
var commentStorage = null;
var eventInstanceStorage = null;
var eventInstanceAction = null;
var eventInstanceElement = null;
var selectedEventDate = null;

$(document).ready(function() {
	// $('#form-area').fadeTo('slow',.6);
	// var width = $('#form-area').width();
	// var height = $('#form-area').height();
	// var top = $('#form-area').position().top;
	// var left = $('#form-area').position().left;
	// $('#form-area').append('<div id="disabled-div" style="border: 1px solid red;background: yellow;position: absolute;top:' + top + 'px;left:' + left + 'px;width:' + width + 'px;height:' + height + 'px;z-index:2;opacity:0.4;filter: alpha(opacity = 50)"></div>'); 
    globalHandlers();
    bindEventListHandlers();
    hideEventControls();
});

function hideEventControls() {
    //hide to start with events unselected
    $('#edit-event').hide();
    $('#share-event').hide();
    $('#delete-event').hide();    
}

function convertEventsFromMySQLRecords(eventRecords) {
    var events = new Array();

    for(var i = 0; i < eventRecords.length; i++) {
        events[i] = new Array();

        events[i]['start-date'] = mySQLDateTom2d2y4(dateFromMySQLTimeStamp(eventRecords[i]['start_time']), '/');
        events[i]['start-time'] = timeFromMySQLTimeStamp(eventRecords[i]['start_time']);
        events[i]['end-date'] = mySQLDateTom2d2y4(dateFromMySQLTimeStamp(eventRecords[i]['stop_time']), '/');
        events[i]['end-time'] = timeFromMySQLTimeStamp(eventRecords[i]['stop_time']);
    }

    return events;
}

function bindEventListHandlers() {
    globalHandlers();
    $('#event-list').change(function() {
        //if delete event button not detected, remove potential delete confirmation buttons   
        if($('#delete-event').length == 0) {
            $('#really-delete-event').remove();
            $('#dont-delete-event').remove();
            $('#edit-event').after(createButton('Delete', 'delete-event', 'deleteEvent_click()', 'red-button'));
        }
        if($(document.body).attr('data-user-id') == $('#event-list option:selected').attr('data-event-owner-id')) {
            $('#edit-event').show();
            $('#share-event').show();
            $('#delete-event').show();
        }
        else {
            $('#edit-event').hide();
            $('#share-event').hide();
            $('#delete-event').hide();
        }
    });
}

var eventSelectedIndex = null;
var eventDateInput = null;
var form = null;

function createEvent_click() {
    formData = $('#event-selection-form').data();
    formHtml = $('#event-selection-form').outerHtml();
    form = $('#event-selection-form').clone(true);
    eventSelectedIndex = $('#event-list')[0].selectedIndex;
    eventDateInput = $('#event-date').val();

    DOMHelp.ajaxGET('render.php?action=RENDER&form-name=EDIT_EVENT_FORM', 'event-selection-form');
}

function shareEvent_click() {
    $('#share-user-name').val('');    
    initDialogPrompt('Share With Username', { 
        'Ok': function() {
            var shareUsername = $('#share-user-name');
            shareUsername.val(shareUsername.val().trim());
            var url = 'data.php?action=SHARE_EVENT&event-id=' + $('#event-list option:selected').val() +
                            '&share-user-name=' + encodeURIComponent(shareUsername.val());
            DOMHelp.ajaxGET(url, function(response) {
                    var result = $.parseJSON(response);
                    if(result['success'] == 0) {
                        initDialog('Share Error!', "'" + shareUsername.val() + "' is not a valid username.");
                        $('#dialog').dialog('open');
                    } else if(result['success'] == -1) {
                        initDialog('Share Error!', "Event is already shared with '" + shareUsername.val() + "'.");
                        $('#dialog').dialog('open');
                    }
                    else {
                        initDialog('Share Confirmation', "Event successfully shared with '" + shareUsername.val() + "'.");
                        $('#dialog').dialog('open');
                    }
            });
            $(this).dialog('close');
        },
        'Cancel': function() {
            $(this).dialog('close');
        }
    });
    $('#dialog-prompt').dialog('open');
}

function editEvent_click() {
    isEditingEvent = true;
    //save the event selection form data
    formData = $('#event-selection-form').data();
    formHtml = $('#event-selection-form').outerHtml();
    form = $('#event-selection-form').clone(true);
    eventSelectedIndex = $('#event-list')[0].selectedIndex;
    eventDateInput = $('#event-date').val();
    //set eventId param
    eventId = $('#event-list option:selected').val();

    DOMHelp.ajaxGET('render.php?action=RENDER&form-name=EDIT_EVENT_FORM&event-id=' + eventId, 'event-selection-form');
}

var eventIdToDelete = null;

function deleteEvent_click() {
    $('#delete-event').replaceWith(createButton('Really Delete?', 'really-delete-event', 'reallyDeleteEvent_click()', 'red-button'));
    $('#really-delete-event').after(createButton('Do Not Delete', 'dont-delete-event', 'dontDeleteEvent_click()', 'green-button'));
    eventIdToDelete = $('#event-list option:selected').val();
}

function reallyDeleteEvent_click() {
    var eventIsDisplayed = (currentEventId == eventIdToDelete);

    DOMHelp.ajaxGET('data.php?action=DELETE_EVENT&event-id=' + eventIdToDelete, function(response) {
        var result = $.parseJSON(response);
        if(result['success']) {
            //rerender the event selection form as the content will have changed
            DOMHelp.ajaxGET('render.php?action=RENDER&form-name=EVENT_SELECTION_FORM', 'event-selection-form',
            function() {                 
                $('#event-selection-form').data(formData);
                bindEventListHandlers();
                hideEventControls();
            });
            /*this can be displayed, but the event instances will be deleted when you can delete and event
              so it shouldn't make a difference on-screen*/
            if(eventIsDisplayed) {
                eventIsDisplayed = false;
                currentEventId = null;
                $('#event-instance-area').html('<p>No event instances exist for this date.</p>');
            }
        }
        else {
            dontDeleteEvent_click();
            alert('Event could not be deleted.');
        }
    });
}

function dontDeleteEvent_click() {
    $('#really-delete-event').replaceWith(createButton('Delete', 'delete-event', 'deleteEvent_click()', 'red-button'));
    $('#dont-delete-event').remove();
}

function saveEvent_click() {
    var eventLabel = $('#event-label');
    formData = $('#event-selection-form').data();
    eventLabel.val(eventLabel.val().trim());
    if(eventLabel.val().length == 0) {
        $('#event-label').next('span').text('empty string!');
    } else {
        var eventId = $('#edit-event-form').attr('data-event-id');
        //change the eventId variable to the corresponding uri component
        eventId = (eventId != 0) ? '&event-id=' + eventId : '';
        var eventLabel = encodeURIComponent($('#event-label').val().trim());
        var eventDesc = encodeURIComponent($('#event-desc').val().trim());
        DOMHelp.ajaxGET('data.php?action=STORE_EVENT&event-label=' + eventLabel + 
                        '&event-desc=' + eventDesc + eventId, 'edit-event-form'
        , function() {
            if(eventId != '')
                DOMHelp.ajaxGET('render.php?action=RENDER&form-name=EVENT_SELECTION_FORM', 'event-selection-form',
                function() { 
                    $('#event-selection-form').data(formData);
                    $('#event-list')[0].selectedIndex = eventSelectedIndex;                            
                    $('#event-date').val(eventDateInput);
                    bindEventListHandlers();

                    if(selectedEventDate != null && isEditingEvent) {
                        var url = 'render.php?action=RENDER&form-name=EVENT_INSTANCE_AREA' +
                                  '&event-id=' + currentEventId +
                                  '&event-start-date=' + selectedEventDate +
                                  '&event-end-date=' + selectedEventDate;

                        DOMHelp.ajaxGET(url, 'event-instance-area', function() {
                            isEditingEventInstance = isEditingComment = false;
                            $('#edit-event-instance').html('');
                        });
                    }

                    isEditingEvent = false;
                });
        }); //End DOMHelp.ajaxGET()    
    } //if/else(event label empty string)
}

function cancelEvent_click() {
    isEditingEvent = false;
    $('#edit-event-form').replaceWith(form);
    $('#event-list')[0].selectedIndex = eventSelectedIndex;
}

function eventDateIsValid() {
    $('#event-date').next('span').text('');
    var regex = /^(\w{2})\/(\w{2})\/(\w{4})$/;
    var eventDate = $('#event-date');
    eventDate.val(eventDate.val().trim());
    var dateInput = eventDate.val();

    if(regex.exec(dateInput) == null) {
        eventDate.next('span').text('Date must be in mm/dd/yyyy format!');
        return false;
    }
    else if(!numberBetween(RegExp.$1, 1, 12)) {
        eventDate.next('span').text('Month must be between 01 and 12!');
        return false;
    }
    else if(!numberBetween(RegExp.$2, 1, 31)) {
        eventDate.next('span').text('Day must be between 01 and 31!');
        return false;
    }
    else if(!numberBetween(RegExp.$3, 1970, 9999)) {
        eventDate.next('span').text('Year must be between 1970 and 9999!');
        return false;
    }
    else {
        eventDate.next('span').text('');
        return true;
    }
} //End eventDateIsValid()

function dateIsValid(inputId) {
    $(inputId).next('span').text('');
    var regex = /^(\w{2})\/(\w{2})\/(\w{4})$/;
    var date = $(inputId);
    date.val(date.val().trim());
    var dateInput = date.val();

    if(regex.exec(dateInput) == null) {
        date.next('span').text('Date must be in mm/dd/yyyy format!');
        return false;
    }
    else if(!numberBetween(RegExp.$1, 1, 12)) {
        date.next('span').text('Month must be between 01 and 12!');
        return false;
    }
    else if(!numberBetween(RegExp.$2, 1, 31)) {
        date.next('span').text('Day must be between 01 and 31!');
        return false;
    }
    else if(!numberBetween(RegExp.$3, 1970, 9999)) {
        date.next('span').text('Year must be between 1970 and 9999!');
        return false;
    }
    else {
        date.next('span').text('');
        return true;
    }
} //End dateIsValid()

function timeIsValid(inputId) {
    $(inputId).next('span').text('*');
    var regex = /^(\d{1,2}):(\d{2}) ?(am|pm)$/i;
    var eventTime = $(inputId);
    eventTime.val(eventTime.val().trim());
    var dateInput = eventTime.val();   

    if(regex.exec(dateInput) == null) {
        eventTime.next('span').text('Time must be in hh:mm am/pm format!');
    }
    else if(!numberBetween(RegExp.$1, 1, 12)) {
        eventTime.next('span').text('Hour must be between 1 and 12!');
        return false;
    }
    else if(!numberBetween(RegExp.$2, 0, 59)) {
        eventTime.next('span').text('Minute must be between 1 and 59!');
        return false;
    }
    else {
        eventTime.next('span').text('*');
        return true;
    }
} //End timeIsValid()

//start and end date are set to dbDate TODO: change end date for future updates
function selectDate_click() {
    //if an event isn't selected, post an error hint
    if($('#event-list')[0].selectedIndex == -1) {
        $('#event-date').next('span').text('An event must be selected!');
    }
    //else clear the error hint
    else if(eventDateIsValid()) {
        //the jQuery call to val much implement a regex
        //because the subgroup references become garbage
        var dbDate = RegExp.$3 + '-' + RegExp.$1 + '-' + RegExp.$2;
        currentEventId = $('#event-list').val();
        selectedEventDate = dbDate;

        var url = 'render.php?action=RENDER&form-name=EVENT_INSTANCE_AREA' +
                  '&event-id=' + $('#event-list').val() +
                  '&event-start-date=' + dbDate +
                  '&event-end-date=' + dbDate;

        DOMHelp.ajaxGET(url, 'event-instance-area', function() {
            isEditingEventInstance = isEditingComment = false;
            $('#edit-event-instance').html('');

            $('#paper').show();
            var start = m2d2y4ToMySQLDate(getDateXDaysFromDate($('#event-date').val().trim(), -6));
            var end = m2d2y4ToMySQLDate($('#event-date').val().trim());

            trendData.fetchEventInstanceRange($('#event-list').val(), start + ' 00:00:00', end + ' 23:59:59'
            , function(events) {
                var convertedEvents = convertEventsFromMySQLRecords(events);

                eventGraph.paper.clear();
                eventGraph.setEvents(convertedEvents, $('#event-date').val().trim());
                eventGraph.draw();
            });
        });
    } else {
        selectedEventDate = null;
    } //End if/else(selectedEventIndex & eventDateisValid)
} //End selectDate_click()

function logEvent_click() {
    if(isEditingEventInstance)
        alert('Finish editing the current event instance before trying to add another one.');

    if($('#event-list').val() == null) {
        $('#log-event').next('span').text('No event is selected!');
        return;
    }
    else if(!eventDateIsValid()) {
        $('#log-event').next('span').text('Check event date input error.');
        return;
    }
    else $('#log-event').next('span').text('');

    isEditingEventInstance = true;
    //setup url params for making a new instance
    eventInstanceAction = 'STORE_EVENT_INSTANCE';
    eventInstanceElement = 'edit-event-instance';
    var dateString = encodeURIComponent($('#event-date').val().trim());

    var utf8string = encodeURIComponent($('#event-list option:selected').text().replace(/'/g, '&apos;'));
    //var utf8string = escape($('#event-list option:selected').text());
    DOMHelp.ajaxGET('render.php?action=RENDER&form-name=EDIT_EVENT_INSTANCE_FORM&event-id=' + $('#event-list').val() +
                    '&event-date=' + dateString + '&event-end-date=' + dateString +
                    '&event-label=' + utf8string, 'edit-event-instance' ,
                    function() { globalHandlers(); $('#event-start-time').focus(); });
} //End logEvent_click()

function editEventInstance_click(instanceId) {
    currentInstanceId = instanceId;

    if(isEditingEventInstance) {
        alert('Finish editing the current event instance before trying to add another one.');
        return;
    }
    else isEditingEventInstance = true;

    //setup url params for editing an existing instance
    eventInstanceAction = 'EDIT_EVENT_INSTANCE';
    eventInstanceElement = 'edit-event-instance-dynamic';

    var divSelector = 'div[data-event-instance-id=' + instanceId + ']';

    var eventLabel = encodeURIComponent($(divSelector).attr('data-event-instance-label').replace(/'/g, '&apos;'));
    var startDate = mySQLDateTom2d2y4($(divSelector).attr('data-start-date'), '/');
    var endDate = mySQLDateTom2d2y4($(divSelector).attr('data-end-date'), '/');
    var startTime = encodeURIComponent($(divSelector).attr('data-start-time'));
    var endTime = encodeURIComponent($(divSelector).attr('data-end-time'));

    eventInstanceStorage = $(divSelector).outerHtml();
    $(divSelector).replaceWith("<div id='edit-event-instance-dynamic'></div");

    var url = 'render.php?action=RENDER&form-name=EDIT_EVENT_INSTANCE_FORM&event-id=' + currentEventId +
              '&event-label=' + eventLabel +
              '&event-date=' + encodeURIComponent(startDate) +
              '&event-end-date=' + encodeURIComponent(endDate) +
              '&event-start-time=' + startTime +
              '&event-end-time=' + endTime;

    DOMHelp.ajaxGET(url, 'edit-event-instance-dynamic',
                    function() { $('#event-start-time').focus(); globalHandlers(); });
}

function saveEventInstance_click() {
    if(dateIsValid('#event-date-display') && dateIsValid('#event-end-date') &&
       timeIsValid('#event-start-time') && timeIsValid('#event-end-time')) {
        $('#event-start-time').next('span').next('span').text('');
        var eventId = $('#event-list').val();
        var eventStartDate = m2d2y4ToMySQLDate($('#event-date-display').val().trim());
        var eventEndDate = m2d2y4ToMySQLDate($('#event-end-date').val().trim());
        var eventStartTime = eventStartDate + ' ' + to24HourTime($('#event-start-time').val().trim());
        var eventEndTime = eventEndDate + ' ' + to24HourTime($('#event-end-time').val().trim());

        var date1 = jsDateFromStrings($('#event-date-display').val().trim(), $('#event-start-time').val().trim());
        var date2 = jsDateFromStrings($('#event-end-date').val().trim(), $('#event-end-time').val().trim());

        if(date1.getTime() > date2.getTime()) {
            initDialog('Save Event Instance Error!', 'Start time occurs after end time. Please enter a valid time range.');
            $('#dialog').dialog('open');
            //abort
            return;
        }

        eventStartTime = encodeURIComponent(eventStartTime);
        eventEndTime = encodeURIComponent(eventEndTime);

        var url = 'data.php?action=EVENT_COLLISION&event-id=' + eventId +
                  '&instance-id=' + currentInstanceId +
                  '&event-start-date=' + eventStartTime +
                  '&event-end-date=' + eventEndTime;

        DOMHelp.ajaxGET(url, function(response) {
            var result = $.parseJSON(response);
            //if no collision
            if(result == 0) {
                url = 'data.php?action=' + eventInstanceAction + '&event-id=' + eventId + 
                      '&instance-id=' + currentInstanceId + '&event-start-time=' + eventStartTime +
                      '&event-end-time=' + eventEndTime;

                DOMHelp.ajaxGET(url, /*eventInstanceElement, */function(response) {
                    //in case the edit-event-instance div on the top is being used
                    $('#edit-event-instance').html('');
                    url = 'render.php?action=RENDER&form-name=EVENT_INSTANCE_AREA' +
                          '&event-id=' + eventId +
                          '&event-start-date=' + eventStartDate +
                          '&event-end-date=' + eventEndDate;
                    DOMHelp.ajaxGET(url, 'event-instance-area', function() {
                        isEditingEventInstance = false;
                        //fire onEditEventInstance event
                        trendEvents.onEditEventInstance(currentInstanceId);
                        currentInstanceId = 0;
                        eventInstanceStorage = null;
                    });
                });
            } else {
                initDialog('Save Event Instance Error!', 
                    'The time range you provided collides with an existing ' +
                    'event instance. Check logged events on your entered dates.');
                $('#dialog').dialog('open');
            }
        });
    } //if(input valid)
} //End saveEventInstance_click()

function cancelEventInstance_click() {
    isEditingEventInstance = false;
    currentInstanceId = 0;
    if(eventInstanceStorage != null) {
        $('#edit-event-instance-dynamic').replaceWith(eventInstanceStorage);
        eventInstanceStorage = null;
    }
    else $('#edit-event-instance').html('');
}

function deleteEventInstance_click(instanceId) {
    $('#delete-event-instance-' + instanceId).replaceWith(createButton('Really Delete?', 
                                                'really-delete-event-instance-' + instanceId,
                                                'reallyDeleteEventInstance_click(' + instanceId + ')', 'red-button'));
    $('#really-delete-event-instance-' + instanceId).after(createButton('Do Not Delete',
                                                'dont-delete-event-instance-' + instanceId,
                                                'dontDeleteEventInstance_click(' + instanceId + ')',
                                                'green-button'));    
}

function reallyDeleteEventInstance_click(instanceId) {
    DOMHelp.ajaxGET('data.php?action=DELETE_EVENT_INSTANCE&instance-id=' + instanceId, function(response) {
        var result = $.parseJSON(response);
        if(result['success']) {
            currentInstanceId = null;
            instanceElement = $('div[data-event-instance-id=' + instanceId + ']');
            instanceElement.prev('hr').remove();
            instanceElement.remove();
            //fire onEditEventInstance event
            trendEvents.onEditEventInstance(null);
            if($('#event-instance-area').html() == '')
                $('#event-instance-area').html('<p>No event instances exist for this date.</p>');
        }
        else {
            dontDeleteEventInstance_click(instanceId);
            alert('Event Instance could not be deleted.');
        }
    });
}

function dontDeleteEventInstance_click(instanceId) {
    $('#really-delete-event-instance-' + instanceId).replaceWith(createButton('Delete', 'delete-event-instance-' + instanceId,
                                                                              'deleteEventInstance_click(' + instanceId + ')',
                                                                              'red-button'));
    $('#dont-delete-event-instance-' + instanceId).remove();
}

function addComment(instanceId) {
    if($('div[data-comment-id=0]').length) {
        alert('Save or Cancel current comment before trying to add another comment.');
        return;
    }
    isEditingComment = true;
    //store the id for the current event to ensure the value
    currentEventId = $('#event-list option:selected').val();
    //store the id for the current event instance to ensure the value
    currentInstanceId = instanceId;
    $('#comment-area-' + instanceId).append("<div id='comment-0' data-comment-id='0'></div>")
    var url = 'render.php?action=RENDER&form-name=EDIT_COMMENT_FORM&instance-id=' + instanceId;    
    DOMHelp.ajaxGET(url, 'comment-0', function() {
        $('#comment-text').focus();
        $('html, body').animate({
            scrollTop: $("#comment-0").offset().top
        }, 2000);
    });
}

function editComment_click(commentId) {
    if(isEditingComment) {
        alert('Save or Cancel current comment before trying to edit another comment.');
        return;     
    }

    isEditingComment = true;
    commentStorage = $('div[data-comment-id=' + commentId + ']').outerHtml();

    currentInstanceId = $("div[id='comment-" + commentId + "']").attr('data-parent-instance-id');

    var url = 'render.php?action=RENDER&form-name=EDIT_COMMENT_FORM&comment-id=' + commentId;    
    DOMHelp.ajaxGET(url, 'comment-' + commentId/*, function() {
        $('html, body').animate({
            scrollTop: $('#comment-' + commentId).offset().top
        }, 2000);
    }*/);
}

function saveComment_click(commentId) {
    var startDate = $('div[data-event-instance-id=' + currentInstanceId + ']').attr('data-start-date');
    var endDate = $('div[data-event-instance-id=' + currentInstanceId + ']').attr('data-end-date');
    var userId = $(document.body).attr('data-user-id');
    var commentText = $("textarea[id='comment-text']").val().trim();
    startDate = encodeURIComponent(startDate);
    endDate = encodeURIComponent(endDate);
    commentText = encodeURIComponent(commentText/*.replace(/'/g, '&apos;')*/);

    var url = 'data.php?action=STORE_COMMENT&user-id=' + userId +
              '&instance-id=' + currentInstanceId +
              '&comment-id=' + commentId +
              '&comment-text=' + commentText;

    DOMHelp.ajaxGET(url, function() {
        url = 'render.php?action=RENDER&form-name=COMMENT_AREA&instance-id=' + currentInstanceId +
                  '&event-start-date=' + startDate + '&event-end-date=' + endDate;
        DOMHelp.ajaxGET(url, 'comment-area-' + currentInstanceId);
        isEditingComment = false;
    });

}

function cancelComment_click(commentId) {
    if(commentId == 0) $('#comment-' + commentId).remove();
    else $('div[data-comment-id=' + commentId + ']').replaceWith(commentStorage);
    isEditingComment = false;
}

function reallyDeleteComment_click(commentId) {
    var reallyDeleteButton = createButton('Really Delete?', 'delete-comment-' + commentId,
                                          'deleteComment_click(' + commentId + ')', 'red-button');
    var dontDeleteButton = createButton('Do Not Delete', 'dont-delete',
                                        'dontDeleteComment_click(' + commentId + ')', 'green-button');
    $('#delete-comment-' + commentId).replaceWith(reallyDeleteButton);
    $('#delete-comment-' + commentId).after(dontDeleteButton);
}

function deleteComment_click(commentId) {
    var url = 'data.php?action=DELETE_COMMENT&comment-id=' + commentId;
    DOMHelp.ajaxGET(url, function(response) {
        var resp = $.parseJSON(response);
        switch(resp['success']) {
            case true:
                $("div[id='comment-" + commentId + "']").remove();
                break;
            case false:
                alert('Comment was unable to be deleted.');
                break;
        }
    });
}

function dontDeleteComment_click(commentId) {
    var deleteComment = $('#delete-comment-' + commentId);
    deleteComment.next().remove();
    deleteComment.replaceWith(createButton('Delete', 'delete-comment-' + commentId, 
                                           'reallyDeleteComment_click(' + commentId + ')', 'red-button'));
}

function validateEventData() {
    var elem = $(this);

    if(!elem.is(':focus'))
        elem.val(elem.val().trim());
    var elemId = elem.attr('id');

    canSubmit = true;

    switch(elem.attr('type')) {
        case 'text':
            if(elem.val() == '')
            {
                isValid[elemId] = false;
                elem.next('span').text('no input');
            }
            else 
            {
                isValid[elemId] = true;
                elem.next('span').text('*');
            }
            break;
        case 'email':
            if(elem.val() == '')
            {
                isValid[elemId] = false;
                elem.next('span').text('no email');
            }
            else if(!isValidEmailAddress(elem.val()))
            {
                isValid[elemId] = false;
                elem.next('span').text('invalid email');                    
            }
            else
            {
                isValid[elemId] = true;
                elem.next('span').text('*');
            }
            break;
        case 'password':
            if(elemId == 'pass1')
            {
                if(elem.val() == '')
                {
                    isValid[elemId] = false;
                    elem.next('span').text('no password');
                }
                else
                {
                    isValid[elemId] = true;
                    elem.next('span').text('*');
                }
            }
            break;
        default:
            return;
            break;
    } //End switch(elem.attr('type'))

    if((elemId == 'pass1' || elemId == 'pass2') &&
       $('#pass1').val() == $('#pass2').val() && $('#pass1').val() != '')
    {
        isValid['pass2'] = true;
        $('#pass2').css('border', '1px solid green');
        $('#pass2').next('span').text('*');
    }
    else if(elemId == 'pass1' || elemId == 'pass2')
    { 
        isValid['pass2'] = false;
        $('#pass2').css('border', '1px solid #db4d4d');        
        $('#pass2').next('span').text("doesn't match");
    }

    if(isValid[elemId] === false)
        elem.css('border', '1px solid #db4d4d');
    else elem.css('border', '1px solid green');

    for(var key in isValid)
        if(isValid[key] === false)
            canSubmit = false;

} //End validateEventData()

// $(document).ready(function() {
// 	$('#submit').click(function() {
// 		var name = $('#name').val();
// 		var email = $('#email').val();
// 		var contact = $('#contact').val();
// 		var gender = $('input[type=radio]:checked').val();
// 		var msg = $('#msg').val();
// 		if (name == '' || email == '' || contact == '' || gender == '' || msg == '') {
// 			alert('Insertion Failed Some Fields are Blank....!!');
// 		} else {
// 			// Returns successful data submission message when the entered information is stored in database.
// 			$.post('refreshform.php', {
// 				name1: name,
// 				email1: email,
// 				contact1: contact,
// 				gender1: gender,
// 				msg1: msg
// 			}, function(data) {
// 				alert(data);
// 				$('#form')[0].reset(); // To reset form fields
// 			});
// 		} //End if(no data)
// 	}); //End click()
// }); //End ready()