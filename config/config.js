const config={
    production :{
        SECRET: process.env.SECRET,
        DATABASE: process.env.MONGODB_URI
    },
    default : {
        SECRET: 'mysecretkey', //key yang akan digunakan saat koneksi database
        DATABASE: 'mongodb://localhost:27017/Users' //lokasi database
    }
}


exports.get = function get(env){
    return config[env] || config.default
}