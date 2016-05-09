function print_r(arr, level) {
	var dumped_text = "";
	if(!level) level = 0;

	//The padding given at the beginning of the line.
	var level_padding = "";
	for(var j=0;j<level+1;j++) level_padding += "    ";

	if(typeof(arr) == 'object') { //Array/Hashes/Objects
		for(var item in arr) {
			var value = arr[item];

			//added this as Dates weren't printing content
			if(value instanceof Date) {
				dumped_text += level_padding + "'" + item + "' => \"" + value + "\"\n";				
			} else if(typeof(value) == 'object') { //If it is an array,
				dumped_text += level_padding + "'" + item + "' ...\n";
				dumped_text += print_r(value,level+1);
			} else {
				dumped_text += level_padding + "'" + item + "' => \"" + value + "\"\n";
			}
		}
	} else { //Stings/Chars/Numbers etc.
		dumped_text = "===>"+arr+"<===("+typeof(arr)+")";
	}
	return dumped_text;
}

function cloneObject(obj) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "Object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = cloneObject(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = cloneObject(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
} //End cloneObject()

function notifyUndefinedStatus(object, label) {
	if(object === undefined) alert(label + ' is undefined.');
	else alert(label + ' is defined.');
}

function hourTextFormat(hour24) {
	if(hour24 >= 0 && hour24 <= 11) {
		if(hour24 != 0)	return hour24 + 'a';
		else return '12a';
	}
	else if(hour24 >= 12 && hour24 <= 23) {
		if(hour24 != 12) return (hour24 - 12) + 'p';
		else return '12p';
	}
	else { return 'hour not between 1 & 24'; }
}

function numberBetween(value, lower, upper) {
    return value >= lower && value <= upper;
}

function getDateComponents(dateString) {
    var regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    regex.exec(dateString);
    return {
        month: parseInt(RegExp.$1) - 1, //month nums are zero-based 0-11
        day: parseInt(RegExp.$2),
        year: parseInt(RegExp.$3)
    };
}

function getTimeComponents(timeString) {
    var regex = /^(\d{1,2}):(\d{2}) ?(am|pm)$/;
    regex.exec(timeString);
    var hour = parseInt(RegExp.$1);
    var minute = parseInt(RegExp.$2);

    var amPm = RegExp.$3.toLowerCase();
    switch(amPm) {
        case 'am':
            if(hour == 12) hour = 0;
            break;
        case 'pm':
            if(hour != 12) hour += 12;
            break;
    }
    return {
        hour: hour,
        minute: minute
    };
}

//date mm/dd/yyyy
//xDays can be negative to get days before, and postive for days after
//ex. if you past a date which is a Sunday, and pass -6 to xDays, you'll get the Monday before.
function getDateXDaysFromDate(date, xDays) {
	var originalDate = jsDateFromStrings(date, '12:00am');
	var xDate = addJSDays(originalDate, xDays);

	return dateFromJSDate(xDate);
}

//dateString = mm/dd/yyyy
//timeString = hh:mm am/pm
function jsDateFromStrings(dateString, timeString) {
    var date = getDateComponents(dateString);
    var time = getTimeComponents(timeString);
    return new Date(date.year, date.month, date.day, time.hour, time.minute);
}

//numDays can be negative to subtract days;
//can't be before 1970
function addJSDays(jsDate, numDays) {
    var newDate = new Date();
    newDate.setTime(jsDate.getTime() + (numDays * (24 * 3600000)));
    return newDate;
}

function dateFromJSDate(jsDate) {
    var month = jsDate.getMonth() + 1;
    month = (month < 10) ? '0' + month : month;
    var day = (jsDate.getDate() < 10) ? '0' + jsDate.getDate() : jsDate.getDate();
    return month + '/' + (day + '/' + (jsDate.getYear() + 1900));
}

function timeFromJSDate(jsDate) {
    var hour = jsDate.getHours();
    var minute = jsDate.getMinutes();
    
    //leading zero for minutes less than 10    
    if(minute < 10) minute = '0' + minute;
    
    if(hour >= 0 && hour <= 11) {
        if(hour == 0) hour = 12;
        if(hour < 10) hour = '0' + hour;
        return hour + ':' + minute + 'am';
    }
    else if(hour >= 12 && hour <= 23) {
        if(hour != 12) hour -= 12;
        if(hour < 10) hour = '0' + hour;
        return hour + ':' + minute + 'pm';
    }
    else return '<invalid date>';    
}

//returns null if dateString is not in mySQL date format,
//otherwise the m2d2y4 date string using the delimiter supplied
function mySQLDateTom2d2y4(dateString, delimiter) {
    var regex = /^(\d{4})\-(\d{2})\-(\d{2})$/;
    if(regex.exec(dateString) == null) {
        alert(dateString + ' is not in yyyy-mm-dd format!');
        return null;
    }
    var year = RegExp.$1;
    var month = RegExp.$2;
    var day = RegExp.$3;

    return month + delimiter + day + delimiter + year;
}

//returns null if dateString is not in m2d2y4 date format,
//otherwise the MySQL date string using the delimiter supplied
function m2d2y4ToMySQLDate(dateString) {
    var regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if(regex.exec(dateString) == null) {
        alert(dateString + ' is not in mm/dd/yyyy format!');
        return null;
    }
    var month = RegExp.$1;
    var day = RegExp.$2;
    var year = RegExp.$3;

    return year + '-' + month + '-' + day;
}
        //previously working...delete later if it works
        // function globalHandlers() {
        //     $("form").submit(function() { return false; });
        //     $('.date-picker').datepicker();
        //     $(document).tooltip();

        //     initDialog('Dialog Title', 'Dialog Body Text');
        //     initDialogPrompt('', null);
            
        // } //End globalHandlers()

        // function initDialog(titleText, bodyText) {
        //     //setup dialog
        //     $('#dialog').text(bodyText);
        //     //init dialog
        //     $('#dialog').dialog({
        //         title: titleText,
        //         autoOpen: false,
        //         modal: true,
        //         hide: 'puff',
        //         show: 'slide'
        //     });
        // }

        // function initDialogPrompt(titleText, buttonsJSON) {
        //     $('#dialog-prompt').dialog({
        //         title: titleText,
        //         autoOpen: false,
        //         modal: true,
        //         hide: 'puff',
        //         show: 'slide',
        //         buttons: buttonsJSON
        //     });
        // }

function globalHandlers() {
    $('form').submit(function() { return false; });
    $('.date-picker').datepicker();
    $(document).tooltip();

    initDialog('Dialog Title', 'Dialog Body Text');
    initDialogPrompt('', null);
    
} //End globalHandlers()

function initDialog(titleText, bodyText) {
    //setup dialog
    $('#dialog').text(bodyText);
    //init dialog
    $('#dialog').dialog({
        title: titleText,
        autoOpen: false,
        modal: true,
        hide: 'puff',
        show: 'slide'
    });
}

function initDialogPrompt(titleText, buttonsJSON) {
    $('#dialog-prompt').dialog({
        title: titleText,
        autoOpen: false,
        modal: true,
        hide: 'puff',
        show: 'slide',
        buttons: buttonsJSON
    });
}

//works with 12 hour format;
//returns -1 when time1 < time2
//         1 when time1 > time2
//         0 when time1 = time2
function timeCompare(time1, time2) {
    time1 = time1.toLowerCase();
    time2 = time2.toLowerCase();
    var regex = /^(\d{1,2}):(\d{2}) ?(am|pm)$/;
    regex.exec(time1);
    var time1amPm = RegExp.$3;
    var time1Hour = RegExp.$1;
    var time1Minute = RegExp.$2;    
    regex.exec(time2);
    var time2amPm = RegExp.$3;
    var time2Hour = RegExp.$1;
    var time2Minute = RegExp.$2;

    //if am/pm are different, determine and return
    if(time1amPm == 'am' && time2amPm == 'pm') return -1;
    else if(time1amPm == 'pm' && time2amPm == 'am') return 1;
    //if hours are different determine and return
    if(time1hour < time2hour) return -1;
    else if(time1hour > time2hour) return 1;
    //if minutes are different determine and return
    if(time1Minute < time2Minute) return -1;
    else if(time1Minute > time2Minute) return 1;

    //times are the same
    return 0;
}

function to24HourTime(timeString) {
    timeString = timeString.toLowerCase();
    var regex = /^(\d{1,2}):(\d{2}) ?(am|pm)$/;
    regex.exec(timeString);
    var hour = parseInt(RegExp.$1);
    var minute = parseInt(RegExp.$2);
    var amPm = RegExp.$3;

    if(amPm == 'am' && hour == 12)
        hour = 0;
    else if(amPm == 'pm' && hour != 12)
        hour += 12;

    hour = String(hour);
    if(hour.length == 1) hour = '0' + hour;
    minute = String(minute);
    if(minute.length == 1) minute = '0' + minute;

    return hour + ':' + minute + ':00';
}

function dateFromMySQLTimeStamp(timeString) {
    timeString = timeString.toLowerCase();
    var regex = /^(\d{4})\-(\d{2})\-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/;
    regex.exec(timeString);
    var year = RegExp.$1;
    var month = RegExp.$2;
    var day = RegExp.$3;

    return year + '-' + month + '-' + day;
}

function timeFromMySQLTimeStamp(timeString) {
    timeString = timeString.toLowerCase();
    var regex = /^(\d{4})\-(\d{2})\-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/;
    regex.exec(timeString);
    var hour = parseInt(RegExp.$4);
    var minute = RegExp.$5;
    var amPm = null;

    if(hour < 12) {
        if(hour == 0) hour = 12;
        amPm = 'am';
    }
    else {
        if(hour > 12) hour -= 12;
        amPm = 'pm';
    }

    return hour + ':' + minute + amPm;
}

function indexOfElement(array, element) {
	for(var i = 0; i < array.length; i++)
		if(array[i] === element)
			return i;
	//not found
	return -1;
}

//returns the text content of the passed html, stripping all tags
function getContent(html) {
    return html.replace(/<[^>]*>/g, '');
}

var _context = window.document;

function _$() {
    return _context;
}

function setContext(context) {
    _context = context;
}