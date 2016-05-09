<?php
    session_start();
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
	<title>Trend Logger</title>
    <meta http-equiv="content-type" content="text/html; charset=utf-8">
    <meta NAME="ROBOTS" CONTENT="NOINDEX, NOFOLLOW">
    <meta name="description" content="WordSpace registration page">
	<link href="style.css" rel="stylesheet">
	<link rel="icon" href="favicon.ico" type="image/x-icon">
    
    <link rel="stylesheet" href="//code.jquery.com/ui/1.11.4/themes/smoothness/jquery-ui.css">
    <script type='text/javascript' src='//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js'></script>
    <script type='text/javascript' src="//code.jquery.com/ui/1.11.4/jquery-ui.js"></script>
    <script type='text/javascript' src='jquery.plugins.js'></script>
    <script type='text/javascript' src='dom-help.js'></script>
    <script type='text/javascript' src='js/html.js'></script>
    <script type="text/javascript" src='js/utilities.js'></script>
    <script type='text/javascript' src='behavior.js'></script>
    <script type='text/javascript' src='register.js'></script>
    <script type='text/javascript'>
        //touch event hack
        $(document).ready(function(){
            $('#login-form input').each(function(index, element) {
                $(element).bind('blur', validate);
            });
            $("#login-form input[type='email'], #login-form input[type='password']").each(function(index, element) {
                $(element).bind('keyup', validate);
            });            
            $('#login-form textarea').bind('blur', function(){ attemptRegistration(false); });
            //setup on submit registration
            $('#submit').click(function(event){
                if (!attemptRegistration(true)) {
                    event.preventDefault();
                }
            });
            globalHandlers();
        }); //End doc ready
    </script>
    <!--[if lt IE 9]>
    <script src="html5shim.googlecode.com/svn/trunk/html5.js"></script>
    <![endif]-->
</head>

<?php
    require_once('includes/inc_utilities.php');    
    require_once('includes/inc_trend_utilities.php');
?>

<body>            
<div id='content' class='content'>

    <?php
    if(isset($_GET['action']) && $_GET['action'] == 'VERIFY')
    {
        $userId = null;
        $userEmail = null;
        $tokensGood = true;
        $verified = false;

        if(getUrlToken($userId, 'user-id') === false)
        {
            showError('user-id URL Token not set!!!');
            $tokensGood = false;
        }
        if(getUrlToken($userEmail, 'user-email') === false)
        {
            showError('user-email URL Token not set!!!');
            $tokensGood = false;
        }

        if($tokensGood === true)
        {
            if(empty($_SESSION['user_id'])) {
                createButtonLink('Login', 'login-button', 'http://trend.6dnx.com/login.php', 'green-button');
                createButtonLink('Register', 'register-button', 'http://trend.6dnx.com/register.php', 'red-button');
            }
            else {            
                echo "{$_SESSION['user_firstname']} {$_SESSION['user_lastname']} ({$_SESSION['user_email']})";
                echo createButton('Logout', 'log-out-button', 
                    'window.location.href="http://trend.6dnx.com/login.php?action=LOG_OUT"', 'red-button');
            }
            ?>
            <h1>Trend Logger - (Registration Verification)</h1>
            <?php
            $dbName = 'trend';
            $table = 'tblUser';
            $dbConnection = null;
            dbConnect($dbConnection);
            $records = getRecordsWhere($table, $dbName, $dbConnection, "WHERE user_id=$userId AND user_email='{$userEmail}'");
            if(count($records) == 1)
            {
                ?>
                <h4><?php echo $records[0]['user_firstname']; ?>, your user account is verified!</h4>
                <?php
                if(selectDatabase($dbName, $dbConnection))
                {
                    $queryString = "UPDATE $table SET user_confirmed=1 WHERE user_id=$userId";
                    @mysql_query($queryString, $dbCon);
                }
                ?>
                <p>Please click <?php createButtonLink('here', 'here-button', '/', 'green-button'); ?>and login with your new account credentials.</p> 
            <?php
            } //End if verified
            else
            {
                ?>
                <h4>Your user account is not verified.</h4>
                <p>You have a bad or tampered with link.  Your account information couldn&apos;t be located in the database.</p>
                <?php                        
            }
            dbClose($dbConnection);
        } //End if $tokensGood
    }
    else
    {
        $agent = null;
        $cols = 60;
        if(isset($_SERVER['HTTP_USER_AGENT']))
        {
            $agent = $_SERVER['HTTP_USER_AGENT'];

            //if firefox is user agent
            if(strlen(strstr($agent,"Firefox")) > 0 )
                $cols = 47;
        }
        if(empty($_SESSION['user_id'])) {
            createButtonLink('Login', 'login-button', 'http://trend.6dnx.com/login.php', 'green-button');
            createButtonLink('Register', 'register-button', 'http://trend.6dnx.com/register.php', 'red-button');
        }
        else {            
            echo "{$_SESSION['user_firstname']} {$_SESSION['user_lastname']} ({$_SESSION['user_email']})";
            echo createButton('Logout', 'log-out-button', 
                'window.location.href="http://trend.6dnx.com/login.php?action=LOG_OUT"', 'red-button');
        }
        ?>
        <h1>Trend Logger - (Register)</h1>

        <h4>Don&apos;t use spaces or non-printable characters</h4>

            <p>
                After filling out your credentials, click the Check button to see if
                your username, email, etc. are available. Then if the Register button
                becomes enabled, click to register. If it doesn&apos;t, correct
                registration information.
            </p>
            <br>

        <form id="login-form" action="index.php" method="post">

            <p>
                <label for="first-name">Your First Name:</label><br>
                <input type="text" id="first-name" name="first-name" required="required" placeholder="your first name..." size="40"><span>*</span><br>
                <label for="last-name">Your Last Name:</label><br>
                <input type="text" id="last-name" name="last-name" required="required" placeholder="your last name..." size="40"><span>*</span><br>
                <label for="email">Your E-Mail Address:</label><br>
                <input type="email" id="email" name="email" required="required" placeholder="yourname@yourdomain.com" size="40"><span>*</span><br>
                <label for="username">Username:</label><br>
                <input type="text" id="username" name="username" required="required" placeholder="enter a username" size="40"><span>*</span><br>
                <label for="pass1">Password:</label><br>
                <input type="password" id="pass1" name="pass1" required="required" placeholder="enter a password" size="40"><span>*</span><br>
                <label for="pass2">Confirm Password:</label><br>
                <input type="password" id="pass2" name="pass2" required="required" placeholder="confirm password" size="40"><span>*</span><br>
                <label for="profile-desc">Profile Description:</label><br>
                <textarea id="profile-desc" name='profile-desc' rows='8' cols='<?php echo $cols; ?>' placeholder="enter profile description here..."></textarea>
            </p>

            <p>
                <input type="reset" value="Reset">                        
                <input type="button" id="check" name="check" value="Check" onclick="attemptRegistration(false)">
                <input type="submit" id="submit" name="submit" value="Register" disabled="disabled" onsubmit='function(){return true;}'>
            </p>

        </form>
    <?php
    } //End else show form
    ?>    
    <footer>
        <span>
            Trend Logger, Copyright <?php echo @date(Y); ?> &copy; C.S. Taylor, Jr.&nbsp;<br>
            <?php 
            createButtonLink('steviesama@gmail.com', 'email-button', 
                             'mailto:steviesama@gmail.com', 'red-button', true);
            ?>                
        </span>
    </footer>
</div> <!--End #content-->
</body>
</html>