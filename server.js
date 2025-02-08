const upload = require('./upload');

app.post('/upload', upload.single('image'), (req, res) => {
  try {
    const file = req.file;
    res.status(200).json({
      message: 'File uploaded successfully',
      file: file.path, // Cloudinary file URL
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload file' });
  }
});
