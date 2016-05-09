<?php
    session_start();
    if (isset($_GET['action']) && $_GET['action'] == 'LOG_OUT')
    {        
        $_SESSION = array();
        session_destroy();        
    }
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
	<title>Trend Logger (Login)</title>
    <meta http-equiv="content-type" content="text/html; charset=utf-8">
    <meta NAME="ROBOTS" CONTENT="NOINDEX, NOFOLLOW">
    <meta name="description" content="Trend Logger login page">
	<link href="style.css" rel="stylesheet">
    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script>
    <script type="text/javascript" src="dom-help.js"></script>    
    <script type="text/javascript" src="register.js"></script>
    <!--[if lt IE 9]>
    <script src="html5shim.googlecode.com/svn/trunk/html5.js"></script>
    <![endif]-->
</head>

<?php

    require_once('includes/inc_connect.php');
    require_once('includes/inc_utilities.php');
    require_once('includes/inc_trend_utilities.php');

?>

<body>

    <!--<div id="wrapper">-->
            
        <div class="content">

            <?php createButtonLink('Home', 'home-button', 'http://trend.6dnx.com', 'green-button'); ?>

            <h1>Trend Logger - (Login)</h1>

            <?php
            $username = '';
            $usernameMsg = strip('*');
            $password = '';
            $passwordMsg = '*';

            $authenticated = false;
            $record = null;
            if(isset($_POST['username']) && isset($_POST['password']))
            {
                $username = strip($_POST['username']);
                $password = strip($_POST['password']);
                $dbName = 'trend';
                $table = 'tblUser';
                $whereClause = "WHERE user_name='{$username}' AND user_password='{$password}' AND user_confirmed=1";                
                if(getRecordCountWhere($table, $dbName, null, $whereClause) == 1)
                {
                    $authenticated = true;
                    $record = getRecordsWhere($table, $dbName, null, $whereClause)[0];
                    //copy column data into session globals
                    foreach($record as $key => $column)
                        $_SESSION[$key] = $column;
                    ?>
                    <h4>Login Successful!</h4>
                    <p>Please click <?php createButtonLink('here', 'here-button', '/', 'green-button'); ?>to enter Trend Logger.</p>
                    <?php
                }
                else
                {
                    $passwordMsg = 'possibly invalid';
                    if(getRecordCountWhere($table, $dbName, null, "WHERE user_name='{$username}'") == 0)
                        $usernameMsg = 'invalid username';
                    else if(getRecordCountWhere($table, $dbName, null, "WHERE user_name='{$username}' AND user_confirmed=1") == 0) {
                        $usernameMsg = 'account not confirmed';
                    }
                    else $passwordMsg = 'invalid password';
                }
                ?>

                <?php
            } //End username and password set

            if($authenticated === false && empty($_GET['action'])) {
                ?>
                <form id='login-form' action='login.php' method='post'>

                    <p>
                        <label for='username'>Username:</label><br>
                        <input type='text' id='username' name='username' required='required' placeholder='enter username...' size='30' value='<?php echo $username; ?>' autofocus><span><?php echo $usernameMsg; ?></span><br>
                        <label for='password'>Password:</label><br>
                        <input type='password' id='password' name='password' required='required' placeholder='enter password...' size='30' value='<?php echo $password; ?>'><span><?php echo $passwordMsg; ?></span>
                    </p>

                    <p>                        
                        <input class='green-button' type='submit' name='submit' value='Login'>
                    </p>

                </form>                
                <?php
                if($usernameMsg == 'account not confirmed') {
                    $record = getRecordsWhere('tblUser', 'trend', null, "WHERE user_name='{$username}'")[0];
                    $msg = "<p>Please click the following link to verify and enable your Trend Logger account.</p>\n";
                    $link = "http://trend.6dnx.com/register.php?action=VERIFY&user-id={$record['user_id']}&user-email={$record['user_email']}";
                    $msg .= "<a href='{$link}'>{$link}</a>\n";                  
                    sendEmail('trendlogger.6dnx@gmail.com', $record['user_email'], 'Trend Logger E-Mail Verification Link', $msg);
                    echo "<h4>Another verification link has been sent to the email address you registered with!</h4>\n";
                }
            } else if(isset($_GET['action']) && $_GET['action'] == 'LOG_OUT') {
                ?>          
                <h4>Logout Successful!</h4>
                <p>
                    <?php
                    createButtonLink('Trend Logger', 'trend-logger-button', '/', 'green-button');
                    createButtonLink('Login', 'login-button', 'login.php', 'green-button');1
                    ?>
                </p>
                <?php
            }
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

    <!--</div> <!--End #wrapper-->
    
</body>
</html>