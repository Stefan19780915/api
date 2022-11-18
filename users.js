class Users {
	constructor(server, database, bcrypt, passport, localStrategy, checkAuthenticated, checkNotAuthenticated, checkAdmin){
		this.server = server;
		this.database = database;
		this.bcrypt = bcrypt;
		this.passport = passport;
		this.localStrategy = localStrategy;
		this.checkAuthenticated = checkAuthenticated;
		this.checkNotAuthenticated = checkNotAuthenticated;
		this.checkAdmin = checkAdmin;
	}
	
	
	getUserByEmail(email){
		let sql = `SELECT * FROM users WHERE users.email = '${email}'`;
		return new Promise((resolve, reject)=>{
			this.database.query(sql, (err, result)=>{
				if (err) return reject (err);
				resolve(result);
			});	
		});
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

	initializePassport(passport, LocalStrategy){
		
		const authenticateUser = async (email, password, done)=>{
				
				const result = await this.getUserByEmail(email);
					
				const user = JSON.parse(JSON.stringify(result));
					
				if(!user.length){
				return done(null, false, {message: 'No user'} );	
				}
				
				try {
					if(await this.bcrypt.compare(password, user[0].password)){
						return done(null, user);
					} else {
						return done(null, false, {message: 'Incorrect password'});
					}
					
				} catch(e){
					return done(e);
				}
			}	
		
		passport.use(
			new LocalStrategy({ usernameField: 'email' }, 
			authenticateUser)
		);
		
		passport.serializeUser(
			(user, done)=>{ 
				done(null, user[0].id) 
			} 
		);
			
		passport.deserializeUser(
			async (id, done)=>{
				const user = await this.getUserById(id);
				return done( null, user);
			}
		);
	}

	loginPage(req, res){
		res.render("login", {error: req.flash('error')});
	}
	
	registerPage(res){
		res.render('register');
	}
	
	async register(req, res){
		try {
			const hashedPassword = await this.bcrypt.hash(req.body.password, 10);
			const post = {
				name: req.body.name,
				surname: req.body.surname,
				email: req.body.email,
				password: hashedPassword
			}
			let sql = 'INSERT INTO users SET ?';
			let query = this.database.query(sql, post, (err, result)=>{
				if(err) throw err;
				res.redirect('/api/login');
			});
		} catch {
			res.redirect('/api/register');
		}
	}
	
	myFunc(){
		this.initializePassport(this.passport, this.localStrategy);
		
		this.server.get('/api/login', this.checkNotAuthenticated, (req, res)=>{this.loginPage(req,res);});
		this.server.post('/api/login', this.checkNotAuthenticated, this.passport.authenticate('local', {
			successRedirect: '/api/profile',
			failureRedirect: '/api/login',
			failureFlash: true
		}));
		
		
		this.server.delete('/api/logout', (req, res, next)=>{
			req.logout((err)=>{
    			if (err) { return next(err); }
    			res.redirect('/api/login');
  			}); 
		});
		
		this.server.get('/api/register', this.checkNotAuthenticated, (req, res)=>{this.registerPage(res);});
		this.server.post('/api/register', this.checkNotAuthenticated, (req, res)=>{this.register(req, res);});	
	}
}

module.exports = {
	Users
}