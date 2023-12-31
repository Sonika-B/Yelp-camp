if(process.env.NODE_EVN !== "production") {
    require("dotenv").config();
}

const express = require("express");
const mongoose=require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session")
const flash = require("connect-flash");
const methodOverride = require("method-override");
const ExpressError = require("./utilities/ExpressError");
mongoose.set('strictQuery', true);
const path = require("path");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user")

// const MongoDBStore = require("connect-mongo")(session);
const MongoDBStore = require('connect-mongodb-session')(session);
const userRoutes = require("./routes/users")
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");

const mongoSanitize = require("express-mongo-sanitize");

const dbUrl = "mongodb://localhost:27017/yelp-camp"

mongoose.connect( dbUrl, {
    useNewUrlParser:true,
    // useCreateIndex:true,
    useUnifiedTopology:true,
});

const db= mongoose.connection;
db.on("error" , console.error.bind(console , "connection error: "));
db.once("open" , ()=> {
    console.log("Database Connected!!");
});

const app = express();

app.engine("ejs" , ejsMate );
app.set("view engine", "ejs");
app.set("views" , path.join(__dirname , "views"));

app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname , "public")));
app.use(mongoSanitize());

const store = new MongoDBStore({
    url: dbUrl,
    secret:"thisshouldbeabettersecret!",
    touchAfter: 24*60*60,
    databaseName: 'yelp-camp',
    collection: 'sessions'

})


store.on("error" , function(e){
    console.log("Session store error!!" , e);
})

const sessionConfig ={
    store,
    name:"session",
    secret:"thisshouldbeabettersecret!",
    resave:false,
    saveUninitialized:true,   
    cookie:{
        httpOnly : true,
        // secure:true,
        expires :Date.now() + 1000*60*60*24*7,
        maxAge: 1000*60*60*24*7
    }
}


app.use(session(sessionConfig));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req , res, next) =>{
    // console.log(req.query);
    // console.log(req.session);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();

})

// app.get("/fakeUser" , async (req , res) => {
//     const user = new User({email: "colt@gmail.com" , username:"colt"});
//     const newUser = await User.register(user , "chicken");
//     res.send(newUser);
// })

app.use("/" , userRoutes)
app.use("/campgrounds" , campgroundRoutes)
app.use("/campgrounds/:id/reviews" , reviewRoutes);

app.get("/" , (req , res)=>{
    res.render("home")
})

app.all("*" , (req , res , next) =>{
    next(new ExpressError("Page Not Found" , 404));
})

app.use((err , req , res , next) => {
    const {statusCode=500} = err;
    if(!err.message) err.message="oh NO , Something went wrong !";
    res.status(statusCode).render("error" , {err});

});

app.listen(3000 , ()=>{
    console.log("serving on port 3000!!")
});