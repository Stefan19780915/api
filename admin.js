class Admin {
	constructor(server, database, checkAuthenticated, checkAdmin){
		this.server = server;
		this.database = database;
		this.checkAuthenticated = checkAuthenticated;
		this.checkAdmin = checkAdmin;
	}
	
	
	adminPage(req, res){
		const user = req.user;
		res.render('admin', {title: "Admin Page", name: user[0].name, surname: user[0].surname});
	}
	
	employeeRecord(req, res){
		const user = req.user;
		res.render('record', {title: "Dotazník Zamestnanca", name: user[0].name, surname: user[0].surname});
	}
	
	
	myFunc(){
		this.server.get('/api/admin', this.checkAuthenticated, this.checkAdmin, (req, res)=>{this.adminPage(req,res);});
		this.server.get('/api/record', this.checkAuthenticated, this.checkAdmin, (req, res)=>{this.employeeRecord(req,res);});
	}
	
}

module.exports = {
	Admin
}