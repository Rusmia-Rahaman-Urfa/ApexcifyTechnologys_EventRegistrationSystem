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
// GET: View specific user's registrations
app.get('/api/my-registrations/:email', async (req, res) => {
    const regs = await Registration.find({ userEmail: req.params.email }).populate('eventId');
    res.json(regs);
});

// DELETE: Cancel registration
app.delete('/api/cancel/:id', async (req, res) => {
    await Registration.findByIdAndDelete(req.params.id);
    res.json({ message: "Registration cancelled." });
});

// Seed Route
app.get('/api/seed', async (req, res) => {
    try {
        await Event.deleteMany({});
        const sampleEvents = [
            { 
                title: "Advanced Backend Architecture", 
                date: new Date('2026-05-15'), 
                description: "Mastering Node.js and MongoDB performance for industrial scale.", 
                category: "Executive Seminar" 
            },
            { 
                title: "MERN Stack Masterclass", 
                date: new Date('2026-06-01'), 
                description: "The complete roadmap from frontend React to backend deployment.", 
                category: "Technical Workshop" 
            },
            { 
                title: "Innovation & Hult Prize", 
                date: new Date('2026-04-10'), 
                description: "Social entrepreneurship strategies for BAIUST innovators.", 
                category: "Conference" 
            }
        ];
        await Event.insertMany(sampleEvents);
        res.send("<h1>Success!</h1><p>Premium events have been added to your database.</p>");
    } catch (err) {
        res.status(500).send("Seeding failed: " + err.message);
    }
});

app.listen(5000, () => console.log("Server running on port 5000"));