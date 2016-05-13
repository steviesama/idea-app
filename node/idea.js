// // var io = require('socket.io');
// // var express = require('express');

// // var app = express(),
// //     server = require('http').Server(app),
// //     io = io.listen(server);

// // server.listen(8000);

// // io.sockets.on('connection', function (socket) {
// //   socket.emit('yo', { hello: 'world' });
// //   socket.on('info', function (data) {
// //     console.log(data);
// //   });
// // });

// // // serve HTML files in the `public` directory.
// // app.use(express.static(__dirname + '/public'));
// // require('node-jsx').install();
// var express = require('express');
// var Promise = require('promise').Promise;
// var assign = require('object-assign');
// var app = express();
// var React = require('react');
// var Dispatcher = require('flux').Dispatcher;
// var http = require('http').createServer(app);//.createServer(app);
// var io = require('socket.io');//(http);
// io = io.listen(http);
// //io = io.listen(http);

// // var mysql = require('mysql');

// // var url = require('url');
// // var url_parts = url.parse(request.url, true);
// // var query = url_parts.query;

// // console.log(query);

// // var $ = require('jquery');

// // var db = mysql.createConnection({
// // 	host:'6dnx.com',
// // 	user:'robert',
// // 	password:'johnson2013',
// // 	database:'trend'
// // });

// // db.connect(function(error) {
// // 	if(error) console.log(error);
// // 	else console.log('Successfully connected to 6dnx.com:3306!');
// // });

// // db.query('SELECT * from tblUser')
// // .on('result', function(data) {
// // 	console.log(data.user_lastname + ', ' + data.user_firstname + '\n');
// // 	console.log(data);
// // 	console.log('\n\n-----------------------\n\n');
// // });

// var users = new Array();
// var shouldChangeMode = false;
// var arduinoCurrentState = 'one-after-another';
// var count = 0;

// function socketExists(socket) {
// 	return users[socket] !== undefined;
// }
// app.use(express.static('.'));
// app.get('/', function(req, res){
// 	if(req.query['arduino'] !== undefined) {
// 		if(req.query['state'] !== undefined) {
// 			io.emit('pattern-state', req.query['state']);
// 		}

// 		io.emit('chat', {
// 			'name':'<Arduino>',
// 			'message':'has CHECKED IN!',
// 			'channel':'global'
// 		});

// 		count++;

// 		//change mode every 15 check ins
// 		if(count > 15) {
// 			shouldChangeMode = true;
// 			count = 0;
// 		}

// 		var response = "{'response':'Received!!!','change-mode':";

// 		if(shouldChangeMode) {
// 			response += "'true'}";
// 			shouldChangeMode = false;
				
// 			io.emit('chat', {
// 				'name':'<Arduino>',
// 				'message':'has CHANGED MODES!',
// 				'channel':'global'
// 			});
// 		} else {
// 			response += "'false'}";
// 		}

// 		res.send(response);
// 	} else if(req.query['arduino-ui'] !== undefined) {
// 		res.sendFile(__dirname + '/arduino_ui.html');
// 	} else if(req.query['sid'] === undefined) {
// 		res.sendFile(__dirname + '/index.html');
// 	}
// }); //End app.get()

// io.on('connection', function(socket) {
// 	socket.toString = function() {
// 		return this.id;
// 	}

// 	console.log('socket.id = ' + socket.id);
// 	if(socketExists(socket)) console.log("socket exists!");
// 	else console.log("socket does NOT exist");

// 	socket.on('change-mode', function(mode) {
// 		shouldChangeMode = true;
// 		//reset count towards mode change
// 		count = 0;
// 	});

// 	if(socketExists(socket) === false)
// 		users[socket] = new Array();

// 	socket.on('connect-message', function(channel) {
// 		this.broadcast.emit('chat', {
// 			'name':'<user>',
// 			'message':'has CONNECTED!',
// 			'channel':channel
// 		});
// 	});

// 	socket.on('chat', function(json) {
// 		users[socket]['name'] = json.name;
// 		users[socket]['channel'] = json.channel;

// 		console.log('\nusers:\n--------------\n');
// 		console.log(users);

// 		console.log('\nusers[socket]:\n--------------\n');
// 		console.log(users[socket]);

// 		io.emit('chat', json);
// 	});

// 	socket.on('disconnect', function() {
// 		if(socketExists(this)) console.log('socket exists in user array!');
// 		else console.log('socket doesn\'t exist in user array!');

// 		if(socketExists(this)) {
// 			io.emit('chat', {
// 				'name':users[this]['name'],
// 				'message':' has DISCONNECTED!',
// 				'channel':users[this]['channel']
// 			});

// 			console.log('\ndisconnect message\n--------------\n');
// 			console.log({
// 				'name':users[this]['name'],
// 				'message':' has DISCONNECTED!',
// 				'channel':users[this]['channel']
// 			});

// 			delete users[this];
// 		} //End if socket exists
// 	});
// });

// http.listen(8001, function() {
//   console.log('listening on *:8001');
// });
const path = require('path');
const express = require('express');
const webpack = require('webpack');
const config = require('./webpack.config');

const app = express();
const compiler = webpack(config);

app.use(require('webpack-dev-middleware')(compiler, {
  publicPath: config.output.publicPath,
  stats: {
    colors: true
  }
}));

app.use(require('webpack-hot-middleware')(compiler));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './index.html'));
});

app.listen(8001, 'localhost', (err) => {
  if (err) {
    console.log(err);
    return;
  }

  console.log('Listening at http://localhost:8001');
});
