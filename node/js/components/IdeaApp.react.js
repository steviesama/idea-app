import React from 'react';
import AppBar from 'react-toolbox/lib/app_bar';
import Navigation from 'react-toolbox/lib/navigation';
import Button from 'react-toolbox/lib/button';
import style from './style.scss';

class IdeaApp extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div>
				<AppBar className={style.appbar} flat>
					<h1>Idea App <small>{VERSION}</small></h1>
					<Button className={style.button} icon='web' accent floating/>
				</AppBar>
				<section className={style.content}>
					Checking font size bro!
				</section>
			</div>
		);
	}
} //End class IdeaApp

module.exports = IdeaApp;