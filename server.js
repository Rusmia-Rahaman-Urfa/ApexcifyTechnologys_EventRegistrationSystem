const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("🚀 Task 2: Cloud Database Connected"))
    .catch(err => console.log(err));

// MODELS
const Event = mongoose.model('Event', new mongoose.Schema({
    title: String,
    date: String,
    description: String,
    category: String // Added for better UI filtering
}));

const Registration = mongoose.model('Registration', new mongoose.Schema({
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    userName: String,
    userEmail: String,
    status: { type: String, default: 'Confirmed' }
}));

// API Endpoints
// Get All Events
app.get('/api/events', async (req, res) => {
    const events = await Event.find();
    res.json(events);
});
// POST: Register a user for an event
app.post('/api/register', async (req, res) => {
    try {
        const newReg = new Registration(req.body);
        await newReg.save();
        res.json({ message: "Registration successful!", data: newReg });
    } catch (err) { res.status(500).json(err); }
});

app.listen(5000, () => console.log("Server running on port 5000"));