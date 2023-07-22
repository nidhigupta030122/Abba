let mongoose =require('mongoose');
DB_url = process.env.DB_url
console.log("url",DB_url);
mongoose.set('strictQuery', false);
mongoose.connect("mongodb+srv://admin:admin@cluster0.qxz2y6e.mongodb.net/abba",{
    
     useUnifiedTopology: true,
     useNewUrlParser: true,
    
   }).
then( ()=> console.log("connect is successfully"))
.catch((err)=>
console.log("Something Went Wrong",err)
)

