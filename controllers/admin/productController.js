const Product = require('../../models/productModel')
const Category = require('../../models/categoryModel')


const productList = async(req, res) => {
    try {
        const productData = await Product.find({}).populate('category')
        // const categoryData = await Category.find({})
        res.render('products',{products : productData})
    } catch (error) {
        console.log(error.message);
    }
}

const LoadAddProduct = async(req, res) => {
    try {
        const categoryList = await Category.find({})
        res.render('addProduct',{category: categoryList})
    } catch (error) {
        console.log(error.mess);
    }
}

const addProduct = async(req, res) => {
    try {
const category =await Category.findOne({name : req.body.category})
        console.log(category._id);
        const Filenames = req.files.map(file => file.filename);
        
        const productData = new Product({
            name : req.body.name,
            description : req.body.description,
            details : req.body.details,
            image: Filenames,
            size : req.body.size,
            brand : req.body.brand,
            price: req.body.price,
            isListed: req.body.isListed,
            category : category._id,
            stock : req.body.stock
        })

        const product = await productData.save()
        const categoryList = await Category.find({})

        if(product) {
            res.render('addProduct', {category : categoryList, message: "Product successfully added"})
        }else{
            res.render('addProduct',{category : categoryList,  message : "Something went wrong"})
        }


    } catch (error) {
        console.log(error.message);
    }
}

const loadEditProduct = async (req,res)=>{
    try {
        const id = req.params.id;
        const category = await Category.find();
        const productData = await Product.findById({_id : id}).populate('category')
        // console.log(productData);
        // console.log(productData.description);
        if(productData) {
            res.render('editProduct', {product:productData, category : category})
        }
     
      
    } catch (error) {
        console.log(error.message);
    }
}

const updateProduct = async(req, res) => {
    try {
        const category =await Category.findOne({name : req.body.category})
        const imageFilenames = req.files.map(file => file.filename);

        const id = req.params.id;
        let data;
        if(req.file) {
           data = {
            id : id,
            name : req.body.name,
            description : req.body.description,
            details : req.body.details,
            image: imageFilenames,
            size : req.body.size,
            brand : req.body.brand,
            price: req.body.price,
            isListed: req.body.isListed,
            category : category._id,
            stock : req.body.stock
           }
        }else{
            data = {
                id : id,
                name : req.body.name,
                description : req.body.description,
                details : req.body.details,
                size : req.body.size,
                brand : req.body.brand,
                price: req.body.price,
                isListed: req.body.isListed,
                category : category._id,
                stock : req.body.stock
            }
        }

        const newData =await Product.findByIdAndUpdate(id, data , {new : true}).populate('category')

        if(newData)
      {  res.render('editProduct',{product : newData, category : category , message : "Product successfully edited"})}
        
    } catch (error) {
        console.log(error.message);
    }
}

const deleteProduct = async(req, res) => {
    try {
        const id = req.params.id;
         await Product.findByIdAndDelete(id)
         const products = await Product.find().populate('category')

         console.log(products);
         res.render('products', {message :'Product deleted', products : products})
    } catch (error) {
        console.log(error.message);
    }
}


module.exports ={
    productList,
    LoadAddProduct,
    addProduct,
    loadEditProduct,
    updateProduct,
    deleteProduct
}