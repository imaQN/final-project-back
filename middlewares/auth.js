const User=require('./../models/user');

let auth =(req,res,next)=>{ //cek apakah token valid
    let token = req.headers['x-access-token'];
    User.findByToken(token,(err,user)=>{
        if(err) throw err;
        if(!user) return res.json({
            error :true
        });

        req.token= token;
        req.user=user;
        next();

    })
}

module.exports={auth};