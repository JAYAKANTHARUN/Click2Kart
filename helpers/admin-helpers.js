var db=require('../config/connection')
var collection=require('../config/collections')
const bcrypt=require('bcrypt')
var objectId=require('mongodb').ObjectID

module.exports={
    doLogin:(adminData)=>{
        return new Promise(async (resolve,reject)=>{
            let loginStatus=false
            let response={}
            let admin=await db.get().collection(collection.ADMIN_COLLECTION).findOne({adminUsername:adminData.adminUsername})
            if (admin){
                bcrypt.compare(adminData.adminPassword,admin.adminPassword).then((status)=>{
                    if (status){
                        response.admin=admin
                        response.status=true
                        resolve(response)
                    }
                    else{
                        resolve({status:false})
                    }
                }) 
            }
            else{
                resolve({status:false})
            }
        })
    }
}