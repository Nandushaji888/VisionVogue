const Category = require('../../models/categoryModel')
const categoryLoad = async(req,res) => {
    try {
        const category = await Category.find({})
        if(category)
        {res.render('category', {category : category})}
        else{
            res.status(500).json({success : false})
        }
    } catch (error) {
        console.log(error.message);
    }
}

const addCatgory =  async(req, res) => {
    try {
        const categoryData = new Category({
            name : req.body.name,
            image : req.file.filename,
            isListed : req.body.isListed,
            description : req.body.description
        })
        const category = await categoryData.save()
        console.log(category);
        if(category){
            const categoryList = await Category.find({})
            return res.render('category', {message: 'Category added Successfully', category :categoryList});
       }else {
           return res.render('category', {message: 'Something went Wrong. Try Again'})
       }
    } catch (error) {
        console.log(error.message);
    }
}


const searchCategory = async(req, res) => {
    try {
        
        var search = req.body.search;
        const categoryData = await Category.find({"name" : {$regex :'.*'+ search + '.*', $options :'i'}})
        if(categoryData.length > 0){
            res.render('category', {category: categoryData})
        }else{
            res.render('category',{message : "Category not found" })

        }
    } catch (error) {
        res.status(400).send({success: false, message: error.message})
    }
} 

const editCategory = async(req, res) => {
    try {
        const id = req.query.id;
        const categoryData = await Category.findById({_id : id});

        if(categoryData) {
            res.render('edit-category',{category : categoryData})
        }else{
            res.redirect('category')
        }
    } catch (error) {
        console.log(error.message);
    }
}
const updateCategory = async(req, res) => {
    try {
        // const category = await Category.findByIdAndUpdate()
        const categoryData = await Category.findByIdAndUpdate({_id : req.params.id},{$set: {name:req.body.name, image : req.body.image, isListed: req.body.isListed, description : req.body.description}})
        res.render('edit-category', {category :categoryData ,message : "Category data updated"})
    } catch (error) {
        console.log(error.message);
    }
}

const deleteCategory = async(req, res) => {
    const id = req.query.id;
   await Category.deleteOne({_id : id})

   res.redirect('/admin/category')

}


module.exports ={
    categoryLoad,
    addCatgory,
    searchCategory,
    editCategory,
    updateCategory,
    deleteCategory
}