class Profile {
	constructor(server, database, bcrypt, checkAuthenticated, checkAdmin){
		this.server = server;
		this.database = database;
		this.checkAuthenticated = checkAuthenticated;
		this.checkAdmin = checkAdmin;
		this.bcrypt = bcrypt; 
	}
	
	
	getSqlDate(sqlDate){
		let dateObject = new Date(sqlDate);
		const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
		const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
		let formatedDate = `${days[dateObject.getDay()]} ${months[dateObject.getMonth()]} ${dateObject.getDate()}, ${dateObject.getFullYear()}`;
		return formatedDate; 
	}
	
	getUserById(id){
		let sql = `SELECT * FROM users WHERE users.id = '${id}'`;
		return new Promise((resolve, reject)=>{
			this.database.query(sql, (err, result)=>{
				if (err) return reject (err);
				resolve(result);
			});	
		});
	}
	
	async profilePage(req, res){
		const msgCurrent = req.query.param1;
		const msgNew = req.query.param2;
		const msgSuccess = req.query.param3;
		//console.log(msgCurrent, msgNew);
		const userData = await this.getUserById(req.user[0].id);
		const registered_at = this.getSqlDate(userData[0].registered_at);
		
		const sql = `SELECT posts.id, posts.title, posts.body, created_at, users.name, users.surname FROM users INNER JOIN posts ON posts.user_id = users.id WHERE posts.user_id = ${req.user[0].id} ORDER BY posts.created_at DESC;`;	
		this.database.query(sql, (err, result)=>{
			if(err) throw err;
			const data = JSON.parse(JSON.stringify(result));
			let adjustedData = data.map( (item, index) => {return {...item, created: item.created_at = this.getSqlDate(data[index].created_at)};});
			const user = req.user;
			//console.log(adjustedData);
				res.render('profile', {
					title: "Posts", 
					adjustedData, 
					id: user[0].id, 
					joined: registered_at, 
					email: user[0].email, 
					name: user[0].name, 
					surname: user[0].surname,
					currentPassword: msgCurrent,
					newPassword: msgNew,
					success: msgSuccess
				});	
		});	
	}

	
	async updateProfile(req, res){	
	const user = req.user;
	if(req.body.currentPassword){
		if(!await this.bcrypt.compare(req.body.currentPassword, user[0].password)){
				//console.log('not match');
				res.redirect('/api/profile/?param1=Current Password does not match!');
			} else if (req.body.newPassword != req.body.confirmPassword) {
					//console.log('not the same');
					res.redirect('/api/profile/?param2=New password does not match!');
			} else { 
						
		const newPassword = await this.bcrypt.hash(req.body.newPassword, 10);
			
		let sql1 = `SELECT * FROM users WHERE users.id = ${req.params.id}`;
		this.database.query(sql1, (err, result)=>{
			if(err) throw err;
			let profileUpdate = {
			   name: req.body.name ? req.body.name : result[0].name,
    		   surname: req.body.surname ? req.body.surname : result[0].surname,
			   email: req.body.email ? req.body.email : result[0].email,
			   password: newPassword 	
			};
			let sql2 = `UPDATE users SET ? WHERE users.id = ${req.params.id}`;
			this.database.query(sql2, profileUpdate, (err, result)=>{
			if(err) throw err;
					let sql3 = `SELECT * FROM users WHERE users.id = ${req.params.id}`;
					this.database.query(sql3, (err, result)=>{
					if(err) throw err;
					res.redirect('/api/profile/?param3=User updated successfuly!');
				});	
			});	
		});
		
	   }
		
	} else {
		let sql1 = `SELECT * FROM users WHERE users.id = ${req.params.id}`;
		this.database.query(sql1, (err, result)=>{
			if(err) throw err;
			let profileUpdate = {
			   name: req.body.name ? req.body.name : result[0].name,
    		   surname: req.body.surname ? req.body.surname : result[0].surname,
			   email: req.body.email ? req.body.email : result[0].email 	
			};
			let sql2 = `UPDATE users SET ? WHERE users.id = ${req.params.id}`;
			this.database.query(sql2, profileUpdate, (err, result)=>{
			if(err) throw err;
					let sql3 = `SELECT * FROM users WHERE users.id = ${req.params.id}`;
					this.database.query(sql3, (err, result)=>{
					if(err) throw err;
					res.redirect('/api/profile/?param3=User updated successfuly!');
				});	
			});	
		});
	}
}
	
	
	
	
	
	myFunc(){
		this.server.get('/api/profile', this.checkAuthenticated, this.checkAdmin, (req, res)=>{this.profilePage(req,res);});
		this.server.post('/api/profile/update/:id', this.checkAuthenticated, (req, res)=>{this.updateProfile(req, res);});
	}
	
}

module.exports = {
	Profile
}