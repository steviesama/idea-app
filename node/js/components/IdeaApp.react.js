import React from 'react';
import AppBar from 'react-toolbox/lib/app_bar';
import DatePicker from 'react-toolbox/lib/date_picker';
import Input from 'react-toolbox/lib/input';
import Navigation from 'react-toolbox/lib/navigation';
import Button from 'react-toolbox/lib/button';
import IdeaEditor from './IdeaEditor.react';
import style from './style.scss';

import Promise from 'promise';
import assign from 'object-assign';

class IdeaApp extends React.Component {
	constructor(props) {
		super(props);
	}

	onConnect(message) {
		console.log(message);
	}

	componentDidMount() {
		socket = io('http://idea.6dnx.com');
		socket.on('connection-received', this.onConnect);
		socket.emit('connect', 'Connected!!!');
	}

	componentWillUnmount() {
		socket.removeListener('connection-received', this.onConnect)
		socket.disconnect();
	}

	render() {
		return (
			<div className={style.app}>
				<AppBar className={style.appbar} fixed flat>
					<h1>Idea Composer <small>{VERSION}</small></h1>
					<Button className={style.button} icon='web' accent floating/>
				</AppBar>
				<section>
					Checking font size bro!
					<div className={style.datepicker}><Input/></div>
					<IdeaEditor/>
				</section>
			</div>
		);
	}
} //End class IdeaApp

module.exports = IdeaApp;