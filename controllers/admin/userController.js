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
const userStatus = async (req, res) => {
    try {
        const id = req.params.id;
        let updateData = {};

        // Toggle the isActive status
        const userData = await User.findById(id);
        if (userData.isActive) {
            updateData.isActive = false;
        } else {
            updateData.isActive = true;
        }

        // Update the user's isActive status
        const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });

        // Check if the user was found and updated
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Send a success response
        res.status(200).json({ message: 'User status updated successfully', user: updatedUser });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};


module.exports = {
    loadUsers,
    loadEditUser,
    updateUser,
    userStatus

}