const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.static('frontend'));
// Increase the payload size limit
app.use(express.json({ limit: '10mb' })); // Adjust '10mb' as needed
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // For form data
// Use express's built-in JSON parser

// MongoDB connection string (make sure to include the database name)
const mongoUri = "mongodb+srv://deviraksitha:d123evi123@cluster0.0ore3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Connect to MongoDB
mongoose.connect(mongoUri)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log('Failed to connect to MongoDB', err));

// Define User Schema and Model
const userSchema = new mongoose.Schema({
    name: String,
    username: String,
    password: String,
    phoneNumber: String
});

const petSchema = new mongoose.Schema({
    name: String,
    contact: String,
    breed: String,
    age: Number,
    gender: String,
    place: String,
    imageUrl: String,
    type: String
});

const User = mongoose.model('User', userSchema);
const Pet = mongoose.model('Pet', petSchema);

// Serve the login page at the root URL
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/frontend/login.html');
});

// Sign Up Route
app.post('/signup', async (req, res) => {
    const { name, username, password, phoneNumber } = req.body;

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ username });

        if (existingUser) {
            return res.status(400).json({ message: 'Username already taken' });
        }

        // Create a new user
        const newUser = new User({ name, username, password, phoneNumber });
        await newUser.save();

        res.status(201).json({ message: 'Signup successful' });
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Login Route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find the user by username
        const user = await User.findOne({ username });

        // Check if the user exists and password matches
        if (user && user.password === password) {
            res.status(200).json({ message: 'Login successful' });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Post Pet Route
app.post('/postpet', async (req, res) => {
    const { name, contact, breed, age, gender, place, imageUrl, type } = req.body;

    try {
        const newPet = new Pet({
            name,
            contact,
            breed,
            age,
            gender,
            place,
            imageUrl,
            type
        });

        await newPet.save();
        res.status(201).json({ message: 'Pet posted successfully' });
    } catch (error) {
        console.error('Error posting pet:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get All Pets Route
app.get('/pets', async (req, res) => {
    try {
        const pets = await Pet.find();
        res.status(200).json(pets);
    } catch (error) {
        console.error('Error fetching pets:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.delete('/api/pet/deleteByName/:name', async (req, res) => {
    try {
        const petName = req.params.name;
        const result = await Pet.findOneAndDelete({ name: petName });
        if (result) {
            res.status(200).send({ message: 'Pet deleted successfully!' });
        } else {
            res.status(404).send({ message: 'Pet not found' });
        }
    } catch (error) {
        res.status(500).send({ message: 'Error deleting pet', error });
    }
});
// Start the server
const port = 5000;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
