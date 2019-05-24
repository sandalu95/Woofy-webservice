const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');
const ProductsController = require('../controllers/products');

const storage = multer.diskStorage({
  destination:function(req,file,cb){
    cb(null,'./uploads/');
  },
  filename:function(req,file,cb){
    cb(null,Date.now()+file.originalname);
  }
});

const fileFilter = (req,file,cb)=>{
  //reject a file
  if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
    cb(null,true);
  } else {
    cb(null,false);
  }
}

const upload = multer({
  storage:storage, 
  limits:{
    fileSize: 1024*1024*5
  },
  fileFilter:fileFilter
});

const Product = require('../models/product');

router.get("/", ProductsController.products_get_all );

router.post("/",checkAuth, upload.single('productImage'),ProductsController.products_create_product);

router.get("/:productId", ProductsController.products_get_product );

router.patch("/:productId", checkAuth, (req, res, next) => {
  const id = req.params.productId;
  const updateOps = {};
  for(const ops of req.body){
    updateOps[ops.propName]=ops.value;
  }
  Product.update({_id:id},{$set:updateOps})
    .exec()
    .then(result=>{
      res.status(200).json({
        message:'Product updated successfully',
        request:{
          type:'GET',
          url:'http://localhost:3000/products/'+id
        }
      });
    })
    .catch(err=>{
      console.log(err);
      res.status(500).json({
        error:err
      });
    });
});

router.delete("/:productId", checkAuth,ProductsController.products_delete_product);

module.exports = router;
