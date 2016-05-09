var isValid = new Array();
isValid['first-name'] = false;
isValid['last-name'] = false;
isValid['email'] = false;
isValid['username'] = false;
isValid['pass1'] = false;
isValid['pass2'] = false;
var canSubmit = false;

function validate() {
    var elem = $(this);

    if(!elem.is(':focus'))
        elem.val(elem.val().trim());
    var elemId = elem.attr('id');

    canSubmit = true;

    switch(elem.attr('type')) {
        case 'text':
            if(elem.val() == '') {
                isValid[elemId] = false;
                elem.next('span').text('no input');
            } else {
                isValid[elemId] = true;
                elem.next('span').text('*');
            }
            break;
        case 'email':
            if(elem.val() == '') {
                isValid[elemId] = false;
                elem.next('span').text('no email');
            } else if(!isValidEmailAddress(elem.val())) {
                isValid[elemId] = false;
                elem.next('span').text('invalid email');                    
            } else {
                isValid[elemId] = true;
                elem.next('span').text('*');
            }
            break;
        case 'password':
            if(elemId == 'pass1') {
                if(elem.val() == '') {
                    isValid[elemId] = false;
                    elem.next('span').text('no password');
                } else {
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
       $('#pass1').val() == $('#pass2').val() && $('#pass1').val() != '') {
        isValid['pass2'] = true;
        $('#pass2').css('border', '1px solid green');
        $('#pass2').next('span').text('*');
    } else if(elemId == 'pass1' || elemId == 'pass2') { 
        isValid['pass2'] = false;
        $('#pass2').css('border', '1px solid #db4d4d');        
        $('#pass2').next('span').text("doesn't match");
    }

    if(isValid[elemId] === false)
        elem.css('border', '1px solid #db4d4d');
    else
        elem.css('border', '1px solid green');

    for(var key in isValid)
        if(isValid[key] === false)
            canSubmit = false;

} //End validate()

function isValidEmailAddress(emailAddress) {
    var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
    return pattern.test(emailAddress);
}

function registrationResponse(response) {
    var resp = jQuery.parseJSON(response);
    if(resp['registered'] != null) {
        if(resp['registered'] === true )
            canSubmit = true;
        else
            canSubmit = false;

        $('#submit').prop('disabled', !canSubmit);

        if(canSubmit === true) {
            $('#submit').css('border', '1px solid green');            
            //clear invalid fields
            $('#username').next('span').text('*');
            $('#email').next('span').text('*');
        } else {
            if(resp['good-username'] != null) {
                if(resp['good-username'] === false)
                    $('#username').next('span').text('Username taken!');
                else $('#username').next('span').text('*');
            }

            if(resp['good-email'] != null) {
                if(resp['good-email'] === false)
                    $('#email').next('span').text('E-Mail in use!');
                else $('#email').next('span').text('*');
            }

            $('#submit').css('border', '1px solid #db4d4d');

            return false;
        }

        if(canSubmit === true && resp['should-register'] === true) {
            var replaceHTML = "<h1>Idea - (E-Mail Verification)</h1>\n";
            replaceHTML += "<h4>You have successfully registered for Idea!</h4>\n";
            replaceHTML += "<p>An email verification link has been sent to the E-Mail " +
                    "address you registered with.  Please check your E-Mail and " +
                    "click the link to verify and enable your account.</p>\n";
            $('#content').html(replaceHTML);
        }
    }
} //End registrationResponse()

function attemptRegistration(shouldRegister) {    
    if(!canSubmit)
        return false;

    var register = null;

    if(shouldRegister === true)
        register = 'YES';
    else
        register = 'NO';

    var profileDesc = encodeURIComponent($('#profile-desc').val());
    if(profileDesc == '')
        profileDesc = 'empty';

    var url = 'do-registration.php?first-name=' + encodeURIComponent($('#first-name').val().trim());
    url += '&last-name=' + encodeURIComponent($('#last-name').val().trim());
    url += '&email=' + encodeURIComponent($('#email').val().trim());
    url += '&username=' + encodeURIComponent($('#username').val().trim());
    url += '&pass1=' + encodeURIComponent($('#pass1').val().trim());
    url += '&profile-desc=' + profileDesc; //don't trim    
    url += '&should-register=' + register; //don't trim

    //call registrationResponse when ajax completes
    DOMHelp.ajaxGET(url, registrationResponse);

    //don't submit
    return false;
}