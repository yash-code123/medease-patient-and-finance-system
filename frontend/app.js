/* ═══════════════════════════════════════════
   MedEase Hospital Management System
   Main JavaScript Application
═══════════════════════════════════════════ */

/* ═══════════════════════════════════════════════
   API CONFIGURATION
═══════════════════════════════════════════════ */
const API_BASE = 'https://medease-backend.onrender.com/api';
let _authToken = null;

async function apiCall(endpoint, method='GET', body=null){
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if(_authToken) opts.headers['Authorization'] = 'Bearer ' + _authToken;
  if(body) opts.body = JSON.stringify(body);
  const res = await fetch(API_BASE + endpoint, opts);
  const data = await res.json();
  if(!res.ok) throw new Error(data.message || 'API error');
  return data;
}

/* ═══════════════════════════════════════════════
   DATA STORE
═══════════════════════════════════════════════ */
const db = {
  patients:[], doctors:[], appointments:[], tokens:[], bills:[],
  prescriptions:[], labOrders:[], medicines:[], beds:[], messages:{},
  notifications:[],
  pidCounter:1000, didCounter:100, aidCounter:200, tidCounter:1,
  bidCounter:3000, ridCounter:5000, labCounter:7000, medCounter:8000,
};

const DEPARTMENTS=[
  {name:'Cardiology',icon:'🫀'},{name:'Neurology',icon:'🧠'},{name:'Orthopedics',icon:'🦴'},
  {name:'Pediatrics',icon:'👶'},{name:'Gynecology',icon:'🌸'},{name:'Dermatology',icon:'🩺'},
  {name:'ENT',icon:'👂'},{name:'Ophthalmology',icon:'👁️'},{name:'General Medicine',icon:'🏥'},
  {name:'Psychiatry',icon:'🧘'},{name:'Gastroenterology',icon:'🫄'},{name:'Urology',icon:'💊'},
];

const SERVICE_RATES={'Consultation':500,'OPD Registration':100,'ECG':300,'X-Ray':600,'Blood Test':400,'Urine Test':200,'Dressing':250,'Injection':150,'Physiotherapy':700,'Other':200};

const ROLE_ACCESS={
  admin:['dashboard','analytics','registration','departments','appointments','queue','chat','prescription','lab','pharmacy','billing','beds','patients'],
  doctor:['dashboard','consult','chat','lab','patients'],
  patient:['dashboard','appointments','chat','myrecords','chatbot'],
};

const ROLE_META={
  admin:{label:'Admin',icon:'🏥',greeting:'Good Morning, Admin'},
  doctor:{label:'Doctor',icon:'👨‍⚕️',greeting:'Good Morning, Doctor'},
  patient:{label:'Patient Portal',icon:'🧑‍⚕️',greeting:'Welcome'},
};

const HINTS={
  admin:'<strong>admin</strong> / admin123 &nbsp;|&nbsp; <strong>superadmin</strong> / super@2024',
  doctor:'<strong>dr.kavitha, dr.suresh, dr.ananya, dr.rajan, dr.meena</strong> / doc123',
  patient:'<strong>P-ID as username</strong> (P-1001, P-1002, P-1003) / patient123',
};

const USERS={
  admin:[{username:'admin',password:'admin123',name:'Hospital Admin',role:'admin'},{username:'superadmin',password:'super@2024',name:'Super Admin',role:'admin'}],
  doctor:[
    {username:'dr.kavitha',password:'doc123',name:'Dr. Kavitha Rao',role:'doctor',dept:'Cardiology'},
    {username:'dr.suresh',password:'doc123',name:'Dr. Suresh Patel',role:'doctor',dept:'Neurology'},
    {username:'dr.ananya',password:'doc123',name:'Dr. Ananya Nair',role:'doctor',dept:'Pediatrics'},
    {username:'dr.rajan',password:'doc123',name:'Dr. Rajan Iyer',role:'doctor',dept:'Orthopedics'},
    {username:'dr.meena',password:'doc123',name:'Dr. Meena Joshi',role:'doctor',dept:'Gynecology'},
  ],
  patient:[
    {username:'P-1001',password:'patient123',name:'Rajesh Kumar',role:'patient',patientId:'P-1001'},
    {username:'P-1002',password:'patient123',name:'Priya Sharma',role:'patient',patientId:'P-1002'},
    {username:'P-1003',password:'patient123',name:'Anil Mehta',role:'patient',patientId:'P-1003'},
  ],
};

let currentRole=null, currentUser=null, activeBedId=null, activeLabId=null, activeChatContact=null;
let charts={};

/* ═══════════════════════════════════════════════
   SEED DATA
═══════════════════════════════════════════════ */
function seedData(){
  const pts=[
    {fname:'Rajesh',lname:'Kumar',dob:'1980-05-12',gender:'Male',blood:'B+',phone:'9876543210',email:'rajesh@email.com',aadhaar:'',address:'123 MG Road, Pune',allergies:'None',emergency:'Sunita 9876543211'},
    {fname:'Priya',lname:'Sharma',dob:'1995-11-22',gender:'Female',blood:'O+',phone:'9123456780',email:'priya@email.com',aadhaar:'',address:'45 Sector 7, Nashik',allergies:'Penicillin',emergency:'Amit 9123456781'},
    {fname:'Anil',lname:'Mehta',dob:'1965-03-30',gender:'Male',blood:'A-',phone:'9988776655',email:'',aadhaar:'',address:'78 Patel Nagar, Mumbai',allergies:'Sulpha drugs',emergency:'Rekha 9988776600'},
    {fname:'Sunita',lname:'Patil',dob:'1990-07-15',gender:'Female',blood:'AB+',phone:'9765432101',email:'sunita@email.com',aadhaar:'',address:'22 Gandhi Nagar, Pune',allergies:'None',emergency:'Raj 9765432100'},
  ];
  pts.forEach(p=>{p.id='P-'+(++db.pidCounter);p.registered=new Date().toLocaleDateString('en-IN');db.patients.push(p);});

  const docs=[
    {name:'Dr. Kavitha Rao',dept:'Cardiology',qual:'MBBS, MD, DM',exp:15,phone:'9111222333',schedule:'Mon-Fri 9AM-1PM',status:'Active'},
    {name:'Dr. Suresh Patel',dept:'Neurology',qual:'MBBS, MD, DM',exp:12,phone:'9222333444',schedule:'Mon-Wed 10AM-2PM',status:'Active'},
    {name:'Dr. Ananya Nair',dept:'Pediatrics',qual:'MBBS, MD',exp:8,phone:'9333444555',schedule:'Tue-Sat 9AM-12PM',status:'Active'},
    {name:'Dr. Rajan Iyer',dept:'Orthopedics',qual:'MBBS, MS',exp:20,phone:'9444555666',schedule:'Mon-Fri 2PM-5PM',status:'Active'},
    {name:'Dr. Meena Joshi',dept:'Gynecology',qual:'MBBS, MD, DGO',exp:10,phone:'9555666777',schedule:'Mon-Sat 9AM-1PM',status:'Active'},
  ];
  docs.forEach(d=>{d.id='D-'+(++db.didCounter);db.doctors.push(d);});

  // Seed beds (30 beds across 3 wards)
  const wards=['General Ward','ICU','Private'];
  for(let i=1;i<=30;i++){
    const ward=wards[i<=10?0:i<=20?1:2];
    db.beds.push({id:'B-'+String(i).padStart(2,'0'),ward,status:i%5===0?'maintenance':i%3===0?'occupied':'available',patientId:i%3===0&&db.patients[i%db.patients.length]?db.patients[i%db.patients.length].id:null});
  }

  // Seed medicines
  const meds=[
    {name:'Paracetamol 500mg',cat:'Analgesic',qty:250,min:50,price:2,expiry:'2026-12-31'},
    {name:'Amoxicillin 250mg',cat:'Antibiotic',qty:15,min:30,price:8,expiry:'2025-11-30'},
    {name:'Metformin 500mg',cat:'Antidiabetic',qty:180,min:40,price:5,expiry:'2026-06-30'},
    {name:'Amlodipine 5mg',cat:'Antihypertensive',qty:8,min:20,price:6,expiry:'2026-03-31'},
    {name:'Pantoprazole 40mg',cat:'Antacid',qty:120,min:30,price:7,expiry:'2026-09-30'},
    {name:'Vitamin D3 1000IU',cat:'Vitamin',qty:90,min:20,price:12,expiry:'2027-01-31'},
  ];
  meds.forEach(m=>{m.id='M-'+(++db.medCounter);db.medicines.push(m);});

  // Seed chat messages
  db.messages['dr.kavitha-P-1001']=[
    {from:'dr.kavitha',text:'Hello Rajesh, how are you feeling today?',time:'09:15 AM'},
    {from:'P-1001',text:'Feeling better, Doctor. The medicine is working.',time:'09:20 AM'},
    {from:'dr.kavitha',text:'Great! Please continue the medication for 5 more days.',time:'09:22 AM'},
  ];
  db.messages['dr.ananya-P-1002']=[
    {from:'P-1002',text:'Doctor, my daughter has fever since yesterday.',time:'10:00 AM'},
    {from:'dr.ananya',text:'Please bring her in immediately. I have a slot at 11 AM.',time:'10:05 AM'},
  ];

  // Seed notifications
  addNotif('🎫','New token T-001 issued for Rajesh Kumar','just now');
  addNotif('📅','Appointment booked with Dr. Kavitha Rao','5 min ago');
  addNotif('💊','Amoxicillin stock is below minimum threshold','10 min ago');
  addNotif('🧪','Lab result ready for Patient P-1002','15 min ago');

  // Seed extra demo patients (so queue is rich)
  const extraPts=[
    {fname:'Mohan',lname:'Desai',dob:'1955-02-14',gender:'Male',blood:'A+',phone:'9812345670',email:'',aadhaar:'',address:'12 Shivaji Nagar, Pune',allergies:'None',emergency:''},
    {fname:'Kavya',lname:'Iyer',dob:'2018-09-05',gender:'Female',blood:'B+',phone:'9900112233',email:'',aadhaar:'',address:'56 Kalyani Nagar, Pune',allergies:'None',emergency:'Ravi 9900112234'},
    {fname:'Suresh',lname:'Naik',dob:'1978-11-20',gender:'Male',blood:'O-',phone:'9876001122',email:'',aadhaar:'',address:'88 Deccan, Pune',allergies:'Aspirin',emergency:''},
    {fname:'Deepa',lname:'Kulkarni',dob:'1988-04-30',gender:'Female',blood:'AB-',phone:'9123009988',email:'deepa@email.com',aadhaar:'',address:'34 Kothrud, Pune',allergies:'None',emergency:''},
    {fname:'Arjun',lname:'Bhat',dob:'1992-07-18',gender:'Male',blood:'B-',phone:'9988123456',email:'',aadhaar:'',address:'21 Wakad, Pune',allergies:'None',emergency:''},
    {fname:'Lata',lname:'Shinde',dob:'1960-12-01',gender:'Female',blood:'A+',phone:'9876543999',email:'',aadhaar:'',address:'77 Pimpri, Pune',allergies:'Sulpha drugs',emergency:''},
    {fname:'Rahul',lname:'Pawar',dob:'2000-03-25',gender:'Male',blood:'O+',phone:'9090909090',email:'rahul@email.com',aadhaar:'',address:'11 Hadapsar, Pune',allergies:'None',emergency:''},
    {fname:'Nisha',lname:'Jadhav',dob:'1975-08-08',gender:'Female',blood:'B+',phone:'9871234560',email:'',aadhaar:'',address:'55 Vishrantwadi, Pune',allergies:'None',emergency:''},
  ];
  extraPts.forEach(p=>{p.id='P-'+(++db.pidCounter);p.registered=new Date().toLocaleDateString('en-IN');db.patients.push(p);});

  const today=new Date().toISOString().split('T')[0];
  const todayStr=new Date().toLocaleDateString('en-IN');

  // ── Helper to make an appointment + token in one shot ──
  function seedApptToken(patId,patName,phone,docId,docName,dept,time,type,notes,priority,tokenStatus,apptStatus){
    const apptId='A-'+(++db.aidCounter);
    db.appointments.push({id:apptId,patientId:patId,patientName:patName,doctorId:docId,doctorName:docName,dept,date:today,time,type,notes,phone,status:apptStatus,fee:600,payMode:'UPI',txnId:'TXN'+Math.floor(Math.random()*1e10),payStatus:'Paid'});
    db.bills.push({id:'B-'+(++db.bidCounter),patientId:patId,patientName:patName,date:todayStr,amount:600,mode:'UPI',status:'Paid',txnId:'TXN'+Math.floor(Math.random()*1e10),apptId,note:'Appointment Fee'});
    const tokNum=String(db.tidCounter++).padStart(3,'0');
    db.tokens.push({id:'T-'+tokNum,patientId:patId,patientName:patName,dept,doctorName:docName,priority,status:tokenStatus,apptId,time});
  }

  // ── CARDIOLOGY — Dr. Kavitha Rao (D-101) ──
  seedApptToken('P-1001','Rajesh Kumar','9876543210','D-101','Dr. Kavitha Rao','Cardiology','09:00 AM','New Visit','Chest pain and breathlessness since 2 days','Normal','In Progress','Confirmed');
  seedApptToken('P-1005','Mohan Desai','9812345670','D-101','Dr. Kavitha Rao','Cardiology','09:30 AM','New Visit','Palpitations and dizziness','Normal','Waiting','Confirmed');
  seedApptToken('P-1008','Nisha Jadhav','9871234560','D-101','Dr. Kavitha Rao','Cardiology','10:00 AM','Follow-Up','Follow-up for hypertension medication','Normal','Waiting','Confirmed');
  seedApptToken('P-1004','Sunita Patil','9765432101','D-101','Dr. Kavitha Rao','Cardiology','10:30 AM','Emergency','Sudden severe chest pain','Emergency','Waiting','Confirmed');

  // ── NEUROLOGY — Dr. Suresh Patel (D-102) ──
  seedApptToken('P-1007','Rahul Pawar','9090909090','D-102','Dr. Suresh Patel','Neurology','10:00 AM','New Visit','Recurring migraines for 3 months','Normal','In Progress','Confirmed');
  seedApptToken('P-1003','Anil Mehta','9988776655','D-102','Dr. Suresh Patel','Neurology','10:30 AM','Follow-Up','Follow-up post MRI scan','Normal','Waiting','Confirmed');
  seedApptToken('P-1006','Deepa Kulkarni','9123009988','D-102','Dr. Suresh Patel','Neurology','11:00 AM','New Visit','Numbness in left hand','Normal','Waiting','Confirmed');

  // ── PEDIATRICS — Dr. Ananya Nair (D-103) ──
  seedApptToken('P-1002','Priya Sharma','9123456780','D-103','Dr. Ananya Nair','Pediatrics','09:00 AM','New Visit','Child fever 102°F since yesterday','Emergency','In Progress','Confirmed');
  seedApptToken('P-1006','Kavya Iyer','9900112233','D-103','Dr. Ananya Nair','Pediatrics','09:30 AM','New Visit','Cough and cold, 5yr old','Normal','Waiting','Confirmed');

  // ── ORTHOPEDICS — Dr. Rajan Iyer (D-104) ──
  seedApptToken('P-1003','Anil Mehta','9988776655','D-104','Dr. Rajan Iyer','Orthopedics','02:00 PM','New Visit','Right knee pain and swelling','Normal','Waiting','Confirmed');
  seedApptToken('P-1005','Mohan Desai','9812345670','D-104','Dr. Rajan Iyer','Orthopedics','02:30 PM','Follow-Up','Post knee surgery review','Normal','Waiting','Confirmed');
  seedApptToken('P-1007','Arjun Bhat','9988123456','D-104','Dr. Rajan Iyer','Orthopedics','03:00 PM','New Visit','Lower back pain radiating to leg','Senior Citizen','Waiting','Confirmed');

  // ── GYNECOLOGY — Dr. Meena Joshi (D-105) ──
  seedApptToken('P-1002','Priya Sharma','9123456780','D-105','Dr. Meena Joshi','Gynecology','11:00 AM','New Visit','Irregular menstrual cycle','Normal','Waiting','Confirmed');
  seedApptToken('P-1004','Sunita Patil','9765432101','D-105','Dr. Meena Joshi','Gynecology','11:30 AM','Follow-Up','Routine check-up','Normal','Waiting','Confirmed');
  seedApptToken('P-1008','Lata Shinde','9876543999','D-105','Dr. Meena Joshi','Gynecology','12:00 PM','New Visit','Abdominal pain and bloating','Normal','Waiting','Confirmed');

  // Seed past prescriptions for history richness
  db.prescriptions.push({id:'Rx-5001',patientId:'P-1001',patientName:'Rajesh Kumar',doctorId:'D-101',doctorName:'Dr. Kavitha Rao',diagnosis:'Hypertension Grade I',complaints:'Headache, dizziness',advice:'Low salt diet, avoid stress',date:todayStr,nextVisit:'',medicines:[{name:'Amlodipine 5mg',dose:'1 tab',freq:'OD',dur:'30 days'},{name:'Telmisartan 40mg',dose:'1 tab',freq:'OD',dur:'30 days'}],vitals:{bp:'150/95',pulse:'88',temp:'98.4',spo2:'97',weight:'82',height:'172',bmi:'27.7',rbs:''}});
  db.prescriptions.push({id:'Rx-5002',patientId:'P-1002',patientName:'Priya Sharma',doctorId:'D-103',doctorName:'Dr. Ananya Nair',diagnosis:'Upper Respiratory Tract Infection',complaints:'Fever, cough, cold',advice:'Rest, plenty of fluids',date:todayStr,nextVisit:'',medicines:[{name:'Paracetamol 500mg',dose:'1 tab',freq:'TDS',dur:'5 days'},{name:'Cetirizine 10mg',dose:'1 tab',freq:'OD',dur:'5 days'}],vitals:{bp:'',pulse:'96',temp:'102',spo2:'98',weight:'58',height:'163',bmi:'21.8',rbs:''}});

  // Seed lab orders
  db.labOrders.push({id:'L-7001',patientId:'P-1001',patientName:'Rajesh Kumar',test:'Complete Blood Count (CBC)',doctorName:'Dr. Kavitha Rao',priority:'Normal',status:'Done',result:'WBC: 6.5K, RBC: 4.8M, HGB: 14.2g/dL — Normal',date:todayStr});
  db.labOrders.push({id:'L-7002',patientId:'P-1002',patientName:'Priya Sharma',test:'Blood Sugar (Fasting)',doctorName:'Dr. Ananya Nair',priority:'Urgent',status:'Processing',result:'',date:todayStr});
  db.labOrders.push({id:'L-7003',patientId:'P-1003',patientName:'Anil Mehta',test:'X-Ray Chest',doctorName:'Dr. Suresh Patel',priority:'Normal',status:'New',result:'',date:todayStr});

  refreshAll();
}

/* ═══════════════════════════════════════════════
   CLOCK & DATE
═══════════════════════════════════════════════ */
function updateClock(){document.getElementById('clockDisplay').textContent=new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});}
setInterval(updateClock,1000); updateClock();
document.getElementById('todayDate').textContent=new Date().toLocaleDateString('en-IN',{weekday:'long',year:'numeric',month:'long',day:'numeric'});

/* ═══════════════════════════════════════════════
   TOAST
═══════════════════════════════════════════════ */
function toast(msg,type='success'){
  const t=document.getElementById('toast');
  t.textContent=msg; t.className='show '+(type||'');
  setTimeout(()=>t.className='',3200);
}

/* ═══════════════════════════════════════════════
   MODAL
═══════════════════════════════════════════════ */
function openModal(id){
  document.getElementById(id).classList.add('open');
  // Populate dept dropdown when opening doctor modal
  if(id==='addDoctorModal'){
    const sel=document.getElementById('doc-dept');
    const val=sel.value;
    sel.innerHTML='<option value="">Select Department</option>';
    DEPARTMENTS.forEach(d=>sel.innerHTML+=`<option value="${d.name}">${d.icon} ${d.name}</option>`);
    if(val)sel.value=val;
  }
}
function closeModal(id){
  document.getElementById(id).classList.remove('open');
  // Reset doctor modal back to form step
  if(id==='addDoctorModal'){
    document.getElementById('docFormStep').style.display    = 'block';
    document.getElementById('docSuccessStep').style.display = 'none';
    document.getElementById('docFormError').style.display  = 'none';
  }
}

/* ═══════════════════════════════════════════════
   NOTIFICATIONS
═══════════════════════════════════════════════ */
function addNotif(icon,msg,time){
  db.notifications.unshift({icon,msg,time,read:false});
  updateNotifPanel();
  document.getElementById('notifDot').classList.add('show');
}
function updateNotifPanel(){
  const list=document.getElementById('notifList');
  if(!db.notifications.length){list.innerHTML='<div style="padding:20px;text-align:center;color:var(--muted);font-size:.85rem">No notifications</div>';return;}
  list.innerHTML=db.notifications.slice(0,10).map(n=>`
    <div class="notif-item ${n.read?'':'unread'}">
      <div class="notif-icon">${n.icon}</div>
      <div><div class="notif-msg">${n.msg}</div><div class="notif-time">${n.time}</div></div>
    </div>`).join('');
}
function toggleNotifPanel(){
  const p=document.getElementById('notifPanel');
  p.classList.toggle('open');
  if(p.classList.contains('open')){db.notifications.forEach(n=>n.read=true);document.getElementById('notifDot').classList.remove('show');updateNotifPanel();}
}
function clearNotifs(){db.notifications=[];updateNotifPanel();}
document.addEventListener('click',e=>{const p=document.getElementById('notifPanel');const bell=document.querySelector('.notif-bell');if(p.classList.contains('open')&&!p.contains(e.target)&&!bell.contains(e.target))p.classList.remove('open');});

/* ═══════════════════════════════════════════════
   NAVIGATION
═══════════════════════════════════════════════ */
document.querySelectorAll('.nav-item').forEach(item=>{
  item.addEventListener('click',()=>{
    document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
    document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
    item.classList.add('active');
    const sec=item.dataset.section;
    document.getElementById(sec).classList.add('active');
    if(sec==='dashboard')updateDashboard();
    if(sec==='analytics')renderCharts();
    if(sec==='chat')renderChatContacts();
    if(document.getElementById('sidebar').classList.contains('open'))toggleSidebar();
  });
});

function toggleSidebar(){document.getElementById('sidebar').classList.toggle('open');}

/* ═══════════════════════════════════════════════
   GLOBAL SEARCH
═══════════════════════════════════════════════ */
function globalSearch(q){
  const box=document.getElementById('globalResults');
  if(!q||q.length<2){box.style.display='none';return;}
  const results=[];
  db.patients.forEach(p=>{if((p.fname+' '+p.lname+p.id+p.phone).toLowerCase().includes(q.toLowerCase()))results.push({type:'Patient',label:`${p.fname} ${p.lname}`,sub:p.id,section:'patients'});});
  db.doctors.forEach(d=>{if((d.name+d.dept).toLowerCase().includes(q.toLowerCase()))results.push({type:'Doctor',label:d.name,sub:d.dept,section:'departments'});});
  db.appointments.forEach(a=>{if((a.patientName+a.doctorName+a.id).toLowerCase().includes(q.toLowerCase()))results.push({type:'Appointment',label:a.patientName,sub:a.id+' · '+a.status,section:'appointments'});});
  db.bills.forEach(b=>{if((b.patientName+b.id).toLowerCase().includes(q.toLowerCase()))results.push({type:'Bill',label:b.patientName,sub:b.id+' · ₹'+b.amount,section:'billing'});});
  if(!results.length){box.innerHTML='<div class="gr-item" style="color:var(--muted)">No results found</div>';box.style.display='block';return;}
  box.innerHTML=results.slice(0,8).map(r=>`<div class="gr-item" onclick="gotoSection('${r.section}')"><strong>${r.label}</strong><span class="gr-tag">${r.type}</span><div style="font-size:.76rem;color:var(--muted)">${r.sub}</div></div>`).join('');
  box.style.display='block';
}
function gotoSection(sec){
  if(sec==='chatbot' && document.getElementById('cbMessages')?.children.length===0) setTimeout(cbInit,100);
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
  document.querySelector(`.nav-item[data-section="${sec}"]`)?.classList.add('active');
  document.getElementById(sec)?.classList.add('active');
  document.getElementById('globalResults').style.display='none';
}

/* ═══════════════════════════════════════════════
   PATIENT REGISTRATION
═══════════════════════════════════════════════ */
function registerPatient(e){
  e.preventDefault();
  const p={
    id:'P-'+(++db.pidCounter),
    fname:document.getElementById('reg-fname').value.trim(),
    lname:document.getElementById('reg-lname').value.trim(),
    dob:document.getElementById('reg-dob').value,
    gender:document.getElementById('reg-gender').value,
    blood:document.getElementById('reg-blood').value,
    phone:document.getElementById('reg-phone').value,
    email:document.getElementById('reg-email').value,
    aadhaar:document.getElementById('reg-aadhaar').value,
    address:document.getElementById('reg-address').value,
    allergies:document.getElementById('reg-allergies').value,
    emergency:document.getElementById('reg-emergency').value,
    registered:new Date().toLocaleDateString('en-IN'),
  };
  db.patients.push(p);
  document.getElementById('regForm').reset();
  addNotif('📋',`New patient ${p.fname} ${p.lname} registered (${p.id})`,'just now');
  refreshAll();
  toast(`✅ Patient ${p.fname} ${p.lname} registered! ID: ${p.id}`);
}

function calcAge(dob){if(!dob)return'—';return Math.floor((Date.now()-new Date(dob))/(365.25*24*3600*1000))+'y';}

/* ═══════════════════════════════════════════════
   DEPARTMENTS & DOCTORS
═══════════════════════════════════════════════ */
function renderDepts(){
  const g=document.getElementById('deptGrid'); if(!g)return;
  g.innerHTML='';
  DEPARTMENTS.forEach(d=>{
    const count=db.doctors.filter(doc=>doc.dept===d.name).length;
    const appts=db.appointments.filter(a=>a.dept===d.name).length;
    g.innerHTML+=`<div style="background:var(--surface);border-radius:12px;padding:18px;text-align:center;border:2px solid var(--border);cursor:pointer;transition:all .2s" onmouseover="this.style.borderColor='var(--accent)';this.style.transform='translateY(-3px)'" onmouseout="this.style.borderColor='var(--border)';this.style.transform=''">
      <div style="font-size:2rem;margin-bottom:8px">${d.icon}</div>
      <div style="font-weight:600;color:var(--primary);font-size:.9rem">${d.name}</div>
      <div style="font-size:.76rem;color:var(--muted);margin-top:4px">${count} Doctor${count!==1?'s':''} · ${appts} Appts</div>
    </div>`;
  });
}

function renderDoctors(){
  const t=document.getElementById('doctorsTbody'); if(!t)return;
  if(!db.doctors.length){t.innerHTML='<tr><td colspan="7" style="color:var(--muted);text-align:center;padding:18px">No doctors added yet</td></tr>';return;}
  t.innerHTML=db.doctors.map(d=>{
    const user=USERS.doctor.find(u=>u.name===d.name);
    const statusColor=d.status==='Active'?'badge-green':d.status==='On Leave'?'badge-warn':'badge-red';
    return `<tr>
      <td><code style="font-size:.74rem">${d.id}</code></td>
      <td><strong>${d.name}</strong>${d.about?`<div style="font-size:.72rem;color:var(--muted);margin-top:2px">${d.about.substring(0,40)}…</div>`:''}  </td>
      <td>${d.dept}</td>
      <td>${d.qual}</td>
      <td>${d.schedule||'—'}</td>
      <td><span class="badge ${statusColor}">${d.status}</span></td>
      <td style="display:flex;gap:4px;flex-wrap:wrap">
        ${user?`<button class="btn btn-outline btn-sm" title="View credentials" onclick="viewDoctorCreds('${d.id}')">🔑</button>`:''}
        <button class="btn btn-sm" style="background:#fde8e8;color:#a33;border:none" title="Remove doctor" onclick="removeDoctor('${d.id}')">🗑️</button>
      </td>
    </tr>`;
  }).join('');
}

function viewDoctorCreds(id){
  const doc=db.doctors.find(d=>d.id===id); if(!doc)return;
  const user=USERS.doctor.find(u=>u.name===doc.name);
  if(!user){toast('No login credentials found for this doctor','error');return;}
  // Open modal and go straight to credentials view
  openModal('addDoctorModal');
  document.getElementById('docFormStep').style.display    = 'none';
  document.getElementById('docSuccessStep').style.display = 'block';
  document.getElementById('cred-username').textContent    = user.username;
  document.getElementById('cred-password').textContent    = user.password;
  document.getElementById('cred-summary').innerHTML       = `
    <strong>👤 ${doc.name}</strong><br/>
    🏥 ${doc.dept} &nbsp;|&nbsp; 🎓 ${doc.qual}<br/>
    📞 ${doc.phone} &nbsp;|&nbsp; 🆔 ${doc.id}<br/>
    📅 ${doc.schedule||'—'}
  `;
}

function removeDoctor(id){
  const doc=db.doctors.find(d=>d.id===id); if(!doc)return;
  if(!confirm(`Remove ${doc.name} from the system?`))return;
  db.doctors=db.doctors.filter(d=>d.id!==id);
  USERS.doctor=USERS.doctor.filter(u=>u.name!==doc.name);
  refreshAll();
  toast(`${doc.name} removed`,'error');
}

function addDoctor(){
  const name    = document.getElementById('doc-name').value.trim();
  const dept    = document.getElementById('doc-dept').value;
  const qual    = document.getElementById('doc-qual').value.trim();
  const phone   = document.getElementById('doc-phone').value.trim();
  const email   = document.getElementById('doc-email').value.trim();
  const exp     = document.getElementById('doc-exp').value;
  const schedule= document.getElementById('doc-schedule').value.trim();
  const fee     = document.getElementById('doc-fee').value;
  const about   = document.getElementById('doc-about').value.trim();
  const status  = document.getElementById('doc-status').value;
  const errEl   = document.getElementById('docFormError');

  // Validation
  if(!name){ errEl.textContent='❌ Doctor name is required.'; errEl.style.display='block'; return; }
  if(!name.toLowerCase().startsWith('dr.')){ errEl.textContent='❌ Name must start with "Dr." (e.g. Dr. Priya Sharma)'; errEl.style.display='block'; return; }
  if(!dept){ errEl.textContent='❌ Please select a department.'; errEl.style.display='block'; return; }
  if(!qual){ errEl.textContent='❌ Qualification is required.'; errEl.style.display='block'; return; }
  if(!phone||phone.length<10||!/^\d+$/.test(phone)){ errEl.textContent='❌ Enter a valid 10-digit phone number.'; errEl.style.display='block'; return; }
  errEl.style.display='none';

  // Use custom password or auto-generate
  const customPass = document.getElementById('doc-password')?.value.trim();
  const password   = customPass || 'doc@'+phone.slice(-4);

  // Generate doctor ID and login credentials
  const docId    = 'D-'+(++db.didCounter);
  const nameParts= name.replace(/^Dr\.\s*/i,'').toLowerCase().split(' ');
  const username = 'dr.'+(nameParts[0]||'doctor')+(nameParts[1]?'.'+nameParts[1]:'');

  // Make username unique if already exists
  let finalUsername = username;
  let suffix = 1;
  while(USERS.doctor.find(u=>u.username===finalUsername)){
    finalUsername = username + suffix; suffix++;
  }

  // Add to doctor db
  const doc = { id:docId, name, dept, qual, exp, phone, email, schedule:schedule||'Mon-Fri 9AM-5PM', fee:fee||'500', about, status };
  db.doctors.push(doc);

  // Register in USERS so doctor can login
  USERS.doctor.push({ username:finalUsername, password, name, role:'doctor', dept });

  // Save to backend API if token available
  if(_authToken){
    apiCall('/doctors','POST',{ name, dept, qual:qual, exp:parseInt(exp)||0, phone, email, schedule:schedule||'Mon-Fri 9AM-5PM', fee:parseInt(fee)||500, about, status })
      .then(res=>{ if(res.doctor) console.log('Doctor saved to DB:', res.doctor.id); })
      .catch(e=>console.warn('Doctor API save failed (kept locally):', e.message));
  }

  // Add notification
  addNotif('👨‍⚕️', `New doctor ${name} added to ${dept}`, 'just now');

  // Refresh all data
  refreshAll();

  // Show credentials step
  document.getElementById('docFormStep').style.display    = 'none';
  document.getElementById('docSuccessStep').style.display = 'block';
  document.getElementById('cred-username').textContent    = finalUsername;
  document.getElementById('cred-password').textContent    = password;
  document.getElementById('cred-summary').innerHTML       = `
    <strong>👤 ${name}</strong><br/>
    🏥 ${dept} &nbsp;|&nbsp; 🎓 ${qual}<br/>
    📞 ${phone} &nbsp;|&nbsp; 🆔 ${docId}<br/>
    📅 ${schedule||'Mon-Fri 9AM-5PM'}<br/>
    ${email?'📧 '+email+'<br/>':''}
    ${fee?'💰 Consultation Fee: ₹'+fee:''}
  `;
  toast(`✅ ${name} added to ${dept}!`,'success');
}


function generateDocPassword(){
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#!';
  let pass = '';
  for(let i=0;i<8;i++) pass += chars[Math.floor(Math.random()*chars.length)];
  const el = document.getElementById('doc-password');
  if(el){ el.value = pass; el.focus(); }
  toast('Password generated: '+pass);
}

function resetDoctorModal(){
  document.getElementById('docFormStep').style.display    = 'block';
  document.getElementById('docSuccessStep').style.display = 'none';
  document.getElementById('docFormError').style.display  = 'none';
  ['doc-name','doc-qual','doc-phone','doc-email','doc-exp','doc-schedule','doc-fee','doc-about','doc-password'].forEach(id=>{
    const el=document.getElementById(id); if(el)el.value='';
  });
  document.getElementById('doc-dept').value   = '';
  document.getElementById('doc-status').value = 'Active';
  // Re-populate dept
  const sel=document.getElementById('doc-dept');
  sel.innerHTML='<option value="">Select Department</option>';
  DEPARTMENTS.forEach(d=>sel.innerHTML+=`<option value="${d.name}">${d.icon} ${d.name}</option>`);
}

function printDoctorCredentials(){
  const name  = document.getElementById('cred-summary').innerHTML;
  const uname = document.getElementById('cred-username').textContent;
  const pass  = document.getElementById('cred-password').textContent;
  const win   = window.open('','_blank');
  win.document.write(`<html><head><title>Doctor Credentials</title>
  <style>body{font-family:sans-serif;padding:40px;max-width:500px;margin:auto}
  h2{color:#1a3a5c}.cred{background:#f0f4ff;border-radius:10px;padding:18px;margin:16px 0}
  .row{display:flex;justify-content:space-between;margin:8px 0;font-size:15px}
  .label{color:#888}.value{font-weight:700;background:#1a3a5c;color:#fff;padding:3px 12px;border-radius:6px}
  small{color:#aaa;font-size:11px}</style></head>
  <body><h2>🏥 MedEase Hospital — Doctor Login Card</h2>
  <div class="cred">
    <div class="row"><span class="label">Username</span><span class="value">${uname}</span></div>
    <div class="row"><span class="label">Password</span><span class="value">${pass}</span></div>
  </div>
  <p>${name}</p>
  <small>⚠️ Please keep these credentials secure and change the password after first login.</small>
  <script>window.print()<\/script></body></html>`);
  win.document.close();
}

/* ═══════════════════════════════════════════════
   APPOINTMENTS
═══════════════════════════════════════════════ */
/* temp booking state */
let _apptDraft = {};

function getConsultFee(){
  const docId = document.getElementById('appt-doctor').value;
  const doc = db.doctors.find(d=>d.id===docId);
  const type = document.getElementById('appt-type').value;
  let base = doc && doc.fee ? parseInt(doc.fee) : 500;
  if(type==='Follow-Up') base = Math.round(base*0.6);
  if(type==='Emergency') base = Math.round(base*1.5);
  return base;
}

function updateConsultFee(){ /* called on doctor/type change — nothing to render in step1 */ }

function goToFeeSummary(){
  const patId  = document.getElementById('appt-patient').value;
  const patName= document.getElementById('appt-patient-name')?.value.trim()||'';
  const docId  = document.getElementById('appt-doctor').value;
  const date   = document.getElementById('appt-date').value;
  const errEl  = document.getElementById('apptStep1Err');
  const phone  = document.getElementById('appt-phone').value.trim();
  if(!patId && !patName){ errEl.textContent='❌ Please enter a patient name or select from suggestions.'; errEl.style.display='block'; return; }
  if(!phone || phone.length<10){ errEl.textContent='❌ Please enter a valid 10-digit contact number.'; errEl.style.display='block'; document.getElementById('appt-phone').focus(); return; }
  if(!docId){ errEl.textContent='❌ Please select a doctor.'; errEl.style.display='block'; return; }
  if(!date){  errEl.textContent='❌ Please select an appointment date.'; errEl.style.display='block'; return; }
  errEl.style.display='none';

  // If patient typed a name but didn't pick from autocomplete, create a walk-in entry
  let pat = db.patients.find(p=>p.id===patId);
  if(!pat && patName){
    const parts = patName.trim().split(' ');
    pat = { id:'WALKIN-'+Date.now(), fname:parts[0], lname:parts.slice(1).join(' ')||'', dob:'', gender:'', blood:'', phone:'', email:'', registered:new Date().toLocaleDateString('en-IN'), walkIn:true };
    // Don't push to db permanently — just use for this booking
  }
  const doc  = db.doctors.find(d=>d.id===docId);
  const type = document.getElementById('appt-type').value;
  const time = document.getElementById('appt-time').value;
  const fee  = getConsultFee();
  const regFee = 100;
  const totalFee = fee + regFee;

  _apptDraft = { patId, docId, date, time, type, fee, regFee, totalFee,
    patName: pat.fname+' '+pat.lname, docName: doc.name, dept: doc.dept,
    phone,
    notes: document.getElementById('appt-notes').value };

  document.getElementById('feeSummaryDetails').innerHTML =
    `<span style="color:var(--muted)">Patient:</span> <strong>${pat.fname} ${pat.lname}</strong> (${pat.id})<br/>
     <span style="color:var(--muted)">Doctor:</span> <strong>${doc.name}</strong><br/>
     <span style="color:var(--muted)">Department:</span> ${doc.dept}<br/>
     <span style="color:var(--muted)">Date & Time:</span> ${new Date(date).toLocaleDateString('en-IN')} · ${time}<br/>
     <span style="color:var(--muted)">Contact:</span> <strong>📞 ${_apptDraft.phone}</strong><br/>
     <span style="color:var(--muted)">Visit Type:</span> <span class="badge badge-blue">${type}</span>`;

  document.getElementById('feeBreakdown').innerHTML =
    `<div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:.86rem">
       <span>Consultation Fee (${type})</span><span style="font-weight:600">₹${fee}</span>
     </div>
     <div style="display:flex;justify-content:space-between;font-size:.86rem">
       <span>OPD Registration</span><span style="font-weight:600">₹${regFee}</span>
     </div>`;
  document.getElementById('feeTotalDisplay').textContent = '₹'+totalFee;
  goToApptStep(2);
}

function onApptPayModeChange(){
  const mode = document.getElementById('appt-pay-mode').value;
  // preview only, actual show happens in goToPayment
}

function goToPayment(){
  _apptDraft.payMode = 'UPI';
  goToApptStep(3);
  document.getElementById('apptPayErr').style.display='none';
  document.getElementById('upiApptAmount').textContent=_apptDraft.totalFee;
  document.getElementById('apptUpiTxnId').value='';
  const qrDiv=document.getElementById('apptUpiQr'); qrDiv.innerHTML='';
  const upiUrl=`upi://pay?pa=barhate.komal12@okaxis&pn=MedEase%20Hospital&am=${_apptDraft.totalFee}&cu=INR&tn=${encodeURIComponent('Appt-'+_apptDraft.patName)}&tr=APT${Date.now()}`;
  new QRCode(qrDiv,{text:upiUrl,width:190,height:190,colorDark:'#1a3a5c',colorLight:'#ffffff',correctLevel:QRCode.CorrectLevel.M});
}

function calcCashChange(){}

function confirmApptPayment(){
  const errEl = document.getElementById('apptPayErr');
  const txnId = document.getElementById('apptUpiTxnId').value.trim();
  if(!txnId){ errEl.textContent='❌ Please enter the UPI Transaction ID after payment.'; errEl.style.display='block'; return; }
  errEl.style.display='none';

  const mode = 'UPI';
  // If logged-in patient, always use their real patientId
  if(currentRole==='patient'){
    const realId = currentUser?.patientId || currentUser?.ref_id;
    if(realId && _apptDraft.patId && _apptDraft.patId.startsWith('WALKIN-')){
      _apptDraft.patId = realId;
      _apptDraft.patName = currentUser.name;
    } else if(realId){
      _apptDraft.patId = realId;
    }
  }

  // If walk-in patient (not in db), register them now
  if(_apptDraft.patId && _apptDraft.patId.startsWith('WALKIN-')){
    const parts=_apptDraft.patName.trim().split(' ');
    const newPat={id:'P-'+(++db.pidCounter),fname:parts[0],lname:parts.slice(1).join(' ')||'',dob:'',gender:'',blood:'',phone:_apptDraft.phone||'',email:'',aadhaar:'',address:'',allergies:'',emergency:'',registered:new Date().toLocaleDateString('en-IN')};
    db.patients.push(newPat);
    USERS.patient.push({username:newPat.id,password:'patient123',name:_apptDraft.patName,role:'patient',patientId:newPat.id});
    _apptDraft.patId=newPat.id;
  }

  // Create appointment
  const apptId = 'A-'+(++db.aidCounter);
  const a = {
    id:apptId, patientId:_apptDraft.patId, patientName:_apptDraft.patName,
    doctorId:_apptDraft.docId, doctorName:_apptDraft.docName, dept:_apptDraft.dept,
    date:_apptDraft.date, time:_apptDraft.time, type:_apptDraft.type,
    notes:_apptDraft.notes, phone:_apptDraft.phone, status:'Confirmed',
    fee:_apptDraft.totalFee, payMode:mode, txnId, payStatus:'Paid'
  };
  db.appointments.push(a);

  // Create linked bill
  const b = {
    id:'B-'+(++db.bidCounter), patientId:_apptDraft.patId, patientName:_apptDraft.patName,
    date:new Date().toLocaleDateString('en-IN'), amount:_apptDraft.totalFee,
    mode, status:'Paid', txnId, apptId, note:'Appointment Fee'
  };
  db.bills.push(b);

  // Auto-issue queue token
  const tokenNum = String(db.tidCounter++).padStart(3,'0');
  const tokenId = 'T-'+tokenNum;
  const priority = _apptDraft.type==='Emergency' ? 'Emergency' : 'Normal';
  const tok = {
    id:tokenId, patientId:_apptDraft.patId, patientName:_apptDraft.patName,
    dept:_apptDraft.dept, doctorName:_apptDraft.docName,
    priority, status:'Waiting', apptId,
    time:new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})
  };
  db.tokens.push(tok);

  addNotif('📅',`Appointment ${apptId} booked · Token ${tokenId} issued for ${_apptDraft.patName}`,'just now');

  // Save to backend API if logged in with token
  if(_authToken){
    apiCall('/appointments','POST',{
      patient_id:_apptDraft.patId, patient_name:_apptDraft.patName,
      doctor_id:_apptDraft.docId, doctor_name:_apptDraft.docName,
      dept:_apptDraft.dept, date:_apptDraft.date, time:_apptDraft.time,
      type:_apptDraft.type, notes:_apptDraft.notes, phone:_apptDraft.phone,
      fee:_apptDraft.totalFee, pay_mode:'UPI', txn_id:txnId
    }).catch(e=>console.warn('API save failed, kept locally:',e.message));
  }

  refreshAll();

  // Booking card
  document.getElementById('apptConfirmCard').innerHTML =
    `<div style="font-size:.7rem;opacity:.55;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px">✅ Booking Confirmation</div>
     <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:.86rem"><span style="opacity:.7">Appointment ID</span><strong>${apptId}</strong></div>
     <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:.86rem"><span style="opacity:.7">Patient</span><strong>${_apptDraft.patName}</strong></div>
     <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:.86rem"><span style="opacity:.7">Doctor</span><strong>${_apptDraft.docName}</strong></div>
     <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:.86rem"><span style="opacity:.7">Department</span><strong>${_apptDraft.dept}</strong></div>
     <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:.86rem"><span style="opacity:.7">Contact</span><strong>📞 ${_apptDraft.phone}</strong></div>
     <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:.86rem"><span style="opacity:.7">Date &amp; Time</span><strong>${new Date(_apptDraft.date).toLocaleDateString('en-IN')} · ${_apptDraft.time}</strong></div>
     <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:.86rem"><span style="opacity:.7">Visit Type</span><strong>${_apptDraft.type}</strong></div>
     <div style="border-top:1px solid rgba(255,255,255,.15);margin:12px 0;padding-top:10px;display:flex;justify-content:space-between;align-items:center">
       <span style="opacity:.7;font-size:.83rem">Paid via UPI</span>
       <span style="font-family:'DM Serif Display',serif;font-size:1.4rem;color:#7ef0c8">₹${_apptDraft.totalFee}</span>
     </div>
     <div style="font-size:.73rem;opacity:.45">Txn: ${txnId}</div>`;

  // Token card
  document.getElementById('tokenBigNum').textContent = tokenNum;
  document.getElementById('tokenDeptLabel').textContent = _apptDraft.dept;
  document.getElementById('tokenPatLabel').textContent = _apptDraft.patName;
  document.getElementById('tokenPriorLabel').textContent = priority + ' · ' + _apptDraft.time;

  _apptLastApptId = apptId;
  _apptLastTokenId = tokenId;
  goToApptStep(4);
  toast('✅ Booked! Token '+tokenId+' issued','success');
}

let _apptLastApptId = null;

function validateTxnId(inp){
  const val = inp.value.trim();
  const tag = document.getElementById('txnVerifyTag');
  inp.classList.remove('valid');
  if(!val){ tag.textContent='—'; tag.className='upi-verify-tag'; return; }
  if(val.length >= 8){
    inp.classList.add('valid');
    tag.textContent='✓ Valid';
    tag.className='upi-verify-tag ok';
  } else {
    tag.textContent='Too short';
    tag.className='upi-verify-tag';
  }
}

function copyUpiId(){
  navigator.clipboard.writeText('barhate.komal12@okaxis').then(()=>{
    const btn=document.getElementById('upiCopyBtn');
    btn.textContent='Copied!'; btn.style.background='var(--accent2)';
    setTimeout(()=>{btn.textContent='Copy';btn.style.background='';},2000);
  }).catch(()=>toast('UPI ID: barhate.komal12@okaxis'));
}
let _apptLastTokenId = null;

function patientAutocomplete(val){
  const box = document.getElementById('patSuggest');
  document.getElementById('appt-patient').value = ''; // clear hidden until picked
  if(!val || val.length < 2){ box.style.display='none'; return; }
  const q = val.toLowerCase();
  const matches = db.patients.filter(p=>(p.fname+' '+p.lname+p.id+p.phone).toLowerCase().includes(q)).slice(0,6);
  if(!matches.length){ box.style.display='none'; return; }
  box.innerHTML = matches.map(p=>`
    <div style="padding:10px 14px;cursor:pointer;border-bottom:1px solid var(--border);font-size:.84rem;transition:background .15s"
      onmouseover="this.style.background='var(--surface2)'" onmouseout="this.style.background=''"
      onclick="selectPatientSuggest('${p.id}','${p.fname} ${p.lname}')">
      <strong>${p.fname} ${p.lname}</strong> <span style="color:var(--muted);font-size:.76rem">${p.id}</span>
      <div style="font-size:.73rem;color:var(--muted)">${p.phone||''}${p.blood?' · '+p.blood:''}</div>
    </div>`).join('');
  box.style.display='block';
}

function selectPatientSuggest(id, name){
  document.getElementById('appt-patient').value = id;
  document.getElementById('appt-patient-name').value = name;
  document.getElementById('patSuggest').style.display='none';
  // Auto-fill phone if patient is registered
  const pat = db.patients.find(p=>p.id===id);
  const phoneEl = document.getElementById('appt-phone');
  const hintEl  = document.getElementById('appt-phone-hint');
  if(pat && pat.phone){
    phoneEl.value = pat.phone;
    phoneEl.style.borderColor = 'var(--accent2)';
    if(hintEl) hintEl.innerHTML = '<span style="color:var(--accent2);font-weight:600">✓ Auto-filled from patient record</span>';
  } else {
    phoneEl.value = '';
    phoneEl.style.borderColor = '';
    if(hintEl) hintEl.textContent = 'Auto-filled for registered patients';
  }
}

function validateApptPhone(inp){
  const hintEl = document.getElementById('appt-phone-hint');
  inp.style.borderColor = '';
  if(!inp.value){ if(hintEl) hintEl.textContent='Auto-filled for registered patients'; return; }
  if(inp.value.length===10){
    inp.style.borderColor='var(--accent2)';
    if(hintEl) hintEl.innerHTML='<span style="color:var(--accent2);font-weight:600">✓ Valid number</span>';
  } else {
    inp.style.borderColor='var(--warn)';
    if(hintEl) hintEl.innerHTML='<span style="color:var(--warn);font-weight:600">Enter 10-digit number ('+(10-inp.value.length)+' more)</span>';
  }
}

function printToken(){
  const a = db.appointments.find(x=>x.id===_apptLastApptId);
  const t = db.tokens.find(x=>x.id===_apptLastTokenId);
  if(!t) return;
  const win = window.open('','_blank');
  win.document.write(`<html><head><title>Queue Token</title>
  <style>
    body{font-family:sans-serif;padding:30px;max-width:320px;margin:auto;text-align:center}
    .token-big{font-size:5rem;font-weight:900;color:#e8613a;line-height:1;margin:10px 0}
    .hosp{font-size:.9rem;color:#1a3a5c;font-weight:700;margin-bottom:4px}
    .dept{font-size:1rem;font-weight:600;color:#1a3a5c;margin-bottom:16px}
    .row{display:flex;justify-content:space-between;font-size:13px;margin:5px 0;border-bottom:1px solid #eee;padding-bottom:5px}
    small{color:#aaa;font-size:10px;margin-top:14px;display:block}
  </style></head>
  <body>
    <div class="hosp">🏥 MedEase Hospital</div>
    <div style="font-size:.72rem;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">OPD Queue Token</div>
    <div class="token-big">${t.id.split('-')[1]}</div>
    <div class="dept">${t.dept}</div>
    <div class="row"><span>Token</span><b>${t.id}</b></div>
    <div class="row"><span>Patient</span><b>${t.patientName}</b></div>
    <div class="row"><span>Doctor</span><b>${t.doctorName||'—'}</b></div>
    <div class="row"><span>Issued</span><b>${t.time}</b></div>
    <div class="row"><span>Priority</span><b>${t.priority}</b></div>
    ${a?`<div class="row"><span>Appt ID</span><b>${a.id}</b></div><div class="row"><span>Time Slot</span><b>${a.time}</b></div>`:''}
    <small>Please wait in the waiting area. Your token will be called shortly.</small>
    <script>window.print()<\/script>
  </body></html>`);
  win.document.close();
}

function printApptReceipt(){
  const a = db.appointments.find(x=>x.id===_apptLastApptId); if(!a)return;
  const win=window.open('','_blank');
  win.document.write(`<html><head><title>Appointment Receipt</title>
  <style>body{font-family:sans-serif;padding:40px;max-width:500px;margin:auto}h1{color:#1a3a5c;font-size:1.2rem}
  .row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee;font-size:14px}
  .total{font-size:1.2rem;font-weight:bold;color:#e8613a;text-align:right;padding-top:12px}
  small{color:#aaa;font-size:11px;display:block;margin-top:20px;text-align:center}</style></head>
  <body><h1>🏥 MedEase Hospital — Appointment Receipt</h1>
  <div class="row"><span>Appointment ID</span><b>${a.id}</b></div>
  <div class="row"><span>Patient</span><b>${a.patientName}</b></div>
  <div class="row"><span>Contact</span><b>📞 ${a.phone||'—'}</b></div>
  <div class="row"><span>Doctor</span><b>${a.doctorName}</b></div>
  <div class="row"><span>Department</span><b>${a.dept}</b></div>
  <div class="row"><span>Date & Time</span><b>${new Date(a.date).toLocaleDateString('en-IN')} · ${a.time}</b></div>
  <div class="row"><span>Visit Type</span><b>${a.type}</b></div>
  <div class="row"><span>Payment Mode</span><b>${a.payMode}</b></div>
  <div class="row"><span>Transaction Ref</span><b>${a.txnId}</b></div>
  <div class="total">Total Paid: ₹${a.fee}</div>
  <small>Thank you for choosing MedEase Hospital. Please carry this receipt on your visit.</small>
  <script>window.print()<\/script></body></html>`);
  win.document.close();
}

function resetApptForm(){
  ['appt-patient','appt-dept','appt-doctor'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';}); const pn=document.getElementById('appt-patient-name');if(pn)pn.value=''; const ps=document.getElementById('patSuggest');if(ps)ps.style.display='none';
  document.getElementById('appt-date').value=new Date().toISOString().split('T')[0];
  document.getElementById('appt-notes').value='';
  document.getElementById('appt-type').value='New Visit';
  const ph=document.getElementById('appt-phone'); if(ph){ph.value='';ph.style.borderColor='';}
  const phi=document.getElementById('appt-phone-hint'); if(phi) phi.textContent='Auto-filled for registered patients';
  document.getElementById('apptStep1Err').style.display='none';
  _apptDraft={};
  goToApptStep(1);
}

function goToApptStep(n){
  [1,2,3,4].forEach(i=>{
    const card=document.getElementById('apptStep'+i);
    if(card) card.style.display = i===n ? 'block':'none';
  });
  // Step indicators
  [1,2,3,4].forEach(i=>{
    const ind=document.getElementById('step'+i+'-ind');
    if(!ind)return;
    ind.classList.remove('active','done');
    if(i<n) ind.classList.add('done');
    else if(i===n) ind.classList.add('active');
  });
  [1,2,3].forEach(i=>{
    const line=document.getElementById('sline'+i);
    if(line) line.classList.toggle('done', i<n);
  });
  // Hide step bar on step 4
  document.getElementById('apptStepBar').style.display = n===4 ? 'none':'flex';
}

function filterDoctors(){
  const dept=document.getElementById('appt-dept').value;
  const sel=document.getElementById('appt-doctor');
  sel.innerHTML='<option value="">Select Doctor</option>';
  db.doctors.filter(d=>!dept||d.dept===dept).forEach(d=>sel.innerHTML+=`<option value="${d.id}">${d.name} — ₹${d.fee||500}</option>`);
}

function renderAppointments(){
  const t=document.getElementById('apptTbody'); if(!t)return;
  const q=(document.getElementById('apptSearch')?.value||'').toLowerCase();
  const isPatient=currentRole==='patient';
  const patientId = currentUser?.patientId || currentUser?.ref_id;
  // Sort newest first
  let appts=[...db.appointments].reverse();
  if(isPatient && patientId) appts=appts.filter(a=>
    a.patientId===patientId || a.patient_id===patientId
  );
  if(q) appts=appts.filter(a=>(a.patientName+a.doctorName+a.dept+a.id).toLowerCase().includes(q));
  if(!appts.length){t.innerHTML=`<tr><td colspan="11" style="color:var(--muted);text-align:center;padding:18px">No appointments found</td></tr>`;return;}
  t.innerHTML=appts.map(a=>`<tr>
    <td><code style="font-size:.72rem">${a.id}</code></td>
    <td>${isPatient?'—':a.patientName}</td>
    <td>${a.doctorName}</td><td>${a.dept}</td>
    <td>${a.date?new Date(a.date).toLocaleDateString('en-IN'):'—'}</td><td>${a.time}</td>
    <td><span class="badge badge-blue">${a.type}</span></td>
    <td style="font-weight:600;color:var(--primary)">${a.fee?'₹'+a.fee:'—'}</td>
    <td>${a.payMode?`<span class="badge ${a.payStatus==='Paid'?'badge-green':'badge-warn'}">${a.payMode}</span>`:'<span style="color:var(--muted);font-size:.8rem">—</span>'}</td>
    <td><span class="badge ${a.status==='Confirmed'?'badge-green':a.status==='Cancelled'?'badge-red':a.status==='Completed'?'badge-blue':'badge-warn'}">${a.status}</span></td>
    <td>${isPatient?'—':`<div style="display:flex;gap:4px">
      <button class="btn btn-outline btn-sm" onclick="changeApptStatus('${a.id}','Completed')">✓</button>
      <button class="btn btn-sm" style="background:#fde8e8;color:#a33;border:none" onclick="changeApptStatus('${a.id}','Cancelled')">✕</button>
    </div>`}</td>
  </tr>`).join('');

  // hide Patient column & Action column for patient role
  const hdr=document.getElementById('apptActionColHdr');
  if(hdr) hdr.style.display=isPatient?'none':'';
  if(t.closest('table')) {
    t.closest('table').querySelectorAll('tr').forEach(row=>{
      const cells=row.querySelectorAll('td,th');
      if(cells[1]) cells[1].style.display=isPatient?'none':'';
      if(cells[10]) cells[10].style.display=isPatient?'none':'';
    });
  }
}

function changeApptStatus(id,status){
  const a=db.appointments.find(x=>x.id===id);
  if(a){a.status=status;renderAppointments();toast(`Appointment ${id} → ${status}`);}
}

/* ═══════════════════════════════════════════════
   QUEUE
═══════════════════════════════════════════════ */
function issueToken(){
  const pat=db.patients.find(p=>p.id===document.getElementById('q-patient').value);
  const dept=document.getElementById('q-dept').value;
  if(!pat||!dept){toast('Select patient and department','error');return;}
  const t={id:'T-'+String(db.tidCounter++).padStart(3,'0'),patientId:pat.id,patientName:pat.fname+' '+pat.lname,dept,priority:document.getElementById('q-priority').value,status:'Waiting',time:new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})};
  db.tokens.push(t);
  addNotif('🎫',`Token ${t.id} issued to ${t.patientName}`,'just now');
  renderQueue();
  toast(`Token ${t.id} issued!`);
}

function renderQueue(){
  const board=document.getElementById('queueBoard'); if(!board)return;
  if(!db.tokens.length){board.innerHTML='<div style="color:var(--muted);font-size:.88rem;grid-column:1/-1">No tokens issued yet.</div>';return;}
  board.innerHTML=db.tokens.map(t=>`
    <div class="token-card ${t.status==='Waiting'?'waiting':t.status==='In Progress'?'in-progress':'done'}" onclick="cycleToken('${t.id}')">
      <div class="token-num">${t.id.split('-')[1]}</div>
      <div class="token-name">${t.patientName}</div>
      <div class="token-dept">${t.dept}</div>
      <div style="margin-top:6px"><span class="badge ${t.status==='Waiting'?'badge-warn':t.status==='In Progress'?'badge-green':'badge-blue'}" style="font-size:.68rem">${t.status}</span></div>
      <div style="font-size:.7rem;color:var(--muted);margin-top:3px">${t.time} · ${t.priority}</div>
    </div>`).join('');
  // Dashboard mini
  const mini=document.getElementById('dash-queue-mini'); if(!mini)return;
  const waiting=db.tokens.filter(t=>t.status==='Waiting').length;
  const inp=db.tokens.filter(t=>t.status==='In Progress').length;
  mini.innerHTML=`<div style="display:flex;gap:20px;flex-wrap:wrap">
    <div style="text-align:center"><div style="font-size:1.6rem;font-weight:700;color:var(--warn)">${waiting}</div><div style="font-size:.76rem;color:var(--muted)">Waiting</div></div>
    <div style="text-align:center"><div style="font-size:1.6rem;font-weight:700;color:var(--accent2)">${inp}</div><div style="font-size:.76rem;color:var(--muted)">In Progress</div></div>
    <div style="text-align:center"><div style="font-size:1.6rem;font-weight:700;color:var(--primary)">${db.tokens.length}</div><div style="font-size:.76rem;color:var(--muted)">Total</div></div>
  </div>`;
}

function cycleToken(id){
  const t=db.tokens.find(x=>x.id===id); if(!t)return;
  const flow=['Waiting','In Progress','Done'];
  t.status=flow[Math.min(flow.indexOf(t.status)+1,2)];
  renderQueue(); toast(`Token ${t.id} → ${t.status}`);
}

/* ═══════════════════════════════════════════════
   CHAT
═══════════════════════════════════════════════ */
function renderChatContacts(){
  const list=document.getElementById('chatContactList'); if(!list)return;
  const contacts=[];
  // Build contacts from doctors and patients
  db.doctors.forEach(d=>{contacts.push({id:d.id,name:d.name,role:d.dept,icon:'👨‍⚕️',key:'dr.'+d.name.split(' ')[1].toLowerCase()+'-'+''});});
  db.patients.forEach(p=>{contacts.push({id:p.id,name:p.fname+' '+p.lname,role:'Patient · '+p.id,icon:'🧑‍⚕️',key:'pat-'+p.id});});
  // Just show doctors for patients, patients for doctors
  const filtered=contacts.slice(0,8);
  list.innerHTML=filtered.map(c=>`
    <div class="chat-contact ${activeChatContact===c.key?'active':''}" onclick="openChat('${c.key}','${c.name}','${c.role}','${c.icon}')">
      <div class="chat-avatar">${c.icon}</div>
      <div style="flex:1;min-width:0"><div class="chat-contact-name">${c.name}</div><div class="chat-contact-role">${c.role}</div></div>
    </div>`).join('');
}

function openChat(key,name,role,icon){
  activeChatContact=key;
  document.getElementById('chatHeaderName').textContent=name;
  document.getElementById('chatHeaderStatus').textContent=role+' · Online';
  document.getElementById('chatAvatar').textContent=icon;
  renderChatContacts();
  renderMessages(key);
}

function renderMessages(key){
  const box=document.getElementById('chatMessages'); if(!box)return;
  const msgs=db.messages[key]||[];
  if(!msgs.length){box.innerHTML='<div style="text-align:center;color:var(--muted);padding:30px;font-size:.85rem">No messages yet. Say hello! 👋</div>';return;}
  const myId=currentUser?currentUser.username:'admin';
  box.innerHTML=msgs.map(m=>`
    <div>
      <div class="msg ${m.from===myId?'sent':'recv'}">${m.text}<div class="msg-time">${m.time}</div></div>
    </div>`).join('');
  box.scrollTop=box.scrollHeight;
}

function sendMessage(){
  const inp=document.getElementById('chatInput');
  const text=inp.value.trim(); if(!text||!activeChatContact)return;
  if(!db.messages[activeChatContact])db.messages[activeChatContact]=[];
  const myId=currentUser?currentUser.username:'admin';
  db.messages[activeChatContact].push({from:myId,text,time:new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})});
  inp.value='';
  renderMessages(activeChatContact);
  // Auto-reply simulation
  setTimeout(()=>{
    if(!db.messages[activeChatContact])return;
    const replies=['I understand. Let me check your file.','Thank you for reaching out.','Please come in for a check-up.','I will review and get back to you.','Noted. Please continue the medication.'];
    db.messages[activeChatContact].push({from:'bot',text:replies[Math.floor(Math.random()*replies.length)],time:new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})});
    renderMessages(activeChatContact);
    addNotif('💬','New message received','just now');
  },1500);
}

/* ═══════════════════════════════════════════════
   PRESCRIPTION & TIMELINE
═══════════════════════════════════════════════ */
function addMedRow(){
  const c=document.getElementById('medsContainer');
  const r=document.createElement('div'); r.className='med-row';
  r.innerHTML=`<input type="text" placeholder="Medicine name"/><input type="text" placeholder="Dosage"/><select><option>OD</option><option>BD</option><option>TDS</option><option>QID</option><option>SOS</option><option>HS</option></select><input type="text" placeholder="Duration"/><button class="btn btn-sm" style="background:#fde8e8;color:#a33;border:none;padding:5px 9px" onclick="this.parentElement.remove()">✕</button>`;
  c.appendChild(r);
}

function savePrescription(){
  const pat=db.patients.find(p=>p.id===document.getElementById('rx-patient').value);
  const doc=db.doctors.find(d=>d.id===document.getElementById('rx-doctor').value);
  if(!pat||!doc){toast('Select patient and doctor','error');return;}
  const rx={id:'Rx-'+(++db.ridCounter),patientId:pat.id,patientName:pat.fname+' '+pat.lname,doctorId:doc.id,doctorName:doc.name,diagnosis:document.getElementById('rx-diagnosis').value,date:document.getElementById('rx-date').value||new Date().toLocaleDateString('en-IN'),nextVisit:document.getElementById('rx-nextvisit').value,advice:document.getElementById('rx-advice').value,complaints:document.getElementById('rx-complaints').value};
  db.prescriptions.push(rx);
  addNotif('💊',`Prescription ${rx.id} written for ${rx.patientName}`,'just now');
  refreshAll();
  toast(`Prescription ${rx.id} saved!`);
}

function loadPatientTimeline(){
  const patId=document.getElementById('rx-patient').value;
  const card=document.getElementById('timelineCard');
  const tl=document.getElementById('patientTimeline');
  if(!patId){card.style.display='none';return;}
  const pat=db.patients.find(p=>p.id===patId);
  if(!pat){card.style.display='none';return;}
  card.style.display='block';
  const items=[];
  db.appointments.filter(a=>a.patientId===patId).forEach(a=>items.push({date:a.date,type:'appointment',title:`Appointment — ${a.dept}`,desc:`Dr. ${a.doctorName} · ${a.type} · ${a.status}`,color:'blue'}));
  db.prescriptions.filter(r=>r.patientId===patId).forEach(r=>items.push({date:r.date,type:'prescription',title:`Prescription — ${r.diagnosis||'General'}`,desc:`By ${r.doctorName}`,color:'green'}));
  db.labOrders.filter(l=>l.patientId===patId).forEach(l=>items.push({date:l.date,type:'lab',title:`Lab Test — ${l.test}`,desc:`Status: ${l.status}`,color:l.status==='Done'?'green':'warn'}));
  db.bills.filter(b=>b.patientId===patId).forEach(b=>items.push({date:b.date,type:'billing',title:`Bill ${b.id} — ₹${b.amount}`,desc:`${b.mode} · ${b.status}`,color:'orange'}));
  if(!items.length){tl.innerHTML='<div style="color:var(--muted);font-size:.85rem">No history found for this patient.</div>';return;}
  tl.innerHTML=items.map(i=>`<div class="tl-item"><div class="tl-dot ${i.color}"></div><div class="tl-date">${i.date}</div><div class="tl-title">${i.title}</div><div class="tl-desc">${i.desc}</div></div>`).join('');
}

function renderRxHistory(){
  const t=document.getElementById('rxHistoryTbody'); if(!t)return;
  if(!db.prescriptions.length){t.innerHTML='<tr><td colspan="6" style="color:var(--muted);text-align:center;padding:18px">No prescriptions</td></tr>';return;}
  t.innerHTML=db.prescriptions.map(r=>`<tr><td><code style="font-size:.74rem">${r.id}</code></td><td>${r.patientName}</td><td>${r.doctorName}</td><td>${r.diagnosis||'—'}</td><td>${r.date}</td><td>${r.nextVisit?new Date(r.nextVisit).toLocaleDateString('en-IN'):'—'}</td></tr>`).join('');
}

function printPrescription(){
  const pat=db.patients.find(p=>p.id===document.getElementById('rx-patient').value);
  const doc=db.doctors.find(d=>d.id===document.getElementById('rx-doctor').value);
  if(!pat||!doc){toast('Select patient and doctor','error');return;}
  const meds=[];
  document.querySelectorAll('#medsContainer .med-row').forEach(row=>{const ins=row.querySelectorAll('input,select');meds.push({name:ins[0]?.value,dose:ins[1]?.value,freq:ins[2]?.value,dur:ins[3]?.value});});
  const win=window.open('','_blank');
  win.document.write(`<html><head><title>Prescription</title><style>body{font-family:serif;padding:40px;max-width:620px;margin:auto}h2{color:#1a3a5c;font-style:italic}table{width:100%;border-collapse:collapse;margin:14px 0}th,td{padding:8px 12px;border-bottom:1px solid #ddd;font-size:14px}.rx-hdr{display:flex;justify-content:space-between;border-bottom:2px solid #1a3a5c;padding-bottom:12px;margin-bottom:18px}</style></head><body>
  <div class="rx-hdr"><div><h2>℞ MedEase Hospital</h2><small>OPD Prescription</small></div><div style="text-align:right"><b>${doc.name}</b><br/><small>${doc.qual} · ${doc.dept}</small></div></div>
  <p><b>Patient:</b> ${pat.fname} ${pat.lname} | <b>ID:</b> ${pat.id} | <b>Age/Gender:</b> ${calcAge(pat.dob)}/${pat.gender}</p>
  <p><b>Date:</b> ${new Date().toLocaleDateString('en-IN')} | <b>Diagnosis:</b> ${document.getElementById('rx-diagnosis').value||'—'}</p>
  <hr/><table><thead><tr><th>#</th><th>Medicine</th><th>Dosage</th><th>Frequency</th><th>Duration</th></tr></thead><tbody>
  ${meds.map((m,i)=>`<tr><td>${i+1}</td><td>${m.name}</td><td>${m.dose}</td><td>${m.freq}</td><td>${m.dur}</td></tr>`).join('')}
  </tbody></table>
  <p><b>Advice:</b> ${document.getElementById('rx-advice').value||'—'}</p>
  <p><b>Next Visit:</b> ${document.getElementById('rx-nextvisit').value||'—'}</p>
  <div style="margin-top:50px;text-align:right"><div style="border-top:1px solid #333;display:inline-block;padding-top:8px;min-width:200px">${doc.name}<br/><small>Signature & Stamp</small></div></div>
  <script>window.print()<\/script></body></html>`);
  win.document.close();
}

/* ═══════════════════════════════════════════════
   LAB TESTS
═══════════════════════════════════════════════ */
function orderLabTest(){
  const pat=db.patients.find(p=>p.id===document.getElementById('lab-patient').value);
  const doc=db.doctors.find(d=>d.id===document.getElementById('lab-doctor').value);
  if(!pat){toast('Select a patient','error');return;}
  const lab={id:'L-'+(++db.labCounter),patientId:pat.id,patientName:pat.fname+' '+pat.lname,test:document.getElementById('lab-test').value,doctorName:doc?doc.name:'—',priority:document.getElementById('lab-priority').value,notes:document.getElementById('lab-notes').value,status:'New',result:'',date:new Date().toLocaleDateString('en-IN')};
  db.labOrders.push(lab);
  addNotif('🧪',`Lab order ${lab.id} placed for ${lab.patientName}`,'just now');
  refreshAll();
  toast(`Lab order ${lab.id} placed!`);
}

function renderLab(){
  const t=document.getElementById('labTbody'); if(!t)return;
  if(!db.labOrders.length){t.innerHTML='<tr><td colspan="7" style="color:var(--muted);text-align:center;padding:18px">No lab orders</td></tr>';return;}
  t.innerHTML=db.labOrders.map(l=>`<tr>
    <td><code style="font-size:.74rem">${l.id}</code></td><td>${l.patientName}</td><td>${l.test}</td><td>${l.doctorName}</td>
    <td><span class="badge ${l.priority==='STAT'?'badge-red':l.priority==='Urgent'?'badge-orange':'badge-blue'}">${l.priority}</span></td>
    <td><span class="${l.status==='Done'?'lab-status-done':l.status==='Processing'?'lab-status-processing':'lab-status-new'}">${l.status}</span></td>
    <td style="display:flex;gap:4px">
      <button class="btn btn-outline btn-sm" onclick="openLabResult('${l.id}')">📋 Result</button>
      ${l.status!=='Done'?`<button class="btn btn-sm btn-warn" onclick="updateLabStatus('${l.id}','Processing')">▶</button>`:''}
    </td></tr>`).join('');
}

function openLabResult(id){activeLabId=id;const lab=db.labOrders.find(l=>l.id===id);document.getElementById('lab-result-text').value=lab?.result||'';document.getElementById('lab-result-ref').value='';openModal('labResultModal');}
function saveLabResult(){
  const lab=db.labOrders.find(l=>l.id===activeLabId); if(!lab)return;
  lab.result=document.getElementById('lab-result-text').value;
  lab.status='Done';
  addNotif('🧪',`Lab result ready for ${lab.patientName} — ${lab.test}`,'just now');
  closeModal('labResultModal');
  renderLab();
  toast('Lab result saved!');
}
function updateLabStatus(id,status){const lab=db.labOrders.find(l=>l.id===id);if(lab){lab.status=status;renderLab();toast(`Lab ${id} → ${status}`);}}

/* ═══════════════════════════════════════════════
   PHARMACY
═══════════════════════════════════════════════ */
function addMedicine(){
  const name=document.getElementById('ph-name').value.trim(); if(!name){toast('Enter medicine name','error');return;}
  const med={id:'M-'+(++db.medCounter),name,cat:document.getElementById('ph-cat').value,qty:parseInt(document.getElementById('ph-qty').value)||0,min:parseInt(document.getElementById('ph-min').value)||10,price:parseFloat(document.getElementById('ph-price').value)||0,expiry:document.getElementById('ph-expiry').value};
  db.medicines.push(med);
  ['ph-name','ph-qty','ph-price'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  if(med.qty<=med.min)addNotif('⚠️',`Low stock: ${med.name} (${med.qty} units)`,'just now');
  refreshAll();
  toast(`${name} added to inventory!`);
}

function renderPharmacy(){
  const t=document.getElementById('pharmacyTbody'); if(!t)return;
  if(!db.medicines.length){t.innerHTML='<tr><td colspan="8" style="color:var(--muted);text-align:center;padding:18px">No medicines</td></tr>';return;}
  t.innerHTML=db.medicines.map(m=>{
    const pct=Math.min(100,Math.round(m.qty/Math.max(m.min*2,1)*100));
    const level=pct>60?'high':pct>30?'medium':'low';
    const statusBadge=m.qty<=0?'<span class="badge badge-red">Out of Stock</span>':m.qty<=m.min?'<span class="badge badge-orange">Low Stock</span>':'<span class="badge badge-green">In Stock</span>';
    return `<tr>
      <td><strong>${m.name}</strong></td><td>${m.cat}</td>
      <td><div>${m.qty} units</div><div class="stock-bar"><div class="stock-fill ${level}" style="width:${pct}%"></div></div></td>
      <td>${m.min}</td><td>₹${m.price}</td><td>${m.expiry||'—'}</td><td>${statusBadge}</td>
      <td><button class="btn btn-outline btn-sm" onclick="restockMed('${m.id}')">+ Restock</button></td></tr>`;
  }).join('');
  // Low stock list in dashboard
  const low=db.medicines.filter(m=>m.qty<=m.min);
  const lowEl=document.getElementById('lowStockList');
  const dashLow=document.getElementById('dash-low-stock');
  const lowHtml=low.length?low.map(m=>`<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);font-size:.83rem"><span>💊 ${m.name}</span><span class="badge badge-orange">${m.qty} left</span></div>`).join(''):'<div style="color:var(--muted);font-size:.85rem">All medicines adequately stocked. ✅</div>';
  if(lowEl)lowEl.innerHTML=lowHtml;
  if(dashLow)dashLow.innerHTML=lowHtml;
}

function restockMed(id){
  const m=db.medicines.find(x=>x.id===id); if(!m)return;
  const qty=prompt(`Restock ${m.name}. Add quantity:`);
  if(qty&&!isNaN(qty)){m.qty+=parseInt(qty);renderPharmacy();toast(`${m.name} restocked by ${qty} units!`);}
}

/* ═══════════════════════════════════════════════
   BILLING & UPI
═══════════════════════════════════════════════ */
function addBillItem(){
  const c=document.getElementById('billItemsContainer');
  const r=document.createElement('div'); r.className='bill-item-row';
  r.innerHTML=`<select class="service-select" onchange="updateServiceRate(this)"><option>Consultation</option><option>OPD Registration</option><option>ECG</option><option>X-Ray</option><option>Blood Test</option><option>Urine Test</option><option>Dressing</option><option>Injection</option><option>Physiotherapy</option><option>Other</option></select><input type="number" class="rate-input" value="200" oninput="calcTotal()"/><input type="number" class="qty-input" value="1" min="1" oninput="calcTotal()"/><input type="text" class="amt-input" readonly value="₹200"/><button class="btn btn-sm" style="background:#fde8e8;color:#a33;border:none;padding:5px 9px" onclick="this.parentElement.remove();calcTotal()">✕</button>`;
  c.appendChild(r); calcTotal();
}
function updateServiceRate(sel){const r=sel.parentElement;r.querySelector('.rate-input').value=SERVICE_RATES[sel.value]||200;calcTotal();}
function calcTotal(){
  let total=0;
  document.querySelectorAll('.bill-item-row').forEach(row=>{const rate=parseFloat(row.querySelector('.rate-input')?.value)||0;const qty=parseInt(row.querySelector('.qty-input')?.value)||1;const amt=rate*qty;const ai=row.querySelector('.amt-input');if(ai)ai.value='₹'+amt;total+=amt;});
  const disc=parseFloat(document.getElementById('bill-discount')?.value)||0;
  const final=total*(1-disc/100);
  document.getElementById('billTotal').textContent='₹'+final.toFixed(0);
  return final;
}
function onPaymentModeChange(){if(document.getElementById('bill-mode').value==='UPI')toast('💡 Click Generate Bill to get UPI QR code');}
function generateBill(){
  const pat=db.patients.find(p=>p.id===document.getElementById('bill-patient').value);
  if(!pat){toast('Select a patient','error');return;}
  const total=calcTotal();const mode=document.getElementById('bill-mode').value;
  const bill={id:'B-'+(++db.bidCounter),patientId:pat.id,patientName:pat.fname+' '+pat.lname,date:new Date().toLocaleDateString('en-IN'),amount:total,mode,status:mode==='UPI'?'Pending':'Paid',txnId:''};
  db.bills.push(bill);refreshAll();
  if(mode==='UPI')showUpiQr(total,bill.id);
  else{addNotif('💳',`Bill ${bill.id} generated — ₹${total.toFixed(0)} (${mode})`,'just now');toast(`Bill ${bill.id} for ₹${total.toFixed(0)}!`);}
}
function renderBillHistory(){
  const t=document.getElementById('billHistoryTbody'); if(!t)return;
  if(!db.bills.length){t.innerHTML='<tr><td colspan="7" style="color:var(--muted);text-align:center;padding:18px">No bills</td></tr>';return;}
  t.innerHTML=db.bills.map(b=>`<tr><td><code style="font-size:.74rem">${b.id}</code></td><td>${b.patientName}</td><td>${b.date}</td><td style="font-weight:600;color:var(--accent)">₹${b.amount.toFixed(0)}</td><td><span class="badge badge-blue">${b.mode}</span></td><td style="font-size:.76rem;color:var(--muted)">${b.txnId||'—'}</td><td><span class="badge ${b.status==='Paid'?'badge-green':'badge-warn'}">${b.status}</span></td></tr>`).join('');
}
const UPI_CONFIG={vpa:'barhate.komal12@okaxis',name:'MedEase Hospital',currency:'INR'};
function showUpiQr(amount,billId){
  const txnRef='TXN'+Date.now();
  const upiUrl=`upi://pay?pa=${UPI_CONFIG.vpa}&pn=${encodeURIComponent(UPI_CONFIG.name)}&am=${amount.toFixed(2)}&cu=${UPI_CONFIG.currency}&tn=${encodeURIComponent('Bill '+billId)}&tr=${txnRef}`;
  const qrDiv=document.getElementById('upiQrCanvas');qrDiv.innerHTML='';
  new QRCode(qrDiv,{text:upiUrl,width:200,height:200,colorDark:'#1a3a5c',colorLight:'#ffffff',correctLevel:QRCode.CorrectLevel.M});
  document.getElementById('upi-display-amount').textContent='₹'+amount.toFixed(0);
  document.getElementById('upi-display-id').textContent=UPI_CONFIG.vpa;
  document.getElementById('upiQrModal').dataset.billId=billId;
  document.getElementById('upiTxnId').value='';
  document.getElementById('upiSuccessMsg').style.display='none';
  openModal('upiQrModal');
}
function submitUpiTxn(){
  const txnId=document.getElementById('upiTxnId').value.trim();
  if(!txnId){toast('Enter Transaction ID','error');return;}
  const bill=db.bills.find(b=>b.id===document.getElementById('upiQrModal').dataset.billId);
  if(bill){bill.status='Paid';bill.txnId=txnId;renderBillHistory();}
  document.getElementById('upiSuccessMsg').textContent='✅ Txn ID: '+txnId;
  document.getElementById('upiSuccessMsg').style.display='block';
  setTimeout(()=>{closeModal('upiQrModal');toast('✅ UPI Payment confirmed!','success');},1800);
}
function printBill(){
  const pat=db.patients.find(p=>p.id===document.getElementById('bill-patient').value);
  if(!pat){toast('Select patient','error');return;}
  const total=calcTotal();
  const win=window.open('','_blank');
  win.document.write(`<html><head><title>Bill - MedEase</title><style>body{font-family:sans-serif;padding:40px;max-width:600px;margin:auto}h1{color:#1a3a5c}table{width:100%;border-collapse:collapse;margin:18px 0}th,td{padding:10px;border:1px solid #ddd;font-size:14px}th{background:#f5f5f5}.total{font-size:1.3rem;font-weight:bold;color:#e8613a;text-align:right}</style></head><body><h1>🏥 MedEase Hospital</h1><p><b>Bill Date:</b> ${new Date().toLocaleDateString('en-IN')}</p><p><b>Patient:</b> ${pat.fname} ${pat.lname} | <b>ID:</b> ${pat.id}</p><hr/><table><thead><tr><th>Service</th><th>Rate</th><th>Qty</th><th>Amount</th></tr></thead><tbody>`);
  document.querySelectorAll('.bill-item-row').forEach(row=>{win.document.write(`<tr><td>${row.querySelector('.service-select')?.value}</td><td>₹${row.querySelector('.rate-input')?.value}</td><td>${row.querySelector('.qty-input')?.value}</td><td>${row.querySelector('.amt-input')?.value}</td></tr>`);});
  win.document.write(`</tbody></table><div class="total">Total: ₹${total.toFixed(0)}</div><p style="color:#888;font-size:12px;margin-top:40px">Thank you for choosing MedEase Hospital</p><script>window.print()<\/script></body></html>`);
  win.document.close();
}

/* ═══════════════════════════════════════════════
   BED MANAGEMENT
═══════════════════════════════════════════════ */
function renderBeds(){
  const grid=document.getElementById('bedGrid'); if(!grid)return;
  grid.innerHTML=db.beds.map(b=>{
    const pat=db.patients.find(p=>p.id===b.patientId);
    return `<div class="bed-card ${b.status}" onclick="manageBed('${b.id}')">
      <div class="bed-num">${b.id}</div>
      <div style="font-size:.72rem;margin-top:2px;opacity:.7">${b.ward}</div>
      <div class="bed-status">${b.status}</div>
      <div class="bed-patient">${pat?pat.fname+' '+pat.lname:''}</div>
    </div>`;
  }).join('');
  const avail=db.beds.filter(b=>b.status==='available').length;
  const occ=db.beds.filter(b=>b.status==='occupied').length;
  const maint=db.beds.filter(b=>b.status==='maintenance').length;
  ['bed-avail','bed-occ','bed-maint','bed-total'].forEach((id,i)=>{const el=document.getElementById(id);if(el)el.textContent=[avail,occ,maint,db.beds.length][i];});
  const statEl=document.getElementById('stat-beds');if(statEl)statEl.textContent=avail;
}

function manageBed(id){
  activeBedId=id;
  const bed=db.beds.find(b=>b.id===id);if(!bed)return;
  document.getElementById('bedModalTitle').textContent=`Manage Bed ${id} — ${bed.ward}`;
  document.getElementById('bed-status-select').value=bed.status;
  const patSel=document.getElementById('bed-patient-select');
  patSel.innerHTML='<option value="">— None —</option>';
  db.patients.forEach(p=>patSel.innerHTML+=`<option value="${p.id}" ${p.id===bed.patientId?'selected':''}>${p.fname} ${p.lname}</option>`);
  document.getElementById('bed-ward-input').value=bed.ward;
  openModal('bedModal');
}
function saveBedStatus(){
  const bed=db.beds.find(b=>b.id===activeBedId);if(!bed)return;
  bed.status=document.getElementById('bed-status-select').value;
  bed.patientId=document.getElementById('bed-patient-select').value||null;
  bed.ward=document.getElementById('bed-ward-input').value;
  closeModal('bedModal');renderBeds();toast(`Bed ${activeBedId} updated!`);
}

/* ═══════════════════════════════════════════════
   PATIENT RECORDS & ID CARD
═══════════════════════════════════════════════ */
function renderPatients(filter=''){
  const t=document.getElementById('patientsTbody'); if(!t)return;
  const filtered=db.patients.filter(p=>!filter||(p.fname+' '+p.lname+p.id+p.phone).toLowerCase().includes(filter.toLowerCase()));
  const countEl=document.getElementById('patientCount');if(countEl)countEl.textContent=filtered.length+' patient'+(filtered.length!==1?'s':'');
  if(!filtered.length){t.innerHTML='<tr><td colspan="8" style="color:var(--muted);text-align:center;padding:18px">No patients found</td></tr>';return;}
  t.innerHTML=filtered.map(p=>`<tr>
    <td><code style="font-size:.74rem">${p.id}</code></td>
    <td><strong>${p.fname} ${p.lname}</strong></td>
    <td>${calcAge(p.dob)}/${p.gender}</td>
    <td>${p.blood||'—'}</td><td>${p.phone}</td><td>${p.allergies||'None'}</td><td>${p.registered}</td>
    <td style="display:flex;gap:4px">
      <button class="btn btn-outline btn-sm" onclick="showIdCard('${p.id}')">🪪</button>
      <button class="btn btn-outline btn-sm" style="color:var(--danger);border-color:var(--danger)" onclick="deletePatient('${p.id}')">🗑️</button>
    </td></tr>`).join('');
}
function searchPatients(){renderPatients(document.getElementById('patientSearch').value);}
function deletePatient(id){if(!confirm('Delete this patient?'))return;db.patients=db.patients.filter(p=>p.id!==id);refreshAll();toast('Patient deleted','error');}

function showIdCard(id){
  const p=db.patients.find(x=>x.id===id);if(!p)return;
  const container=document.getElementById('idCardContainer');
  container.innerHTML=`<div class="id-card" id="printableCard">
    <div class="id-card-header">
      <div><div class="id-card-logo">Med<span>Ease</span></div><div style="font-size:.65rem;opacity:.6;letter-spacing:.5px">MULTI-SPECIALITY HOSPITAL</div></div>
      <div class="id-card-badge">OPD CARD</div>
    </div>
    <div class="id-card-body">
      <div class="id-card-avatar">${p.gender==='Female'?'👩':'👨'}</div>
      <div class="id-card-info">
        <div class="id-card-name">${p.fname} ${p.lname}</div>
        <div class="id-card-detail">
          DOB: ${p.dob?new Date(p.dob).toLocaleDateString('en-IN'):'—'}<br/>
          Gender: ${p.gender} &nbsp;|&nbsp; Blood: <strong>${p.blood||'—'}</strong><br/>
          Phone: ${p.phone}<br/>
          ${p.allergies&&p.allergies!=='None'?`⚠️ Allergies: ${p.allergies}`:''}
        </div>
        <div class="id-card-pid">ID: ${p.id}</div>
      </div>
    </div>
    <div class="id-card-footer">
      <span>Issued: ${p.registered}</span>
      <span>Emergency: ${p.emergency||'—'}</span>
    </div>
  </div>`;
  openModal('idCardModal');
}
function printIdCard(){
  const card=document.getElementById('printableCard'); if(!card)return;
  const win=window.open('','_blank');
  win.document.write(`<html><head><title>Patient ID Card</title><style>body{margin:20px;font-family:sans-serif}${Array.from(document.styleSheets).map(s=>{try{return Array.from(s.cssRules).map(r=>r.cssText).join('')}catch(e){return ''}}).join('')}</style></head><body>${card.outerHTML}<script>window.print()<\/script></body></html>`);
  win.document.close();
}

/* ═══════════════════════════════════════════════
   ANALYTICS & CHARTS
═══════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════
   NUMBER FORMATTING
═══════════════════════════════════════════════ */
function formatINR(num){
  const n = parseFloat(num) || 0;
  if(n >= 10000000) return (n/10000000).toFixed(1) + ' Cr';
  if(n >= 100000)   return (n/100000).toFixed(1) + ' L';
  if(n >= 1000)     return (n/1000).toFixed(1) + 'K';
  return n.toFixed(0);
}

function formatINRFull(num){
  const n = parseFloat(num) || 0;
  return n.toLocaleString('en-IN', {maximumFractionDigits:0});
}

function renderCharts(){
  // Patients should never see admin analytics
  if(currentRole==='patient'){
    document.getElementById('analytics').innerHTML=`<div class="page-header"><h1>Access Restricted</h1><p>Analytics are available to hospital staff only.</p></div><div class="card" style="text-align:center;padding:40px"><div style="font-size:3rem;margin-bottom:12px">🔒</div><div style="color:var(--muted)">Please contact hospital administration.</div></div>`;
    return;
  }
  // Update summary stats — parse all amounts as floats to avoid string concatenation
  const totalRev = db.bills.reduce((s,b)=>s + parseFloat(b.amount||0), 0);
  const paidBills = db.bills.filter(b=>b.status==='Paid');
  const avgBill = paidBills.length ? paidBills.reduce((s,b)=>s+parseFloat(b.amount||0),0) / paidBills.length : 0;
  document.getElementById('an-revenue').textContent = '₹' + formatINR(totalRev);
  document.getElementById('an-patients').textContent = db.patients.length;
  document.getElementById('an-avg').textContent = '₹' + formatINR(avgBill);
  document.getElementById('an-appts').textContent = db.appointments.length;

  // Revenue chart (last 7 days mock data + real)
  if(charts.revenue){charts.revenue.destroy();}
  const days=['Mon','Tue','Wed','Thu','Fri','Sat','Today'];
  const revData=[1200,2400,1800,3200,2100,2800,db.bills.reduce((s,b)=>s+parseFloat(b.amount||0),0)];
  charts.revenue=new Chart(document.getElementById('revenueChart'),{type:'line',data:{labels:days,datasets:[{label:'Revenue (₹)',data:revData,borderColor:'#e8613a',backgroundColor:'rgba(232,97,58,.1)',fill:true,tension:.4,pointBackgroundColor:'#e8613a'}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{callback:v=>'₹'+v}}}}});

  // Dept chart
  if(charts.dept){charts.dept.destroy();}
  const deptCounts=DEPARTMENTS.map(d=>db.appointments.filter(a=>a.dept===d.name).length);
  charts.dept=new Chart(document.getElementById('deptChart'),{type:'bar',data:{labels:DEPARTMENTS.map(d=>d.name.substring(0,8)),datasets:[{data:deptCounts,backgroundColor:['#e8613a','#1a3a5c','#4caf8e','#3a8fda','#9c6fda','#e8a23a','#d94f4f','#4caf8e','#1a3a5c','#e8613a','#3a8fda','#9c6fda']}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{stepSize:1}}}}});

  // Appointment status pie
  if(charts.apptStatus){charts.apptStatus.destroy();}
  const conf=db.appointments.filter(a=>a.status==='Confirmed').length;
  const comp=db.appointments.filter(a=>a.status==='Completed').length;
  const canc=db.appointments.filter(a=>a.status==='Cancelled').length;
  charts.apptStatus=new Chart(document.getElementById('apptStatusChart'),{type:'doughnut',data:{labels:['Confirmed','Completed','Cancelled'],datasets:[{data:[conf,comp,canc],backgroundColor:['#4caf8e','#3a8fda','#d94f4f'],borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom'}}}});

  // Bed occupancy
  if(charts.bed){charts.bed.destroy();}
  const bavail=db.beds.filter(b=>b.status==='available').length;
  const bocc=db.beds.filter(b=>b.status==='occupied').length;
  const bmaint=db.beds.filter(b=>b.status==='maintenance').length;
  charts.bed=new Chart(document.getElementById('bedChart'),{type:'doughnut',data:{labels:['Available','Occupied','Maintenance'],datasets:[{data:[bavail,bocc,bmaint],backgroundColor:['#4caf8e','#d94f4f','#e8a23a'],borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom'}}}});
}

/* ═══════════════════════════════════════════════
   EXPORT REPORTS
═══════════════════════════════════════════════ */
function exportPDF(title,headers,rows){
  const win=window.open('','_blank');
  win.document.write(`<html><head><title>${title}</title><style>body{font-family:sans-serif;padding:32px;max-width:900px;margin:auto}h1{color:#1a3a5c;font-size:1.4rem}table{width:100%;border-collapse:collapse;margin-top:16px;font-size:13px}th{background:#1a3a5c;color:#fff;padding:8px 12px;text-align:left}td{padding:8px 12px;border-bottom:1px solid #ddd}tr:nth-child(even){background:#f9f9f9}.footer{margin-top:24px;font-size:11px;color:#aaa}</style></head><body><h1>🏥 MedEase Hospital — ${title}</h1><p style="color:#888;font-size:12px">Generated: ${new Date().toLocaleString('en-IN')}</p><table><thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table><div class="footer">MedEase Multi-Speciality Hospital Management System</div><script>window.print()<\/script></body></html>`);
  win.document.close();
}
function exportPatientsPDF(){exportPDF('Patient Report',['Patient ID','Name','Age','Gender','Blood','Phone','Registered'],db.patients.map(p=>[p.id,p.fname+' '+p.lname,calcAge(p.dob),p.gender,p.blood||'—',p.phone,p.registered]));}
function exportBillingPDF(){exportPDF('Billing Report',['Bill ID','Patient','Date','Amount','Mode','Status'],db.bills.map(b=>[b.id,b.patientName,b.date,'₹'+b.amount.toFixed(0),b.mode,b.status]));}
function exportAppointmentsPDF(){exportPDF('Appointments Report',['Appt ID','Patient','Doctor','Dept','Date','Status'],db.appointments.map(a=>[a.id,a.patientName,a.doctorName,a.dept,a.date,a.status]));}
function exportCSV(type){
  let csv='',rows=[];
  if(type==='patients'){csv='ID,Name,DOB,Gender,Blood,Phone,Email,Registered\n';rows=db.patients.map(p=>[p.id,p.fname+' '+p.lname,p.dob,p.gender,p.blood,p.phone,p.email,p.registered]);}
  else if(type==='bills'){csv='Bill ID,Patient,Date,Amount,Mode,Status\n';rows=db.bills.map(b=>[b.id,b.patientName,b.date,b.amount,b.mode,b.status]);}
  csv+=rows.map(r=>r.join(',')).join('\n');
  const a=document.createElement('a');a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv);a.download=`medease_${type}_${Date.now()}.csv`;a.click();
  toast(`${type} CSV exported!`);
}

/* ═══════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════ */
function updateDashboard(){
  document.getElementById('stat-patients').textContent=db.patients.length;
  document.getElementById('stat-appts').textContent=db.appointments.filter(a=>a.status==='Confirmed').length;
  document.getElementById('stat-tokens').textContent=db.tokens.filter(t=>t.status!=='Done').length;
  const rev=db.bills.reduce((s,b)=>s+parseFloat(b.amount||0),0);
  document.getElementById('stat-revenue').textContent=rev>0?'₹'+formatINRFull(rev):'₹0';
  document.getElementById('stat-labs').textContent=db.labOrders.filter(l=>l.status!=='Done').length;
  document.getElementById('stat-meds').textContent=db.medicines.length;
  document.getElementById('stat-rx').textContent=db.prescriptions.length;
  const dashAppt=document.getElementById('dash-appt-tbody');
  const recent=db.appointments.slice(-5).reverse();
  if(!recent.length)dashAppt.innerHTML='<tr><td colspan="4" style="color:var(--muted);text-align:center;padding:18px">No appointments</td></tr>';
  else dashAppt.innerHTML=recent.map(a=>`<tr><td>${a.patientName||a.patient_name||'—'}</td><td>${a.doctorName||a.doctor_name||'—'}</td><td>${a.dept||'—'}</td><td><span class="badge ${a.status==='Confirmed'?'badge-green':a.status==='Cancelled'?'badge-red':'badge-blue'}">${a.status}</span></td></tr>`).join('');
  renderQueue(); renderBeds();
}

/* ═══════════════════════════════════════════════
   DROPDOWNS
═══════════════════════════════════════════════ */
function populateDropdowns(){
  ['q-patient','bill-patient','rx-patient','lab-patient'].forEach(sid=>{
    const sel=document.getElementById(sid); if(!sel)return;
    const val=sel.value;
    sel.innerHTML='<option value="">Select Patient</option>';
    db.patients.forEach(p=>sel.innerHTML+=`<option value="${p.id}">${p.id} — ${p.fname} ${p.lname}</option>`);
    if(val)sel.value=val;
  });
  ['appt-dept','q-dept','doc-dept'].forEach(sid=>{
    const sel=document.getElementById(sid); if(!sel)return;
    const val=sel.value;
    sel.innerHTML='<option value="">Select Department</option>';
    DEPARTMENTS.forEach(d=>sel.innerHTML+=`<option value="${d.name}">${d.icon} ${d.name}</option>`);
    if(val)sel.value=val;
  });
  ['appt-doctor','rx-doctor','lab-doctor'].forEach(sid=>{
    const sel=document.getElementById(sid); if(!sel)return;
    const val=sel.value;
    sel.innerHTML='<option value="">Select Doctor</option>';
    db.doctors.forEach(d=>sel.innerHTML+=`<option value="${d.id}">${d.name} (${d.dept})</option>`);
    if(val)sel.value=val;
  });
  const billAppt=document.getElementById('bill-appt');
  if(billAppt){billAppt.innerHTML='<option value="">Select Appointment</option>';db.appointments.forEach(a=>billAppt.innerHTML+=`<option value="${a.id}">${a.id} — ${a.doctorName}</option>`);}
}

/* ═══════════════════════════════════════════════
   REFRESH ALL
═══════════════════════════════════════════════ */
function refreshAll(){
  populateDropdowns();renderDepts();renderDoctors();renderAppointments();
  renderQueue();renderBillHistory();renderRxHistory();renderPatients();
  renderLab();renderPharmacy();renderBeds();updateDashboard();calcTotal();
  if(currentRole==='patient'){
    const pid = currentUser?.patientId || currentUser?.ref_id;
    if(pid) renderMyRecords(pid);
  }
  if(currentRole==='doctor') renderMyQueue();
}

/* ═══════════════════════════════════════════════
   LOGIN SYSTEM
═══════════════════════════════════════════════ */
function selectRole(role){
  currentRole=role;
  document.querySelectorAll('.role-card').forEach(c=>c.classList.remove('selected'));
  document.querySelector(`.role-card[data-role="${role}"]`).classList.add('selected');
  const meta=ROLE_META[role];
  document.getElementById('loginTitle').textContent=`${meta.icon} ${meta.label} Login`;
  document.getElementById('loginSubtitle').textContent='Enter your credentials to continue';
  document.getElementById('loginHint').innerHTML=`<p>Demo credentials:</p><p>${HINTS[role]}</p>`;
  document.getElementById('loginError').classList.remove('show');
  document.getElementById('loginUser').value='';document.getElementById('loginPass').value='';
  document.getElementById('authTabs').style.display=role==='patient'?'flex':'none';
  switchTab('login');
  const card=document.getElementById('loginFormCard');card.style.display='block';card.style.animation='popIn .25s ease';
  setTimeout(()=>document.getElementById('loginUser').focus(),100);
}

function switchTab(tab){
  const isL=tab==='login';
  document.getElementById('loginPanel').style.display=isL?'block':'none';
  document.getElementById('signupPanel').style.display=isL?'none':'block';
  document.getElementById('tabLogin').classList.toggle('active',isL);
  document.getElementById('tabSignup').classList.toggle('active',!isL);
  if(!isL){document.getElementById('signupError').classList.remove('show');document.getElementById('signupSuccess').style.display='none';['su-fname','su-lname','su-dob','su-phone','su-email','su-pass','su-pass2'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});}
}

async function doLogin(){
  if(!currentRole) return;
  const username = document.getElementById('loginUser').value.trim();
  const password = document.getElementById('loginPass').value;
  const errEl = document.getElementById('loginError');
  const btn = document.querySelector('.btn-login');

  if(!username || !password){ errEl.textContent='❌ Enter username and password.'; errEl.classList.add('show'); return; }

  // Show loading
  if(btn){ btn.textContent='Signing in...'; btn.disabled=true; }
  errEl.classList.remove('show');

  try {
    // Try API login first
    const data = await apiCall('/auth/login','POST',{username, password});
    _authToken = data.token;
    const apiUser = data.user;

    // Map API user to local user format
    const match = {
      username: apiUser.username,
      name: apiUser.name,
      role: apiUser.role,
      patientId: apiUser.role==='patient' ? apiUser.ref_id : null,
      ref_id: apiUser.ref_id,
    };

    currentRole = apiUser.role;
    currentUser = match;

    // Load real data from API
    await loadDataFromAPI();

    loginSuccess(match);

    // Re-render My Records after data loads for patient
    if(apiUser.role === 'patient' && apiUser.ref_id){
      setTimeout(()=>renderMyRecords(apiUser.ref_id), 500);
    }

    toast(`✅ Welcome, ${match.name}!`,'success');

  } catch(err) {
    // Fallback to local users (demo + newly created accounts)
    let match = USERS[currentRole]?.find(u=>u.username===username && u.password===password);
    // Also search all roles in case role selection was wrong
    if(!match){
      for(const role of Object.keys(USERS)){
        const found = USERS[role]?.find(u=>u.username===username && u.password===password);
        if(found){ match=found; currentRole=found.role; break; }
      }
    }
    if(match){
      currentUser = match;
      loginSuccess(match);
      toast(`✅ Welcome, ${match.name}!`,'success');
    } else {
      errEl.textContent='❌ Invalid credentials. Try again.';
      errEl.classList.add('show');
      document.getElementById('loginPass').value='';
    }
  } finally {
    if(btn){ btn.textContent='Sign In →'; btn.disabled=false; }
  }
}

function loginSuccess(match){
  applyRoleAccess(currentRole, match);
  const ls = document.getElementById('loginScreen');
  ls.style.transition='opacity .4s ease,transform .4s ease';
  ls.style.opacity='0'; ls.style.transform='scale(1.03)';
  setTimeout(()=>ls.classList.add('hidden'),400);
  document.getElementById('headerRoleBadge').style.display='flex';
  document.getElementById('headerRoleText').textContent=`${ROLE_META[currentRole].icon} ${match.name}`;
  document.getElementById('logoutBtn').style.display='inline-block';
  document.getElementById('dashGreeting').textContent=`${ROLE_META[currentRole].greeting}, ${match.name.split(' ')[0]} 👋`;
}

async function loadDataFromAPI(){
  try {
    // Load all data in parallel
    const [patients, doctors, appointments, tokens, prescriptions, labs, bills, pharmacy, beds] = await Promise.allSettled([
      apiCall('/patients'),
      apiCall('/doctors'),
      apiCall('/appointments'),
      apiCall('/tokens'),
      apiCall('/prescriptions'),
      apiCall('/lab'),
      apiCall('/billing'),
      apiCall('/pharmacy'),
      apiCall('/beds'),
    ]);

    if(patients.status==='fulfilled')
      db.patients = patients.value.map(p=>({...p, fname:p.fname||p.name, lname:p.lname||''}));
    if(doctors.status==='fulfilled')
      db.doctors = doctors.value.map(d=>({...d, dept:d.dept, fee:d.fee||500}));
    if(appointments.status==='fulfilled')
      db.appointments = appointments.value.map(a=>({...a,
        patientId:a.patient_id||a.patientId,
        patientName:a.patient_name||a.patientName,
        doctorId:a.doctor_id||a.doctorId,
        doctorName:a.doctor_name||a.doctorName
      }));
    if(tokens.status==='fulfilled')
      db.tokens = tokens.value.map(t=>({...t,
        patientId:t.patient_id||t.patientId,
        patientName:t.patient_name||t.patientName,
        apptId:t.appointment_id||t.apptId
      }));
    if(prescriptions.status==='fulfilled')
      db.prescriptions = prescriptions.value.map(r=>({...r,
        patientId:r.patient_id||r.patientId,
        patientName:r.patient_name||r.patientName,
        doctorId:r.doctor_id||r.doctorId,
        doctorName:r.doctor_name||r.doctorName
      }));
    if(labs.status==='fulfilled')
      db.labOrders = labs.value.map(l=>({...l,
        patientId:l.patient_id||l.patientId,
        patientName:l.patient_name||l.patientName
      }));
    if(bills.status==='fulfilled')
      db.bills = bills.value.map(b=>({...b,
        patientId:b.patient_id||b.patientId,
        patientName:b.patient_name||b.patientName
      }));
    if(pharmacy.status==='fulfilled') db.medicines = pharmacy.value;
    if(beds.status==='fulfilled')     db.beds      = beds.value;

    // Update counters based on loaded data so new IDs don't clash
    if(db.appointments.length) db.aidCounter = Math.max(...db.appointments.map(a=>parseInt(a.id?.split('-')[1]||200)), db.aidCounter);
    if(db.patients.length)     db.pidCounter = Math.max(...db.patients.map(p=>parseInt(p.id?.split('-')[1]||1000)), db.pidCounter);
    if(db.tokens.length)       db.tidCounter = Math.max(...db.tokens.map(t=>parseInt(t.id?.split('-')[1]||1)), db.tidCounter) + 1;
    if(db.bills.length)        db.bidCounter = Math.max(...db.bills.map(b=>parseInt(b.id?.split('-')[1]||3000)), db.bidCounter);
    if(db.prescriptions.length) db.ridCounter = Math.max(...db.prescriptions.map(r=>parseInt(r.id?.split('-')[1]||5000)), db.ridCounter);
    if(db.labOrders.length)    db.labCounter = Math.max(...db.labOrders.map(l=>parseInt(l.id?.split('-')[1]||7000)), db.labCounter);

    refreshAll();
    // Re-render My Records for patient after API data loads
    if(currentRole==='patient'){
      const pid = currentUser?.patientId || currentUser?.ref_id;
      if(pid) setTimeout(()=>renderMyRecords(pid), 300);
    }
  } catch(err){
    console.warn('Could not load API data, using demo data:', err.message);
    seedData();
  }
}

async function doSignup(){
  const fname=document.getElementById('su-fname').value.trim();
  const lname=document.getElementById('su-lname').value.trim();
  const dob=document.getElementById('su-dob').value;
  const gender=document.getElementById('su-gender').value;
  const phone=document.getElementById('su-phone').value.trim();
  const pass=document.getElementById('su-pass').value;
  const pass2=document.getElementById('su-pass2').value;
  const blood=document.getElementById('su-blood').value;
  const email=document.getElementById('su-email').value.trim();
  const errEl=document.getElementById('signupError');

  if(!fname||!lname||!dob||!gender||!phone||!pass){errEl.textContent='❌ Fill all required fields.';errEl.classList.add('show');return;}
  if(phone.length<10||!/^\d+$/.test(phone)){errEl.textContent='❌ Valid 10-digit phone required.';errEl.classList.add('show');return;}
  if(pass.length<6){errEl.textContent='❌ Password min 6 characters.';errEl.classList.add('show');return;}
  if(pass!==pass2){errEl.textContent='❌ Passwords do not match.';errEl.classList.add('show');return;}
  errEl.classList.remove('show');

  const btn=document.querySelector('#signupPanel .btn-login');
  if(btn){btn.textContent='Creating...';btn.disabled=true;}

  try {
    const data = await apiCall('/auth/signup','POST',{fname,lname,dob,gender,blood,phone,email,password:pass});
    const newId = data.patientId;
    // Store password in session so login works immediately
    USERS.patient.push({username:newId, password:pass, name:fname+' '+lname, role:'patient', patientId:newId});
    // Also cache credentials for auto-fill
    document.getElementById('signupSuccess').style.display='block';
    document.getElementById('signupSuccessMsg').textContent=`✅ Welcome, ${fname}! Your Patient ID: ${newId} · Password: ${pass}`;
    document.querySelectorAll('#signupPanel .login-field').forEach(el=>el.style.display='none');
    document.querySelector('#signupPanel .btn-login').style.display='none';
    // Auto-fill login form so patient can sign in with one click
    setTimeout(()=>{
      document.getElementById('loginUser').value = newId;
      document.getElementById('loginPass').value = pass;
    }, 100);
  } catch(err){
    // Fallback local signup
    const newP={id:'P-'+(++db.pidCounter),fname,lname,dob,gender,blood,phone,email,aadhaar:'',address:'',allergies:'',emergency:'',registered:new Date().toLocaleDateString('en-IN')};
    db.patients.push(newP);
    USERS.patient.push({username:newP.id,password:pass,name:fname+' '+lname,role:'patient',patientId:newP.id});
    refreshAll();
    document.getElementById('signupSuccess').style.display='block';
    document.getElementById('signupSuccessMsg').textContent=`✅ Welcome, ${fname}! Patient ID: ${newP.id} · Password: ${pass}`;
    document.querySelectorAll('#signupPanel .login-field').forEach(el=>el.style.display='none');
    document.querySelector('#signupPanel .btn-login').style.display='none';
    setTimeout(()=>{
      document.getElementById('loginUser').value = newP.id;
      document.getElementById('loginPass').value = pass;
    }, 100);
  } finally {
    if(btn){btn.textContent='✅ Create Account →';btn.disabled=false;}
  }
}

function applyRoleAccess(role,user){
  const allowed=ROLE_ACCESS[role];

  // Show/hide nav items
  document.querySelectorAll('.nav-item[data-section]').forEach(item=>{
    const sec=item.dataset.section;
    // myrecords only for patients
    if(sec==='myrecords'||sec==='chatbot'){ item.style.display=role==='patient'?'':'none'; return; }
    item.style.display=allowed.includes(sec)?'':'none';
  });

  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));

  const dash=document.querySelector('.nav-item[data-section="dashboard"]');if(dash)dash.classList.add('active');
  document.getElementById('dashboard').classList.add('active');

  // Doctor-specific setup
  if(role==='doctor'){
    // Show consult nav, hide prescription (embedded in consult)
    const consultNav=document.querySelector('.nav-item[data-section="consult"]');
    if(consultNav) consultNav.style.display='';
    const rxNav=document.querySelector('.nav-item[data-section="prescription"]');
    if(rxNav) rxNav.style.display='none';
    setTimeout(()=>renderMyQueue(),200);
  }

  const patId = user.patientId || user.ref_id;
  if(role==='patient' && patId){
    // Lock patient dropdown to this patient
    setTimeout(()=>{
      ['appt-patient','q-patient','bill-patient','rx-patient','lab-patient'].forEach(id=>{
        const sel=document.getElementById(id); if(!sel)return;
        sel.value=patId;
        sel.disabled=true;
      });
      // Render records immediately, then again after API data loads
      renderMyRecords(patId);
      setTimeout(()=>renderMyRecords(patId), 1000);
      setTimeout(()=>renderMyRecords(patId), 2500);
      setTimeout(cbInit, 400);
    },350);

    // Customise dashboard for patient
    document.getElementById('dashGreeting').textContent=`Welcome back, ${user.name.split(' ')[0]} 👋`;

    // Hide admin analytics elements from patient dashboard
    const statsRow=document.querySelector('#dashboard .stats-row');
    if(statsRow){
      // Show only relevant stats for patient
      const allCards=statsRow.querySelectorAll('.stat-card');
      allCards.forEach((c,i)=>{ c.style.display=i<3?'':'none'; });
    }

    // Hide booking steps bar initially shown
    const stepBar=document.getElementById('apptStepBar');
    if(stepBar) stepBar.style.display='flex';

    // Book apt step — for patient lock to step1
    goToApptStep(1);
  } else {
    // Re-enable dropdowns for non-patient roles
    ['appt-patient','q-patient','bill-patient','rx-patient','lab-patient'].forEach(id=>{
      const sel=document.getElementById(id); if(sel) sel.disabled=false;
    });
  }
}

function doLogout(){
  currentUser=null;currentRole=null;
  document.querySelectorAll('.nav-item[data-section]').forEach(item=>item.style.display='');
  document.getElementById('headerRoleBadge').style.display='none';
  document.getElementById('logoutBtn').style.display='none';
  const ls=document.getElementById('loginScreen');
  ls.classList.remove('hidden');ls.style.opacity='0';ls.style.transform='scale(.97)';ls.style.transition='opacity .35s ease,transform .35s ease';
  document.getElementById('loginFormCard').style.display='none';
  document.querySelectorAll('.role-card').forEach(c=>c.classList.remove('selected'));
  requestAnimationFrame(()=>requestAnimationFrame(()=>{ls.style.opacity='1';ls.style.transform='scale(1)';}));
}



/* ═══════════════════════════════════════════════
   DOCTOR CONSULT WORKFLOW
═══════════════════════════════════════════════ */
let _activeConsultToken = null;
let _activeConsultPatient = null;
let _consultSavedRx = null;

function renderMyQueue(){
  const list = document.getElementById('myQueueList');
  const countEl = document.getElementById('myQueueCount');
  if(!list) return;

  // Get doctor's dept from current user
  const docUser = currentUser;
  const doc = db.doctors.find(d=>d.name===docUser?.name);
  const dept = doc?.dept || docUser?.dept;

  // Filter tokens for this doctor's dept, not Done
  let tokens = db.tokens.filter(t=>
    (!dept || t.dept===dept) && t.status!=='Done'
  );

  // Also include tokens explicitly assigned to this doctor
  const allTokens = [...tokens];
  if(!allTokens.length){
    list.innerHTML='<div style="color:var(--muted);font-size:.84rem;text-align:center;padding:24px 0">🎉 No patients in queue</div>';
    if(countEl) countEl.textContent='0';
    return;
  }
  if(countEl) countEl.textContent=allTokens.length;

  list.innerHTML = allTokens.map(t=>{
    const isActive = _activeConsultToken?.id===t.id;
    const statusColor = t.status==='In Progress'?'badge-green':t.status==='Waiting'?'badge-warn':'badge-blue';
    const appt = db.appointments.find(a=>a.id===t.apptId);
    return `<div class="queue-patient-card ${isActive?'active-patient':''} ${t.status==='In Progress'?'in-progress':''}"
      onclick="openConsult('${t.id}')">
      <div style="display:flex;gap:10px;align-items:flex-start">
        <div class="qpc-token">${t.id.split('-')[1]}</div>
        <div style="flex:1">
          <div class="qpc-name">${t.patientName}</div>
          <div class="qpc-meta">${t.dept}${appt?' · '+appt.type:''}</div>
          ${appt&&appt.phone?`<div class="qpc-meta">📞 ${appt.phone}</div>`:''}
        </div>
        <div class="qpc-badge"><span class="badge ${statusColor}" style="font-size:.66rem">${t.status}</span></div>
      </div>
      <div style="display:flex;gap:6px;margin-top:10px">
        ${t.status==='Waiting'?`<button class="btn btn-sm" style="background:#e8f5ee;color:#1a7a55;border:1px solid #b3e0ca;font-size:.72rem" onclick="event.stopPropagation();callPatient('${t.id}')">📢 Call Patient</button>`:''}
        ${isActive?`<button class="btn btn-sm btn-outline" style="font-size:.72rem" onclick="event.stopPropagation();markConsultDone()">✓ Mark Done</button>`:''}
      </div>
    </div>`;
  }).join('');
}

function callPatient(tokenId){
  const t = db.tokens.find(x=>x.id===tokenId);
  if(!t) return;
  t.status = 'In Progress';
  openConsult(tokenId);
  addNotif('📢',`Calling patient ${t.patientName} — Token ${tokenId}`,'just now');
  refreshAll();
  toast('📢 Patient '+t.patientName+' called!');
}

function openConsult(tokenId){
  const t = db.tokens.find(x=>x.id===tokenId);
  if(!t){ toast('Token not found','error'); return; }
  _activeConsultToken = t;

  // Find patient record
  const pat = db.patients.find(p=>p.id===t.patientId);
  _activeConsultPatient = pat;

  // Update panel header
  document.getElementById('cpName').textContent = t.patientName;
  const appt = db.appointments.find(a=>a.id===t.apptId);
  const age = pat ? calcAge(pat.dob) : '—';
  const gender = pat?.gender||'—';
  const phone = appt?.phone || pat?.phone || '—';
  document.getElementById('cpMeta').textContent =
    `${age} · ${gender} · 📞 ${phone}${appt?' · '+appt.type:''}`;
  document.getElementById('cpTokenBadge').textContent = t.id;

  // Show panel, hide empty state
  document.getElementById('consultPanel').style.display='block';
  document.getElementById('consultEmptyState').style.display='none';

  // Reset tabs to vitals
  switchConsultTab('ctab-vitals', document.querySelector('.consult-tab'));

  // Clear vitals
  ['v-bp','v-pulse','v-temp','v-spo2','v-weight','v-height','v-bmi','v-rbs','v-complaints','v-exam'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.value='';
  });

  // Pre-fill complaints from appointment notes
  if(appt?.notes && document.getElementById('v-complaints')){
    document.getElementById('v-complaints').value = appt.notes;
  }

  // Load history
  renderConsultHistory(t.patientId);

  // Load existing lab orders for this patient today
  renderConsultLabOrders(t.patientId);

  // Reset Rx
  document.getElementById('c-diagnosis').value = '';
  document.getElementById('c-advice').value = '';
  const nv = document.getElementById('c-nextvisit');
  if(nv) nv.value = '';
  document.getElementById('cMedsContainer').innerHTML = `<div class="rx-med-row">
    <input type="text" placeholder="Medicine name & strength"/>
    <input type="text" placeholder="1 tab"/>
    <select><option>OD</option><option>BD</option><option>TDS</option><option>QID</option><option>SOS</option><option>HS</option></select>
    <input type="text" placeholder="5 days"/>
    <span></span>
  </div>`;
  _consultSavedRx = null;

  // Mark token In Progress if still Waiting
  if(t.status==='Waiting'){ t.status='In Progress'; renderMyQueue(); }

  // Refresh queue list
  renderMyQueue();
}

function switchConsultTab(panelId, btn){
  document.querySelectorAll('.consult-body').forEach(p=>p.style.display='none');
  document.querySelectorAll('.consult-tab').forEach(b=>b.classList.remove('active'));
  document.getElementById(panelId).style.display='block';
  if(btn) btn.classList.add('active');
  // Auto-calc BMI
  if(panelId==='ctab-vitals') calcBmi();
}

function calcBmi(){
  const w=parseFloat(document.getElementById('v-weight')?.value)||0;
  const h=parseFloat(document.getElementById('v-height')?.value)||0;
  const bmiEl=document.getElementById('v-bmi');
  if(w&&h&&bmiEl){ bmiEl.value=(w/((h/100)**2)).toFixed(1); }
}

// Auto-calc BMI on weight/height input
document.addEventListener('input',e=>{
  if(e.target.id==='v-weight'||e.target.id==='v-height') calcBmi();
});

function saveVitalsGoRx(){
  // Save vitals to the token record
  if(_activeConsultToken){
    _activeConsultToken.vitals = {
      bp: document.getElementById('v-bp').value,
      pulse: document.getElementById('v-pulse').value,
      temp: document.getElementById('v-temp').value,
      spo2: document.getElementById('v-spo2').value,
      weight: document.getElementById('v-weight').value,
      height: document.getElementById('v-height').value,
      bmi: document.getElementById('v-bmi').value,
      rbs: document.getElementById('v-rbs').value,
      complaints: document.getElementById('v-complaints').value,
      exam: document.getElementById('v-exam').value,
    };
  }
  switchConsultTab('ctab-rx', document.querySelectorAll('.consult-tab')[1]);
  toast('Vitals saved — write prescription');
}

function addConsultMedRow(){
  const c = document.getElementById('cMedsContainer');
  const row = document.createElement('div');
  row.className='rx-med-row';
  row.innerHTML=`<input type="text" placeholder="Medicine name & strength"/>
    <input type="text" placeholder="1 tab"/>
    <select><option>OD</option><option>BD</option><option>TDS</option><option>QID</option><option>SOS</option><option>HS</option></select>
    <input type="text" placeholder="5 days"/>
    <span style="cursor:pointer;color:var(--danger);font-size:1rem;text-align:center" onclick="this.parentElement.remove()">✕</span>`;
  c.appendChild(row);
}

function saveConsultPrescription(){
  if(!_activeConsultToken){ toast('No patient selected','error'); return; }
  const diag = document.getElementById('c-diagnosis').value.trim();
  if(!diag){ toast('Please enter a diagnosis','error'); document.getElementById('c-diagnosis').focus(); return; }

  const meds = [];
  document.querySelectorAll('#cMedsContainer .rx-med-row').forEach(row=>{
    const inputs = row.querySelectorAll('input,select');
    if(inputs[0].value.trim()) meds.push({name:inputs[0].value,dose:inputs[1].value,freq:inputs[2].value,dur:inputs[3].value});
  });

  const doc = db.doctors.find(d=>d.name===currentUser?.name);
  const vitals = _activeConsultToken.vitals||{};
  const rx = {
    id:'Rx-'+(++db.ridCounter),
    patientId: _activeConsultToken.patientId,
    patientName: _activeConsultToken.patientName,
    doctorId: doc?.id||'',
    doctorName: currentUser?.name||'Doctor',
    diagnosis: diag,
    complaints: vitals.complaints||'',
    advice: document.getElementById('c-advice').value,
    date: new Date().toLocaleDateString('en-IN'),
    nextVisit: document.getElementById('c-nextvisit').value,
    medicines: meds,
    vitals,
    apptId: _activeConsultToken.apptId,
  };
  db.prescriptions.push(rx);
  _consultSavedRx = rx;
  addNotif('💊','Prescription saved for '+rx.patientName,'just now');
  refreshAll();
  toast('✅ Prescription saved for '+rx.patientName,'success');
}

function printConsultRx(){
  let rx = _consultSavedRx;
  if(!rx){
    // Auto-save first
    saveConsultPrescription();
    rx = _consultSavedRx;
  }
  if(!rx){ toast('Save prescription first','error'); return; }

  const vitals = rx.vitals||{};
  const medsHtml = (rx.medicines||[]).map(m=>`
    <tr><td>${m.name}</td><td>${m.dose}</td><td>${m.freq}</td><td>${m.dur}</td></tr>`).join('');

  const win=window.open('','_blank');
  win.document.write(`<html><head><title>Prescription - ${rx.patientName}</title>
  <style>
    body{font-family:Arial,sans-serif;padding:28px 36px;max-width:680px;margin:auto;color:#1c1c2e;font-size:13px}
    .header{display:flex;justify-content:space-between;border-bottom:3px solid #1a3a5c;padding-bottom:12px;margin-bottom:16px}
    .hosp-name{font-size:1.3rem;font-weight:800;color:#1a3a5c}.hosp-sub{font-size:.75rem;color:#888}
    .rx-symbol{font-size:2.5rem;color:#e8613a;font-style:italic;font-family:serif;line-height:1}
    .patient-box{background:#f4f6fb;border-radius:8px;padding:10px 14px;display:grid;grid-template-columns:1fr 1fr;gap:4px 20px;margin-bottom:14px;font-size:12px}
    .vitals-grid{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px}
    .vbox{background:#fff;border:1px solid #dde1ec;border-radius:6px;padding:5px 10px;text-align:center;min-width:80px}
    .vbox .vl{font-size:.6rem;color:#888;text-transform:uppercase;letter-spacing:.5px}
    .vbox .vv{font-weight:700;color:#1a3a5c;font-size:.9rem}
    .section-title{font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#888;margin:12px 0 6px;border-top:1px solid #eee;padding-top:8px}
    table{width:100%;border-collapse:collapse;font-size:12px}
    th{background:#1a3a5c;color:#fff;padding:7px 10px;text-align:left;font-weight:600}
    td{padding:7px 10px;border-bottom:1px solid #eee}
    tr:nth-child(even) td{background:#f9fafb}
    .footer{margin-top:24px;display:flex;justify-content:space-between;font-size:.75rem;color:#aaa}
    .sign-line{border-top:1px solid #1a3a5c;padding-top:4px;min-width:160px;text-align:center;font-size:.78rem;color:#1a3a5c;font-weight:600}
  </style></head>
  <body>
    <div class="header">
      <div><div class="hosp-name">🏥 MedEase Hospital</div><div class="hosp-sub">Multi-Speciality OPD</div></div>
      <div class="rx-symbol">℞</div>
    </div>
    <div class="patient-box">
      <div><b>Patient:</b> ${rx.patientName}</div>
      <div><b>Rx ID:</b> ${rx.id}</div>
      <div><b>Doctor:</b> ${rx.doctorName}</div>
      <div><b>Date:</b> ${rx.date}</div>
      ${rx.nextVisit?`<div><b>Next Visit:</b> ${new Date(rx.nextVisit).toLocaleDateString('en-IN')}</div>`:''}
    </div>
    ${vitals.bp||vitals.pulse||vitals.temp?`
    <div class="section-title">Vitals</div>
    <div class="vitals-grid">
      ${vitals.bp?`<div class="vbox"><div class="vl">BP</div><div class="vv">${vitals.bp}</div></div>`:''}
      ${vitals.pulse?`<div class="vbox"><div class="vl">Pulse</div><div class="vv">${vitals.pulse} bpm</div></div>`:''}
      ${vitals.temp?`<div class="vbox"><div class="vl">Temp</div><div class="vv">${vitals.temp}°F</div></div>`:''}
      ${vitals.spo2?`<div class="vbox"><div class="vl">SpO₂</div><div class="vv">${vitals.spo2}%</div></div>`:''}
      ${vitals.weight?`<div class="vbox"><div class="vl">Weight</div><div class="vv">${vitals.weight} kg</div></div>`:''}
      ${vitals.bmi?`<div class="vbox"><div class="vl">BMI</div><div class="vv">${vitals.bmi}</div></div>`:''}
    </div>`:''}
    <div class="section-title">Diagnosis</div>
    <p style="font-weight:600;color:#1a3a5c;margin:4px 0 8px">${rx.diagnosis}</p>
    ${rx.complaints?`<div class="section-title">Complaints</div><p style="margin:4px 0 8px">${rx.complaints}</p>`:''}
    ${medsHtml?`
    <div class="section-title">Medications</div>
    <table><thead><tr><th>Medicine</th><th>Dosage</th><th>Frequency</th><th>Duration</th></tr></thead>
    <tbody>${medsHtml}</tbody></table>`:''}
    ${rx.advice?`<div class="section-title">Advice</div><p style="margin:4px 0">${rx.advice}</p>`:''}
    <div class="footer">
      <div>Rx ID: ${rx.id} &nbsp;|&nbsp; ${rx.date}</div>
      <div class="sign-line">${rx.doctorName}<br/>Doctor</div>
    </div>
    <script>window.print()<\/script>
  </body></html>`);
  win.document.close();
}

function saveConsultLab(){
  if(!_activeConsultToken){ toast('No patient selected','error'); return; }
  const testVal = document.getElementById('c-labtest').value;
  const doc = db.doctors.find(d=>d.name===currentUser?.name);
  const lab = {
    id:'L-'+(++db.labCounter),
    patientId: _activeConsultToken.patientId,
    patientName: _activeConsultToken.patientName,
    test: testVal,
    doctorName: currentUser?.name||'Doctor',
    priority: document.getElementById('c-labpriority').value,
    notes: document.getElementById('c-labnotes').value,
    status:'New', result:'',
    date: new Date().toLocaleDateString('en-IN')
  };
  db.labOrders.push(lab);
  addNotif('🧪','Lab order '+lab.id+' for '+lab.patientName,'just now');
  renderConsultLabOrders(_activeConsultToken.patientId);
  refreshAll();
  toast('🧪 Lab test ordered: '+testVal);
}

function renderConsultLabOrders(patientId){
  const el=document.getElementById('cLabOrdersList'); if(!el) return;
  const orders=db.labOrders.filter(l=>l.patientId===patientId);
  if(!orders.length){ el.innerHTML='<div style="color:var(--muted);font-size:.82rem">No lab orders yet for this patient.</div>'; return; }
  el.innerHTML='<div style="font-size:.76rem;color:var(--muted);font-weight:600;margin-bottom:6px;text-transform:uppercase;letter-spacing:.7px">Lab Orders for This Patient</div>'+
    orders.map(l=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:var(--surface2);border-radius:8px;margin-bottom:6px;font-size:.82rem">
      <span><strong>${l.test}</strong> <span class="badge badge-${l.priority==='STAT'?'red':l.priority==='Urgent'?'orange':'blue'}" style="font-size:.65rem">${l.priority}</span></span>
      <span class="${l.status==='Done'?'lab-status-done':l.status==='Processing'?'lab-status-processing':'lab-status-new'}">${l.status}</span>
    </div>`).join('');
}

function renderConsultHistory(patientId){
  const el=document.getElementById('cHistoryContent'); if(!el) return;
  const pat=db.patients.find(p=>p.id===patientId);
  const appts=db.appointments.filter(a=>a.patientId===patientId);
  const rxs=db.prescriptions.filter(r=>r.patientId===patientId);
  const labs=db.labOrders.filter(l=>l.patientId===patientId);

  if(!appts.length && !rxs.length && !labs.length){
    el.innerHTML='<div style="text-align:center;padding:24px;color:var(--muted)">No previous records found</div>';
    return;
  }

  let html='';
  if(pat){ html+=`<div style="background:var(--surface2);border-radius:10px;padding:12px 14px;margin-bottom:14px;font-size:.83rem">
    <strong>${pat.fname} ${pat.lname}</strong> · ${calcAge(pat.dob)} · ${pat.gender||'—'} · ${pat.blood||'—'}
    ${pat.allergies?`<br/><span style="color:var(--danger);font-size:.76rem">⚠️ Allergies: ${pat.allergies}</span>`:''}
  </div>`; }

  if(rxs.length){ html+=`<div style="font-weight:700;font-size:.78rem;color:var(--muted);text-transform:uppercase;letter-spacing:.7px;margin-bottom:8px">Previous Prescriptions</div>`;
    html+=rxs.slice().reverse().map(r=>`<div style="border-left:3px solid var(--accent2);padding:8px 12px;background:var(--surface2);border-radius:0 8px 8px 0;margin-bottom:8px;font-size:.82rem">
      <strong>${r.diagnosis}</strong> <span style="color:var(--muted);font-size:.75rem">— ${r.date}</span>
      <div style="color:var(--muted);font-size:.76rem;margin-top:2px">${(r.medicines||[]).map(m=>m.name).join(', ')||'—'}</div>
    </div>`).join(''); }

  if(labs.length){ html+=`<div style="font-weight:700;font-size:.78rem;color:var(--muted);text-transform:uppercase;letter-spacing:.7px;margin:10px 0 8px">Lab History</div>`;
    html+=labs.slice().reverse().map(l=>`<div style="display:flex;justify-content:space-between;font-size:.8rem;padding:6px 10px;background:var(--surface2);border-radius:7px;margin-bottom:5px">
      <span>${l.test} <span style="color:var(--muted);font-size:.72rem">· ${l.date}</span></span>
      <span>${l.result||l.status}</span>
    </div>`).join(''); }

  el.innerHTML = html;
}

function markConsultDone(){
  if(!_activeConsultToken){ toast('No active patient','error'); return; }
  if(!_consultSavedRx){ toast('Please save prescription before marking done','error'); switchConsultTab('ctab-rx',document.querySelectorAll('.consult-tab')[1]); return; }
  _activeConsultToken.status='Done';
  const appt=db.appointments.find(a=>a.id===_activeConsultToken.apptId);
  if(appt) appt.status='Completed';
  addNotif('✅','Consultation done for '+_activeConsultToken.patientName,'just now');
  refreshAll();
  _activeConsultToken=null; _activeConsultPatient=null; _consultSavedRx=null;
  document.getElementById('consultPanel').style.display='none';
  document.getElementById('consultEmptyState').style.display='flex';
  toast('✅ Consultation complete!','success');
}



/* ═══════════════════════════════════════════════
   HEALTH CHATBOT (Claude AI)
═══════════════════════════════════════════════ */
let _cbHistory = [];
let _cbTyping = false;

function cbInit(){
  _cbHistory = [];
  const box = document.getElementById('cbMessages');
  if(!box) return;
  box.innerHTML = '';
  const pat = currentUser ? currentUser.name : 'there';
  cbAddBotMsg(`Hello ${pat.split(' ')[0]}! 👋 I'm your **MedEase Health Assistant**. I can help you with:

• Booking & managing appointments
• Understanding your reports & prescriptions  
• Hospital departments & doctors
• General health questions
• Emergency guidance

What can I help you with today?`, [
    'Book an appointment','My lab reports','OPD timings','Speak to a doctor'
  ]);
}

function cbAddUserMsg(text){
  const box = document.getElementById('cbMessages');
  if(!box) return;
  const el = document.createElement('div');
  el.className = 'cb-msg user';
  el.innerHTML = `<div class="cb-msg-avatar" style="background:var(--primary);color:#fff">👤</div>
    <div class="cb-bubble">${escHtml(text)}</div>`;
  box.appendChild(el);
  box.scrollTop = box.scrollHeight;
}

function cbShowTyping(){
  const box = document.getElementById('cbMessages');
  if(!box) return;
  const el = document.createElement('div');
  el.className = 'cb-msg bot'; el.id = 'cbTypingIndicator';
  el.innerHTML = `<div class="cb-msg-avatar">🤖</div>
    <div class="cb-typing"><div class="cb-dot"></div><div class="cb-dot"></div><div class="cb-dot"></div></div>`;
  box.appendChild(el);
  box.scrollTop = box.scrollHeight;
}

function cbRemoveTyping(){
  document.getElementById('cbTypingIndicator')?.remove();
}

function cbAddBotMsg(text, chips=[]){
  const box = document.getElementById('cbMessages');
  if(!box) return;
  // Convert **bold** markdown
  let formatted = escHtml(text)
    .replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')
    .replace(/\n/g,'<br/>');
  const el = document.createElement('div');
  el.className = 'cb-msg bot';
  let chipsHtml = '';
  if(chips.length){
    chipsHtml = `<div class="cb-chips">${chips.map(c=>`<span class="cb-chip" onclick="cbQuickTopic('${c}')">${c}</span>`).join('')}</div>`;
  }
  el.innerHTML = `<div class="cb-msg-avatar">🤖</div>
    <div><div class="cb-bubble">${formatted}</div>${chipsHtml}</div>`;
  box.appendChild(el);
  box.scrollTop = box.scrollHeight;
}

function escHtml(s){
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function cbSend(){
  const inp = document.getElementById('cbInput');
  if(!inp || _cbTyping) return;
  const msg = inp.value.trim();
  if(!msg) return;
  inp.value = '';
  cbChat(msg);
}

function cbQuickTopic(text){
  cbChat(text);
}

function cbChat(userMsg){
  if(_cbTyping) return;
  _cbTyping = true;
  cbAddUserMsg(userMsg);
  cbShowTyping();

  // Simulate typing delay for natural feel
  const delay = 600 + Math.random() * 800;
  setTimeout(()=>{
    cbRemoveTyping();
    const reply = cbGetReply(userMsg.toLowerCase().trim());
    cbAddBotMsg(reply.text, reply.chips||[]);
    _cbTyping = false;
  }, delay);
}

function cbGetReply(msg){
  const pat = db.patients.find(p=>p.id===currentUser?.patientId);
  const name = pat ? pat.fname : (currentUser?.name?.split(' ')[0] || 'there');
  const myAppts = pat ? db.appointments.filter(a=>a.patientId===pat.id&&a.status==='Confirmed') : [];
  const myLabs  = pat ? db.labOrders.filter(l=>l.patientId===pat.id) : [];
  const myRx    = pat ? db.prescriptions.filter(r=>r.patientId===pat.id) : [];
  const depts   = [...new Set(db.doctors.map(d=>d.dept))];

  // ── GREETINGS ──
  if(/^(hi|hello|hey|good morning|good afternoon|good evening|namaste|hii|helo)/.test(msg))
    return {text:`Hello ${name}! 👋 Welcome to **MedEase Hospital Assistant**.\n\nI can help you with appointments, lab reports, prescriptions, hospital timings, and general health questions.\n\nWhat can I help you with today?`, chips:['Book appointment','My lab reports','OPD timings','My prescriptions']};

  if(/thank|thanks|thank you|dhanyawad/.test(msg))
    return {text:`You're welcome, ${name}! 😊 Is there anything else I can help you with?`, chips:['Book appointment','OPD timings','Emergency help']};

  if(/bye|goodbye|ok bye|take care/.test(msg))
    return {text:`Take care, ${name}! 🌟 Stay healthy. Don't hesitate to reach out anytime you need help.`};

  // ── APPOINTMENTS ──
  if(/book|schedule|appointment|appoint|opd slot|fix appointment/.test(msg)){
    return {text:`To book an appointment at MedEase:\n\n1️⃣ Click **"Appointments"** in the sidebar\n2️⃣ Enter your name and select department\n3️⃣ Choose your doctor, date and time slot\n4️⃣ Pay the consultation fee via **UPI**\n5️⃣ Your token is issued automatically ✅\n\nOPD is open **Monday–Saturday, 9 AM – 5 PM**.`, chips:['OPD timings','Payment options','Available departments']};
  }

  if(/my appointment|upcoming appointment|check appointment|view appointment/.test(msg)){
    if(myAppts.length){
      const list = myAppts.slice(0,3).map(a=>`• ${a.doctorName} — ${a.dept} on ${a.date} at ${a.time}`).join('\n');
      return {text:`${name}, here are your upcoming appointments:\n\n${list}\n\nYou can view all details in **My Records → Appointments** section.`, chips:['Cancel appointment','Book another','My lab reports']};
    }
    return {text:`${name}, you have **no upcoming appointments** right now.\n\nWould you like to book one?`, chips:['Book appointment','Available departments','OPD timings']};
  }

  if(/cancel appointment|reschedule/.test(msg))
    return {text:`To cancel or reschedule your appointment:\n\n1️⃣ Go to **"Appointments"** section\n2️⃣ Find your appointment\n3️⃣ Click the action button\n\nFor urgent changes please call our reception directly.`, chips:['Book appointment','Contact hospital']};

  // ── LAB REPORTS ──
  if(/lab report|test result|blood test result|report ready|my report|test status/.test(msg)){
    if(myLabs.length){
      const pending = myLabs.filter(l=>l.status!=='Done');
      const done    = myLabs.filter(l=>l.status==='Done');
      let txt = `${name}, here's your lab summary:\n\n`;
      if(done.length)    txt += `✅ **Completed:** ${done.map(l=>l.test).join(', ')}\n`;
      if(pending.length) txt += `⏳ **Pending:** ${pending.map(l=>l.test+' ('+l.status+')').join(', ')}\n`;
      txt += `\nView full reports in **My Records → Lab Results**.`;
      return {text:txt, chips:['My prescriptions','Book appointment']};
    }
    return {text:`${name}, you have **no lab orders** on record yet.\n\nIf your doctor ordered a test, visit the Lab section or check with reception.`, chips:['Book appointment','Speak to doctor']};
  }

  if(/how.*prepare.*test|fasting|before blood test|before lab/.test(msg))
    return {text:`**How to prepare for common lab tests:**\n\n🩸 **Fasting Blood Sugar** — Fast for 8–10 hours (water allowed)\n🩸 **Lipid Profile** — Fast for 12 hours\n🩸 **CBC / KFT / LFT** — No fasting needed\n🧪 **Urine Test** — Collect first morning sample\n\nYour doctor will give specific instructions when ordering the test.`, chips:['Book appointment','Lab timings','My lab reports']};

  // ── PRESCRIPTIONS ──
  if(/prescription|medicine|my medicine|my rx|drug|tablet|dosage/.test(msg)){
    if(myRx.length){
      const latest = myRx[myRx.length-1];
      const meds = (latest.medicines||[]).map(m=>`• ${m.name} — ${m.dose} ${m.freq} for ${m.dur}`).join('\n') || 'No medicines listed';
      return {text:`${name}, your latest prescription:\n\n**Diagnosis:** ${latest.diagnosis}\n**Date:** ${latest.date}\n\n**Medicines:**\n${meds}\n\nView all prescriptions in **My Records → Prescriptions**.`, chips:['My lab reports','Book follow-up','Speak to doctor']};
    }
    return {text:`${name}, you have **no prescriptions** on record yet.\n\nAfter your consultation the doctor will add your prescription here automatically.`, chips:['Book appointment','Speak to doctor']};
  }

  // ── OPD TIMINGS ──
  if(/timing|time|hour|opd time|open|when.*open|schedule|working hour/.test(msg))
    return {text:`**MedEase Hospital Timings:**\n\n🏥 **OPD:** Monday–Saturday, 9:00 AM – 5:00 PM\n🚨 **Emergency:** 24 hours, 7 days a week\n🧪 **Lab:** Monday–Saturday, 8:00 AM – 4:00 PM\n💊 **Pharmacy:** Monday–Saturday, 8:00 AM – 8:00 PM\n\n📍 Location: Pune, Maharashtra`, chips:['Book appointment','Available departments','Emergency help']};

  // ── DEPARTMENTS & DOCTORS ──
  if(/department|speciality|specialist|which doctor|available doctor|which dept/.test(msg)){
    const deptList = depts.length ? depts.map(d=>`• ${d}`).join('\n') : '• Cardiology\n• Neurology\n• Pediatrics\n• Orthopedics\n• Gynecology\n• Dermatology\n• ENT\n• Ophthalmology';
    return {text:`**MedEase Hospital Departments:**\n\n${deptList}\n\nAll departments are available **Monday–Saturday**. Book an appointment to see a specialist.`, chips:['Book appointment','OPD timings','Speak to doctor']};
  }

  if(/cardiology|heart|chest pain|cardiac/.test(msg))
    return {text:`Our **Cardiology** department specializes in heart conditions including hypertension, chest pain, irregular heartbeat, and heart disease.\n\n👨‍⚕️ **Dr. Kavitha Rao** — MBBS, MD, DM (15 years experience)\n⏰ Mon–Fri, 9 AM – 1 PM\n\n⚠️ If you have **severe chest pain**, please call **108** immediately.`, chips:['Book appointment','Emergency help','OPD timings']};

  if(/neurology|brain|headache|migraine|nerve/.test(msg))
    return {text:`Our **Neurology** department handles brain, nerve and spine conditions including migraines, epilepsy, stroke, and nerve pain.\n\n👨‍⚕️ **Dr. Suresh Patel** — MBBS, MD, DM (12 years experience)\n⏰ Mon–Wed, 10 AM – 2 PM\n\nBook an appointment for a consultation.`, chips:['Book appointment','OPD timings']};

  if(/pediatric|child|baby|kid|children/.test(msg))
    return {text:`Our **Pediatrics** department provides care for infants, children and teenagers.\n\n👩‍⚕️ **Dr. Ananya Nair** — MBBS, MD (8 years experience)\n⏰ Tue–Sat, 9 AM – 12 PM\n\nFor **high fever in children**, please visit as soon as possible.`, chips:['Book appointment','Emergency help']};

  if(/orthopedic|bone|joint|knee|back pain|fracture/.test(msg))
    return {text:`Our **Orthopedics** department handles bone, joint, and muscle conditions including fractures, knee pain, back pain, and sports injuries.\n\n👨‍⚕️ **Dr. Rajan Iyer** — MBBS, MS (20 years experience)\n⏰ Mon–Fri, 2 PM – 5 PM`, chips:['Book appointment','OPD timings']};

  if(/gynecology|gynae|women|periods|pregnancy|menstrual/.test(msg))
    return {text:`Our **Gynecology** department provides women's health services including prenatal care, menstrual issues, and routine checkups.\n\n👩‍⚕️ **Dr. Meena Joshi** — MBBS, MD, DGO (10 years experience)\n⏰ Mon–Sat, 9 AM – 1 PM`, chips:['Book appointment','OPD timings']};

  // ── PAYMENT ──
  if(/payment|pay|fee|charge|cost|upi|how much/.test(msg))
    return {text:`**MedEase Payment Information:**\n\n💳 We accept **UPI payments only**\n📱 UPI ID: **barhate.komal12@okaxis**\n\n**Consultation Fees:**\n• New Visit — ₹500–₹600\n• Follow-Up — ₹300–₹360\n• Emergency — ₹750–₹900\n\nPayment is collected at the time of appointment booking.`, chips:['Book appointment','OPD timings']};

  // ── EMERGENCY ──
  if(/emergency|urgent|serious|ambulance|critical|stroke|unconscious|accident|can't breathe|difficulty breathing/.test(msg))
    return {text:`🚨 **EMERGENCY HELP**\n\nIf this is a medical emergency:\n\n📞 **Call 108** (Free ambulance service)\n📞 **Call 112** (National emergency)\n🏥 **MedEase Emergency** is open **24/7**\n\n**Go to emergency immediately if you have:**\n• Severe chest pain\n• Difficulty breathing\n• Stroke symptoms (face drooping, arm weakness)\n• Unconsciousness\n• Severe bleeding\n\n⚠️ Do NOT wait — call 108 now!`, chips:['Hospital location','Contact hospital']};

  // ── DOCUMENTS ──
  if(/document|bring|what to carry|id proof|aadhaar|insurance/.test(msg))
    return {text:`**Documents to bring for OPD visit:**\n\n📋 Aadhaar Card or any photo ID\n📋 Previous medical records (if any)\n📋 Previous prescriptions\n📋 Lab reports (if any)\n📋 Health insurance card (if applicable)\n\nFor **first-time patients** — just your ID is enough to get registered.`, chips:['Book appointment','OPD timings']};

  // ── SPEAK TO DOCTOR ──
  if(/speak.*doctor|talk.*doctor|consult|doctor available|need doctor/.test(msg))
    return {text:`To speak with a doctor at MedEase:\n\n1️⃣ Book an appointment in the **Appointments** section\n2️⃣ You can also use the **Messages** section to chat with your assigned doctor\n3️⃣ For emergencies, visit directly — we are open **24/7**\n\nWhich department are you looking for?`, chips:['Cardiology','Neurology','Pediatrics','Orthopedics']};

  // ── HEALTH TIPS ──
  if(/health tip|stay healthy|diet|exercise|fitness|wellness/.test(msg))
    return {text:`**General Health Tips from MedEase:**\n\n🥗 Eat a balanced diet with fruits and vegetables\n💧 Drink 8–10 glasses of water daily\n🏃 Exercise for at least 30 minutes a day\n😴 Sleep 7–8 hours every night\n🚭 Avoid smoking and limit alcohol\n🩺 Get regular health checkups\n\nFor personalised advice, consult our doctors!`, chips:['Book appointment','Available departments']};

  if(/fever|temperature|cold|cough|flu/.test(msg))
    return {text:`For **fever, cold or cough**, here are some general tips:\n\n🌡️ Rest and stay hydrated\n💊 Paracetamol can help reduce fever\n🍋 Warm water with honey and lemon soothes throat\n\nIf fever is above **102°F** or lasts more than **3 days**, please consult our **General Medicine** or **Pediatrics** (for children) department.\n\nShould I help you book an appointment?`, chips:['Book appointment','OPD timings','Emergency help']};

  if(/diabetes|sugar|blood sugar|insulin/.test(msg))
    return {text:`For **diabetes management**, our doctors recommend:\n\n• Regular blood sugar monitoring\n• Low-sugar, high-fibre diet\n• Regular exercise\n• Taking medicines on time\n• Regular HbA1c tests every 3 months\n\nOur **General Medicine** department specialises in diabetes care. A doctor would be best placed to advise on your specific case.`, chips:['Book appointment','Lab tests','OPD timings']};

  if(/blood pressure|hypertension|bp/.test(msg))
    return {text:`For **blood pressure** concerns:\n\n• Normal BP is around 120/80 mmHg\n• Reduce salt intake\n• Exercise regularly\n• Avoid stress\n• Take medicines regularly if prescribed\n\nOur **Cardiology** department handles hypertension. Please consult Dr. Kavitha Rao for a proper evaluation.`, chips:['Book appointment','Cardiology','OPD timings']};

  // ── HOSPITAL INFO ──
  if(/location|address|where|hospital address|how to reach|directions/.test(msg))
    return {text:`📍 **MedEase Multi-Speciality Hospital**\nPune, Maharashtra, India\n\n🏥 **OPD:** Mon–Sat, 9 AM – 5 PM\n🚨 **Emergency:** 24/7\n\nFor exact directions, search **"MedEase Hospital Pune"** on Google Maps.`, chips:['OPD timings','Book appointment','Emergency help']};

  if(/contact|phone|number|call hospital/.test(msg))
    return {text:`📞 **MedEase Hospital Contact:**\n\n• **Reception:** 020-XXXX-XXXX\n• **Emergency:** 108 (free)\n• **Email:** info@medease.hospital\n• **OPD Timings:** Mon–Sat, 9 AM – 5 PM\n\nYou can also use the **Messages** section to chat with your doctor directly.`, chips:['OPD timings','Book appointment','Emergency help']};

  // ── DEFAULT FALLBACK ──
  return {text:`I'm sorry ${name}, I didn't quite understand that. 😊\n\nI can help you with:\n• **Appointments** — booking, viewing, cancelling\n• **Lab reports** — status and results\n• **Prescriptions** — medicines and dosage\n• **Hospital info** — timings, departments, doctors\n• **Health tips** — general wellness advice\n\nCould you rephrase your question?`, chips:['Book appointment','OPD timings','My lab reports','Emergency help']};
}

/* ═══════════════════════════════════════════════
   MY RECORDS (PATIENT PORTAL)
═══════════════════════════════════════════════ */
function switchRecTab(panelId, btn){
  document.querySelectorAll('.rec-panel').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.rec-tab').forEach(b=>b.classList.remove('active'));
  document.getElementById(panelId).classList.add('active');
  btn.classList.add('active');
}

function renderMyRecords(patientId){
  if(!patientId) return;

  // Helper — match patient by id or patient_id field
  const matchPat = (obj) => obj.patientId===patientId || obj.patient_id===patientId;

  // Appointments
  const myAppts = db.appointments.filter(matchPat);
  const mAt = document.getElementById('myApptTbody');
  if(mAt){
    mAt.innerHTML = myAppts.length ? [...myAppts].reverse().map(a=>`<tr>
      <td><code style="font-size:.72rem">${a.id}</code></td>
      <td>${a.doctorName||a.doctor_name||'—'}</td>
      <td>${a.dept||'—'}</td>
      <td>${a.date?new Date(a.date).toLocaleDateString('en-IN'):'—'}</td>
      <td>${a.time||'—'}</td>
      <td><span class="badge badge-blue">${a.type||'—'}</span></td>
      <td style="font-weight:600;color:var(--accent)">${a.fee?'₹'+a.fee:'—'}</td>
      <td>${(a.payMode||a.pay_mode)?`<span class="badge ${(a.payStatus||a.pay_status)==='Paid'?'badge-green':'badge-warn'}">${a.payMode||a.pay_mode}</span>`:'—'}</td>
      <td><span class="badge ${a.status==='Confirmed'?'badge-green':a.status==='Cancelled'?'badge-red':a.status==='Completed'?'badge-blue':'badge-warn'}">${a.status||'—'}</span></td>
    </tr>`).join('')
    : '<tr><td colspan="9" style="color:var(--muted);text-align:center;padding:18px">No appointments yet</td></tr>';
  }

  // Bills
  const myBills = db.bills.filter(matchPat);
  const mBt = document.getElementById('myBillTbody');
  if(mBt){
    mBt.innerHTML = myBills.length ? [...myBills].reverse().map(b=>`<tr>
      <td><code style="font-size:.72rem">${b.id}</code></td>
      <td>${b.date||'—'}</td>
      <td style="font-weight:600;color:var(--accent)">₹${parseFloat(b.amount||0).toFixed(0)}</td>
      <td><span class="badge badge-blue">${b.mode||b.pay_mode||'—'}</span></td>
      <td style="font-size:.76rem;color:var(--muted)">${b.txnId||b.txn_id||'—'}</td>
      <td><span class="badge ${b.status==='Paid'?'badge-green':'badge-warn'}">${b.status}</span></td>
    </tr>`).join('')
    : '<tr><td colspan="6" style="color:var(--muted);text-align:center;padding:18px">No bills yet</td></tr>';
    const totalPaid = myBills.filter(b=>b.status==='Paid').reduce((s,b)=>s+parseFloat(b.amount||0),0);
    const tpe = document.getElementById('myTotalPaid'); if(tpe) tpe.textContent='₹'+totalPaid.toFixed(0);
  }

  // Prescriptions
  const myRx = db.prescriptions.filter(matchPat);
  const mRt = document.getElementById('myRxTbody');
  if(mRt){
    mRt.innerHTML = myRx.length ? myRx.reverse().map(r=>`<tr>
      <td><code style="font-size:.72rem">${r.id}</code></td>
      <td>${r.doctorName}</td>
      <td>${r.diagnosis||'—'}</td>
      <td>${r.date}</td>
      <td>${r.nextVisit?new Date(r.nextVisit).toLocaleDateString('en-IN'):'—'}</td>
    </tr>`).join('')
    : '<tr><td colspan="5" style="color:var(--muted);text-align:center;padding:18px">No prescriptions yet</td></tr>';
  }

  // Lab Results
  const myLabs = db.labOrders.filter(matchPat);
  const mLt = document.getElementById('myLabTbody');
  if(mLt){
    mLt.innerHTML = myLabs.length ? myLabs.reverse().map(l=>`<tr>
      <td><code style="font-size:.72rem">${l.id}</code></td>
      <td>${l.test}</td><td>${l.doctorName}</td>
      <td><span class="badge ${l.priority==='STAT'?'badge-red':l.priority==='Urgent'?'badge-orange':'badge-blue'}">${l.priority}</span></td>
      <td>${l.date}</td>
      <td><span class="${l.status==='Done'?'lab-status-done':l.status==='Processing'?'lab-status-processing':'lab-status-new'}">${l.status}</span></td>
      <td style="font-size:.82rem;color:var(--muted)">${l.result||'Awaiting…'}</td>
    </tr>`).join('')
    : '<tr><td colspan="7" style="color:var(--muted);text-align:center;padding:18px">No lab orders yet</td></tr>';
  }

  // Timeline
  const tl = document.getElementById('myTimeline');
  if(tl){
    const items=[];
    db.appointments.filter(matchPat).forEach(a=>items.push({date:a.date,title:`Appointment — ${a.dept||'OPD'}`,desc:`${a.doctorName||a.doctor_name||'Doctor'} · ${a.type||'Visit'} · ${a.status} · ${a.fee?'₹'+a.fee+' paid':'No fee'}`,color:'blue'}));
    db.prescriptions.filter(matchPat).forEach(r=>items.push({date:r.date,title:`Prescription — ${r.diagnosis||'General'}`,desc:`By ${r.doctorName||r.doctor_name||'Doctor'}`,color:'green'}));
    db.labOrders.filter(matchPat).forEach(l=>items.push({date:l.date||l.ordered_at,title:`Lab — ${l.test}`,desc:`Status: ${l.status}${l.result?' · '+l.result.substring(0,40):''}`,color:l.status==='Done'?'green':'warn'}));
    db.bills.filter(matchPat).forEach(b=>items.push({date:b.date,title:`Bill ${b.id} — ₹${parseFloat(b.amount||0).toFixed(0)}`,desc:`${b.mode||b.pay_mode||'UPI'} · ${b.status}`,color:'orange'}));
    items.sort((a,b)=>new Date(b.date)-new Date(a.date));
    tl.innerHTML = items.length ? items.map(i=>`<div class="tl-item"><div class="tl-dot ${i.color}"></div><div class="tl-date">${i.date?new Date(i.date).toLocaleDateString('en-IN'):''}</div><div class="tl-title">${i.title}</div><div class="tl-desc">${i.desc}</div></div>`).join('')
    : '<div style="color:var(--muted);font-size:.86rem">No history yet.</div>';
  }
}

/* ═══════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded',()=>{
  const today=new Date().toISOString().split('T')[0];
  ['appt-date','rx-date','rx-nextvisit','ph-expiry'].forEach(id=>{const el=document.getElementById(id);if(el)el.value=today;});
  seedData();
});
