<?php
	//optional global database connection variable
	$dbCon = null;

	function dbConnect(&$db, $host = '6dnx.com', $username = 'robert', $password = 'johnson2013') {

		global $dbCon;
		//if($dbCon) mysql_close($dbCon);
		$dbCon = @mysql_connect($host, $username, $password);

		//if the password 
		if($db == null) $db = $dbCon;

		return $dbCon;
	}

	function dbDisconnect() {
		global $dbCon;
		@mysql_close($dbCon);
	}

	function dbClose(&$connection) {
		if($connection != null) mysql_close($connection);
	}
?>