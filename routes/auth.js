const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/db');

// Route untuk menampilkan halaman login
router.get('/login', (req, res) => {
    res.render('login');
});

// Route untuk menampilkan halaman signup
router.get('/signup', (req, res) => {
    res.render('signin');
});

// Route untuk proses signup
router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).send('Semua field wajib diisi.');
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
        db.query(query, [username, email, hashedPassword], (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Database error.');
            }
            res.redirect('/auth/login');
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error.');
    }
});

// Route untuk proses login
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Username dan password wajib diisi!');
    }

    // Cek jika username dan password adalah "maajid"
    if (username === 'maajid' && password === 'maajid') {
        // Simpan data admin di session
        req.session.user = { username: 'maajid', isAdmin: true };
        return res.redirect('/homeadmin'); // Arahkan ke halaman admin
    }

    // Jika bukan "maajid", cari di database untuk user biasa
    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], async (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Gagal login.');
        }

        if (results.length === 0) {
            return res.status(400).send('Pengguna tidak ditemukan.');
        }

        const user = results[0];

        // Compare hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send('Password salah.');
        }

        // Simpan data user di session (bukan admin)
        req.session.user = { username: user.username, isAdmin: false };
        res.redirect('/'); // Arahkan ke halaman home user
    });
});

// Route untuk logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Gagal logout.');
        }
        res.redirect('/auth/login');
    });
});

module.exports = router;