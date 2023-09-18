const Product = require("../../models/productModel");
const Category = require("../../models/categoryModel");

//showing products in admin side
const productList = async (req, res) => {
  try {
    const productData = await Product.find({}).populate("category");
    if (productData) {
      res.render("products", { products: productData });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//load add to product page
const LoadAddProduct = async (req, res) => {
  try {
    const filenames = req.files.map((file) => file.filename);

    const categoryList = await Category.find({isListed : true});
    res.render("addProduct", { category: categoryList, filenames: filenames, });
  } catch (error) {
    console.log(error.mess);
  }
};

//adding new product

const addProduct = async (req, res) => {
  try {
    const category = await Category.findOne({ name: req.body.category });
    if (!category) {
      return res.status(400).render("addProduct", {
        category: categoryList,
        message: "Invalid category",
      });
    }

    // Map file objects to their filenames
    const filenames = req.files.map((file) => file.filename);
    const coverImage = req.body.coverImage;


    const productData = new Product({
      name: req.body.name,
      description: req.body.description,
      details: req.body.details,
      image: filenames,
      coverImage: coverImage,
      size: req.body.size,
      brand: req.body.brand,
      price: req.body.price,
      isListed: req.body.isListed,
      category: category._id,
      stock: req.body.stock,
    });

    const product = await productData.save();
    const categoryList = await Category.find();
    // Save the product to the database
    if (product) {
      res.redirect('/admin/products')
      // res.render("addProduct", {
      //   category: categoryList,
      //   message: "Product successfully added",
      // });
    } else {
      res.status(500).render("addProduct", {
        category: categoryList,
        message: "Something went wrong",
      });
    }
  } catch (error) {
    console.error(error.message);
    const categoryList = await Category.find();

    res.status(500).render("addProduct", {
      category: categoryList,
      message: "Internal server error",
    });
  }
};

// const addProduct = async (req, res) => {
//   try {
//     const category = await Category.findOne({ name: req.body.category });
//     console.log(category._id);
//     const Filenames = req.files.map((file) => file.filename);

//     const productData = new Product({
//       name: req.body.name,
//       description: req.body.description,
//       details: req.body.details,
//       image: Filenames,
//       size: req.body.size,
//       brand: req.body.brand,
//       price: req.body.price,
//       isListed: req.body.isListed,
//       category: category._id,
//       stock: req.body.stock,
//     });

//     const product = await productData.save();
//     const categoryList = await Category.find({});

//     if (product) {
//       res.render("addProduct", {
//         category: categoryList,
//         message: "Product successfully added",
//       });
//     } else {
//       res.render("addProduct", {
//         category: categoryList,
//         message: "Something went wrong",
//       });
//     }
//   } catch (error) {
//     console.log(error.message);
//   }
// };

//load edit product page
const loadEditProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const category = await Category.find();
    const productData = await Product.findById({ _id: id }).populate(
      "category"
    );
    console.log(productData);
    // console.log(productData.description);
      if (productData) {
        res.render("editProduct", { product: productData, category: category });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//updating an existing product
const updateProduct = async (req, res) => {
  try {
    const imageFilenames = req.files.map((file) => file.filename);
    const category = await Category.findOne({ name: req.body.category });

    const id = req.params.id;
    let data;
    if (req.files.length) {
      data = {
        id: id,
        name: req.body.name,
        description: req.body.description,
        details: req.body.details,
        image: imageFilenames,
        size: req.body.size,
        brand: req.body.brand,
        price: req.body.price,
        isListed: req.body.isListed,
        category: category._id,
        stock: req.body.stock,
      };
    } else {
      data = {
        id: id,
        name: req.body.name,
        description: req.body.description,
        details: req.body.details,
        size: req.body.size,
        brand: req.body.brand,
        price: req.body.price,
        isListed: req.body.isListed,
        category: category._id,
        stock: req.body.stock,
      };
    }

    // if(category.isListed === false && req.)
    console.log(data);

    const newData = await Product.findByIdAndUpdate(id, data, {
      new: true,
    });

    if (newData) {
      const category = await Category.find({});

      res.render("editProduct", {
        product: newData,
        category: category,
        message: "Product successfully edited",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//deleting a product
const   deleteProduct = async (req, res) => {
  try {
    const id = req.params.id;
    await Product.findByIdAndDelete(id);
    const products = await Product.find().populate("category");

    console.log(products);
    res.render("products", { message: "Product deleted", products: products });
  } catch (error) {
    console.log(error.message);
  }
};

const deleteImage = async (req, res) => {
  const id = req.params.id;
  const img = req.params.img;

  try {
      const updatedDocument = await Product.findOneAndUpdate(
          { _id: id },
          { $pull: { image: img } },
          { new: true }
      );

      if (!updatedDocument) {
          console.log('Document not found');
          return res.status(404).json({ message: 'Document not found' });
      }

      console.log('Element removed successfully');
      res.redirect('/admin/edit-product/'+id)
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'An error occurred while deleting the element' });
  }
};

module.exports = {
  productList,
  LoadAddProduct,
  addProduct,
  loadEditProduct,
  updateProduct,
  deleteProduct,
  deleteImage
  
};
