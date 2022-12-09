const mongoose = require('mongoose');

const conn = ()=>{
    mongoose.connect("mongodb+srv://gunjan:Gunjan2002@cluster0.upscsio.mongodb.net/Banking_System" , { useNewUrlParser:true}).then(()=> {
        console.log("DATABASE CONNECTED");
    }).catch((err) =>{
        console.log(err)
    })
}

module.exports =conn;