<?php
    session_start();
    if (isset($_GET['action']) && $_GET['action'] == 'LOG_OUT')
    {        
        $_SESSION = array();
        session_destroy();        
    }
?>
<!doctype html>
<html lang='en'>
<head>
	<title>Trend Logger Home Page</title>
	<meta charset='utf-8'>
	<link rel='stylesheet' href='style.css' type='text/css' media='all'>
	<!-- <link rel="stylesheet" href="//code.jquery.com/ui/1.11.4/themes/smoothness/jquery-ui.css"> -->
	<link rel='stylesheet' href="style/jquery-ui/jquery-ui.css">
    <script type='text/javascript' src='//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js'></script>
    <script type='text/javascript' src="//code.jquery.com/ui/1.11.4/jquery-ui.js"></script>
    <script type='text/javascript' src='jquery.plugins.js'></script>
    <script type='text/javascript' src='dom-help.js'></script>
    <script type='text/javascript' src='behavior.js'></script>
    <script type="text/javascript" src='js/utilities.js'></script>
    <script type='text/javascript' src='trend.js'></script>
    <script type='text/javascript' src='js/html.js'></script>
    <script type="text/javascript" src='js/raphael-min.js'></script>
    <script type="text/javascript" src='js/raphael-utilities.js'></script>
    <script type="text/javascript" src='js/class.trendData.js'></script>
    <script type="text/javascript" src='js/class.trendEvents.js'></script>
    <script type="text/javascript" src='js/class.eventGraph.js'></script>
    <script type="text/javascript">
   		var globals = new function() {
   			this.hourHeight = 15;
   			this.hourWidth = 60;
   			this.hourPadding = 0;
   			this.paperWidth = 450;
   			this.paperHeight = 400 + this.hourHeight;
   		}

    	$(function() {
    		$('.data-picker').datepicker();
    		$(document).tooltip();
    		//RaphaelJS setup
    		eventGraph.init('paper', globals.paperWidth, globals.paperHeight);
    		$('#paper').hide();
    	});
    </script>
</head>

<?php

    require_once('includes/inc_connect.php');
    require_once('includes/inc_utilities.php');
    require_once('includes/inc_trend_utilities.php');

?>

<body data-user-id="<?php echo isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 0; ?>">
	<div class="content">
		<?php
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

		<h1>Trend Logger</h1>

		<?php
			
			if(isset($_SESSION['user_id']))
		    {
		    	require_once('includes/inc_trend_logger.php');
		    }
		    else
		    {
		        ?>
		        <h4>Application Description</h4>
				<p>
					Trend Logger is a web application that allows you to create events, such as sleep events,
					and create occurrences of these events as well as add comments to these occurrences. You can specify 
					the date as well as the start and stop time ranges for these occurrences. It will add the total
					time consumed by these occurrences for display.
				</p>

				<p>
					Trend Logger will eventually allow for average daily sleep per week as well as week-to-week
					comparisons, as well as other statistical information.
				</p>

				<h4>Notes</h4>
				<p>
					Be wary of logging event instances that have a time span of less than 3 to 5 minutes as it may be
					difficult or impossible to see the event rendered on the event graph.
				</p>

				<h4>Event Graph Features and an Overview</h4>
				<iframe width="640" height="360" src="https://www.youtube.com/embed/ZFWaFBdfGAs" frameborder="0" allowfullscreen></iframe>
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
	<div id='dialog' title='Dialog Title'>Dialog text.</div>
	<div id='dialog-prompt'>
		<form>
			<label for='share-user-name'>Username</label>
			<input id='share-user-name' type='text' name='share-user-name' class='text ui-widget-content ui-corner-all'>
		</form>
	</div>
</body>
</html>