var mongoose=require('mongoose'); //untuk koneksi mongodb dan backend
const jwt=require('jsonwebtoken'); //generate token
const bcrypt=require('bcrypt'); //enkripsi password
const confiq=require('../config/config').get(process.env.NODE_ENV); //konfigurasi yang digunakan
const salt=10; //hashing password

const userSchema=mongoose.Schema({ //struktur collection
    fullname:{
        type: String,
        required: true,
        maxlength: 100
    },
    username:{
        type: String,
        required: true,
        trim: true,
        unique: 1
    },
    password:{
        type:String,
        required: true,
        minlength:8
    },
    password2:{
        type:String,
        required: true,
        minlength:8

    },
    token:{
        type: String
    }
});


//simpan user ke database
userSchema.pre('save',function(next){ 
    var user=this;
    
    //generate enkripsi password
    if(user.isModified('password')){ 
        bcrypt.genSalt(salt,function(err,salt){
            if(err)return next(err);

            //mengenkripsi dan meng-hash password user
            bcrypt.hash(user.password,salt,function(err,hash){
                if(err) return next(err);
                user.password=hash;
                user.password2=hash;
                next();
            })

        })
    }
    else{
        next();
    }
});

//mencocokkan password yang dimasukkan dengan yang tersimpan
userSchema.methods.comparepassword=function(password,cb){
    bcrypt.compare(password,this.password,function(err,isMatch){
        if(err) return cb(next);
        cb(null,isMatch);
    });
}

//generate token untuk login
userSchema.methods.generateToken=function(cb){
    var user =this;
    var token=jwt.sign(user._id.toHexString(),confiq.SECRET);

    user.token=token;
    user.save(function(err,user){
        if(err) return cb(err);
        cb(null,user);
    })
}

//mencari token, cek apakah user sudah login
userSchema.statics.findByToken=function(token,cb){
    var user=this;

    jwt.verify(token,confiq.SECRET,function(err,decode){
        user.findOne({"_id": decode, "token":token},function(err,user){
            if(err) return cb(err);
            cb(null,user);
        })
    })
};

//hapus token
userSchema.methods.deleteToken=function(token,cb){
    var user=this;

    user.update({$unset : {token :1}},function(err,user){
        if(err) return cb(err);
        cb(null,user);
    })
}

module.exports=mongoose.model('User',userSchema);