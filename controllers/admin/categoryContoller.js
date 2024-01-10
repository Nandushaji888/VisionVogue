const Category = require('../../models/categoryModel')
const Product = require('../../models/productModel')



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



const addCategory = async (req, res) => {
    try {
        console.log(req.body);
        const categoryData = new Category({
            name: req.body.name,
            image: req.file.filename,
            isListed: req.body.isListed,
            description: req.body.description
        });
        const category = await categoryData.save();
        console.log(category);

        if (category) {
            const categoryList = await Category.find({});
            return res.render('category', { message: 'Category added Successfully', category: categoryList });
        } 
    } catch (error) {
        console.log(error.name); 
        console.log(error.code);
        if (error.name === 'MongoServerError' && error.code === 11000) {
            const categoryList = await Category.find({});
            return res.render('category', { message: 'Category name is already taken. Please try a different name.', category: categoryList });
        } else {
            console.log(error.message);
            const categoryList = await Category.find({});
            return res.render('category', { message: 'An error occurred while adding the category', category: categoryList  });
        }
    }
};



// const searchCategory = async(req, res) => {
//     try {
        
//         var search = req.body.search;
//         const categoryData = await Category.find({"name" : {$regex :'.*'+ search + '.*', $options :'i'}})
//         if(categoryData.length > 0){
//             res.render('category', {category: categoryData})
//         }else{
//             res.render('category',{message : "Category not found" })

//         }
//     } catch (error) {
//         res.status(400).send({success: false, message: error.message})
//     }
// } 

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

const categoryStatus = async (req, res) => {
    try {
        const id = req.query.id;
        let updateCategory = {
            isListed: false
        }

        const categoryData = await Category.findById({ _id: id });

        if (!categoryData.isListed) {
            updateCategory.isListed = true;
        }

        await Category.findByIdAndUpdate(id, updateCategory, { new: true });

        res.redirect('/admin/category');
    } catch (error) {
        console.log(error.message);
    }
}



// const categoryStatus = async( req, res) => {
//     try {
//         const id = req.query.id;
//         let block = {
//             isListed : false
//         }
//         let unblock = {
//             isListed : true
//         }
//         const categoryData = await Category.findById({_id : id});
//         if(categoryData.isListed) {
//                   const productsToUpdate = await Product.find({ category: id });
//                   console.log(productsToUpdate);
//                   for (const product of productsToUpdate) {
//                    product.isListed = false;
//             await product.save();
//         }
//             await Category.findByIdAndUpdate(id, block, {new : true})
//         }else{
//             const productsToUpdate = await Product.find({ category: id });
//             console.log(productsToUpdate);
//                 for (const product of productsToUpdate) {
//                     product.isListed = true;
//                     await product.save();
//                 }
//             await Category.findByIdAndUpdate(id, unblock, {new : true})

//         }

//         res.redirect('/admin/category')
//     } catch (error) {
//         console.log(error.message);
//     }
// }




module.exports ={
    categoryLoad,
    addCategory,
    editCategory,
    categoryStatus,
    updateCategory
}