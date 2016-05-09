<?php

	require_once('includes/inc_connect.php');

	function showError($errorMessage) {

		echo "<p class='error'>{$errorMessage}</p>\n";

	} //End showError()

	/*display syntax-highlighted php code in $fileName
	  if code block styling is require, create a code-block class*/
	function displayCode($fileName, $stripslashes = false) {

		//if slashes should be stripped
		if($stripslashes === true)
			//strip them
			$fileName = stripslashes($fileName);

		//div to apply the code-block style to
		echo "<div class='code-block'>";
		//syntax highlight the contents of the file
		echo highlight_string(file_get_contents($fileName), true);
		//end code-block div
		echo "</div>";

	} //End displayCode()

	//Gets the default page title or one represented by a url token if one exists
	function pageTitle() {

		//if the title url token is set
		if(isset($_GET['title']))
			//output its value
			echo $_GET['title'];		
		//else output the default page title
		else echo 'The Chinese Zodiac: A Code Demonstration for PHP';

	} //End getPageTitle()

	/*returns an array of chinese zodiac sign names to match return values
	  from getChineseZodiacSignIndex()*/
	function getChineseZodiacSignNames() {
		return array
		(
			"Rat",
			"Ox",
			"Tiger",
			"Rabbit",
			"Dragon",
			"Snake",
			"Horse",
			"Sheep",
			"Monkey",
			"Rooster",
			"Dog",
			"Pig"
		);
	} //End getChineseZodiacSignNames()

	/*calculates and returns an offset into the name array returned by 
	  getChineseZodiacSignNames() and FALSE upon invalid input*/
	function getChineseZodiacSignIndex($birthYear) {
		//if $birthYear isn't a number, or year zero
		if(!is_numeric($birthYear) || $birthYear == 0)
			//return false
			return false;

		//calculate sign with 1912 as a base referencing Rat
		$offset = ($birthYear - 1912) % 12;
		
		//if $birthYear is negative
		if($birthYear < 1912) {
			//if $birthYear is negative
			if($birthYear < 0)
				//add one to the birth year in order to get the correct sign
				$birthYear++;
			//adjust index from other direction
			$offset = 11 - ((1911 - $birthYear) % 12);
		}

		//return the correct offset into the sign names array
		return $offset;

	} //End getChineseZodiacSignIndex()

	//negative numbers are B.C. years
	function formatYearInt($year) {

		//if year given is not numeric
		if(!is_numeric($year))
			//display error
			return "<ERROR: YEAR GIVEN IS NOT A NUMBER!>\n";
		//else is year given is zero
		else if($year == 0)
			//display error
			return "<ERROR: YEAR ZERO IS NOT A YEAR>\n";

		//default year suffix to AD
		$yearSuffix = " AD";

		//if year is negative (BC)
		if($year < 0) {
			//set year suffix
			$yearSuffix = " BC";
			//clear negative sign
			$year = abs($year);
		}

		//if year is more than four digits
		if($year > 9999)
			//insert thousandths separator and BC
			$year = number_format($year) . $yearSuffix;
		//else just append the year suffix
		else  $year .= $yearSuffix;

		//return formatted year
		return $year;

	} //End formatYearInt()

	/*This function gets the content, section, and anchor-id URL Tokens
	(if they are available) and sets the parameters to them by reference.*/
	function getTemplateURLTokens(&$content, &$section, &$anchorId) {

		//if content is set
		if(isset($_GET['content']))
			//set proper content URL Token value
			$content = trim(htmlentities(stripslashes($_GET['content'])));

		//if section is set
		if(isset($_GET['section']))
			//set proper section URL Token value
			$section = $_GET['section'];

		//if anchor-id is set
		if(isset($_GET['anchor-id']))
			//set proper anchor-id URL Token value
			$anchorId = trim(htmlentities(stripslashes($_GET['anchor-id'])));

	} //End getTemplateURLTokens()

	/*This function encapsulates the template URL parsing logic.*/	
	function getTemplateURL() {

		//---to hold the URL Token
		$content = "";
		$section = "";
		$anchorId = "";

		//get template URL Tokens
		getTemplateURLTokens($content, $section, $anchorId);

		//set the template url appropriately
		$templateURL = "index.php?content={$content}&section={$section}&anchor-id={$anchorId}#{$anchorId}";
		
		//return appropriate template URL
		return $templateURL;

	} //End getTemplateURL()

	/*This function creates a template URL from the parameters given.
	  if not anchor id is desire, pass an empty string.*/	
	function createTemplateURL($content, $section, $anchorId) {

		//return the appropriate template URL
		return "index.php?content={$content}&section={$section}&anchor-id={$anchorId}#{$anchorId}";

	} //End createTemplateURL()

	//gets the record count in a table using the specified parameters
	function getRecordCount($table, $dbName, $dbCon) {

		$count = 0;
		$row = 0;

		dbConnect($dbCon);

		if($dbCon !== false)
		{
			if(@mysql_select_db($dbName) === true)
			{
				$resultSet = @mysql_query("SELECT COUNT(*) FROM $table", $dbCon);
				if($resultSet !== false)
				{
					if(($row = @mysql_fetch_row($resultSet)) !== false)
						$count = mysql_result($resultSet, 0);
					else showError('Row NOT FOUND!!');
					mysql_free_result($resultSet);
				}
			}
		}

		$dbDisconnect();

		return $count;

	} //End getRecordCount()

	function getRecordCountWhere($table, $dbName, $dbCon, $whereClause) {

		$count = 0;
		$row = 0;

		dbConnect($dbCon);

		if($dbCon !== false)
		{
			if(@mysql_select_db($dbName) === true)
			{
				$resultSet = @mysql_query("SELECT COUNT(*) FROM $table $whereClause", $dbCon);
				if($resultSet !== false)
				{
					if(($row = @mysql_fetch_row($resultSet)) !== false)
						$count = mysql_result($resultSet, 0);
					else showError('Row NOT FOUND!!');
					mysql_free_result($resultSet);
				}
			}
		}

		dbDisconnect();

		return $count;

	} //End getRecordCountWhere()

	function getRecordsWhere($table, $dbName, $dbCon, $whereClause) {

		$shouldClose = false;
		$records = array();
		$row = 0;

		if($dbCon == null) {
			dbConnect($dbCon);
			$shouldClose = true;
		}

		if($dbCon !== false)
		{
			if(@mysql_select_db($dbName) === true)
			{
				$resultSet = @mysql_query("SELECT * FROM $table $whereClause", $dbCon);
				if($resultSet !== false)
				{
					while(($row = @mysql_fetch_assoc($resultSet)) !== false)
						$records[] = $row;
					mysql_free_result($resultSet);
				}
			}
		}

		if($shouldClose) dbClose($dbCon);

		return $records;

	} //End getRecordsWhere()

	function deleteRecordsWhere($table, $dbName, $dbCon, $whereClause) {
		$result = false;

		if($dbCon == null)
			dbConnect($dbCon);

		if(selectDatabase($dbName, $dbCon))
			$result = @mysql_query("DELETE FROM $table $whereClause", $dbCon);

		dbDisconnect();

		return $result;

	} //End deleteRecordsWhere()

	/*Take a column name, table name, database name, and database connection
	  and fetches the max value of the given column name and returns it.
	  If anything goes wrong, it returns false.*/
	function getMaxColumnValue($columnName, $table, $dbName, $dbCon) {

		$max = 0;
		$row = 0;

		//if database is selected
		if(selectDatabase($dbName, $dbCon)) {
			//store query results
			$resultSet = @mysql_query("SELECT MAX($columnName) FROM $table", $dbCon);
			//if resultSet is good
			if($resultSet !== false) {
				//fetch first row
				if(($row = @mysql_fetch_row($resultSet)) !== false)
					//store max value
					$max = mysql_result($resultSet, 0);
				//free query
				mysql_free_result($resultSet);
			}	
		} //End if selectDatabase()
		//else database not selected, return failure
		else return false;

		//return max value
		return $max;

	} //End getRecordCount()

	/*Takes the name of a database and a reference to a database connection
	  and attempts to selected the database named from the connection supplied
	  then returns the results of the selection.*/
	function selectDatabase($dbName, $dbCon) {

		//if the connection is null
		//if(!isset($dbCon)
			//just set it to false
			//$dbCon = false;

		//if the database connection is valid
		if ($dbCon === false) {
			echo "<p class='error'>Unable to connect to the database server.</p>" .
				 "<p class='error'>Error code " . mysql_errno() . ": " .
				 mysql_error() . "</p>";
		//else database connection is good
		} else {
			//select the database
			$dbSelected = mysql_select_db($dbName, $dbCon);
			//if database not selected
			if ($dbSelected === false) {
				//display error
				echo "<p class='error'>Unable to connect to the database server.</p>\n" .
					 "<p class='error'>Error code " . mysql_errno() . ": " .
					 mysql_error() . "</p>\n";
				//invalidate database connection variable
				$dbCon = false;
			}
			
			//return the result of the database selection
			return $dbSelected;
		} //End database connection validation

	} //End selectDatabase()

	/*Takes a reference to a token key string and checks to see if
	  it is in the GET auto-global array.  If is it, it converts the
	  argument to associated token value.  If it is not, false is returned
	  indicating that the token requested is not available.*/
	function getURLToken(&$tokenValue, $tokenKey) {

		//if token key is set in get array
		if(isset($_GET[$tokenKey])) {
			//echo "$tokenKey IS set!!!<br>";
			//set proper token URL Token value
			$tokenValue = trim(htmlentities(stripslashes($_GET[$tokenKey])));
		//else return failure
		} else { 
			//echo "$tokenKey is NOT set!!!<br>";
			return false;
		}

		//return token in case of success
		return $tokenValue;

	} //End getURLToken()

	function strip($string) {
		return trim(htmlentities(stripslashes($string)));		
	} //End strip()

	/*This function should be used when database
	  selection is already complete.*/
	function getLastInsertId($table, $dbCon) {

		//holds last insert id from $table
		$lastInsertId = false;

		//result set
		$result = mysql_query("SELECT LAST_INSERT_ID() FROM $table", $dbCon);
		//holds the row
		$row;
		//fetch first row
		if(($row = @mysql_fetch_row($result)) !== false) {
			if($row != null)
				//store last insert id			
				$lastInsertId = mysql_result($result, 0);
			else showError("table == $table");
		}

		//return the last insert id, will be false if something went wrong
		return $lastInsertId;

	} //End getLastInsertId()

	function extractTagIdArg($tagId, $regexArg) {
		return preg_replace('/^.*\-(.*)_.*\-(.*)$/', $regexArg, $tagId);
	} //End extractTagIdArg()

	function replaceTagId($tagId, $subGroup, $newValue) {

	    //return replacement replaceTagId
	    return preg_replace("/^(.*\-)(.*)(_.*\-)(.*)$/", '$1$2$3' . $newValue);
	    
	} //End replaceTagId

	function to24HourTime($timeString) {
		$timeString = strtolower($timeString);
		$hour = (int)preg_replace("/^(\d{1,2}):(\d{2}) ?(am|pm)$/", '$1', $timeString);
		$minute = (int)preg_replace("/^(\d{1,2}):(\d{2}) ?(am|pm)$/", '$2', $timeString);
		$amPm = preg_replace("/^(\d{1,2}):(\d{2}) ?(am|pm)$/", '$3', $timeString);
		
		if($amPm == 'am' && $hour == 12)
			$hour = 0;
		else if($amPm == 'pm' && $hour != 12)
			$hour += 12;

		return sprintf('%02d:%02d', $hour, $minute) . ':00';
	}

	function dateFromMySQLTimeStamp($timeString) {
	    $timeString = strtolower($timeString);
	    $pattern = "/^(\d{4})\-(\d{2})\-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/";
	    
	    $year = preg_replace($pattern, '$1', $timeString);
	    $month = preg_replace($pattern, '$2', $timeString);
	    $day = preg_replace($pattern, '$3', $timeString);

	    return $year . '-' . $month . '-' . $day;
	}

	function timeFromMySQLTimeStamp($timeString) {
	    $timeString = strtolower($timeString);
	    $pattern = "/^(\d{4})\-(\d{2})\-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/";

	    $hour = (int)preg_replace($pattern, '$4', $timeString);
	    $minute = preg_replace($pattern, '$5', $timeString);;
	    $amPm = null;

	    if($hour < 12) {
	        if($hour == 0) $hour = 12;
	        $amPm = 'am';
	    }
	    else {
	        if($hour > 12) $hour -= 12;
	        $amPm = 'pm';
	    }

	    return $hour . ':' . $minute . $amPm;
	}

    function getBlurbId($blurbRow) {
    	return 'blurb-' . $blurbRow['blurb_id'] . '_parentid-' . $blurbRow['parent_id'];
    } //End getBlurbId()

    function buildBlurbId($blurbId, $parentId) {
    	return 'blurb-' . $blurbId . '_parentid-' . $parentId;
    } //End buildBlurbId()

    function getBlurbUiId($blurbId) {
    	return 'ui-' . $blurbId;
    } //End getBlurbUiId()

    function buildBlurbUiId($blurbId, $parentId) {
    	return 'ui-' . buildBlurbId($blurbId, $parentId);
    } //End buildBlurbUiId()

    require_once('includes/PHPMailerAutoload.php');
    require_once('includes/class.phpmailer.php');
    require_once('includes/inc_wordspace_password.php');

    function sendEmail($from, $to, $subject, $message)     {
        global $wordspaceGmailPassword;

        $mail = new PHPMailer(); // create a new object
        // $mail->SMTPDebug = 2;
        $mail->IsSMTP(); // enable SMTP
        $mail->SMTPAuth = true; // authentication enabled
        $mail->SMTPSecure = 'ssl'; // secure transfer enabled REQUIRED for GMail
        $mail->Host = "smtp.gmail.com";
        $mail->Port = 465; // or 587
        $mail->IsHTML(true);
        $mail->Username = "trendlogger.6dnx@gmail.com";
        $mail->Password = '20ryan10';
        $mail->SetFrom($from);
        $mail->Subject = $subject;
        $mail->Body = $message;
        $mail->AddAddress($to);        

        if(!$mail->Send())
            echo "Mailer Error: " . $mail->ErrorInfo;
    } //End sendEmail()

    function callProcedure($dbName, $dbCon, $procedureCall)	{

		$records = array();
		$row = 0;

		dbConnect($dbCon);

		if($dbCon !== false)
		{
			if(@mysql_select_db($dbName) === true)
			{
				$resultSet = @mysql_query('CALL ' . $procedureCall, $dbCon);
				if($resultSet !== false)
				{
					while(($row = @mysql_fetch_assoc($resultSet)) !== false)
						$records[] = $row;
					mysql_free_result($resultSet);
				}
			}
		}

		dbDisconnect();

		return $records;

	} //End callProcedure()

    function callFunction($dbName, $dbCon, $functionCall) {

		$records = array();
		$row = 0;

		dbConnect($dbCon);

		if($dbCon !== false)
		{
			if(@mysql_select_db($dbName) === true)
			{
				$resultSet = @mysql_query('SELECT ' . $functionCall, $dbCon);
				if($resultSet !== false)
				{
					while(($row = @mysql_fetch_assoc($resultSet)) !== false)
						$records[] = $row;
					mysql_free_result($resultSet);
				}
			}
		}

		dbDisconnect();

		return $records;

	} //End callFunction()

	function esc($token) {
		// error_reporting(E_ALL ^ E_DEPRECATED);
		// return mysql_real_escape_string($token); 
		$con = mysqli_connect('6dnx.com', 'robert', 'johnson2013', 'trend');

		$token = mysqli_real_escape_string($con, $token);

		mysqli_close($con);

		return $token;
	}

	function utf8_urldecode($str) {
		$str = preg_replace("/%u([0-9a-f]{3,4})/i","&#x\\1;", urldecode($str)); 
		return html_entity_decode($str, null, 'UTF-8');
	}

	//decodes $string as many times as encoding is detected
	function _utf8_decode($string) {
	  $tmp = $string;
	  $count = 0;

	  while (mb_detect_encoding($tmp)=="UTF-8") {
	    $tmp = utf8_decode($tmp);
	    $count++;
	  }
	  
	  for ($i = 0; $i < $count - 1 ; $i++) {
	    $string = utf8_decode($string);
	    
	  }

	  return $string;	  
	}

	//creates a button that takes a click handler
	function createButton($label, $id, $clickHandler = null, $class = null, $addSpace = false) {
		$classText = ($class != null) ? " class='$class' " : '';
		$clickHandlerText = ($clickHandler != null) ? " onclick='$clickHandler' " : '';
		?>
		<a id="<?php echo $id; ?>" <?php echo $classText; ?>
			<?php echo $clickHandlerText; ?>><?php echo $label; ?></a>
		<?php
		if($addSpace) echo '&nbsp;';
	} // End createButton()

	function createLink($label, $id, $link = null, $class = null, $addSpace = false) {
		$classText = ($class != null) ? " class='$class' " : '';
		$linkText = ($link != null) ? "$link" : '';
		?>
		<a href='<?php echo $linkText; ?>' id='<?php echo $id; ?>' <?php echo $classText; ?>><?php echo '$label'; ?></a>
		<?php
		if($addSpace) echo '&nbsp;';
	} // End createLink()

	//creates a button that takes a hyper link
	//$link must be fully qualified i.e. http://www.domain.com/page.html
	function createButtonLink($label, $id, $link, $buttonClass = null, $openInNewTab = false, $addSpace = false) {
		$classText = ($buttonClass != null) ? " class='$buttonClass' " : '';
		$targetText = ($openInNewTab === true) ? " target='_blank' " : '';
		//setup inline scripting based on whether $openInNewTab is true or false
		?>
		<a href="<?php echo $link; ?>" id='<?php echo $id; ?>'<?php echo $targetText; ?>
			<?php echo $classText; ?>><?php echo $label; ?></a>
		<?php
		if($addSpace) echo "&nbsp;";
	} // End createButtonLink()
	
?>