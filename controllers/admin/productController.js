const Product = require('../../models/productModel')


const productList = async(req, res) => {
    try {
        const productData = await Product.find({})
        res.render('products',{product : productData})
    } catch (error) {
        console.log(error.message);
    }
}

const addProduct = async(req, res) => {
    try {
        res.render('addProduct')
    } catch (error) {
        console.log(error.mess);
    }
}



module.exports ={
    productList,
    addProduct
}