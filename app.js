// test/report.test.js
const request = require('supertest');
const express = require('express');
const db = require('../config/db'); // Sesuaikan path ke file db
const reportRouter = require('../routes/report'); // Sesuaikan path ke file report.js

// Mock database query
jest.mock('../config/db', () => ({
  query: jest.fn(),
}));

// Mock ExcelJS
jest.mock('exceljs', () => {
  return {
    Workbook: jest.fn(() => ({
      addWorksheet: jest.fn(() => ({
        columns: [],
        addRow: jest.fn(),
      })),
      xlsx: {
        writeBuffer: jest.fn().mockResolvedValue(Buffer.from('mock-excel-data')),
      },
    })),
  };
});

// Buat app Express dan gunakan router
const app = express();
app.use(express.json());
app.use('/', reportRouter);

describe('Report Routes', () => {
  beforeEach(() => {
    // Reset mock sebelum setiap test
    db.query.mockReset();
  });

  // Test untuk route GET /export
  describe('GET /export', () => {
    it('should export data to Excel', async () => {
      // Mock data dari database
      const mockData = [
        {
          id: 1,
          nama: 'John Doe',
          nomor_telepon: '123456789',
          email: 'john@example.com',
          tanggal_lahir: '1990-01-01',
          jenis_kelamin: 'Laki-laki',
          tanggal_bergabung: '2020-01-01',
          status_karyawan: 'Aktif',
          departemen: 'IT',
          tipe_kontrak: 'Permanen',
          pendidikan_terakhir: 'S1',
          jabatan: 'Software Engineer',
          gaji_pokok: 10000000,
          potongan: 500000,
          total_gaji: 9500000,
          shift: 'Pagi',
          tanggal: '2023-10-01',
        },
      ];

      // Mock query database untuk mengembalikan data
      db.query.mockImplementation((sql, callback) => {
        callback(null, mockData);
      });

      // Kirim request GET ke route /export
      const response = await request(app).get('/export');

      // Assertions
      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toBe(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      expect(response.headers['content-disposition']).toBe(
        'attachment; filename=data_karyawan.xlsx'
      );
    });

    it('should handle database error during export', async () => {
      // Mock query database untuk mengembalikan error
      db.query.mockImplementation((sql, callback) => {
        callback(new Error('Database error'), null);
      });

      // Kirim request GET ke route /export
      const response = await request(app).get('/export');

      // Assertions
      expect(response.statusCode).toBe(500);
      expect(response.text).toContain( "Terjadi kesalahan pada server"); // Pastikan pesan error ini sesuai
    });
  });
});