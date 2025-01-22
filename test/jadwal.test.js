const request = require('supertest');
const express = require('express');
const sinon = require('sinon');
const chai = require('chai');
const expect = chai.expect;
const db = require('../config/db'); // pastikan path sesuai dengan struktur project Anda
const router = require('../routes/jadwal'); // path sesuai dengan file route Anda


const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/jadwal', router);

describe('Jadwal Routes', () => {
  let queryStub;

  beforeEach(() => {
    // Mock db.query dengan sinon
    queryStub = sinon.stub(db, 'query');
  });

  afterEach(() => {
    // Mengembalikan stub
    queryStub.restore();
  });

  

  it('should return 500 if error fetching jadwal kerja', async () => {
    queryStub.yields(new Error('Database error'), null);

    const res = await request(app).get('/jadwal');

    expect(res.status).to.equal(500);
    expect(res.text).to.include('Error fetching data');
  });

  it('should add new jadwal', async () => {
    // Stub untuk query INSERT
    queryStub.yields(null, { insertId: 1 });

    const res = await request(app)
      .post('/jadwal/tambah')
      .send({ id_karyawan: 1, shift: 'Pagi', tanggal: '2025-01-22' });

    expect(res.status).to.equal(302); // Expect redirect after insert
    expect(res.header.location).to.equal('/jadwal');
  });

  it('should return 400 if missing fields for adding jadwal', async () => {
    const res = await request(app)
      .post('/jadwal/tambah')
      .send({ id_karyawan: '', shift: '', tanggal: '' });

    expect(res.status).to.equal(400);
    expect(res.text).to.include('ID Karyawan, Shift, dan Tanggal wajib diisi');
  });

  it('should update jadwal', async () => {
    // Stub untuk query UPDATE
    queryStub.yields(null, { affectedRows: 1 });

    const res = await request(app)
      .post('/jadwal/edit/1')
      .send({ id_karyawan: 1, shift: 'Pagi', tanggal: '2025-01-22' });

    expect(res.status).to.equal(302); // Expect redirect after update
    expect(res.header.location).to.equal('/jadwal');
  });

  it('should delete jadwal', async () => {
    queryStub.yields(null, { affectedRows: 1 });

    const res = await request(app).get('/jadwal/hapus/1');

    expect(res.status).to.equal(302); // Expect redirect after delete
    expect(res.header.location).to.equal('/jadwal');
  });

});
