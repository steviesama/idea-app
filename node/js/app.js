var React = require('react');
var ReactDOM = require('react-dom');
var IdeaApp = require('./components/IdeaApp.react');
import style from '../style.scss';

ReactDOM.render(
	<IdeaApp style={style.app}/>,
	document.getElementById('idea-app')
);