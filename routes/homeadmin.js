const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Route untuk halaman home admin
router.get('/', (req, res) => {
    const query = `
        SELECT karyawan.*, gaji.gaji_pokok, gaji.potongan, gaji.total_gaji, jadwal_kerja.shift, jadwal_kerja.tanggal
        FROM karyawan
        LEFT JOIN gaji ON karyawan.id = gaji.id_karyawan
        LEFT JOIN jadwal_kerja ON karyawan.id = jadwal_kerja.id_karyawan
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching data from database:', err);
            return res.status(500).send('Error fetching data');
        }

        // Render halaman 'homeadmin' dengan data karyawan
        res.render('homeadmin', { karyawan: results });
    });
});

module.exports = router;