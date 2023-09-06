const User = require("../models/userModel");


const isLogin = async(req, res, next)=> {
    try {

        if(req.session.user_id){  
            const user = await User.findById(req.session.user_id)
            if(user.isActive) {
                console.log(req.session.user_id);
                next();
            }else{
                req.session.user_id = null;
                res.render("login", {
                    message:
                      "Your access has been restricted by the administrator. Please reach out to the administrator at admin@gmail.com for further assistance.",
                  });
            }
          }
        else{
            res.redirect('/login')
        }

       
    } catch (error) {
        console.log(error.message);
    }
}

const isLogout = async(req, res, next)=> {
    try {

        if(req.session.user_id){
            res.redirect('/')
        }else{ next()
        }

    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    isLogin,
    isLogout
}