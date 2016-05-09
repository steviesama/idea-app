<?php
	session_start();
	
	require_once('includes/inc_utilities.php');

	$dbName = 'idea';
	$table = 'tblUser';

	$dbConnection = null;
	dbConnect($dbConnection);

	function isValidRegTokens()
	{
		$isValid = true;
		if(empty($_GET['first-name']))
			$isValid = false;
		if(empty($_GET['last-name']))
			$isValid = false;
		if(empty($_GET['username']))
			$isValid = false;
		if(empty($_GET['pass1']))
			$isValid = false;
		if(empty($_GET['email']))
			$isValid = false;
		if(empty($_GET['profile-desc']))
			$isValid = false;
		if(empty($_GET['should-register']))
			$isValid = false;

		return $isValid;
	} //End isValidRegTokens()

	//declare
	$response = array();

	//default to invalid
	$response['should-register'] = false;

	if(selectDatabase($dbName, $dbConnection))
	{
		if(isValidRegTokens())			
		{				
			$response['should-register'] = ($_GET['should-register'] == 'YES') ? true : false;
			$username = esc($_GET['username']);
			$pass = esc($_GET['pass1']);
			$firstName = esc($_GET['first-name']);
			$lastName = esc($_GET['last-name']);
			$email = esc($_GET['email']);
			$profileDesc = esc($_GET['profile-desc']);

			$usernames = getRecordsWhere($table, $dbName, $dbConnection, "WHERE user_name='{$username}'");
			$emails = getRecordsWhere($table, $dbName, $dbConnection, "WHERE user_email='{$email}'");
			if(count($usernames) == 0)
				$response['good-username'] = true;
			else
				$response['good-username'] = false;

			if(count($emails) == 0)
				$response['good-email'] = true;
			else
				$response['good-email'] = false;

			if($response['good-username'] === true && $response['good-email'] === true)
			{

				$queryString = "INSERT INTO $table VALUES(NULL, 0, '{$username}', " .
							   "'{$pass}', '{$firstName}', '{$lastName}', '{$email}', " .
							   "'{$profileDesc}', NULL)";
				$query = null;				
				if($_GET['should-register'] == 'YES')
					$query = @mysql_query($queryString);

				if($query === false)
				{
					$response['registered'] = false;
					echo mysql_error();
				}
				else if($query != null)
				{
					$response['registered'] = true;
					$response['user-id'] = getLastInsertId($table, $dbConnection);
					$msg = "<p>Please click the following link to verify and enable your Idea account.</p>\n";
					$link = "http://idea.6dnx.com/register.php?action=VERIFY&user-id={$response['user-id']}&user-email={$_GET['email']}";
					$msg .= "<a href='{$link}'>{$link}</a>\n";					
					sendEmail('idea.6dnx@gmail.com', $_GET['email'], 'Idea E-Mail Verification Link', $msg);
				}
				//respond that data is good
				else $response['registered'] = true;

				$response['email'] = $_GET['email'];
			} //End if good data
			else $response['registered'] = false;

		} //End if(isValidRegTokens())
		else $response['registered'] = false;

	} //End if(selectDatabase())
	else $response['registered'] = false;

	dbClose($dbConnection);

	//return json data
	echo json_encode($response);
?>