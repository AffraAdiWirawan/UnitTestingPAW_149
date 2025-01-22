const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Route untuk menampilkan daftar jadwal kerja
router.get('/', (req, res) => {
  const query = `
    SELECT jadwal_kerja.*, karyawan.nama AS nama_karyawan 
    FROM jadwal_kerja 
    JOIN karyawan ON jadwal_kerja.id_karyawan = karyawan.id`;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data from database:', err);
      return res.status(500).send('Error fetching data');
    }

    res.render('jadwal', { jadwal: results });
  });
});

// Route untuk menampilkan form tambah jadwal
router.get('/tambah', (req, res) => {
  const query = 'SELECT id, nama FROM karyawan';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching employees from database:', err);
      return res.status(500).send('Error fetching employees');
    }

    res.render('tambahjadwal', { karyawan: results });
  });
});

// Route untuk menyimpan data jadwal baru
router.post('/tambah', (req, res) => {
  const { id_karyawan, shift, tanggal } = req.body;

  if (!id_karyawan || !shift || !tanggal) {
    return res.status(400).send('ID Karyawan, Shift, dan Tanggal wajib diisi');
  }

  const query = 'INSERT INTO jadwal_kerja (id_karyawan, shift, tanggal) VALUES (?, ?, ?)';

  db.query(query, [id_karyawan, shift, tanggal], (err, result) => {
    if (err) {
      console.error('Error inserting data into database:', err);
      return res.status(500).send('Error adding schedule');
    }

    res.redirect('/jadwal');
  });
});

// Route untuk menampilkan form edit jadwal
router.get('/edit/:id', (req, res) => {
  const { id } = req.params;
  const queryJadwal = 'SELECT * FROM jadwal_kerja WHERE id_jadwal = ?';
  const queryKaryawan = 'SELECT id, nama FROM karyawan';

  db.query(queryJadwal, [id], (err, jadwalResults) => {
    if (err) {
      console.error('Error fetching schedule data from database:', err);
      return res.status(500).send('Error fetching schedule data');
    }

    if (jadwalResults.length === 0) {
      return res.status(404).send('Schedule record not found');
    }

    db.query(queryKaryawan, (err, karyawanResults) => {
      if (err) {
        console.error('Error fetching employees from database:', err);
        return res.status(500).send('Error fetching employees');
      }

      res.render('editjadwal', { jadwal: jadwalResults[0], karyawan: karyawanResults });
    });
  });
});

// Route untuk menyimpan perubahan data jadwal
router.post('/edit/:id', (req, res) => {
  const { id } = req.params;
  const { id_karyawan, shift, tanggal } = req.body;

  if (!id_karyawan || !shift || !tanggal) {
    return res.status(400).send('ID Karyawan, Shift, dan Tanggal wajib diisi');
  }

  const query = 'UPDATE jadwal_kerja SET id_karyawan = ?, shift = ?, tanggal = ? WHERE id_jadwal = ?';

  db.query(query, [id_karyawan, shift, tanggal, id], (err, result) => {
    if (err) {
      console.error('Error updating schedule data in database:', err);
      return res.status(500).send('Error updating schedule data');
    }

    res.redirect('/jadwal');
  });
});

// Route untuk menghapus data jadwal
router.get('/hapus/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM jadwal_kerja WHERE id_jadwal = ?';

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting schedule data from database:', err);
      return res.status(500).send('Error deleting schedule data');
    }

    res.redirect('/jadwal');
  });
});

module.exports = router;
