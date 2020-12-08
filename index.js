const express=require('express');
const cors = require('cors'); 
const mongoose= require('mongoose');
const bodyparser=require('body-parser');
const db=require('./config/config').get(process.env.NODE_ENV);
const User=require('./models/user');
const {auth} =require('./middlewares/auth');

const app=express();

app.use(cors()) //supaya tidak terkena cors policy
app.use(bodyparser.urlencoded({extended : false}));
app.use(bodyparser.json());

//hubungkan database
mongoose.Promise=global.Promise;
mongoose.connect(db.DATABASE,{ useNewUrlParser: true,useUnifiedTopology:true },function(err){
    if(err) console.log(err);
    console.log("database is connected");
});


app.get('/api',function(req,res){
    res.status(200).send(`Welcome`);
});

//port yang digunakan
const PORT=process.env.PORT||3000;
app.listen(PORT,()=>{
    console.log(`app is live at ${PORT}`);
});

//menambah user
app.post('/api/register',function(req,res){
    //membuat "object user" baru berdasarkan request
    const newuser=new User(req.body);
    //mencocokkan password dan confirm password
   if(newuser.password!=newuser.password2)return res.status(400).json({message: "password not match"});
    
   //cek apakah username pernah dipakai
    User.findOne({username:newuser.username},function(err,user){
        if(user) return res.status(400).json({ success : false, message :"username exits"});
        
        //simpan user baru ke database (panggil method save di user.js)
        newuser.save((err,doc)=>{
            if(err) {console.log(err); //jika gagal
                return res.status(400).json({ success : false, message : "unknown error"});}
            res.status(200).json({ //jika berhasil
                success:true,
                user : doc
            });
        });
    });
 });

 //login user
app.post('/api/login', function(req,res){
    //cari apakah username sudah tersimpan
    User.findOne({'username':req.body.username},function(err,user){
        if(!user) return res.json({isAuth : false, message : 'username not found'});

        //bandingkan password dengn password tersimpan (panggil method compare di user.js)
        user.comparepassword(req.body.password,(err,isMatch)=>{
            if(!isMatch) return res.json({isAuth : false, message : "password doesn't match"});
        
        //generate token untuk akses activity (panggil method generate di user.js)
        user.generateToken((err,user)=>{
            if(err) return res.status(400).send(err);
            res.json({
                isAuth : true,
                token : user.token,
                id : user._id,
                username : user.username
            });
        });    
    });
  });
});

//menampilkan profil user
app.get('/api/profile',auth,function(req,res){
    res.json({
        isAuth: true,
        id: req.user._id,
        username: req.user.username,
        name: req.user.fullname
        
    })
});

//user logout
app.get('/api/logout',auth,function(req,res){
    //hapus token dari database (panggil method delete di user.js)
    req.user.deleteToken(req.token,(err,user)=>{
        if(err) return res.status(400).send(err);
        res.sendStatus(200);
    });

}); 