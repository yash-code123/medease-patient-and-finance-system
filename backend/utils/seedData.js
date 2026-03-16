require('dotenv').config();
const bcrypt     = require('bcryptjs');
const sequelize  = require('../config/db');
const User       = require('../models/User');
const Patient    = require('../models/Patient');
const Doctor     = require('../models/Doctor');
const Medicine   = require('../models/Medicine');
const Bed        = require('../models/Bed');

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('DB connected ✅');
    await sequelize.sync({ force: true });  // drops & recreates tables
    console.log('Tables synced ✅');

    // ── Admin user ──
    await User.create({ username:'admin', password: await bcrypt.hash('admin123',10), role:'admin', name:'Hospital Admin', ref_id:null });
    await User.create({ username:'superadmin', password: await bcrypt.hash('super@2024',10), role:'admin', name:'Super Admin', ref_id:null });
    console.log('Admin users created ✅');

    // ── Doctors ──
    const doctors = [
      { id:'D-101', name:'Dr. Kavitha Rao',  dept:'Cardiology',   qual:'MBBS, MD, DM',    exp:15, phone:'9111222333', schedule:'Mon-Fri 9AM-1PM',    fee:500, status:'Active' },
      { id:'D-102', name:'Dr. Suresh Patel', dept:'Neurology',    qual:'MBBS, MD, DM',    exp:12, phone:'9222333444', schedule:'Mon-Wed 10AM-2PM',   fee:600, status:'Active' },
      { id:'D-103', name:'Dr. Ananya Nair',  dept:'Pediatrics',   qual:'MBBS, MD',        exp:8,  phone:'9333444555', schedule:'Tue-Sat 9AM-12PM',   fee:450, status:'Active' },
      { id:'D-104', name:'Dr. Rajan Iyer',   dept:'Orthopedics',  qual:'MBBS, MS',        exp:20, phone:'9444555666', schedule:'Mon-Fri 2PM-5PM',    fee:550, status:'Active' },
      { id:'D-105', name:'Dr. Meena Joshi',  dept:'Gynecology',   qual:'MBBS, MD, DGO',   exp:10, phone:'9555666777', schedule:'Mon-Sat 9AM-1PM',    fee:500, status:'Active' },
    ];
    for (const d of doctors) {
      await Doctor.create(d);
      const parts = d.name.replace(/^Dr\.\s*/i,'').toLowerCase().split(' ');
      const username = 'dr.' + parts[0] + (parts[1] ? '.'+parts[1] : '');
      await User.create({ username, password: await bcrypt.hash('doc123',10), role:'doctor', name:d.name, ref_id:d.id });
    }
    console.log('Doctors created ✅');

    // ── Patients ──
    const patients = [
      { id:'P-1001', fname:'Rajesh',  lname:'Kumar',    dob:'1980-05-12', gender:'Male',   blood:'B+', phone:'9876543210', email:'rajesh@email.com', allergies:'None',         emergency:'Sunita 9876543211', address:'123 MG Road, Pune' },
      { id:'P-1002', fname:'Priya',   lname:'Sharma',   dob:'1995-11-22', gender:'Female', blood:'O+', phone:'9123456780', email:'priya@email.com',  allergies:'Penicillin',   emergency:'Amit 9123456781',   address:'45 Sector 7, Nashik' },
      { id:'P-1003', fname:'Anil',    lname:'Mehta',    dob:'1965-03-30', gender:'Male',   blood:'A-', phone:'9988776655', email:'',                 allergies:'Sulpha drugs', emergency:'',                  address:'78 Patel Nagar, Mumbai' },
      { id:'P-1004', fname:'Sunita',  lname:'Patil',    dob:'1990-07-15', gender:'Female', blood:'AB+',phone:'9765432101', email:'sunita@email.com', allergies:'None',         emergency:'Raj 9765432100',    address:'22 Gandhi Nagar, Pune' },
    ];
    for (const p of patients) {
      await Patient.create({ ...p, aadhaar:'', registered: new Date().toISOString().split('T')[0] });
      await User.create({ username: p.id, password: await bcrypt.hash('patient123',10), role:'patient', name: p.fname+' '+p.lname, ref_id: p.id });
    }
    console.log('Patients created ✅');

    // ── Medicines ──
    const meds = [
      { id:'M-8001', name:'Paracetamol 500mg', category:'Analgesic',       quantity:250, min_stock:50, price:2,  expiry:'2026-12-31' },
      { id:'M-8002', name:'Amoxicillin 250mg', category:'Antibiotic',      quantity:15,  min_stock:30, price:8,  expiry:'2025-11-30' },
      { id:'M-8003', name:'Metformin 500mg',   category:'Antidiabetic',    quantity:180, min_stock:40, price:5,  expiry:'2026-06-30' },
      { id:'M-8004', name:'Amlodipine 5mg',    category:'Antihypertensive',quantity:8,   min_stock:20, price:6,  expiry:'2026-03-31' },
      { id:'M-8005', name:'Pantoprazole 40mg', category:'Antacid',         quantity:120, min_stock:30, price:7,  expiry:'2026-09-30' },
      { id:'M-8006', name:'Vitamin D3 1000IU', category:'Vitamin',         quantity:90,  min_stock:20, price:12, expiry:'2027-01-31' },
    ];
    for (const m of meds) await Medicine.create(m);
    console.log('Medicines created ✅');

    // ── Beds (30 beds) ──
    const wards = ['General Ward','ICU','Private'];
    for (let i = 1; i <= 30; i++) {
      const ward = wards[i<=10?0:i<=20?1:2];
      const id   = 'B-' + String(i).padStart(2,'0');
      const status = i%5===0?'maintenance':i%3===0?'occupied':'available';
      await Bed.create({ id, ward, status, patient_id: null });
    }
    console.log('Beds created ✅');

    console.log('\n🎉 Seed complete! You can now start the server.');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
