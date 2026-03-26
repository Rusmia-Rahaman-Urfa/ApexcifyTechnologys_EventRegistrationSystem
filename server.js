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
    .then(() => console.log("🚀 EventHub Backend: Cloud MongoDB Connected!"))
    .catch(err => console.error("❌ Connection Error:", err));

// --- MODELS ---

const Event = mongoose.model('Event', new mongoose.Schema({
    title: String,
    date: Date, 
    description: String,
    category: String 
}), 'events'); 

const Registration = mongoose.model('Registration', new mongoose.Schema({
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    userName: String,
    userEmail: String,
    userPhone: String,    // New
    organization: String, // New
}), 'registrations');

// --- AUTH & USER API ---

// Simple Login Check
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    // For this task, we'll allow any email, but check for a specific password
    if (password === "admin123" || password === "user123") {
        res.json({ success: true, message: "Login successful" });
    } else {
        res.status(401).json({ success: false, message: "Invalid Password" });
    }
});

app.get('/api/events', async (req, res) => {
    try {
        const events = await Event.find().sort({ date: 1 });
        res.json(events);
    } catch (err) { res.status(500).send(err); }
});

app.post('/api/register', async (req, res) => {
    try {
        const newReg = new Registration(req.body);
        await newReg.save();
        res.json({ message: "Registration successful!" });
    } catch (err) { res.status(500).send(err); }
});

app.get('/api/my-registrations/:email', async (req, res) => {
    try {
        const regs = await Registration.find({ userEmail: req.params.email }).populate('eventId');
        res.json(regs);
    } catch (err) { res.status(500).send(err); }
});

// --- ADMIN API ---

app.post('/api/admin/add-event', async (req, res) => {
    try {
        const newEvent = new Event(req.body);
        await newEvent.save();
        res.json({ message: "Event created!" });
    } catch (err) { res.status(500).send(err); }
});

app.get('/api/admin/registrations', async (req, res) => {
    try {
        const allRegs = await Registration.find().populate('eventId');
        res.json(allRegs);
    } catch (err) { res.status(500).send(err); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));