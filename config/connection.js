const mongoClient=require('mongodb').MongoClient
const state={
    db:null
}

module.exports.connect=function(done){
    const url=`mongodb+srv://jayakantharun03:click2kart@cluster0.nkgdwh3.mongodb.net/?retryWrites=true&w=majority`//'mongodb://0.0.0.0:27017'
    const dbname='shopping'

    mongoClient.connect( url,(err,data)=>{                   //   { useUnifiedTopology: true },
        
        if (err) return done(err)
        state.db=data.db(dbname)
        done()
    })
}

module.exports.get=function(){
    return state.db
}