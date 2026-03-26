const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Your hard-earned Cloud MongoDB Connection
const mongoURI = process.env.MONGO_URI; 

mongoose.connect(mongoURI)
    .then(() => console.log("🚀 Task-2: Cloud MongoDB Connected!"))
    .catch(err => console.error("❌ Connection Error:", err));

// --- MODELS ---

// Event Model
const Event = mongoose.model('Event', new mongoose.Schema({
    title: String,
    date: { type: Date, default: Date.now }, 
    description: String,
    category: String 
}), 'events'); 

// Registration Model
const Registration = mongoose.model('Registration', new mongoose.Schema({
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    userName: String,
    userEmail: String,
    userPhone: String,
    organization: String,
}), 'registrations');

// --- API ENDPOINTS ---

// Simple Login Check
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    if (password === "admin123" || password === "user123") {
        res.json({ success: true, message: "Login successful" });
    } else {
        res.status(401).json({ success: false, message: "Invalid Password" });
    }
});

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
        res.json({ success: true, message: "Registration successful!" });
    } catch (err) { res.status(500).send(err); }
});

// 3. Get my registrations by email
app.get('/api/my-registrations/:email', async (req, res) => {
    try {
        const regs = await Registration.find({ userEmail: req.params.email }).populate('eventId');
        res.json(regs);
    } catch (err) { res.status(500).send(err); }
});

// 4. Seed Route (To add sample data easily)
app.get('/api/seed', async (req, res) => {
    try {
        const sample = [
            { title: "MERN Masterclass", date: new Date('2026-05-10'), description: "Learn full-stack engineering with MongoDB, Express, React, and Node.", category: "Workshop" },
            { title: "AI Seminar", date: new Date('2026-06-15'), description: "Exploring the future of GPT and Large Language Models.", category: "Seminar" }
        ];
        await Event.insertMany(sample);
        res.send("Sample data added successfully!");
    } catch (err) { res.status(500).send(err.message); }
});

// --- ADMIN API ---

// Create Event
app.post('/api/admin/add-event', async (req, res) => {
    try {
        const newEvent = new Event(req.body);
        await newEvent.save();
        res.json({ message: "Event created!" });
    } catch (err) { res.status(500).send(err); }
});

// View all registrations (Admin only view)
app.get('/api/admin/registrations', async (req, res) => {
    try {
        const allRegs = await Registration.find().populate('eventId');
        res.json(allRegs);
    } catch (err) { res.status(500).send(err); }
});

// DELETE an event (Admin Only)
app.delete('/api/admin/delete-event/:id', async (req, res) => {
    try {
        const result = await Event.findByIdAndDelete(req.params.id);
        if (result) {
            // Optional: Also delete all registrations associated with this event
            await Registration.deleteMany({ eventId: req.params.id });
            return res.json({ success: true, message: "Event and registrations deleted" });
        }
        res.status(404).json({ success: false, message: "Event not found" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`✅ Task-2 Backend running on port ${PORT}`));