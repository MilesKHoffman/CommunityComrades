const mongoLogic = require('./mongoLogic.cjs');
const { validateLogin } = mongoLogic;
const express = require('express');
const cors = require('cors');
const {getListings} = require("./mongoLogic.cjs");
const app = express();
const MongoLogic = require('./mongoLogic.cjs');
const { createWriteStream } = require('fs');
const path = require('path');

const multer = require('multer');
const { MongoClient } = require('mongodb');
const {Promise} = require("mongoose");

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true }));

//picture storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const url = "mongodb+srv://cc465proj:cc465proj@cluster0.3wpv56y.mongodb.net/?retryWrites=true&w=majority";
const dbName = "CommunityComrades";

let db;

MongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: true}, (err, client) => {
    if (err) {
        console.error('Error connecting to MongoDB:', err);
        return;
    }

    console.log('Connected to MongoDB');
    db = client.db(dbName);
});

// VARIABLES ----------------------------------------------------
let globalUsername = '';

// VAR FUNCTIONS ------------------------------------------------
function setUsername( name ) {
    globalUsername = name;
    console.log("server....THIS IS THE USERNAME..." + globalUsername);
}
// --------------------------------------------------------------

const corsOptions = {
    origin: 'http://localhost:5173',
};

app.use(cors(corsOptions));

app.post('/api/getListings', async (req, res) => {
    try {

        const{getListings} = mongoLogic;
        // Call the getListing function
        const filterData = req.body;

        console.log("....Server getListing.... filterData: ", filterData)

        const listings = await getListings(filterData);

        // Send the listings as a response
        res.json(listings);
    } catch (error) {
        console.error('__________________api/getListings...Error fetching listings:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('api/closeMongo', async (req, res) => {

    await MongoLogic.closeMongo();

    res.json("Closed mongo");
});

app.post('/api/getComments', async (req, res) => {
    try {

        const {getComments} = require('./mongoLogic.cjs');

        // Call the getListing function
        //console.log("server start getComments")

        const data = req.body;
        const comments = await getComments(data.listingID);

        //console.log("Server...GetComments...Comments: ", comments);

        // Send the listings as a response
        res.json(comments);
    } catch (error) {
        console.error('__________________api/getListings...Error fetching listings:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Returns an array of sorted replies - MH
app.post('/api/getReplies', async (req, res) => {
    try {

        const {getReplies} = require('./mongoLogic.cjs')

        // Call the getReplies function
        console.log("1 server start getReplies ")

        const data = req.body;
        const comments = await getReplies( data.listingID );

        console.log("4 Server...GetReply...replies: ", );

        // Send the replies as a response
        res.json(comments);
    } catch (error) {
        console.error('__________________api/getReplies...Error fetching replies:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.get('/api/getProfile', async (req, res) => {
    try {

        const{getListings} = mongoLogic;
        // Call the getListing function
        const filterData = {
            query: true,
            name: "",
            location: "",
            minPrice: "",
            maxPrice: "",
            username: globalUsername,
            condition: {
                new: true,
                used: true,
                refurbished: true,
                damaged: true
            },
            category: "",
            ID: ""
        };
        const listings = await getListings( filterData );


        // Send the listings as a response
        res.json(listings);
    } catch (error) {
        console.error('__________________api/getListings...Error fetching listings:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
app.post('/api/login',  async (req, res) => {
    // Handle login logic here
    const {username, password} = req.body;
    console.log(username);
    console.log(password);

    // Check username and password against your database
    // If login is successful, respond with a success message or token
    // If login fails, respond with an error message

    const isValid = await validateLogin(username, password);

    if (isValid) {
        res.json({message: 'Login successful' + isValid}); // Example response
        setUsername(username);
    }
    else {
        res.status(401).json({message: 'Invalid Credentials'});
    }
});
//method to send the filtered data to mongodb so that we can filter for th

// This will get the request to create a new listing.
app.post('/api/createListing', upload.array('images'), (req, res) => {
    console.log("POST CreateListing");
    console.log('Request Headers:', req.headers);
    console.log('Request Body:', req.body);
    console.log('Request Files:', req.files);

    const { name, location, price, desc, condition, category } = req.body;
    const images = req.files.map(file => ({
        fileName: file.originalname,
        file: file.buffer,
        type: file.mimetype,
    }));

    console.log("Images array in createListing endpoint:", images);

    const {createListing} = mongoLogic;

    const listingData = {
        name, location, price, desc, image: images, username: globalUsername, condition, category
    }

    createListing( listingData );

    res.json( {message: "Created listing for: " + globalUsername} )
});

app.post('/api/createUser', (req, res) => {
    const { email, username, password } = req.body;
    const { createUser } = mongoLogic;

    createUser( email, username, password );

    res.json( {message: "Created user for: " + username} )
});

// To edit a listing
app.put('/api/editListing', (req, res) => {
    try {
        const { editListing } = mongoLogic;
        console.log(req.body);
        const { id, name, locationState, price, desc, condition, category } = req.body;

        const updData = {
            Name: name,
            Location: locationState,
            Price: price,
            Description: desc,
            Username: globalUsername,
            Condition: condition,
            Category: category
        }

        console.log("Updated data: ", updData) //testing updated data
        // Assuming there's a unique identifier for each listing, like ID
        const listingID = id;

        console.log("listingID", listingID)
        // Call the editListing function with the updated data and listingId

        const result = editListing(listingID, updData);

        res.json(result);
    }
    catch (error) {
        console.error('Error editing listing:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


//to delete a listing
app.delete('/api/deleteListing', async (req, res) => {


    const {deleteListing} = mongoLogic;

    const dID = req.body

    const listingID = dID.ID

    console.log('delete id:', listingID)


    const result =  await deleteListing(listingID)

    res.json({message: "Delete successful"});
    //mongoLogic function to delete listing from user
    console.log('request received')

})


app.post('/api/sendComment', async (req, res) => {


    const {createComment} = mongoLogic;


    const lID = req.body
    const commentData = {
        username: globalUsername,
        message: lID.TextBoxMessage,
        listingID: lID.ListingID
    }

    console.log('data', commentData)



    const result =  await createComment(commentData)

    res.json({message: "comment sent"});
    //mongoLogic function to delete listing from user
    console.log('request received')

})


app.post('/api/sendReply', async (req, res) => {


    const {createReply} = mongoLogic;


    const rID = req.body
    const replyData = {
        username: globalUsername,
        message: rID.textBoxMessage,
        commentID: rID.commentID,
        listingID: rID.listingID,
        repliedTo: rID.repliedTo
    }

    //console.log('data', replyData)

    const result =  await createReply(replyData)

    console.log("... Server..A reply has been created: ", replyData)
})





const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});