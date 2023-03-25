var express = require('express');
var router = express.Router();
var productHelpers=require('../helpers/product-helpers')
var userHelpers=require('../helpers/user-helpers')
var adminHelpers=require('../helpers/admin-helpers')
var db=require('../config/connection')
var collection=require('../config/collections')
const bcrypt=require('bcrypt')
var objectId=require('mongodb').ObjectID
const verifyLogin=(req,res,next)=>{
  if (req.session.userLoggedIn){
    next()
  }
  else{
    res.redirect('/login')
  }
}
let flag=0
/* GET home page. */
router.get('/',async function (req, res, next) {

  if (flag==0){
    flag=1
    const adminDetails={
      adminUsername:'admin',
      adminPassword:'admin'
    }
    adminDetails.adminPassword=await bcrypt.hash(adminDetails.adminPassword,10)
    db.get().collection(collection.ADMIN_COLLECTION).insertOne(adminDetails)
  }

  let user=req.session.user
  let admin=req.session.admin
  let cartCount=null
  if (req.session.user){
    cartCount=await userHelpers.getCartCount(req.session.user._id)
  }
  
  productHelpers.getAllProducts().then((products)=>{
    res.render('user/view-products',{products,user,cartCount})
  })
});

router.get('/login',(req,res)=>{
  if (req.session.user){
    res.redirect('/')    //Browser Issue, Try Microsoft Edge
  }
  else{
    res.render('user/login',{"loginErr":req.session.userLoginErr})
    req.session.userLoginErr=false
  }
})

router.get('/signup',(req,res)=>{
  res.render('user/signup')
})

router.post('/signup',(req,res)=>{
  console.log(req.body)
  userHelpers.doSignup(req.body).then((response)=>{
    req.session.user=response.user
    req.session.userLoggedIn=true
    res.redirect('/')
  })
})
router.post('/login',(req,res)=>{
  userHelpers.doLogin(req.body).then((response)=>{
    if (response.status){
      req.session.user=response.user
      req.session.userLoggedIn=true
      res.redirect('/')
    }
    else{
      req.session.userLoginErr="INVALID USERNAME OR PASSWORD"
      res.redirect('/login')
    }
  })
})
router.get('/logout',(req,res)=>{
  req.session.user=null
  req.session.userLoggedIn=false
  res.redirect('/')
})

router.get('/cart',verifyLogin,async(req,res)=>{
  let products=await userHelpers.getCartProducts(req.session.user._id)
  let totalValue=0
  if (products.length>0){
    totalValue=await userHelpers.getTotalAmount(req.session.user._id)
  }
  res.render('user/cart',{products,user:req.session.user,totalValue})
})

router.get('/add-to-cart/:id',(req,res)=>{
  userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
    res.json({status:true})
  })
})

router.post('/change-product-quantity',(req,res,next)=>{
  userHelpers.changeProductQuantity(req.body).then(async(response)=>{
    response.total=await userHelpers.getTotalAmount(req.body.user)
    res.json(response)
  })
})

router.get('/delete-product/:id/:proId',(req , res)=>{
  let proId = req.params.proId
  let Id = req.params.id
  userHelpers.deleteProduct(proId , Id).then((response)=>{
    res.redirect('/cart')
  })
})

router.get('/place-order',verifyLogin,async(req,res)=>{
  let total=await userHelpers.getTotalAmount(req.session.user._id)
  res.render('user/place-order',{total,user:req.session.user})
})

router.post('/place-order',async(req,res)=>{
  let products=await userHelpers.getCartProductList(req.body.userId)
  let totalPrice=await userHelpers.getTotalAmount(req.body.userId)
  userHelpers.placeOrder(req.body,products,totalPrice).then((orderId)=>{
    if (req.body['payment-method']=='COD'){
      res.json({codSuccess:true})
    }
    else{
      userHelpers.generateRazorpay(orderId,totalPrice).then((response)=>{
        res.json(response)
      })
    }
  })
})

router.get('/order-success',(req,res)=>{
  res.render('user/order-success',{user:req.session.user})
})

router.get('/orders',async(req,res)=>{
  let orders=await userHelpers.getUserOrders(req.session.user._id)
  res.render('user/orders',{user:req.session.user,orders})
})

router.get('/view-order-products/:id',async(req,res)=>{
  let products=await userHelpers.getOrderProducts(req.params.id)
  res.render('user/view-order-products',{user:req.session.user,products})
})

router.post('/verify-payment',(req,res)=>{
  console.log(req.body)
  userHelpers.verifyPayment(req.body).then(()=>{
    userHelpers.changePaymentStatus(req.body['order[receipt]']).then(()=>{
      res.json({status:true})
    })
  }).catch((err)=>{
    res.json({status:false,errMsg:''})
  })
})

router.get('/adminlogin',(req,res)=>{
  if (req.session.admin){
    res.render('/admin')    //Browser Issue, Try Microsoft Edge
  }
  else{
    res.render('admin/adminlogin',{"adminLoginErr":req.session.adminLoginErr})
    req.session.adminLoginErr=false
  }
})

router.post('/adminlogin',(req,res)=>{
  adminHelpers.doLogin(req.body).then((response)=>{
    if (response.status){
      req.session.admin=response.admin
      req.session.adminLoggedIn=true
      res.redirect('/admin')
    }
    else{
      req.session.adminLoginErr="INVALID USERNAME OR PASSWORD"
      res.redirect('/adminlogin')
    }
  })
})

router.get('/adminlogout',(req,res)=>{
  req.session.admin=null
  req.session.adminLoggedIn=false
  res.redirect('/')
})

module.exports = router;
