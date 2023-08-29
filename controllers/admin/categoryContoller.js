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
        console.log(req.body);
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
        console.log(categoryData);

        if(categoryData) {
            res.render('edit-category',{data: categoryData})
        }
    } catch (error) {
        console.log(error.message);
    }
}


const updateCategory = async (req,res)=>{
    try { 
        console.log(req.body);
        console.log(req.file);
        const id = req.params.id;
        let data; 
        if(req.file){
        data = {
            _id: id,
            name: req.body.name,
            image: req.file.filename,
            isListed: req.body.isListed,
            description: req.body.description
        }}else{
            data = {
                _id: id,
            name: req.body.name,
            isListed: req.body.isListed,
            description: req.body.description
            }
        }
        console.log(data); 
       const newData = await Category.findByIdAndUpdate(id,data, {new : true})



        res.render('edit-category', {message: 'Category Updated', data: newData})

    } catch (error) {
        console.log(error.message);
    }
}


// const updateCategory = async (req,res)=>{
//     try { 
//         // console.log(req.body);
//         //  console.log(req.session.id);

//         // console.log(req.file);
//         const id = req.params.id;
//         console.log(id);
//         console.log(req.body.name);


//         const category =await Category.findById({_id : id})
//         console.log(category);
//         console.log(req.body);

//         let data;
//         if(req.file){
//         data = {
//             _id: id,
//             name: req.body.name,
//             image: req.file.filename,
//             isListed: req.body.isListed,
//             description: req.body.description
//         }}else{
//             data = {
//                 _id: id,
//             name: req.body.name,
//             isListed: req.body.isListed,
//             description: req.body.description
//             }
//         }
//         console.log(data);
//         await Category.findByIdAndUpdate(id,data)

//         res.render('edit-category',{category: category, message: 'Data Updated'})

//     } catch (error) {
//         console.log(error.message);
// }
// }

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
    deleteCategory,
    updateCategory
}