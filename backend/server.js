const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const handlebars = require('handlebars');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/email-builder', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.log('Error connecting to MongoDB', err);
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Models
const EmailTemplate = require('./models/emailTemplate');

// Helper function to upload to Cloudinary
const uploadToCloudinary = async (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'email-builder',
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    const bufferStream = require('stream').Readable.from(fileBuffer);
    bufferStream.pipe(uploadStream);
  });
};

// Routes

// Get Email Layout
app.get('/api/getEmailLayout', async (req, res) => {
  try {
    const layoutPath = path.join(__dirname, 'templates', 'layout.html');
    const layoutContent = await fs.readFile(layoutPath, 'utf8');
    res.send(layoutContent);
  } catch (error) {
    console.error('Error reading layout file:', error);
    res.status(500).send('Error reading layout file');
  }
});

// Upload Image
app.post('/api/uploadImage', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded');
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer);
    
    res.json({
      imageUrl: result.secure_url,
      publicId: result.public_id
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).send('Error uploading image');
  }
});

// Upload Email Config
app.post('/api/uploadEmailConfig', async (req, res) => {
  try {
    const { title, subtitle, styles, imageUrls } = req.body;
    
    const emailTemplate = new EmailTemplate({
      title,
      subtitle,
      styles,
      imageUrls,
      createdAt: new Date()
    });

    await emailTemplate.save();
    res.status(201).json(emailTemplate);
  } catch (error) {
    console.error('Error saving email template:', error);
    res.status(500).send('Error saving email template');
  }
});

// Render and Download Template
app.post('/api/renderAndDownloadTemplate', async (req, res) => {
  try {
    const templateData = req.body;
    if (!templateData) {
      return res.status(400).send('Template data is required');
    }

    // Read the layout file
    const layoutPath = path.join(__dirname, 'templates', 'layout.html');
    const layoutContent = await fs.readFile(layoutPath, 'utf8');

    // Compile the template with Handlebars
    const compiledTemplate = handlebars.compile(layoutContent);
    
    // Render the template with the data
    const renderedHtml = compiledTemplate({
      title: templateData.title,
      subtitle: templateData.subtitle,
      styles: templateData.styles,
      imageUrls: templateData.imageUrls
    });

    // Set headers for file download
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', 'attachment; filename=email-template.html');
    
    res.send(renderedHtml);
  } catch (error) {
    console.error('Error rendering template:', error);
    res.status(500).send('Error rendering template');
  }
});

// Delete image from Cloudinary
app.delete('/api/deleteImage', async (req, res) => {
  try {
    const { publicId } = req.body;
    if (!publicId) {
      return res.status(400).send('Public ID is required');
    }

    const result = await cloudinary.uploader.destroy(publicId);
    res.json(result);
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).send('Error deleting image');
  }
});

// Get all templates
app.get('/api/templates', async (req, res) => {
  try {
    const templates = await EmailTemplate.find().sort({ createdAt: -1 });
    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).send('Error fetching templates');
  }
});

// Get template by ID
app.get('/api/templates/:id', async (req, res) => {
  try {
    const template = await EmailTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).send('Template not found');
    }
    res.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).send('Error fetching template');
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
