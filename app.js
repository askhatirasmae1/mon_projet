require('dotenv').config();

const express = require('express');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;

// ===== Middleware =====
app.use(express.json());
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));

// ===== Utils =====
const readUsers = () => {
  return JSON.parse(fs.readFileSync('./users.json', 'utf8'));
};

const writeUsers = (data) => {
  fs.writeFileSync('./users.json', JSON.stringify(data, null, 2));
};

// ===== Routes =====

// Home
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Get all users
app.get('/api/users', (req, res) => {
  try {
    const users = readUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Get user by ID
app.get('/api/users/:id', (req, res) => {
  const users = readUsers();
  const user = users.find(u => u.id === parseInt(req.params.id));

  if (!user) {
    return res.status(404).json({ error: 'User introuvable' });
  }

  res.json(user);
});

// Add user
app.post('/api/users', (req, res) => {
  const { nom, prenom, age } = req.body;

  if (!nom || !prenom) {
    return res.status(400).json({ error: 'Nom et prénom obligatoires' });
  }

  const users = readUsers();

  const newUser = {
    id: users.length ? users[users.length - 1].id + 1 : 1,
    nom,
    prenom,
    age: age || 0
  };

  users.push(newUser);
  writeUsers(users);

  res.status(201).json(newUser);
});

// Delete user
app.delete('/api/users/:id', (req, res) => {
  let users = readUsers();
  const id = parseInt(req.params.id);

  const newUsers = users.filter(u => u.id !== id);

  if (users.length === newUsers.length) {
    return res.status(404).json({ error: 'User non trouvé' });
  }

  writeUsers(newUsers);
  res.json({ message: 'User supprimé' });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});