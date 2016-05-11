<?php
    session_start();
    if (isset($_GET['action']) && $_GET['action'] == 'LOG_OUT')
    {        
        $_SESSION = array();
        session_destroy();        
    }
?>
<!doctype html>
<html lang='en-US'>
<head>
	<title>Idea Home Page</title>
	<meta charset='utf-8'>
	<link rel='stylesheet' href='style.css' type='text/css' media='all'>
	<!-- <link rel="stylesheet" href="//code.jquery.com/ui/1.11.4/themes/smoothness/jquery-ui.css"> -->
	<link rel='stylesheet' href="style/jquery-ui/jquery-ui.css">
    <script src='//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js'></script>
    <script src="//code.jquery.com/ui/1.11.4/jquery-ui.js"></script>
    <script src='js/react.js'></script>
    <script src='js/react-dom.js'></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/babel-core/5.8.23/browser.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/6.8.0/polyfill.min.js"></script>
    <script src='jquery.plugins.js'></script>
    <script src='dom-help.js'></script>
    <script src='js/utilities.js'></script>
    <script src='js/html.js'></script>
    <script type="text/javascript">
    	$(function() {
    		globalHandlers();
    	});
    </script>
</head>

<?php

    require_once('includes/inc_connect.php');
    require_once('includes/inc_utilities.php');

?>

<body data-user-id="<?php echo isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 0; ?>">
	<div class="content">
		<?php
			if(empty($_SESSION['user_id'])) {
				createButtonLink('Login', 'login-button', 'http://idea.6dnx.com/login.php', 'green-button');
				createButtonLink('Register', 'register-button', 'http://idea.6dnx.com/register.php', 'red-button');
			} else {            
                echo "{$_SESSION['user_firstname']} {$_SESSION['user_lastname']} ({$_SESSION['user_email']})";
               	echo createButton('Logout', 'log-out-button', 
               		'window.location.href="http://idea.6dnx.com/login.php?action=LOG_OUT"', 'red-button');
            }
		?>

		<h1>Idea</h1>

		<?php
			
			if(isset($_SESSION['user_id'])) {
                ?>
                <div id='content'></div>
                <div id='like-button'></div>
                <div id='avatar'></div>

                <script type='text/babel'>
                    var MessageBox = React.createClass({
                        render: () => (
                                    <div className="messageBox">
                                        <p>Not Yet Implemented. With Arrow Function!</p>
                                    </div>
                                )                                       
                    });

                    ReactDOM.render(
                        <MessageBox/>,
                        document.getElementById('content')
                    );

                    // var LikeButton = React.createClass({
                    //   getInitialState: function() {
                    //     return {liked: false};
                    //   },
                    //   handleClick: function(event) {
                    //     this.setState({liked: !this.state.liked});
                    //   },
                    //   render: function() {
                    //     var text = this.state.liked ? 'like' : 'haven\'t liked';
                    //     return (
                    //       <p onClick={this.handleClick}>
                    //         You {text} this. Click to toggle.
                    //       </p>
                    //     );
                    //   }
                    // });

                    class LikeButton extends React.Component {
                        constructor(props) {
                            super(props);
                            this.handleClick = this.handleClick.bind(this);
                            this.state = props.liked === undefined ? {liked: false} : {liked: props.liked};
                            console.log(this.state.liked);

                        }

                        handleClick(event) {
                            this.setState({liked: !this.state.liked});
                            console.log(this.state.liked);
                        }

                        render() {
                            var text = this.state.liked ? 'like' : 'haven\'t liked';
                            console.log(this.state.liked);
                            console.log(text);
                            return (
                                <p onClick={this.handleClick}>
                                    You {text} this. Click to toggle.
                                </p>
                            );
                        }
                    }

                    ReactDOM.render(
                      <LikeButton/>,
                      document.getElementById('like-button')
                    );

                    var Avatar = React.createClass({
                      render: function() {
                        return (
                          <div>
                            <PagePic pagename={this.props.pagename} />
                            <PageLink pagename={this.props.pagename} />
                          </div>
                        );
                      }
                    });

                    var PagePic = React.createClass({
                      render: function() {
                        return (
                          <img src={'https://graph.facebook.com/' + this.props.pagename + '/picture'} />
                        );
                      }
                    });

                    var PageLink = React.createClass({
                      render: function() {
                        return (
                          <a href={'https://www.facebook.com/' + this.props.pagename}>
                            {this.props.pagename}
                          </a>
                        );
                      }
                    });

                    ReactDOM.render(
                      <Avatar pagename="Engineering"/>,
                      document.getElementById('avatar')
                    );
                </script>
                <?php
		    } else {
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
        		Idea, Copyright <?php echo @date(Y); ?> &copy; C.S. Taylor, Jr.&nbsp;<br>
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