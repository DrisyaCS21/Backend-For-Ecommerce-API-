  const User = require("../models/User.js");
const bcrypt = require("bcrypt");
const auth = require("../auth.js");

module.exports.registerUser = (req, res) => {

    // Checks if the email is in the right format
    if (!req.body.email.includes("@")){
        return res.status(400).send({ "error": 'Email invalid' });
    }
    // Checks if the mobile number has the correct number of characters
    else if (req.body.mobileNo.length !== 11){
        return res.status(400).send({ "error": 'Mobile number invalid'});
    }
    // Checks if the password has atleast 8 characters
    else if (req.body.password.length < 8) {
        return res.status(400).send({ "error": 'Password must be at least 8 characters'});
    // If all needed requirements are achieved
    } else {
        let newUser = new User({
            firstName : req.body.firstName,
            lastName : req.body.lastName,
            email : req.body.email,
            mobileNo : req.body.mobileNo,
            password : bcrypt.hashSync(req.body.password, 10)
        })

        return newUser.save()
        .then((result) => res.status(201).send({
            message: 'Registered successfully',
            
        }))
        .catch(error => errorHandler(error, req, res));
    }
};


module.exports.loginUser = (req, res) => {

    if(req.body.email.includes("@")){

        return User.findOne({ email : req.body.email })
        .then(result => {
            if(result == null){
                return res.status(404).send({ "error": 'No email found'});
            } else {
                const isPasswordCorrect = bcrypt.compareSync(req.body.password, result.password);
                if (isPasswordCorrect) {
                    return res.status(200).send({
                       
                        access : auth.createAccessToken(result)
                    });
                } else {
                    //401 - unauthorized
                    return res.status(401).send({ "error": 'Email and password do not match'});
                }
            }
        })
        .catch(error => errorHandler(error, req, res));
    }else{
        return res.status(400).send({ "error": 'Invalid Email' })
    }
};


module.exports.getAllUsers = (req, res, next) => {
    User.find()
        .then(users => {
            if (!users || users.length === 0) {
                return res.status(404).send({ message: 'User not found' });
            }


            users = users.map(user => {
                user.password = undefined;
                return {
                    user : user
                }
            });

            return res.status(200).send(users); 
        })
        .catch(error => next(error)); 
};



//[SECTION] Reset Password
// Function to reset the password
//Modify how we export our controllers
//async - keyword that tells JavaScript that this function might need to wait for some tasks/or other lines of code to finish
//await - this keyword pauses the function and waits for something to finish (like saving a document to a database) to finish before moving on to the next line

module.exports.updatePassword = async (req, res) => {
  try {

    console.log(req.body);
    console.log(req.user);

    const { newPassword } = req.body;
    const { id } = req.user; // Extracting user ID from the authorization header

    // Hashing the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Updating the user's password in the database
    await User.findByIdAndUpdate(id, { password: hashedPassword });

    // Sending a success response
    res.status(201).send({ message: 'Password reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal server error' });
  }
};

// Details
module.exports.getDetails = (req, res) => {
    
    return User.findById(req.user.id)
    .then(user => {


        if(!user){
            
            return res.status(404).send({ message: 'User not found'})
        }else{
            user.password = "";
            return res.status(200).send({user: user});
        }
        
    })
    .catch(error => errorHandler(error, req, res));
};

// Update user admin status (PATCH) - Admin only route
module.exports.setAsAdmin = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);

        // Check if user exists
        if (!user) {
            const error = new Error('User not found');
            error.status = 404;
            return next(error);
        }

        // Update user's admin status
        user.isAdmin = true;
        await user.save();

        res.status(200).json({
            updatedUser : user
        });
    } catch (error) {
        next(error); 
    }
};