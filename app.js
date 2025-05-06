const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = 3001;

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

// Parse URL-encoded form data (if needed later)
app.use(express.urlencoded({ extended: true }));




// Homepage (Assignment List)
app.get('/', (req, res) => {
  const dataPath = path.join(__dirname, 'data', 'assignments.json');
  fs.readFile(dataPath, 'utf8', (err, jsonData) => {
    if (err) {
      return res.status(500).send('Error loading assignments');
    }
    const assignments = JSON.parse(jsonData);
    // console.log(assignments);
    res.render('index', { assignments, assignmentString:JSON.stringify(assignments) });
  });
});


// Set up multer storage to preserve original file extension
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, 'uploads')); // Save uploaded files to 'uploads' directory
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Keep the original file extension
    }
  });
  
  const upload = multer({ storage: storage });
  
  // Handling file uploads and associating them with an assignment
  app.post('/api/upload-submission/:assignment_id', upload.single('file'), (req, res) => {
    const assignmentId = req.params.assignment_id; // Get the assignment ID from the URL parameter
    const file = req.file;
  
    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' }); // Send JSON response
    }
  
    const dataPath = path.join(__dirname, 'data', 'assignments.json');
  
    fs.readFile(dataPath, 'utf8', (err, jsonData) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error loading assignments' }); // Send JSON response
      }
  
      const assignments = JSON.parse(jsonData);
      const assignment = assignments.find(a => a.id === assignmentId);
  
      if (!assignment) {
        return res.status(404).json({ success: false, message: 'Assignment not found' }); // Send JSON response
      }
  
      // Add the file path to the assignment
      if (!assignment.submissions) {
        assignment.submissions = [];
      }
  
      // Save the file path in the assignments JSON
      assignment.submissions.push({
        filename: file.originalname,
        filePath: path.join('uploads', file.filename), // Path to the uploaded file
        uploadedAt: new Date(),
      });
  
      // Save the updated assignments JSON
      fs.writeFile(dataPath, JSON.stringify(assignments, null, 2), (err) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Error saving assignment data' }); // Send JSON response
        }
        res.status(200).json({ success: true, message: 'File uploaded successfully' }); // Send JSON response
      });
    });
  });


// ===== Catch-all 404 =====
app.use((req, res) => {
  res.send('404');
});

// ===== Start Server =====
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
