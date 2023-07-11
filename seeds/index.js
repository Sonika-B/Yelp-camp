
const mongoose=require("mongoose");
mongoose.set('strictQuery', true);
const cities = require("./cities");
const { places, descriptors } = require('./seedHelpers');
const Campground = require("../models/campground");

mongoose.connect("mongodb://localhost:27017/yelp-camp" , {
    useNewUrlParser:true,
    // useCreateIndex:true,
    useUnifiedTopology:true
});

const db= mongoose.connection;
db.on("error" , console.error.bind(console , "connection error: "));
db.once("open" , ()=> {
    console.log("Database Connected!!");
});

const sample = array => array[Math.floor(Math.random()*array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for(let i=0; i<300 ; i++ ){
        const random1000 = Math.floor(Math.random()*1000);
        const price = Math.floor(Math.random() *20) +10 ;
        const camp = new Campground({
            author: "63d4e54a87bbf58422103ced",
            location:  `${cities[random1000].city} , ${cities[random1000].state} `,
            title: `${sample(descriptors)} ${sample(places)}`,
            description:"Welcome to my camphrujdhgvjhdj sgvdcbhs c sgcshc nzxbcjszhvdygjs csdvfwyecdbhbc hdcgyeyisfbckjzcn",
            price:price,
            geometry:{
                type:"Point",
                coordinates:[cities[random1000].longitude, cities[random1000].latitude]
            },
            images:[
                {
                  url: 'https://res.cloudinary.com/dvdyadmoj/image/upload/v1674992654/YelpCamp/rw84mngvhm51pzlutgbd.jpg',
                  filename: 'YelpCamp/rw84mngvhm51pzlutgbd',
                  
                },
                {
                  url: 'https://res.cloudinary.com/dvdyadmoj/image/upload/v1674992657/YelpCamp/apsiar2ccwxjkwvj9fad.jpg',
                  filename: 'YelpCamp/apsiar2ccwxjkwvj9fad',
                  
                },
              ]
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})


