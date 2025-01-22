const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Route untuk menampilkan daftar gaji
router.get('/', (req, res) => {
  const query = `
    SELECT gaji.*, karyawan.nama AS nama_karyawan 
    FROM gaji 
    JOIN karyawan ON gaji.id_karyawan = karyawan.id`;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data from database:', err);
      return res.status(500).send('Error fetching data');
    }

    res.render('gaji', { gaji: results });
  });
});

// Route untuk menampilkan form tambah gaji
router.get('/tambah', (req, res) => {
  const query = 'SELECT id, nama, jabatan FROM karyawan';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching employees from database:', err);
      return res.status(500).send('Error fetching employees');
    }

    res.render('tambahGaji', { karyawan: results });
  });
});

// Route untuk menyimpan data gaji baru
router.post('/tambah', (req, res) => {
  const { id_karyawan, gaji_pokok, potongan } = req.body;

  if (!id_karyawan || !gaji_pokok) {
    return res.status(400).send('ID Karyawan dan Gaji Pokok wajib diisi');
  }

  const total_gaji = parseFloat(gaji_pokok) - parseFloat(potongan || 0);
  const query = 'INSERT INTO gaji (id_karyawan, gaji_pokok, potongan, total_gaji) VALUES (?, ?, ?, ?)';

  db.query(query, [id_karyawan, gaji_pokok, potongan, total_gaji], (err, result) => {
    if (err) {
      console.error('Error inserting data into database:', err);
      return res.status(500).send('Error adding salary');
    }

    res.redirect('/gaji');
  });
});

// Route untuk menampilkan form edit gaji
router.get('/edit/:id', (req, res) => {
  const { id } = req.params;
  const queryGaji = 'SELECT * FROM gaji WHERE id_gaji = ?';
  const queryKaryawan = 'SELECT id, nama, jabatan FROM karyawan';

  db.query(queryGaji, [id], (err, gajiResults) => {
    if (err) {
      console.error('Error fetching salary data from database:', err);
      return res.status(500).send('Error fetching salary data');
    }

    if (gajiResults.length === 0) {
      return res.status(404).send('Salary record not found');
    }

    db.query(queryKaryawan, (err, karyawanResults) => {
      if (err) {
        console.error('Error fetching employees from database:', err);
        return res.status(500).send('Error fetching employees');
      }

      res.render('editGaji', { gaji: gajiResults[0], karyawan: karyawanResults });
    });
  });
});

// Route untuk menyimpan perubahan data gaji
router.post('/edit/:id', (req, res) => {
  const { id } = req.params;
  const { id_karyawan, gaji_pokok, potongan } = req.body;

  if (!id_karyawan || !gaji_pokok) {
    return res.status(400).send('ID Karyawan dan Gaji Pokok wajib diisi');
  }

  const total_gaji = parseFloat(gaji_pokok) - parseFloat(potongan || 0);
  const query = 'UPDATE gaji SET id_karyawan = ?, gaji_pokok = ?, potongan = ?, total_gaji = ? WHERE id_gaji = ?';

  db.query(query, [id_karyawan, gaji_pokok, potongan, total_gaji, id], (err, result) => {
    if (err) {
      console.error('Error updating salary data in database:', err);
      return res.status(500).send('Error updating salary data');
    }

    res.redirect('/gaji');
  });
});

// Route untuk menghapus data gaji
router.get('/hapus/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM gaji WHERE id_gaji = ?';

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting salary data from database:', err);
      return res.status(500).send('Error deleting salary data');
    }

    res.redirect('/gaji');
  });
});

module.exports = router;
