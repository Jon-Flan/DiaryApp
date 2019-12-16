//creating app for web apps project, NCI Computing Year 2

var express = require("express"); //call the express module 
var session = require("express-session");//call the express sessions module
var app = express(); //declaration of app, initialising it as an object express 
var bodyParser = require('body-parser');//allow access to body parser
var mysql = require('mysql');//alows access to mysql and connect to our database
var bcrypt = require('bcrypt');//allows us to hash and salt our passwords

//make conmection to sql database
var connection = mysql.createConnection({
	host:'mysql4299.cp.blacknight.com',
	user:'u1518531_dyr_usr',
	password:'G#8yJbV*6tKq',
	database:'db1518531_dyr_db'
});

connection.connect(function(error){
	if(!!error){
		console.log('Error Connecting to server');
	}else{
		console.log('Connection success');
	}
});

//set the app to use a session cookie
app.use(session({
	secret:'!dy1aReAaq',
	resave:true,
	saveUninitialized: true
}));

app.use(bodyParser.urlencoded({extended:true}));
//set the app to use the specific folders
app.use(express.static("views")); //use the public folder pages
app.use(express.static("scripts")); //use the scripts folder for functionality
app.use(express.static("images")); //use the images folder for images

//setting the view engine
app.set('view engine','ejs');


//create and provide the server port for the app
app.listen(8080, function(){
	console.log("Server is running correctly");
});


//route to login page
app.get('/', function(req,res){
	//check if the user is already logged in and redirect to the correct page
	if(req.session.loggedin){
		res.redirect("home");
	}else{
		res.render("index");
	}
	res.end();
});

//route to the sign_up page
app.get('/sign_up', function(req,res){
	res.render("sign_up");
});

//create a new user and send to databse (this is an async function for bcrypt to work)
app.post('/sign_up', async (req,res)=>{
	//connect to database and add the new user to the databsase
	var username = req.body.username;
	var email = req.body.email;
	var password = req.body.password;
	var name = req.body.fName;
	var age = req.body.age;

	//try and catch for bcrypt to salt and hash password and send to database
	try{
		const hashedPassword = await bcrypt.hash(password, 10)
		//make a connection to the databse and insert the users info in the database
		var sql = "INSERT INTO User_tbl (user_id, username, eMail, password, name, age) VALUES (Null,'"+username+"','"+email+"','"+hashedPassword+"','"+name+"','"+age+"');";
	  	connection.query(sql, function (err, result) {
	    if (err) throw err;
	    console.log("1 record inserted");
  	});
	res.redirect('/');
	}catch(err){
		console.log("error in sign up");
	}
});


//test user log in and redirect to home page or back to sign in page if incorrect
app.post('/sign_in', async(req,res) =>
{
	var email = req.body.email;
	var password = req.body.password;
	//check if the user correct and redirect to the correct page
	//check if the user correct and redirect to the correct page
	if(email && password){
		connection.query("SELECT * FROM User_tbl WHERE eMail = ?;", [email], function(error, results, fields){
			if(results.length > 0){
				let user = results[0]
				bcrypt.compare(password, user.password, (error)=>{
					if(error){
						console.log("error");
						res.end();
					}
				});
				req.session.loggedin = true; //set session logged in to true
				req.session.username = results[0].user_id; //set session log to the user ID
							
				res.redirect('home');
				res.end();
			}else{
				res.redirect('/loginWrong');
			}

			res.end();
		});
	}


});




//route for incorrect log in details, identical to normal login just with different heading
app.get('/loginWrong', function(req, res){
	//check if the user is already logged in and redirect to the correct page
	if(req.session.loggedin){
		res.redirect("home");
	}else{
		res.render("loginWrong");
	}
	res.end();
});

//route to the home page or to login page if session is not active
app.get('/home', function(req,res){
	//check if the user is already logged in and redirect to the correct page
	if(req.session.loggedin){
		//connect to the databse and select the correct values
		connection.query("SELECT * FROM User_tbl WHERE user_id = ?", [req.session.username], function(error, results,fields){
			if(results.length > 0){
				res.render("home",{results});
			}else{
				res.redirect("/");
			}
		});	
	}else{
		res.redirect('/');
		res.end();
	}

});

//route to the profile edit page
app.get('/profile', function(req,res){
	//check if the user is already logged in and redirect to the correct page
		if(req.session.loggedin){
		//connect to the databse and select the correct values
		connection.query("SELECT * FROM User_tbl WHERE user_id = ?", [req.session.username], function(error, results,fields){
			if(results.length > 0){
				res.render("profile", {results});;
			}else{
				res.redirect("/");
			}
		});	
	}else{
		res.redirect('/');
		res.end();
	}
});

//post the edited profile details
app.post('/profile', function(req,res){
	//get the user entered data
	var name = req.body.fName;
	var age = req.body.age;
	var about = req.body.about;
	console.log(about);
	//check if the user is already logged in and redirect to the correct page
	if(req.session.loggedin){
		//connect to the databse and update the correct values
		connection.query("UPDATE User_tbl SET name = ?, age = ? , about_me = ?  WHERE user_id = ?", [name, age, about, req.session.username], function(error, results,fields){
			res.redirect("home");			
		});	
	}else{
		res.redirect('/');
		res.end();
	}

});

//route to diary page
app.get('/diaryPages', function(req,res){
	//check if the user is already logged in and redirect to the correct page
	if(req.session.loggedin){
		//connect to the databse and select the correct values
		connection.query("select * FROM entry_tbl where user_id = ?;", [req.session.username], function(error, results,fields){
			if(results.length > 0){
				res.render("diaryPages", {results});
			}else{
				res.redirect("/add_entry");
			}
		});	
	}else{
		res.redirect('/');
		res.end();
	}
})


//routes to add workouts
app.get('/add_entry', function(req,res){
	//check if the user is already logged in and redirect to the correct page
	if(req.session.loggedin){
		res.render("add_entry");
	}else{
		res.render("index");
	}
	res.end();
});

app.post('/add_entry', function(req,res){
	var title = req.body.title;
	var entry = req.body.entry;

	//get the correct date format for sending in sql query
	var pad = function(num) { return ('00'+num).slice(-2) };
	var pad = function(num) { return ('00'+num).slice(-2) };
	var date;
	date = new Date();
	date = date.getUTCFullYear()        + '-' +
	        pad(date.getUTCMonth() + 1) + '-' +
	        pad(date.getUTCDate());
	 //check if the user is already logged in and redirect to the correct page
	if(req.session.loggedin){
		//connect to the databse and insert the values
	  	connection.query("INSERT INTO entry_tbl (entry_ID, user_id, entry_date, entry_title, entry) VALUES (Null, ? , ? , ?, ?);",[req.session.username, date, title, entry], function (err, result) {
	    if (err) throw err;
	    console.log("1 record inserted");
  		});
	res.redirect('/diaryPages');
	}else{
		res.redirect('/');
		res.end();	
	}

});




//routes to edit an entry
app.get('/edit_entry/:entry_ID', function(req,res){
	//check if the user is already logged in and redirect to the correct page
	if(req.session.loggedin){
		//connect to the databse and select the correct values
		connection.query("select * FROM entry_tbl where entry_ID = ?;", [req.params.entry_ID], function(error, results,fields){
		if(results.length > 0){
				res.render("edit_entry",{results});
			}else{
				res.redirect("/diaryPages");
			}
		});	
	}else{
		res.redirect('/');
		res.end();	
	}	
});

//post the edited entry to the database
app.post('/edit_entry/:entry_ID', function(req, res) {
	var title = req.body.title;
	var entry = req.body.entry;
	//connect to the databse and update the correct values
	connection.query("UPDATE entry_tbl SET entry_title = ?,entry = ? WHERE entry_ID = ?;", [title, entry, req.params.entry_ID], function(error,results,fields){
		res.redirect("/diaryPages");
	})

});

//delete entry route
app.get('/delete_entry/:entry_ID', function(req, res) {
	//check if the user is already logged in and redirect to the correct page
	if(req.session.loggedin){
		//connect to the databse and delete the users diary entry
		connection.query("DELETE FROM entry_tbl WHERE entry_ID = ?;", [req.params.entry_ID], function(error,results, fields){
		res.redirect("/diaryPages");
	})
	}else{
		res.redirect('/');
		res.end();	
	}
});

//delete profile route
app.get('/deleteProfile', function(req, res) {
	//check if the user is already logged in and redirect to the correct page
	if(req.session.loggedin){
		//connect to the databse and delete the users profile and log them out
		connection.query("DELETE FROM User_tbl WHERE user_ID = ?;", [req.session.username], function(error,results, fields){
		req.session.destroy();
		res.redirect('/');
	})
	}else{
		res.redirect('/');
		res.end();	
	}
});

//logout feature to destroy session and redirect to login page
app.get('/logout', function(req,res, next){
	req.session.destroy();
	res.redirect('/');
})

































