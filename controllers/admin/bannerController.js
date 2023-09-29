const Banner = require("../../models/bannerModel");

const loadBannerList = async (req, res) => {
  try {
    const banner = await Banner.find()
    res.render('bannerList',{banner : banner})
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
const loadAddBanner = async (req, res) => {
  try {
    res.render("addBanner");
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const addBanner = async (req, res) => {
  try {
    console.log(req.body);
    const bannerData = new Banner({
      title: req.body.title,
      image: req.file.filename,
      linkToProduct: req.body.url,
      validity: req.body.validity,
      isListed: req.body.isListed,
      details: req.body.details,
      description: req.body.description,
      createdAt: Date.now(),
    });

    const banner = await bannerData.save();

    if (banner) {
      res.redirect("/admin/banners");
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  loadBannerList,
  loadAddBanner,
  addBanner,
};
