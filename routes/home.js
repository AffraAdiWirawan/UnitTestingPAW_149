const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Route untuk halaman utama
router.get('/', (req, res) => {
  // Query untuk menggabungkan data dari 3 tabel: karyawan, gaji, dan jadwal_kerja
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

    // Render halaman 'home' dengan data karyawan, gaji, dan jadwal_kerja
    res.render('home', { karyawan: results });
  });
});

module.exports = router;
