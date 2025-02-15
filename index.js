const express = require("express");
const multer = require("multer");
const cors = require("cors");
const dotenv = require("dotenv");
const speech = require("@google-cloud/speech");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Fix: Set up Multer with memory storage (No local files)
const upload = multer({ storage: multer.memoryStorage() });

// Google Speech Client
const client = new speech.SpeechClient();

app.get("/", (req, res) => {
    res.send("Welcome to the Speech-to-Text API!");
});

// Transcription Endpoint
app.post("/transcribe", upload.single("audio"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const audioBytes = req.file.buffer.toString("base64");

        const request = {
            audio: { content: audioBytes },
            config: {
                encoding: "LINEAR16",
                sampleRateHertz: 16000,
                languageCode: "en-US",
            },
        };

        const [response] = await client.recognize(request);
        const transcription = response.results
            .map(result => result.alternatives[0].transcript)
            .join("\n");

        res.json({ transcription });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Error processing audio" });
    }
});

// Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
