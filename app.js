const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

// Parse URL-encoded form data (if needed later)
app.use(express.urlencoded({ extended: true }));

// ===== API to return assignments JSON =====
app.get('/api/assignments', (req, res) => {
  const dataPath = path.join(__dirname, 'data', 'assignments.json');
  fs.readFile(dataPath, 'utf8', (err, jsonData) => {
    if (err) {
      console.error('Error reading assignments:', err);
      return res.status(500).json({ error: 'Failed to load assignments' });
    }
    res.setHeader('Content-Type', 'application/json');
    res.send(jsonData);
  });
});

// Homepage (Assignment List)
app.get('/', (req, res) => {
  const dataPath = path.join(__dirname, 'data', 'assignments.json');
  fs.readFile(dataPath, 'utf8', (err, jsonData) => {
    if (err) {
      return res.status(500).send('Error loading assignments');
    }
    const assignments = JSON.parse(jsonData);
    console.log(assignments);
    res.render('index', { assignments });
  });
});

// Single Assignment Page
app.get('/assignment/:id', (req, res) => {
  const dataPath = path.join(__dirname, 'data', 'assignments.json');
  const assignmentId = req.params.id;

  fs.readFile(dataPath, 'utf8', (err, jsonData) => {
    if (err) {
      return res.status(500).send('Error loading assignment');
    }
    const assignments = JSON.parse(jsonData);
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) {
      return res.status(404).send('Assignment not found');
    }
    res.render('assignment', { assignment });
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
