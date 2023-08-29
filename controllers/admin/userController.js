const User = require('../../models/userModel')


const loadUsers = async(req, res) => {
    try {
        const users = await User.find({is_admin : 0})
        res.render('userList', {users : users})
    } catch (error) {
        console.log(error.message);
    }
}

const loadEditUser = async(req, res) => {
    try {
        const id = req.params.id
        const userData = await User.findById({_id : id});
        console.log(userData);
        console.log(userData.name);
        res.render('editUser', {data : userData})

    } catch (error) {
        console.log(error.message);
    }
}

const updateUser = async( req, res) => {
    try {
        const id = req.params.id;
        const data = {
            name : req.body.name,
            email : req.body.email,
            phone : req.body.phone,
            isActive : req.body.isActive
        }

        const userData = await User.findByIdAndUpdate(id, data,{new : true}) 

        if(userData) 

        {res.render('editUser', {data : userData, message :'User updated successfully'})}
    } catch (error) {
        console.log(error.message);
    }
}
const userStatus = async( req, res) => {
    try {
        const id = req.params.id;
        let block = {
            isActive : false
        }
        let unblock = {
            isActive : true
        }
        const userData = await User.findById({_id : id});
        if(userData.isActive) {
            await User.findByIdAndUpdate(id, block, {new : true})
        }else{
            await User.findByIdAndUpdate(id, unblock, {new : true})
        }

        res.redirect('/admin/users')
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadUsers,
    loadEditUser,
    updateUser,
    userStatus

}