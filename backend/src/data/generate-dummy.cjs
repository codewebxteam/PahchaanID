const fs = require('fs');

// --- Realistic Indian Data ---
const MALE_FIRST = ["Aarav", "Vihaan", "Arjun", "Sai", "Reyansh", "Krishna", "Ishaan", "Shaurya", "Atharva", "Kabir", "Rudra", "Aryan", "Kian", "Rohan", "Vikram", "Amit", "Rajat", "Manish", "Deepak", "Sunil"];
const FEMALE_FIRST = ["Saanvi", "Aanya", "Aadhya", "Aaradhya", "Ananya", "Pari", "Navya", "Mira", "Myra", "Kavya", "Diya", "Sara", "Anika", "Shanaya", "Priya", "Sneha", "Neha", "Pooja", "Ritu", "Sakshi"];
const SURNAMES = ["Sharma", "Verma", "Gupta", "Singh", "Patel", "Kumar", "Das", "Bose", "Jain", "Mehta", "Reddy", "Nair", "Iyer", "Rao", "Chauhan", "Mishra", "Tiwari", "Yadav", "Pandey", "Saxena"];
const FATHER_FIRST = ["Suresh", "Ramesh", "Naresh", "Dinesh", "Mahesh", "Rajesh", "Kamlesh", "Mukesh", "Rakesh", "Sanjay", "Vijay", "Ajay", "Manoj", "Anil", "Pramod"];

const CITIES_STATES = [
  { city: "Mumbai", state: "Maharashtra", pin: "400" },
  { city: "Delhi", state: "Delhi", pin: "110" },
  { city: "Bangalore", state: "Karnataka", pin: "560" },
  { city: "Hyderabad", state: "Telangana", pin: "500" },
  { city: "Ahmedabad", state: "Gujarat", pin: "380" },
  { city: "Chennai", state: "Tamil Nadu", pin: "600" },
  { city: "Kolkata", state: "West Bengal", pin: "700" },
  { city: "Pune", state: "Maharashtra", pin: "411" },
  { city: "Jaipur", state: "Rajasthan", pin: "302" },
  { city: "Lucknow", state: "Uttar Pradesh", pin: "226" },
  { city: "Indore", state: "Madhya Pradesh", pin: "452" },
  { city: "Bhopal", state: "Madhya Pradesh", pin: "462" },
  { city: "Nagpur", state: "Maharashtra", pin: "440" },
  { city: "Surat", state: "Gujarat", pin: "395" },
  { city: "Chandigarh", state: "Punjab", pin: "160" },
];

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const VEHICLE_CLASSES = ["LMV", "MCWG", "LMV-NT", "MCWG, LMV"];
const RTO_CODES = ["MH-01", "DL-01", "KA-01", "TN-01", "GJ-01", "RJ-14", "UP-32", "WB-01", "MP-09", "AP-28"];
const PASSPORT_OFFICES = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune", "Lucknow"];

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function makeDOB(age) {
  const y = 2026 - age;
  const m = String(rand(1, 12)).padStart(2, '0');
  const d = String(rand(1, 28)).padStart(2, '0');
  return `${d}/${m}/${y}`;
}

function makeAddress() {
  const loc = pick(CITIES_STATES);
  const houseNo = rand(1, 500);
  const streets = ["MG Road", "Station Road", "Gandhi Nagar", "Nehru Colony", "Shastri Nagar", "Laxmi Nagar", "Vikas Puri", "Rajendra Nagar", "Civil Lines", "Sadar Bazaar"];
  return {
    full: `${houseNo}, ${pick(streets)}, ${loc.city}, ${loc.state} - ${loc.pin}${String(rand(1,99)).padStart(3,'0')}`,
    city: loc.city,
    state: loc.state,
    pincode: `${loc.pin}${String(rand(1,99)).padStart(3,'0')}`
  };
}

function makeAadhaarNumber() {
  return String(rand(2000,9999)) + String(rand(1000,9999)) + String(rand(1000,9999));
}
function makePanNumber() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return letters[rand(0,25)] + letters[rand(0,25)] + letters[rand(0,25)] + "P" + letters[rand(0,25)] + String(rand(1000,9999)) + letters[rand(0,25)];
}
function makeVoterID() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return letters[rand(0,25)] + letters[rand(0,25)] + letters[rand(0,25)] + String(rand(1000000,9999999));
}
function makePassportNumber() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return letters[rand(0,25)] + String(rand(1000000,9999999));
}
function makeDLNumber() {
  const rto = pick(RTO_CODES);
  return `${rto}-${String(rand(2010,2024))}${String(rand(1000000,9999999))}`;
}
function makeIssueDate(age) {
  const issueYear = 2026 - rand(1, Math.min(age - 18, 15));
  return `${String(rand(1,28)).padStart(2,'0')}/${String(rand(1,12)).padStart(2,'0')}/${issueYear}`;
}
function makeExpiryDate(issueDate, yearsValid) {
  const parts = issueDate.split('/');
  const expiryYear = parseInt(parts[2]) + yearsValid;
  return `${parts[0]}/${parts[1]}/${expiryYear}`;
}

let allIds = {};
let avatarIdx = 0;

// ========== AADHAAR (Minors allowed) ==========
for (let i = 0; i < 10; i++) {
  const isMale = Math.random() > 0.45;
  const gender = isMale ? "Male" : "Female";
  const firstName = pick(isMale ? MALE_FIRST : FEMALE_FIRST);
  const surname = pick(SURNAMES);
  const name = `${firstName} ${surname}`;
  const fatherName = `${pick(FATHER_FIRST)} ${surname}`;
  // 40% chance minor for Aadhaar
  const isMinor = Math.random() < 0.4;
  const age = isMinor ? rand(5, 17) : rand(18, 65);
  const dob = makeDOB(age);
  const addr = makeAddress();
  const idNumber = makeAadhaarNumber();
  avatarIdx++;

  allIds[idNumber] = {
    idNumber,
    idType: "AADHAAR",
    name,
    fatherName,
    dob,
    age,
    gender,
    address: addr.full,
    district: addr.city,
    state: addr.state,
    pincode: addr.pincode,
    photoUrl: `https://i.pravatar.cc/150?img=${avatarIdx}`,
    issueDate: null,
    isMinor: age < 18
  };
}

// ========== PAN (Minors allowed but rare, 20%) ==========
for (let i = 0; i < 10; i++) {
  const isMale = Math.random() > 0.45;
  const gender = isMale ? "Male" : "Female";
  const firstName = pick(isMale ? MALE_FIRST : FEMALE_FIRST);
  const surname = pick(SURNAMES);
  const name = `${firstName} ${surname}`;
  const fatherName = `${pick(FATHER_FIRST)} ${surname}`;
  const isMinor = Math.random() < 0.2;
  const age = isMinor ? rand(10, 17) : rand(18, 65);
  const dob = makeDOB(age);
  const addr = makeAddress();
  const idNumber = makePanNumber();

  allIds[idNumber] = {
    idNumber,
    idType: "PAN",
    name,
    fatherName,
    dob,
    age,
    gender,
    address: addr.full,
    district: addr.city,
    state: addr.state,
    pincode: addr.pincode,
    photoUrl: `https://i.pravatar.cc/150?img=${++avatarIdx}`,
    isMinor: age < 18
  };
}

// ========== VOTER_ID (18+ ONLY - no minors) ==========
for (let i = 0; i < 10; i++) {
  const isMale = Math.random() > 0.45;
  const gender = isMale ? "Male" : "Female";
  const firstName = pick(isMale ? MALE_FIRST : FEMALE_FIRST);
  const surname = pick(SURNAMES);
  const name = `${firstName} ${surname}`;
  const fatherName = `${pick(FATHER_FIRST)} ${surname}`;
  const age = rand(18, 70); // ALWAYS 18+
  const dob = makeDOB(age);
  const addr = makeAddress();
  const idNumber = makeVoterID();

  allIds[idNumber] = {
    idNumber,
    idType: "VOTER_ID",
    name,
    fatherName,
    dob,
    age,
    gender,
    address: addr.full,
    district: addr.city,
    state: addr.state,
    pincode: addr.pincode,
    constituency: `${addr.city} ${rand(1,5)} - Ward ${rand(1,50)}`,
    photoUrl: `https://i.pravatar.cc/150?img=${++avatarIdx}`,
    isMinor: false
  };
}

// ========== PASSPORT (Minors allowed, 20%) ==========
for (let i = 0; i < 10; i++) {
  const isMale = Math.random() > 0.45;
  const gender = isMale ? "Male" : "Female";
  const firstName = pick(isMale ? MALE_FIRST : FEMALE_FIRST);
  const surname = pick(SURNAMES);
  const name = `${firstName} ${surname}`;
  const fatherName = `${pick(FATHER_FIRST)} ${surname}`;
  const isMinor = Math.random() < 0.2;
  const age = isMinor ? rand(5, 17) : rand(18, 65);
  const dob = makeDOB(age);
  const addr = makeAddress();
  const idNumber = makePassportNumber();
  const placeOfIssue = pick(PASSPORT_OFFICES);
  const issueDate = isMinor ? makeIssueDate(age + 18) : makeIssueDate(age); // hack for valid issue
  const expiryDate = makeExpiryDate(issueDate, isMinor ? 5 : 10);

  allIds[idNumber] = {
    idNumber,
    idType: "PASSPORT",
    name,
    fatherName,
    dob,
    age,
    gender,
    address: addr.full,
    district: addr.city,
    state: addr.state,
    pincode: addr.pincode,
    nationality: "Indian",
    placeOfBirth: addr.city,
    placeOfIssue,
    dateOfIssue: issueDate,
    dateOfExpiry: expiryDate,
    photoUrl: `https://i.pravatar.cc/150?img=${++avatarIdx}`,
    isMinor: age < 18
  };
}

// ========== DRIVING_LICENSE (18+ ONLY - no minors) ==========
for (let i = 0; i < 10; i++) {
  const isMale = Math.random() > 0.45;
  const gender = isMale ? "Male" : "Female";
  const firstName = pick(isMale ? MALE_FIRST : FEMALE_FIRST);
  const surname = pick(SURNAMES);
  const name = `${firstName} ${surname}`;
  const fatherName = `${pick(FATHER_FIRST)} ${surname}`;
  const age = rand(18, 65); // ALWAYS 18+
  const dob = makeDOB(age);
  const addr = makeAddress();
  const idNumber = makeDLNumber();
  const bloodGroup = pick(BLOOD_GROUPS);
  const vehicleClass = pick(VEHICLE_CLASSES);
  const issueDate = makeIssueDate(age);
  const expiryDate = makeExpiryDate(issueDate, 20);
  const issuingAuthority = `RTO ${addr.city}`;

  allIds[idNumber] = {
    idNumber,
    idType: "DRIVING_LICENSE",
    name,
    fatherName,
    dob,
    age,
    gender,
    address: addr.full,
    district: addr.city,
    state: addr.state,
    pincode: addr.pincode,
    bloodGroup,
    vehicleClass,
    dateOfIssue: issueDate,
    dateOfValidity: expiryDate,
    issuingAuthority,
    photoUrl: `https://i.pravatar.cc/150?img=${++avatarIdx}`,
    isMinor: false
  };
}

// Write to file
fs.writeFileSync('/Users/thead76/Desktop/PahchaanID/backend/src/data/dummyIds.json', JSON.stringify(allIds, null, 2));
console.log(`Generated ${Object.keys(allIds).length} dummy IDs`);

// Also generate the markdown reference
const types = ['AADHAAR', 'PAN', 'VOTER_ID', 'PASSPORT', 'DRIVING_LICENSE'];
const typeLabels = {
  'AADHAAR': 'Aadhaar Card',
  'PAN': 'PAN Card',
  'VOTER_ID': 'Voter ID (EPIC)',
  'PASSPORT': 'Passport',
  'DRIVING_LICENSE': 'Driving License'
};
const minorRules = {
  'AADHAAR': 'Minors allowed (any age)',
  'PAN': 'Minors allowed (rare)',
  'VOTER_ID': '18+ only (No minors)',
  'PASSPORT': 'Minors allowed',
  'DRIVING_LICENSE': '18+ only (No minors)'
};

let md = `# 📋 PahchaanID - Dummy Verification Data\n\nYe saare dummy IDs presentation ke time use karne ke liye hain. Manager app me ID type select karo, neeche diye gaye ID number daalo, aur verify karo!\n\n`;
md += `> **Note:** Sirf AADHAAR aur PASSPORT me hi minor (under 18) IDs hain. Voter ID aur Driving License me koi minor nahi hai kyunki ye documents 18+ ke baad hi bante hain.\n\n`;

for (const type of types) {
  md += `---\n\n## ${typeLabels[type]}\n**Rule:** ${minorRules[type]}\n\n`;
  md += `| # | ID Number | Name | Father's Name | Age | Gender | Address | Minor? |\n`;
  md += `|---|---|---|---|---|---|---|---|\n`;
  
  let idx = 1;
  for (const key in allIds) {
    if (allIds[key].idType === type) {
      const p = allIds[key];
      const minor = p.isMinor ? '🔴 YES' : '🟢 NO';
      const shortAddr = p.address.length > 40 ? p.address.substring(0, 40) + '...' : p.address;
      md += `| ${idx} | \`${p.idNumber}\` | ${p.name} | ${p.fatherName} | ${p.age} | ${p.gender} | ${shortAddr} | ${minor} |\n`;
      idx++;
    }
  }
  md += `\n`;
}

fs.writeFileSync('/Users/thead76/.gemini/antigravity-ide/brain/65063295-9b01-4b72-b523-5398200cb729/dummy_data_reference.md', md);
console.log("Markdown reference generated.");
