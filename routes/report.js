const express = require('express');
const db = require('../config/db'); // Impor koneksi database
const ExcelJS = require('exceljs');
const router = express.Router();

// Route untuk menampilkan data
router.get('/', (req, res) => {
    let sql = `
        SELECT 
            k.id, k.nama, k.nomor_telepon, k.email, k.tanggal_lahir, k.jenis_kelamin, 
            k.tanggal_bergabung, k.status_karyawan, k.departemen, k.tipe_kontrak, 
            k.pendidikan_terakhir, k.jabatan, 
            g.gaji_pokok, g.potongan, g.total_gaji, 
            j.shift, j.tanggal
        FROM karyawan k
        LEFT JOIN gaji g ON k.id = g.id_karyawan
        LEFT JOIN jadwal_kerja j ON k.id = j.id_karyawan
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error executing query:', err.stack);
            return res.status(500).send('Terjadi kesalahan pada server');
        }
        res.render('report', { data: results }); // Render file EJS dengan data
    });
});

// Route untuk export to Excel
router.get('/export', (req, res) => {
    let sql = `
        SELECT 
            k.id, k.nama, k.nomor_telepon, k.email, k.tanggal_lahir, k.jenis_kelamin, 
            k.tanggal_bergabung, k.status_karyawan, k.departemen, k.tipe_kontrak, 
            k.pendidikan_terakhir, k.jabatan, 
            g.gaji_pokok, g.potongan, g.total_gaji, 
            j.shift, j.tanggal
        FROM karyawan k
        LEFT JOIN gaji g ON k.id = g.id_karyawan
        LEFT JOIN jadwal_kerja j ON k.id = j.id_karyawan
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error executing query:', err.stack);
            return res.status(500).send('Terjadi kesalahan pada server');
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data Karyawan');

        // Menambahkan header
        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Nama', key: 'nama', width: 30 },
            { header: 'Nomor Telepon', key: 'nomor_telepon', width: 15 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Tanggal Lahir', key: 'tanggal_lahir', width: 15 },
            { header: 'Jenis Kelamin', key: 'jenis_kelamin', width: 15 },
            { header: 'Tanggal Bergabung', key: 'tanggal_bergabung', width: 15 },
            { header: 'Status Karyawan', key: 'status_karyawan', width: 15 },
            { header: 'Departemen', key: 'departemen', width: 20 },
            { header: 'Tipe Kontrak', key: 'tipe_kontrak', width: 15 },
            { header: 'Pendidikan Terakhir', key: 'pendidikan_terakhir', width: 20 },
            { header: 'Jabatan', key: 'jabatan', width: 20 },
            { header: 'Gaji Pokok', key: 'gaji_pokok', width: 15 },
            { header: 'Potongan', key: 'potongan', width: 15 },
            { header: 'Total Gaji', key: 'total_gaji', width: 15 },
            { header: 'Shift', key: 'shift', width: 15 },
            { header: 'Tanggal Shift', key: 'tanggal', width: 15 }
        ];

        // Menambahkan data
        results.forEach(row => {
            worksheet.addRow(row);
        });

        // Menyimpan file Excel ke buffer
        workbook.xlsx.writeBuffer()
            .then(buffer => {
                // Set header untuk download file
                res.setHeader(
                    'Content-Type',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                );
                res.setHeader(
                    'Content-Disposition',
                    'attachment; filename=data_karyawan.xlsx'
                );
                // Kirim file sebagai respons
                res.end(buffer);
            })
            .catch(error => {
                console.error('Error generating Excel file:', error);
                res.status(500).send('Gagal membuat file Excel');
            });
    });
});

module.exports = router;