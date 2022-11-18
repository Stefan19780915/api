
class Posts {
	constructor(server, database, checkAuthenticated, checkAdmin){
		this.server = server;
		this.database = database;
		this.checkAuthenticated = checkAuthenticated;
		this.checkAdmin = checkAdmin;
	}
	
	getSqlDate(sqlDate){
		let dateObject = new Date(sqlDate);
		const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
		const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
		let formatedDate = `${days[dateObject.getDay()]} ${months[dateObject.getMonth()]} ${dateObject.getDate()}, ${dateObject.getFullYear()}`;
		return formatedDate; 
	}

	getPosts(req, res){
		const sql = "SELECT posts.id, posts.user_id, posts.title, posts.body, created_at, users.name, users.surname FROM users INNER JOIN posts ON posts.user_id = users.id ORDER BY posts.created_at DESC;";	
		this.database.query(sql, (err, result)=>{
			if(err) throw err;
			const data = JSON.parse(JSON.stringify(result));
			let adjustedData = data.map( (item, index) => {
			return item.user_id == req.user[0].id 
				? {...item, user: true, created: item.created_at = this.getSqlDate(data[index].created_at)} 
				: {...item, user: false, created: item.created_at = this.getSqlDate(data[index].created_at)}; 
			});
			
			const user = req.user;
			console.log(adjustedData);
				res.render('indexPost', {title: "Posts", adjustedData, name: user[0].name, surname: user[0].surname});	
		});
    }
	
	createPost(req, res){
		
		const user = req.user;

		const post = {
 			   title: req.body.title,
    		   body: req.body.body,
    		   user_id: user[0].id
			}
		
		
		if(!post.title && !post.body){
			return res.render('createPost', {
				titleBack: req.body.title, 
				bodyBack: req.body.body, 
				msg:"Please fill all fields", 
				invalid: "is-invalid", name: user[0].name, surname: user[0].surname});
				
		}
		
		if(!post.title){
			return res.render('createPost', {
				titleBack: req.body.title, 
				bodyBack: req.body.body, 
				msgNoTitle:"Please fill all fields", 
				noTitle: "is-invalid",
				name: user[0].name, 
				surname: user[0].surname		
				});
		}
		
		if(!post.body){
			return res.render('createPost', {
				titleBack: req.body.title, 
				bodyBack: req.body.body, 
				msgNoBody:"Please fill all fields", 
				noBody: "is-invalid",
				name: user[0].name, 
				surname: user[0].surname
				});
		}
		
		if(post.title.length < 3){
			
			return res.render('createPost', {
				titleBack: req.body.title, 
				bodyBack: req.body.body, 
				msgTitle:"Title must be longer than 3 letters.", 
				invalidTitle: "is-invalid",
				name: user[0].name, 
				surname: user[0].surname
				});
		}
		
	let sql = 'INSERT INTO posts SET ?';
	let query = this.database.query(sql, post, (err, result)=>{
		if(err) throw err;
		res.redirect('/api/posts');
		});
	}
	
	getPost(req, res){
		let sql = `SELECT * FROM posts WHERE posts.id = ${req.params.id}`;
		let result = (err, result)=>{
			if(err) throw err;
			const data = JSON.parse(JSON.stringify(result));
			const user = req.user;
				res.render('updatePost', {title1: "Update Post", ...data[0], name: user[0].name, surname: user[0].surname});
			};
		this.database.query(sql, result);
    }
	
	updatePost(req, res){
		let sql1 = `SELECT * FROM posts WHERE posts.id = ${req.params.id}`;
		this.database.query(sql1, (err, result)=>{
			if(err) throw err;
			let postUpdate = {
			   title: req.body.title ? req.body.title : result[0].title,
    		   body: req.body.body ? req.body.body : result[0].body,
			   user_id: req.body.user_id ? req.body.user_id : result[0].user_id
			};
			let sql2 = `UPDATE posts SET ? WHERE posts.id = ${req.params.id}`;
			this.database.query(sql2, postUpdate, (err, result)=>{
			if(err) throw err;
					let sql3 = `SELECT * FROM posts WHERE posts.id = ${req.params.id}`;
					this.database.query(sql3, (err, result)=>{
					if(err) throw err;
					res.redirect('/api/posts');
				});	
			});	
		});
	}
	
	deletePost(req, res){
			let sql = `DELETE FROM posts WHERE posts.id = ${req.params.id} AND posts.user_id = ${req.user[0].id}`;
			this.database.query(sql, (err, result)=>{
			if(err) throw err;
			res.redirect('/api/posts');
			});
	}
	
	createDatabase(req, res){
		let sql = `CREATE DATABASE ${req.params.name}`;
		this.database.query(sql, (err, result)=>{
		if(err) throw err;
		console.log(result);
		res.send(`Database ${name} created....`);
	});
	}
	
	createTable(req, res){
		let sql = `CREATE TABLE ${req.params.name}(id int AUTO_INCREMENT, brand VARCHAR(255), description VARCHAR(255), PRIMARY KEY(id))`;
		this.database.query(sql, (err, result)=>{
		if(err) throw err;
		console.log(result);
		res.send(`Table ${req.params.name} created...`);
	});
	}
	
	
	myFunc(){
		this.server.get('/api/posts', this.checkAuthenticated, this.checkAdmin, (req, res)=>{this.getPosts(req, res);});
		
		this.server.get('/api/update/:id', this.checkAuthenticated, (req, res)=>{this.getPost(req, res)});
		this.server.post('/api/posts/:id', this.checkAuthenticated, (req, res)=>{this.updatePost(req, res);});
		
		this.server.get('/api/create', this.checkAuthenticated, (req, res)=>{
				const user = req.user;
				res.render('createPost', {
					title: "Create New Post", 
					name: user[0].name, 
					surname: user[0].surname}); 
		});
		this.server.post('/api/posts', this.checkAuthenticated, (req, res)=>{this.createPost(req, res);});
		
		this.server.get('/api/delete/:id', this.checkAuthenticated, (req, res)=>{this.deletePost(req, res);});
		
	
		//CREATE TABE AND DATABASE
		this.server.get('/api/database/:name', this.checkAuthenticated, (req, res)=>{this.createDatabase(req, res);});
		this.server.get('/api/table/:name', this.checkAuthenticated, (req, res)=>{this.createTable(req, res);});
	}
}

module.exports = {
	Posts
}