const Coupondb = require("../../models/couponModel");

const loadAddCoupon = async (req, res) => {
  try {
    res.render("addCoupon");
  } catch (error) {
    console.error(error);
  }
};

const loadCouponList = async (req, res) => {
  try {
    const coupon = await Coupondb.find();
    res.render("couponList", { coupon: coupon });
  } catch (error) {
    console.error(error);
  }
};

const addCoupon = async (req, res) => {
  try {
    console.log(req.body.couponCode);
    const couponData = await Coupondb.find({ couponCode: req.body.couponCode });
    console.log(couponData);

    if (couponData.length) {
        res.render('addCoupon',{message : 'Coupon Name already exists'})
    } else {
      console.log(req.body);
      const coupon = new Coupondb({
        couponCode: req.body.couponCode,
        discount: req.body.discount,
        description: req.body.description,
        minOrderPrice: req.body.minOrderPrice,
        maxDiscount: req.body.maxDiscount,
        isListed: req.body.isListed,
      });
      await coupon.save();
      res.redirect("/admin/coupon");
    }
  } catch (error) {
    console.error(error);
  }
};

const couponStatus = async (req, res) => {
    try {
        const id = req.params.id;
        let updateData = {};
console.log('started'+id);
        const couponData = await Coupondb.findById(id);
        if (couponData.isListed) {
            updateData.isListed = false;
        } else {
            updateData.isListed = true;
        }
        const updatedCoupon = await Coupondb.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedCoupon) {
            return res.status(404).json({ message: 'User not found' });
        }
        console.log('updated');
        res.status(200).json({ message: 'User status updated successfully', coupon: updatedCoupon });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
  loadAddCoupon,
  addCoupon,
  loadCouponList,
  couponStatus
};
