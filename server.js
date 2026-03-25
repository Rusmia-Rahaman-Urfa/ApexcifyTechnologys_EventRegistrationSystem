const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect using your .env variable - Exactly like Task-1
const mongoURI = process.env.MONGO_URI; 

mongoose.connect(mongoURI)
    .then(() => console.log("🚀 Task-2: Cloud MongoDB Connected!"))
    .catch(err => console.error("❌ Connection Error:", err));

// --- MODELS ---

// Event Model (Matches your Atlas 'events' collection)
const Event = mongoose.model('Event', new mongoose.Schema({
    title: String,
    date: Date, 
    description: String,
    category: String 
}), 'events'); 

// Registration Model (Matches your Atlas 'registrations' collection)
const Registration = mongoose.model('Registration', new mongoose.Schema({
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    userName: String,
    userEmail: String
}), 'registrations');

// --- API ENDPOINTS ---

// 1. Get all events
app.get('/api/events', async (req, res) => {
    try {
        const events = await Event.find().sort({ date: 1 });
        res.json(events);
    } catch (err) { res.status(500).send(err); }
});

// 2. Register for an event
app.post('/api/register', async (req, res) => {
    try {
        const newReg = new Registration(req.body);
        await newReg.save();
        res.json({ message: "Registration successful!" });
    } catch (err) { res.status(500).send(err); }
});

// 3. Get my registrations by email
app.get('/api/my-registrations/:email', async (req, res) => {
    try {
        const regs = await Registration.find({ userEmail: req.params.email }).populate('eventId');
        res.json(regs);
    } catch (err) { res.status(500).send(err); }
});

// 4. Seed Route (To add data to your new database easily)
app.get('/api/seed', async (req, res) => {
    try {
        const sample = [
            { title: "MERN Masterclass", date: new Date('2026-05-10'), description: "Learn full-stack.", category: "Workshop" },
            { title: "AI Seminar", date: new Date('2026-06-15'), description: "Future of GPT.", category: "Seminar" }
        ];
        await Event.insertMany(sample);
        res.send("Data added successfully!");
    } catch (err) { res.status(500).send(err.message); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Task-2 Backend running on port ${PORT}`));