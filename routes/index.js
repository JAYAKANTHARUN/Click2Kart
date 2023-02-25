var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  let products=[
    {
      name:"IPHONE",
      category:'mobile',
      description:"This is a good phone",
      image:"https://www.apple.com/newsroom/images/product/iphone/standard/Apple-iPhone-14-Pro-iPhone-14-Pro-Max-deep-purple-220907_inline.jpg.large.jpg"
    },
    {
      name:"ONE PLUS",
      category:'mobile',
      description:"This is a good phone",
      image:"https://m.media-amazon.com/images/I/61mIUCd-37L._SX425_.jpg"
    },
    {
      name:"SAMSUNG",
      category:'mobile',
      description:"This is a good phone",
      image:"https://d2d22nphq0yz8t.cloudfront.net/88e6cc4b-eaa1-4053-af65-563d88ba8b26/https://media.croma.com/image/upload/v1662439580/Croma%20Assets/Communication/Mobiles/Images/248913_t4jcqo.png/mxw_640,f_auto"
    },
    {
      name:"REDMI",
      category:'mobile',
      description:"This is a good phone",
      image:"https://i.pinimg.com/564x/5a/0c/70/5a0c70841f7fad2820824a9b64d4f168.jpg"
    }
  ]
  res.render('index', {products,admin:true});
});

module.exports = router;
