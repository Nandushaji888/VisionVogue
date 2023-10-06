const User = require("../../models/userModel");
const bcrypt = require("bcrypt");
const Category = require("../../models/categoryModel");
const Product = require("../../models/productModel");
const Order = require("../../models/orderModel");
const PDFDocument = require("pdfkit");

//admin login

const loadLogin = async (req, res) => {
  try {
    res.render("adminLogin");
  } catch (error) {
    console.log(error.message);
  }
};

//verify login

const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const adminData = await User.findOne({ email: email });

    if (adminData) {
      const passwordMatch = await bcrypt.compare(password, adminData.password);

      if (passwordMatch && adminData.is_admin === 1) {
        req.session.admin = adminData._id;
        res.redirect("/admin");
      } else {
        res.render("adminLogin", { message: "Email or password incorrect" });
      }
    } else {
      res.render("adminLogin", { message: "Email or password incorrect" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadHome = async (req, res) => {
  try {
    const adminData = await User.findById({ _id: req.session.admin });
    const category = await Category.find();
    const products = await Product.find();

    const orders = await Order.find({ orderStatus: { $ne: "PENDING" } });
    // console.log(orders);
    let total1 = 0;
    for (let i = 0; i < orders.length; i++) {
      let sum = parseInt(orders[i].paidAmount);
      total1 += sum;
    }

    console.log("total " + total1);
    const totalPaid = total1.toLocaleString("en-IN");
    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            $lt: new Date(
              new Date().getFullYear(),
              new Date().getMonth() + 1,
              1
            ),
          },
          orderStatus: { $ne: "PENDING" },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$paidAmount" },
        },
      },
    ]);
    const mRevenue =
      monthlyRevenue.length > 0
        ? monthlyRevenue[0].total.toLocaleString("en-IN")
        : "0";

    const monthlySales = await Order.aggregate([
      {
        $project: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: { year: "$year", month: "$month" },
          totalOrders: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);
    // console.log("monthlySales");
    // console.log(monthlySales);

    const graphDataSales = [];

    // Loop through the 12 months (1 to 12)
    for (let month = 1; month <= 12; month++) {
      const resultForMonth = monthlySales.find(
        (result) => result._id.month === month
      );
      if (resultForMonth) {
        graphDataSales.push(resultForMonth.totalOrders);
      } else {
        graphDataSales.push(0);
      }
    }

    const productCountData = await Product.aggregate([
      {
        $lookup: {
          from: "categories", // Replace 'categories' with the actual name of your category collection
          localField: "category",
          foreignField: "_id",
          as: "categoryData",
        },
      },
      {
        $unwind: "$categoryData",
      },
      {
        $group: {
          _id: {
            categoryId: "$categoryData._id",
            categoryName: "$categoryData.name", // Assuming 'name' is the field with category names
          },
          count: { $sum: 1 }, // Count the documents in each category
        },
      },
    ]);
    const user = await User.find();
    const categoryNames = productCountData.map((item) => item._id.categoryName);

    const categoryCounts = productCountData.map((item) => item.count);

    res.render("adminHome", {
      adminData: adminData,
      category: category,
      products: products,
      orders: orders,
      total: totalPaid,
      user: user,
      mRevenue: mRevenue,
      graphDataSales: graphDataSales,
      categoryNames: categoryNames,
      categoryCounts,
      categoryCounts,
    });
  } catch (error) {
    console.log(error.message);
  }
};

// const productList = async(req, res) => {
//     try {
//         res.render('products')
//     } catch (error) {
//         console.log(error.message);
//     }
// }

// const addProduct = async(req, res) => {
//     try {
//         res.render('addProduct')
//     } catch (error) {
//         console.log(error.message);
//     }
// }

const adminLogout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/admin");
  } catch (error) {
    console.log(error.message);
  }
};

const generateReport = async (req, res) => {
  try {
    let orders = await Order.find().populate('products.productId');

    const PDFDocument = require('pdfkit');

    // Create a document with custom page size and margins
    const doc = new PDFDocument({ size: 'letter', margin: 50 });

    // Pipe its output somewhere, like to a file or HTTP response
    // See below for browser usage
    doc.pipe(res);

    // Title
    doc.fontSize(20).text('Sales Report', { align: 'center' });
    doc.moveDown(); // Move down to create space below the title

    // Define table headers
    const headers = [
      'Index',
      'Date',
      'Order Id',
      'Qnty',
      'Total',
      'Discount',
      'Final Price',
    ];
    // Calculate column widths
    const colWidths = [35, 90, 140, 50, 70, 70, 70];

    // Set initial position for drawing
    let x = 50;
    let y = doc.y;

    // Draw table headers
    headers.forEach((header, index) => {
      doc
        .font('Helvetica-Bold')
        .fontSize(12)
        .text(header, x, y, { width: colWidths[index], align: 'center' });
      x += colWidths[index];
    });

    // Draw table rows
    let currentPageY = y;
    orders.forEach((order, index) => {
      const total = order.paidAmount;
      const discount = order.couponDiscount;
      const orderId = order.orderId;
      const date = String(order.createdAt).slice(4, 16);

      order.products.forEach((product) => {
        const quantity = product.quantity;

        const finalPrice = total - discount;

        // Create an array of row data with the Indian Rupee symbol and formatted prices
        const rowData = [
          index + 1,
          date,
          orderId,
          quantity,
          total, // Format total price
          discount, // Format discount
          finalPrice, // Format final price
        ];

        x = 50;
        currentPageY += 20;

        // Check if the current row will fit on the current page, if not, create a new page
        if (currentPageY + 20 > doc.page.height - 50) {
          doc.addPage(); // Create a new page
          currentPageY = 50; // Reset the current Y position
        }

        // Draw row data
        rowData.forEach((value, index) => {
          doc.font('Helvetica').fontSize(12).text(value.toString(), x, currentPageY, {
            width: colWidths[index],
            align: 'center',
          });
          x += colWidths[index];
        });
      });
    });

    // Finalize PDF file
    doc.end();
  } catch (error) {
    console.log(error.message);
  }
};



module.exports = {
  loadLogin,
  loadHome,
  verifyLogin,
  adminLogout,
  generateReport,
};
