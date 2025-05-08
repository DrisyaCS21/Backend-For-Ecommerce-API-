const jwt = require("jsonwebtoken");
	// [Section] Environment Setup
	const dotenv = require("dotenv");
	dotenv.config();

	// Json web token
		//json web toke or JWT is a way of securely passing information from the server to the client or to the other part of the severs
		//information is kept secure through the use of the secret code
		//only the system that knows the secret code can decode the encrypted infromation.
		//only the person who knows the secret code can open the JWT


	// [SECTION] Token Creation
	module.exports.createAccessToken = (user) =>{
		
			const data = {
				id: user._id,
				email: user.email,
				isAdmin: user.isAdmin
			}

			return jwt.sign(data, process.env.JWT_SECRET_KEY, {});
		}

	//[SECTION] Token verification
		
	module.exports.verify = (req, res, next) => {
	

		let token = req.headers.authorization;

		if(typeof token === "undefined"){
			return res.send({auth : "Failed. No Token"});
		}else{
			token = token.slice(7, token.length);
			// console.log(token);


			// Token decryption
			

			jwt.verify(token, process.env.JWT_SECRET_KEY, function(err, decodedToken){

				if(err){
					return res.status(403).send({
						auth: "Failed",
						message: err.message
					})
				}else{
					
					req.user = decodedToken;
				

					
					next();
				}


			})
		}
	}

	// [SECTION] Verify Admin
	//this middleware will check if the user is admin or not.
	module.exports.verifyAdmin = (req, res, next) => {
		if (req.user && req.user.isAdmin) {
			next(); // Proceed if the user is admin
		} else {
			return res.status(403).send({ auth: "Failed", message: "Action Forbidden" });
		}
	};

	//[SECTION] Error Handler

	module.exports.errorHandler = (err, req, res, next) => {
		console.error(err);
		const statusCode = err.status || 500;
		const errorMessage = err.message || "Internal Server Error";
		res.status(statusCode).json({
			error: {
				message: errorMessage,
				code: err.code || "SERVER_ERROR"
			}
		});
	};
	

	
	module.exports.isLoggedIn = (req, res, next) =>{

		if(req.user){
			next()
		}else{
			res.sendStatus(401);
		}

	}