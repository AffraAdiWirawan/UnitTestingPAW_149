const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');

// Konfigurasi multer untuk menangani upload foto
const storage = multer.memoryStorage(); // Menyimpan foto dalam memory
const upload = multer({ storage: storage });

// Route untuk menampilkan daftar karyawan dalam bentuk card
router.get('/', (req, res) => {
  const query = 'SELECT * FROM karyawan';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data from database:', err);
      return res.status(500).send('Error fetching data');
    }

    res.render('todo', { karyawan: results });
  });
});



// Route untuk menampilkan form tambah karyawan
router.get('/tambah', (req, res) => {
  res.render('tambah');
});

// Route untuk menyimpan karyawan baru (dengan menangani file foto)
router.post('/tambah', upload.single('foto'), (req, res) => {
  const {
    nama,
    nomor_telepon,
    email,
    tanggal_lahir,
    jenis_kelamin,
    tanggal_bergabung,
    status_karyawan,
    departemen,
    tipe_kontrak,
    pendidikan_terakhir,
    catatan_tambahan,
    jabatan,
  } = req.body;
  const foto = req.file ? req.file.buffer : null; // Jika ada file, simpan buffer-nya

  // Validasi input
  if (!nama || !email || !jabatan || !tanggal_bergabung) {
    return res.status(400).send('Nama, Jabatan, dan Tanggal Bergabung wajib diisi');
  }

  const query = `
    INSERT INTO karyawan 
    (nama, nomor_telepon, email, tanggal_lahir, jenis_kelamin, tanggal_bergabung, status_karyawan, departemen, tipe_kontrak, pendidikan_terakhir, catatan_tambahan, jabatan, foto) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [
      nama,
      nomor_telepon,
      email,
      tanggal_lahir,
      jenis_kelamin,
      tanggal_bergabung,
      status_karyawan || 'Aktif',
      departemen,
      tipe_kontrak || 'Tetap',
      pendidikan_terakhir,
      catatan_tambahan,
      jabatan,
      foto,
    ],
    (err, result) => {
      if (err) {
        console.error('Error inserting data into database:', err);
        return res.status(500).send('Error adding employee');
      }

      res.redirect('/todo'); // Redirect ke halaman daftar karyawan
    }
  );
});




// Route untuk mengedit data karyawan
router.get('/edit/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM karyawan WHERE id = ?';

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error fetching data from database:', err);
      return res.status(500).send('Error fetching employee');
    }

    if (results.length === 0) {
      return res.status(404).send('Employee not found');
    }

    res.render('edit', { karyawan: results[0] });
  });
});





// Route untuk menyimpan perubahan karyawan setelah edit
router.post('/edit/:id', upload.single('foto'), (req, res) => {
  const { id } = req.params;
  const {
    nama,
    nomor_telepon,
    email,
    tanggal_lahir,
    jenis_kelamin,
    tanggal_bergabung,
    status_karyawan,
    departemen,
    tipe_kontrak,
    pendidikan_terakhir,
    catatan_tambahan,
    jabatan,
  } = req.body;
  const foto = req.file ? req.file.buffer : null;

  // Validasi input
  if (!nama || !email || !jabatan || !tanggal_bergabung) {
    return res.status(400).send('Nama, Jabatan, dan Tanggal Bergabung wajib diisi');
  }

  const query = `
    UPDATE karyawan 
    SET nama = ?, nomor_telepon = ?, email = ?, tanggal_lahir = ?, jenis_kelamin = ?, tanggal_bergabung = ?, status_karyawan = ?, departemen = ?, tipe_kontrak = ?, pendidikan_terakhir = ?, catatan_tambahan = ?, jabatan = ?, foto = ? 
    WHERE id = ?
  `;

  db.query(
    query,
    [
      nama,
      nomor_telepon,
      email,
      tanggal_lahir,
      jenis_kelamin,
      tanggal_bergabung,
      status_karyawan || 'Aktif',
      departemen,
      tipe_kontrak || 'Tetap',
      pendidikan_terakhir,
      catatan_tambahan,
      jabatan,
      foto,
      id,
    ],
    (err, result) => {
      if (err) {
        console.error('Error updating data in database:', err);
        return res.status(500).send('Error updating employee');
      }

      res.redirect('/todo'); // Redirect ke halaman todo
    }
  );
});

// Route untuk menghapus karyawan
router.get('/hapus/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM karyawan WHERE id = ?';

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting data from database:', err);
      return res.status(500).send('Error deleting employee');
    }

    res.redirect('/todo'); // Redirect ke halaman todo
  });
});

module.exports = router;
