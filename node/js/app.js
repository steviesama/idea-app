import style from '../style.scss';
var React = require('react');
var ReactDOM = require('react-dom');
var IdeaApp = require('./components/IdeaApp.react');

ReactDOM.render(
	<IdeaApp/>,
	document.getElementById('idea-app')
);
