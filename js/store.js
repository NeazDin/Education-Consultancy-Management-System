const KEY = "edu-xyz-bd-v2";
const STAGES = ["inquiry", "documents", "applied", "offer", "visa", "completed"];
const DOC_TYPES = [
  "Passport",
  "Academic transcripts",
  "Statement of purpose (SOP)",
  "IELTS score report",
  "Bank solvency certificate",
  "Recommendation letter (LOR)",
  "CV / Resume",
];
const INTEREST = ["study-abroad", "IELTS", "both"];

function uid(prefix) {
  return prefix + "-" + Math.random().toString(36).slice(2, 9);
}

const KNOWN_PASSWORDS = {
  admin123: "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9",
  counselor123: "5efd3d99ffa5347945cb96ce0cfc994d55d76a10ed702336aae44f7919db98a2",
  instructor123: "c1437a55f6e93b7049c4064af1b0920974e383a435283f5d0b0496ee4a8a47b5",
  accounts123: "3730f9f9069024dccfefaf0c79ac46208e3256ddb38f46e5c5556069083e9930",
  student123: "703b0a3d6ad75b649a28adde7d83c6251da457549263bc7ff45ec709b0a8448b",
  admin: "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9",
  counselor: "5efd3d99ffa5347945cb96ce0cfc994d55d76a10ed702336aae44f7919db98a2",
  instructor: "c1437a55f6e93b7049c4064af1b0920974e383a435283f5d0b0496ee4a8a47b5",
  accountant: "3730f9f9069024dccfefaf0c79ac46208e3256ddb38f46e5c5556069083e9930",
  accounts: "3730f9f9069024dccfefaf0c79ac46208e3256ddb38f46e5c5556069083e9930",
  student: "703b0a3d6ad75b649a28adde7d83c6251da457549263bc7ff45ec709b0a8448b",
  admission123: "a025feb38b25822972cfff44e9061cb804edd67b208ebfbd2ae4d94ba6997308",
  admission: "6a6ba702490a3747917518200e696dead01e32cbdcdca0dd3ac2bf3568982ab5",
  admissions123: "a8806e156c9b26853030490435fcd5ada7cd9c87673110c9051b49480a33e1de",
  admissions: "68944f4e1e42f3ac4bea73ff9361790c300ca0dead0e09b2b6f957d7a341a4cf",
  hr123: "070a3b5e8d4bd5c46acccb91c9c54614c0cd649e78c4c4719e3a64270bae5ddf",
  hr: "1b52f3a2e15148731314bf167145c54565ed2385a862b5eb7771eaf719e4f82e",
  manager123: "866485796cfa8d7c0cf7111640205b83076433547577511d81f8030ae99ecea5",
  manager: "6ee4a469cd4e91053847f5d3fcb61dbcc91e8f0ef10be7748da4c4a1ba382d17",
  reception123: "5145dba3b6bda2d610d2c5c435a1c2481eefd3146b6a7e004ad73f794386e031",
  reception: "066a4a70376da00eb9e50a8e30725427faf9b9573d0c6430d28316497c889213",
  frontdesk: "066a4a70376da00eb9e50a8e30725427faf9b9573d0c6430d28316497c889213",
  marketing123: "7d50137f0395e9a47a5daf16959dd68abef6370d3b837ec3be4fe9d869db46a3",
  marketing: "e2a530e251d3675034d23f5c5f87f54ec3182a088ba7d13350824794f8e6b76e",
  compliance123: "53a962ecd68923f6543935bee766e0d4a4abd57b0d8ed0bd00187b267ee24491",
  compliance: "29a3e14798aa2363dc0ca5d6cf18f3a0cf9003c8824cf66fde7804867e8ceee9",
};

// Pure JavaScript SHA-256 fallback algorithm (works in any protocol including file:///)
function jsSha256(ascii) {
  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let i, j;
  let result = "";
  const words = [];
  const asciiBitLength = ascii.length * 8;
  const hash = (jsSha256.h = jsSha256.h || []);
  const k = (jsSha256.k = jsSha256.k || []);
  let primeCounter = k.length;

  const isComposite = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 300; i += candidate) isComposite[i] = candidate;
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }

  ascii += "\x80";
  while ((ascii.length % 64) - 56) ascii += "\x00";
  for (i = 0; i < ascii.length; i++) {
    j = ascii.charCodeAt(i);
    if (j >> 8) return "";
    words[i >> 2] |= j << (((3 - i) % 4) * 8);
  }
  words[words.length] = (asciiBitLength / maxWord) | 0;
  words[words.length] = asciiBitLength;

  for (j = 0; j < words.length; ) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash.slice(0);
    for (i = 0; i < 64; i++) {
      const i2 = i + j;
      const w15 = w[i - 15],
        w2 = w[i - 2];
      const a = hash[0],
        e = hash[4];
      const temp1 =
        hash[7] +
        (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) +
        ((e & hash[5]) ^ (~e & hash[6])) +
        k[i] +
        (w[i] =
          i < 16
            ? w[i]
            : (w[i - 16] +
                (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) +
                w[i - 7] +
                (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) |
              0);
      const temp2 =
        (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) +
        ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));

      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
    }
    for (i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i]) | 0;
  }

  for (i = 0; i < 8; i++) {
    for (let i2 = 3; i2 >= 0; i2--) {
      const c = (hash[i] >> (i2 * 8)) & 255;
      result += (c < 16 ? "0" : "") + c.toString(16);
    }
  }
  return result;
}

async function sha256(text) {
  text = String(text || "").trim();
  if (KNOWN_PASSWORDS[text]) return KNOWN_PASSWORDS[text];

  if (window.crypto && window.crypto.subtle && typeof window.crypto.subtle.digest === "function") {
    try {
      const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
      return Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    } catch (e) {
      // fallback to pure JS below
    }
  }
  return jsSha256(text);
}

function getDefaultUsers() {
  const HASH_ADMIN = "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9"; // admin123
  const HASH_COUNSELOR = "5efd3d99ffa5347945cb96ce0cfc994d55d76a10ed702336aae44f7919db98a2"; // counselor123
  const HASH_INSTRUCTOR = "c1437a55f6e93b7049c4064af1b0920974e383a435283f5d0b0496ee4a8a47b5"; // instructor123
  const HASH_ACCOUNTANT = "3730f9f9069024dccfefaf0c79ac46208e3256ddb38f46e5c5556069083e9930"; // accounts123
  const HASH_STUDENT = "703b0a3d6ad75b649a28adde7d83c6251da457549263bc7ff45ec709b0a8448b"; // student123
  const HASH_ADMISSION = "a025feb38b25822972cfff44e9061cb804edd67b208ebfbd2ae4d94ba6997308"; // admission123
  const HASH_HR = "070a3b5e8d4bd5c46acccb91c9c54614c0cd649e78c4c4719e3a64270bae5ddf"; // hr123
  const HASH_MANAGER = "866485796cfa8d7c0cf7111640205b83076433547577511d81f8030ae99ecea5"; // manager123
  const HASH_RECEPTION = "5145dba3b6bda2d610d2c5c435a1c2481eefd3146b6a7e004ad73f794386e031"; // reception123
  const HASH_MARKETING = "7d50137f0395e9a47a5daf16959dd68abef6370d3b837ec3be4fe9d869db46a3"; // marketing123
  const HASH_COMPLIANCE = "53a962ecd68923f6543935bee766e0d4a4abd57b0d8ed0bd00187b267ee24491"; // compliance123

  return [
    // --- Official Education XYZ BD Staff Accounts ---
    {
      id: "u-admin",
      staffId: "XYZ-ADM-001",
      name: "MD. Rafiqul Islam",
      email: "admin1@eduxyzbd.com",
      altEmail: "rafiqul@eduxyzbd.com",
      password: HASH_ADMIN,
      role: "admin",
      title: "Managing Director",
      phone: "01781-827022",
      officeHours: "Sun – Thu · 10:00 AM – 7:00 PM",
      photoUrl: "",
      bio: "Managing Director of Education XYZ BD, overseeing international admissions, British Council IELTS test center partnerships, and strategic consulting."
    },
    {
      id: "u-c1",
      staffId: "XYZ-CSL-001",
      name: "Farzana Yasmin",
      email: "counselor1@eduxyzbd.com",
      altEmail: "farzana@eduxyzbd.com",
      password: HASH_COUNSELOR,
      role: "counselor",
      title: "Senior Education Counselor",
      phone: "+880 1781 827022",
      officeHours: "Mon – Thu · 10:30 AM – 5:30 PM",
      credentials: "UK Education Specialist · British Council Certified",
      photoUrl: "",
      bio: "Senior Counselor with 7+ years guiding students into Russell Group and Group of Eight universities. Specialist in visa SOP scrutiny."
    },
    {
      id: "u-c2",
      staffId: "XYZ-CSL-002",
      name: "Tanvir Ahmed",
      email: "counselor2@eduxyzbd.com",
      altEmail: "tanvir@eduxyzbd.com",
      password: HASH_COUNSELOR,
      role: "counselor",
      title: "Study-Abroad Advisor",
      phone: "+880 1781 827022",
      officeHours: "Sun, Tue, Thu · 11:00 AM – 6:00 PM",
      credentials: "Canada & Australia Visa Specialist",
      photoUrl: "",
      bio: "Admissions advisor specializing in Canadian study permits, GIC funding, and Australian post-study work visa applications."
    },
    {
      id: "u-c3",
      staffId: "XYZ-CSL-003",
      name: "Nusrat Jahan",
      email: "counselor3@eduxyzbd.com",
      altEmail: "nusrat@eduxyzbd.com",
      password: HASH_COUNSELOR,
      role: "counselor",
      title: "Senior Study-Abroad Advisor",
      phone: "+880 1781 827022",
      officeHours: "Sun – Thu · 10:00 AM – 6:00 PM",
      credentials: "USA & Europe University Specialist",
      photoUrl: "",
      bio: "Senior counselor with 6 years experience in US university admissions, DAAD scholarships in Germany, and Swedish institute programs."
    },
     {
       id: "u-c4",
       staffId: "XYZ-CSL-004",
       name: "Sultana Razia",
       email: "counselor4@eduxyzbd.com",
       altEmail: "sultana@eduxyzbd.com",
       password: HASH_COUNSELOR,
       role: "counselor",
       title: "Senior Counselor",
       phone: "+880 1781 827022",
       photoUrl: ""
     },
     {
       id: "u-c5",
       staffId: "XYZ-CSL-005",
       name: "Taslima Akhter",
       email: "counselor5@eduxyzbd.com",
       altEmail: "taslima@eduxyzbd.com",
       password: HASH_COUNSELOR,
       role: "counselor",
       title: "Australia & New Zealand Specialist",
       phone: "+880 1781 827022",
       officeHours: "Sun – Thu · 10:00 AM – 6:00 PM",
       credentials: "MARA Registered · Australia & NZ Education Specialist",
       photoUrl: "",
       bio: "MARA-registered education agent with 5 years of experience in Australian and New Zealand university admissions, scholarship applications, and post-study work visas."
     },
     {
       id: "u-c6",
       staffId: "XYZ-CSL-006",
       name: "Imran Hossain",
       email: "counselor6@eduxyzbd.com",
       altEmail: "imran@eduxyzbd.com",
       password: HASH_COUNSELOR,
       role: "counselor",
       title: "Canada & Immigration Counselor",
       phone: "+880 1781 827022",
       officeHours: "Sun – Thu · 9:30 AM – 5:30 PM",
       credentials: "ICCRC Licensed · Canada Study Permit Specialist",
       photoUrl: "",
       bio: "ICRC-licensed immigration consultant specializing in Canadian study permits, SDS stream, GIC processing, and Express Entry guidance."
     },
     {
       id: "u-i1",
      staffId: "XYZ-INS-001",
      name: "Nasir Uddin (IELTS Trainer)",
      email: "instructor1@eduxyzbd.com",
      altEmail: "nasir@eduxyzbd.com",
      password: HASH_INSTRUCTOR,
      role: "instructor",
      title: "Lead IELTS Instructor & Master Trainer",
      phone: "+880 1781 827022",
      credentials: "Cambridge CELTA Certified · IELTS Band 8.5",
      officeHours: "Sun, Tue, Thu · 4:00 PM – 6:15 PM",
      room: "Studio A & Faculty Room #1",
      photoUrl: "",
      bio: "Master Trainer with 9+ years of experience training 3,500+ successful IELTS students. Certified by Cambridge English (CELTA) and British Council. Focus on Writing Task 2 coherence and Speaking fluency."
    },
    {
      id: "u-i2",
      staffId: "XYZ-INS-002",
      name: "Rafiqul Islam",
      email: "instructor2@eduxyzbd.com",
      altEmail: "rafiqul.i@eduxyzbd.com",
      password: HASH_INSTRUCTOR,
      role: "instructor",
      title: "IELTS Instructor",
      phone: "+880 1781 827022",
      credentials: "IELTS Band 8.0 · TESOL Certified",
      officeHours: "Fri & Sat · 2:00 PM – 4:00 PM",
      photoUrl: "",
      bio: "TESOL-certified IELTS instructor specializing in Reading section scanning techniques and Listening distractors."
    },
    {
      id: "u-i3",
      staffId: "XYZ-INS-003",
      name: "Sumaiya Khatun",
      email: "instructor3@eduxyzbd.com",
      altEmail: "sumaiya@eduxyzbd.com",
      password: HASH_INSTRUCTOR,
      role: "instructor",
      title: "PTE & Academic English Instructor",
      phone: "+880 1781 827022",
      credentials: "PTE Certified · MA in Applied Linguistics",
      officeHours: "Sun, Tue, Thu · 4:30 PM – 6:30 PM",
      room: "Computer Lab 1",
      photoUrl: "",
      bio: "PTE Academic specialist with 6 years experience training students for computer-based English proficiency tests. Expert in PTE speaking & writing scoring algorithms."
    },
    {
      id: "u-i4",
      staffId: "XYZ-INS-004",
      name: "Dr. Ahmed Hassan",
      email: "instructor4@eduxyzbd.com",
      altEmail: "ahmed@eduxyzbd.com",
      password: HASH_INSTRUCTOR,
      role: "instructor",
      title: "GRE & SAT Quantitative Reasoning Trainer",
      phone: "+880 1781 827022",
      credentials: "PhD in Mathematics · GRE 330+",
      officeHours: "Mon, Wed, Fri · 6:30 PM – 8:30 PM",
      room: "Studio B",
      photoUrl: "",
      bio: "PhD mathematician and GRE/SAT quant specialist. Trained 800+ students achieving 165+ quant scores. Published author of GRE prep guides."
    },
    {
      id: "u-i5",
      staffId: "XYZ-INS-005",
      name: "Rebecca Sarah",
      email: "instructor5@eduxyzbd.com",
      altEmail: "rebecca@eduxyzbd.com",
      password: HASH_INSTRUCTOR,
      role: "instructor",
      title: "Spoken English & Pronunciation Coach",
      phone: "+880 1781 827022",
      credentials: "BA (Hons) English Literature · TEFL Certified",
      officeHours: "Fri & Sat · 4:00 PM – 6:00 PM",
      room: "Language Lounge",
      photoUrl: "",
      bio: "Native English speaker with TEFL certification. Specializes in accent reduction, phonetics, and conversational fluency for international students."
    },
    {
      id: "u-i6",
      staffId: "XYZ-INS-006",
      name: "Kamal Hossain",
      email: "instructor6@eduxyzbd.com",
      altEmail: "kamal@eduxyzbd.com",
      password: HASH_INSTRUCTOR,
      role: "instructor",
      title: "IELTS Reading & Listening Instructor",
      phone: "+880 1781 827022",
      credentials: "IELTS Band 8.5 · MEd in TESOL",
      officeHours: "Sun, Tue, Thu · 2:00 PM – 4:00 PM",
      room: "Studio A",
      photoUrl: "",
      bio: "TESOL master's graduate specializing in IELTS reading and listening strategies. Developed the institute's 30-day IELTS Band 7+ crash course."
    },
    {
      id: "u-i7",
      staffId: "XYZ-INS-007",
      name: "Farhana Rahman",
      email: "instructor7@eduxyzbd.com",
      altEmail: "farhana.r@eduxyzbd.com",
      password: HASH_INSTRUCTOR,
      role: "instructor",
      title: "IELTS Writing Task 1 & 2 Specialist",
      phone: "+880 1781 827022",
      credentials: "IELTS Band 9 Writing · CELTA Certified",
      officeHours: "Mon, Wed, Fri · 4:30 PM – 6:30 PM",
      room: "Studio A",
      photoUrl: "",
      bio: "Rare IELTS Band 9 Writing scorer. Cambridge CELTA certified with 8 years experience in academic writing instruction and essay evaluation."
    },
    {
      id: "u-acc",
      staffId: "XYZ-ACC-001",
      name: "Kamrul Hasan",
      email: "accountant1@eduxyzbd.com",
      altEmail: "kamrul@eduxyzbd.com",
      password: HASH_ACCOUNTANT,
      role: "accountant",
      title: "Chief Accounts & Finance Officer",
      phone: "+880 1781 827022",
      photoUrl: ""
    },
    {
      id: "u-acc2",
      staffId: "XYZ-ACC-002",
      name: "Kamrul Hasan",
      email: "accountant2@eduxyzbd.com",
      altEmail: "kamrul.h@eduxyzbd.com",
      password: HASH_ACCOUNTANT,
      role: "accountant",
      title: "Accounts Officer",
      phone: "+880 1781 827022",
      photoUrl: ""
    },
    {
      id: "u-ado-1",
      staffId: "XYZ-ADO-001",
      name: "Zubaida Khanam",
      email: "admission1@eduxyzbd.com",
      altEmail: "zubaida@eduxyzbd.com",
      password: HASH_ADMISSION,
      role: "admission_officer",
      title: "Senior Admission Officer",
      phone: "+880 1781 827022",
      officeHours: "Sun – Thu · 10:00 AM – 6:30 PM",
      credentials: "UK & Australia University Admissions Specialist · CAS & COE Processing",
      photoUrl: "",
      bio: "Senior Admission Officer at Education XYZ BD. Specialized in partner university liaison, CAS and COE issuance, offer letter evaluation, and academic document verification."
    },
    {
      id: "u-ado-2",
      staffId: "XYZ-ADO-002",
      name: "Sultana Razia",
      email: "admission2@eduxyzbd.com",
      altEmail: "sultana.r@eduxyzbd.com",
      password: HASH_ADMISSION,
      role: "admission_officer",
      title: "Admissions Executive",
      phone: "+880 1781 827022",
      officeHours: "Sun – Thu · 10:00 AM – 6:00 PM",
      credentials: "Canada & USA University Liaison",
      photoUrl: "",
      bio: "Admissions executive managing university portal lodgements, WES credentials, and conditional offer follow-ups."
    },
    {
      id: "u-ado-3",
      staffId: "XYZ-ADO-003",
      name: "Nafisa Rahman",
      email: "admission3@eduxyzbd.com",
      altEmail: "nafisa@eduxyzbd.com",
      password: HASH_ADMISSION,
      role: "admission_officer",
      title: "Germany & Europe Admissions Officer",
      phone: "+880 1781 827022",
      officeHours: "Sun – Thu · 10:00 AM – 6:00 PM",
      credentials: "DAAD Certified · European University Liaison",
      photoUrl: "",
      bio: "Specialist in German blocked accounts, APS certification, uni-assist documentation, and European university admissions across Germany, Sweden, and Netherlands."
    },
    {
      id: "u-hr-1",
      staffId: "XYZ-HR-001",
      name: "Mahmudur Rahman",
      email: "hr1@eduxyzbd.com",
      altEmail: "mahmudur@eduxyzbd.com",
      password: HASH_HR,
      role: "hr",
      title: "Human Resources & Talent Manager",
      phone: "+880 1781 827022",
      officeHours: "Sun – Thu · 9:30 AM – 6:30 PM",
      credentials: "SHRM-CP · People Operations & Compliance",
      photoUrl: "",
      bio: "Head of Human Resources at Education XYZ BD. Managing staff recruitment, onboarding, counselor & faculty KPI appraisals, attendance tracking, and employee relations."
    },
    {
      id: "u-hr-2",
      staffId: "XYZ-HR-002",
      name: "Sabrina Hossain",
      email: "hr2@eduxyzbd.com",
      altEmail: "sabrina@eduxyzbd.com",
      password: HASH_HR,
      role: "hr",
      title: "HR & Recruitment Coordinator",
      phone: "+880 1781 827022",
      officeHours: "Sun – Thu · 9:00 AM – 5:30 PM",
      credentials: "BBA in HRM · Certified Recruitment Professional",
      photoUrl: "",
      bio: "HR coordinator managing recruitment scheduling, staff onboarding documentation, attendance reconciliation, and employee welfare programs."
    },
    {
      id: "u-mgr-1",
      staffId: "XYZ-MGR-001",
      name: "Anisur Rahman",
      email: "manager1@eduxyzbd.com",
      altEmail: "anisur@eduxyzbd.com",
      password: HASH_MANAGER,
      role: "branch_manager",
      title: "Branch & Operations Manager",
      phone: "+880 1781 827022",
      officeHours: "Sun – Thu · 9:00 AM – 7:00 PM",
      credentials: "MBA in Operations Management · British Council Education UK Certified",
      photoUrl: "",
      bio: "Branch & Operations Manager directing all consultancy branches, counselor allocation, student retention, faculty scheduling, and database integrity."
    },
    {
      id: "u-rec-1",
      staffId: "XYZ-REC-001",
      name: "Sadia Afrin",
      email: "frontdesk1@eduxyzbd.com",
      altEmail: "sadia@eduxyzbd.com",
      password: HASH_RECEPTION,
      role: "front_desk",
      title: "Front Desk & Reception Executive",
      phone: "+880 1781 827022",
      officeHours: "Sun – Thu · 8:30 AM – 5:30 PM",
      credentials: "Customer Experience Specialist · Front-Office Operations",
      photoUrl: "",
      bio: "Lead receptionist managing walk-in student registrations, counselor appointments, telephone inquiries, and visitor documentation."
    },
    {
      id: "u-rec-2",
      staffId: "XYZ-REC-002",
      name: "Farhana Begum",
      email: "frontdesk2@eduxyzbd.com",
      altEmail: "farhana.b@eduxyzbd.com",
      password: HASH_RECEPTION,
      role: "front_desk",
      title: "Front Desk Executive",
      phone: "+880 1781 827022",
      officeHours: "Sun – Thu · 8:30 AM – 5:30 PM",
      credentials: "Customer Service & Office Administration",
      photoUrl: "",
      bio: "Front desk executive managing walk-in registrations, phone inquiries, visitor scheduling, and reception operations."
    },
    {
      id: "u-mkt-1",
      staffId: "XYZ-MKT-001",
      name: "Nafis Fuad",
      email: "marketing1@eduxyzbd.com",
      altEmail: "nafis@eduxyzbd.com",
      password: HASH_MARKETING,
      role: "marketing",
      title: "Digital Marketing & Outreach Lead",
      phone: "+880 1781 827022",
      officeHours: "Sun – Thu · 10:00 AM – 6:30 PM",
      credentials: "Google & Meta Certified Digital Marketer · Higher Ed Outreach",
      photoUrl: "",
      bio: "Outreach lead driving university partner education expos, campus ambassador networks, student testimonials, and social media campaigns."
    },
    {
      id: "u-cmp-1",
      staffId: "XYZ-CMP-001",
      name: "Tahmina Akter",
      email: "compliance1@eduxyzbd.com",
      altEmail: "tahmina@eduxyzbd.com",
      password: HASH_COMPLIANCE,
      role: "compliance_officer",
      title: "Visa Compliance & Integrity Officer",
      phone: "+880 1781 827022",
      officeHours: "Sun – Thu · 9:30 AM – 6:00 PM",
      credentials: "Immigration Law Certification · UKVI & Australian Home Affairs Compliance",
      photoUrl: "",
      bio: "Compliance officer reviewing financial genuineness, CAS credibility interviews, and student visa compliance verification."
    },

    // --- Official Student Accounts (st-1 to st-16 original) ---
    { id: "u-s1", name: "Ayesha Karim", email: "student1@eduxyzbd.com", altEmail: "ayesha@eduxyzbd.com", password: HASH_STUDENT, role: "student", studentId: "st-1", photoUrl: "" },
    { id: "u-s2", name: "Ayesha Karim", email: "student2@eduxyzbd.com", altEmail: "ayesha.k@eduxyzbd.com", password: HASH_STUDENT, role: "student", studentId: "st-1", photoUrl: "" },
    { id: "u-s3", name: "Ayesha Karim", email: "student3@eduxyzbd.com", altEmail: "ayesha.karim@eduxyzbd.com", password: HASH_STUDENT, role: "student", studentId: "st-1", photoUrl: "" },
    { id: "u-s-rahim", name: "Rahim Uddin Chowdhury", email: "student4@eduxyzbd.com", altEmail: "rahim@eduxyzbd.com", password: HASH_STUDENT, role: "student", studentId: "st-2", photoUrl: "" },
    { id: "u-s-samiha", name: "Samiha Noor", email: "student5@eduxyzbd.com", altEmail: "samiha@eduxyzbd.com", password: HASH_STUDENT, role: "student", studentId: "st-3", photoUrl: "" },
    { id: "u-s-tanvir", name: "Tanvir Hasan", email: "student6@eduxyzbd.com", altEmail: "tanvir.h@eduxyzbd.com", password: HASH_STUDENT, role: "student", studentId: "st-4", photoUrl: "" },
    { id: "u-s-lamiya", name: "Lamiya Chowdhury", email: "student7@eduxyzbd.com", altEmail: "lamiya@eduxyzbd.com", password: HASH_STUDENT, role: "student", studentId: "st-5", photoUrl: "" },
    { id: "u-s-arif", name: "Arif Mahmud", email: "student8@eduxyzbd.com", altEmail: "arif@eduxyzbd.com", password: HASH_STUDENT, role: "student", studentId: "st-6", photoUrl: "" },
    { id: "u-s-shahriar", name: "Shahriar Kabir", email: "student9@eduxyzbd.com", altEmail: "shahriar@eduxyzbd.com", password: HASH_STUDENT, role: "student", studentId: "st-7", photoUrl: "" },
    { id: "u-s-farzana", name: "Farzana Haque", email: "student10@eduxyzbd.com", altEmail: "farzana.h@eduxyzbd.com", password: HASH_STUDENT, role: "student", studentId: "st-8", photoUrl: "" },
    { id: "u-s-mustafiz", name: "Mustafizur Rahman", email: "student11@eduxyzbd.com", altEmail: "mustafiz@eduxyzbd.com", password: HASH_STUDENT, role: "student", studentId: "st-9", photoUrl: "" },
    { id: "u-s-nusrat", name: "Nusrat Parveen", email: "student12@eduxyzbd.com", altEmail: "nusrat.p@eduxyzbd.com", password: HASH_STUDENT, role: "student", studentId: "st-10", photoUrl: "" },

    // --- Additional Student Accounts (st-17 to st-66) ---
    { id: "u-s17", name: "Sumaiya Binte Rafiq", email: "student17@eduxyzbd.com", altEmail: "sumaiya.r@eduxyzbd.com", password: HASH_STUDENT, role: "student", studentId: "st-17", photoUrl: "" },
    { id: "u-s18", name: "Mahbubul Alam", email: "student18@eduxyzbd.com", altEmail: "mahbubul@eduxyzbd.com", password: HASH_STUDENT, role: "student", studentId: "st-18", photoUrl: "" },
    { id: "u-s19", name: "Nafisa Tahnin", email: "student19@eduxyzbd.com", altEmail: "nafisa.t@eduxyzbd.com", password: HASH_STUDENT, role: "student", studentId: "st-19", photoUrl: "" },
    { id: "u-s20", name: "Rakibul Hasan", email: "student20@eduxyzbd.com", altEmail: "rakibul@eduxyzbd.com", password: HASH_STUDENT, role: "student", studentId: "st-20", photoUrl: "" },
    { id: "u-s21", name: "Tanzeela Chowdhury", email: "student21@eduxyzbd.com", altEmail: "tanzeela@eduxyzbd.com", password: HASH_STUDENT, role: "student", studentId: "st-21", photoUrl: "" },
    { id: "u-s22", name: "Md. Habibur Rahman", email: "student22@eduxyzbd.com", altEmail: "habibur@eduxyzbd.com", password: HASH_STUDENT, role: "student", studentId: "st-22", photoUrl: "" },
    { id: "u-s23", name: "Farzana Mostafa", email: "student23@eduxyzbd.com", altEmail: "farzana.m@eduxyzbd.com", password: HASH_STUDENT, role: "student", studentId: "st-23", photoUrl: "" },
    { id: "u-s24", name: "Saiful Islam", email: "student24@eduxyzbd.com", altEmail: "saiful@eduxyzbd.com", password: HASH_STUDENT, role: "student", studentId: "st-24", photoUrl: "" },
    { id: "u-s25", name: "Washiqa Noor", email: "student25@eduxyzbd.com", altEmail: "washiqa@eduxyzbd.com", password: HASH_STUDENT, role: "student", studentId: "st-25", photoUrl: "" },
    { id: "u-s26", name: "Anisur Rahman", email: "student26@eduxyzbd.com", altEmail: "anisur.r@eduxyzbd.com", password: HASH_STUDENT, role: "student", studentId: "st-26", photoUrl: "" },
    { id: "u-s27", name: "Priya Das", email: "student27@eduxyzbd.com", altEmail: "priya@eduxyzbd.com", password: HASH_STUDENT, role: "student", studentId: "st-27", photoUrl: "" },
    { id: "u-s28", name: "Mohammad Kaif", email: "student28@eduxyzbd.com", altEmail: "kaif@eduxyzbd.com", password: HASH_STUDENT, role: "student", studentId: "st-28", photoUrl: "" },
    { id: "u-s29", name: "Shirin Akter", email: "student29@eduxyzbd.com", altEmail: "shirin@eduxyzbd.com", password: HASH_STUDENT, role: "student", studentId: "st-29", photoUrl: "" },
    { id: "u-s30", name: "Kamal Uddin", email: "student30@eduxyzbd.com", altEmail: "kamal.u@eduxyzbd.com", password: HASH_STUDENT, role: "student", studentId: "st-30", photoUrl: "" },
    { id: "u-s31", name: "Nusrat Jahan", email: "student31@eduxyzbd.com", altEmail: "nusrat.j@eduxyzbd.com", password: HASH_STUDENT, role: "student", studentId: "st-31", photoUrl: "" },
    { id: "u-s32", name: "Tanvir Hossain", email: "student32@eduxyzbd.com", altEmail: "tanvir.ho@eduxyzbd.com", password: HASH_STUDENT, role: "student", studentId: "st-32", photoUrl: "" },
    { id: "u-s33", name: "Sabrina Yeasmin", email: "student33@eduxyzbd.com", altEmail: "sabrina.y@eduxyzbd.com", password: HASH_STUDENT, role: "student", studentId: "st-33", photoUrl: "" },
    { id: "u-s34", name: "Afzal Hossain", email: "student34@eduxyzbd.com", altEmail: "afzal@eduxyzbd.com", password: HASH_STUDENT, role: "student", studentId: "st-34", photoUrl: "" },
    { id: "u-s35", name: "Tasnia Rahman", email: "student35@eduxyzbd.com", altEmail: "tasnia@eduxyzbd.com", password: HASH_STUDENT, role: "student", studentId: "st-35", photoUrl: "" },
    { id: "u-s36", name: "Raihan Siddique", email: "student36@eduxyzbd.com", altEmail: "raihan@eduxyzbd.com", password: HASH_STUDENT, role: "student", studentId: "st-36", photoUrl: "" },
    { id: "u-s37", name: "Farida Begum", email: "student37@eduxyzbd.com", altEmail: "farida@eduxyzbd.com", password: HASH_STUDENT, role: "student", studentId: "st-37", photoUrl: "" },
    { id: "u-s38", name: "Zahidul Islam", email: "student38@eduxyzbd.com", altEmail: "zahidul@eduxyzbd.com", password: HASH_STUDENT, role: "student", studentId: "st-38", photoUrl: "" },
    { id: "u-s39", name: "Rumaisa Khan", email: "student39@eduxyzbd.com", altEmail: "rumaisa@eduxyzbd.com", password: HASH_STUDENT, role: "student", studentId: "st-39", photoUrl: "" },
    { id: "u-s40", name: "Sohel Rana", email: "student40@eduxyzbd.com", altEmail: "sohel@eduxyzbd.com", password: HASH_STUDENT, role: "student", studentId: "st-40", photoUrl: "" },
    { id: "u-s41", name: "Maliha Haque", email: "student41@eduxyzbd.com", altEmail: "maliha@eduxyzbd.com", password: HASH_STUDENT, role: "student", studentId: "st-41", photoUrl: "" },
    { id: "u-s42", name: "Fahim Ahmed", email: "student42@eduxyzbd.com", altEmail: "fahim@eduxyzbd.com", password: HASH_STUDENT, role: "student", studentId: "st-42", photoUrl: "" },
    { id: "u-s43", name: "Nafisat Jahan", email: "student43@eduxyzbd.com", altEmail: "nafisat@eduxyzbd.com", password: HASH_STUDENT, role: "student", studentId: "st-43", photoUrl: "" },
    { id: "u-s44", name: "Al Mamun", email: "student44@eduxyzbd.com", altEmail: "almamun@eduxyzbd.com", password: HASH_STUDENT, role: "student", studentId: "st-44", photoUrl: "" },
    { id: "u-s45", name: "Bushra Khatun", email: "student45@eduxyzbd.com", altEmail: "bushra@eduxyzbd.com", password: HASH_STUDENT, role: "student", studentId: "st-45", photoUrl: "" },
    { id: "u-s46", name: "Shahin Alam", email: "student46@eduxyzbd.com", altEmail: "shahin@eduxyzbd.com", password: HASH_STUDENT, role: "student", studentId: "st-46", photoUrl: "" },
    { id: "u-s47", name: "Rubaiyat Khan", email: "student47@eduxyzbd.com", altEmail: "rubaiyat@eduxyzbd.com", password: HASH_STUDENT, role: "student", studentId: "st-47", photoUrl: "" },
    { id: "u-s48", name: "Hasina Akhter", email: "student48@eduxyzbd.com", altEmail: "hasina@eduxyzbd.com", password: HASH_STUDENT, role: "student", studentId: "st-48", photoUrl: "" },
    { id: "u-s49", name: "Mominul Haque", email: "student49@eduxyzbd.com", altEmail: "mominul@eduxyzbd.com", password: HASH_STUDENT, role: "student", studentId: "st-49", photoUrl: "" },
    { id: "u-s50", name: "Samira Rahman", email: "student50@eduxyzbd.com", altEmail: "samira@eduxyzbd.com", password: HASH_STUDENT, role: "student", studentId: "st-50", photoUrl: "" },
    { id: "u-s51", name: "Yusuf Ali", email: "student51@eduxyzbd.com", altEmail: "yusuf@eduxyzbd.com", password: HASH_STUDENT, role: "student", studentId: "st-51", photoUrl: "" },
    { id: "u-s52", name: "Rokeya Khatun", email: "student52@eduxyzbd.com", altEmail: "rokeya@eduxyzbd.com", password: HASH_STUDENT, role: "student", studentId: "st-52", photoUrl: "" },
    { id: "u-s53", name: "Aminul Islam", email: "student53@eduxyzbd.com", altEmail: "aminul@eduxyzbd.com", password: HASH_STUDENT, role: "student", studentId: "st-53", photoUrl: "" },
    { id: "u-s54", name: "Fatima Rahman", email: "student54@eduxyzbd.com", altEmail: "fatima@eduxyzbd.com", password: HASH_STUDENT, role: "student", studentId: "st-54", photoUrl: "" },
    { id: "u-s55", name: "Habib Rahman", email: "student55@eduxyzbd.com", altEmail: "habib@eduxyzbd.com", password: HASH_STUDENT, role: "student", studentId: "st-55", photoUrl: "" },
    { id: "u-s56", name: "Shabnam Ara", email: "student56@eduxyzbd.com", altEmail: "shabnam@eduxyzbd.com", password: HASH_STUDENT, role: "student", studentId: "st-56", photoUrl: "" },
    { id: "u-s57", name: "Jamal Uddin", email: "student57@eduxyzbd.com", altEmail: "jamal@eduxyzbd.com", password: HASH_STUDENT, role: "student", studentId: "st-57", photoUrl: "" },
    { id: "u-s58", name: "Salma Khatun", email: "student58@eduxyzbd.com", altEmail: "salma@eduxyzbd.com", password: HASH_STUDENT, role: "student", studentId: "st-58", photoUrl: "" },
    { id: "u-s59", name: "Rashedul Islam", email: "student59@eduxyzbd.com", altEmail: "rashedul@eduxyzbd.com", password: HASH_STUDENT, role: "student", studentId: "st-59", photoUrl: "" },
    { id: "u-s60", name: "Nazma Begum", email: "student60@eduxyzbd.com", altEmail: "nazma@eduxyzbd.com", password: HASH_STUDENT, role: "student", studentId: "st-60", photoUrl: "" },
    { id: "u-s61", name: "Sakib Al Hasan", email: "student61@eduxyzbd.com", altEmail: "sakib@eduxyzbd.com", password: HASH_STUDENT, role: "student", studentId: "st-61", photoUrl: "" },
    { id: "u-s62", name: "Mst. Roksana", email: "student62@eduxyzbd.com", altEmail: "roksana@eduxyzbd.com", password: HASH_STUDENT, role: "student", studentId: "st-62", photoUrl: "" },
    { id: "u-s63", name: "Shariful Islam", email: "student63@eduxyzbd.com", altEmail: "shariful@eduxyzbd.com", password: HASH_STUDENT, role: "student", studentId: "st-63", photoUrl: "" },
    { id: "u-s64", name: "Ruma Akter", email: "student64@eduxyzbd.com", altEmail: "ruma@eduxyzbd.com", password: HASH_STUDENT, role: "student", studentId: "st-64", photoUrl: "" },
    { id: "u-s65", name: "Biplob Kumar", email: "student65@eduxyzbd.com", altEmail: "biplob@eduxyzbd.com", password: HASH_STUDENT, role: "student", studentId: "st-65", photoUrl: "" },
    { id: "u-s66", name: "Farhana Parveen", email: "student66@eduxyzbd.com", altEmail: "farhana.p@eduxyzbd.com", password: HASH_STUDENT, role: "student", studentId: "st-66", photoUrl: "" },
  ];
}

function ensureDefaultAccounts(users, students = []) {
  let changed = false;
  const defaults = getDefaultUsers();

  for (const def of defaults) {
    const idx = users.findIndex(
      (u) => u.email && u.email.toLowerCase().trim() === def.email.toLowerCase().trim()
    );
    if (idx === -1) {
      users.push({ ...def });
      changed = true;
    } else {
      // Ensure password, staffId, bio, credentials, officeHours, and photoUrl sync
      if (users[idx].password !== def.password) {
        users[idx].password = def.password;
        changed = true;
      }
      if (def.staffId && users[idx].staffId !== def.staffId) {
        users[idx].staffId = def.staffId;
        changed = true;
      }
      if (!users[idx].role) {
        users[idx].role = def.role;
        changed = true;
      }
      if (def.studentId && !users[idx].studentId) {
        users[idx].studentId = def.studentId;
        changed = true;
      }
      if (def.altEmail && users[idx].altEmail !== def.altEmail) {
        users[idx].altEmail = def.altEmail;
        changed = true;
      }
      if (def.credentials && !users[idx].credentials) {
        users[idx].credentials = def.credentials;
        changed = true;
      }
      if (def.bio && !users[idx].bio) {
        users[idx].bio = def.bio;
        changed = true;
      }
      if (def.officeHours && !users[idx].officeHours) {
        users[idx].officeHours = def.officeHours;
        changed = true;
      }
    }
  }

  // Ensure every student in students list has an associated user account
  if (Array.isArray(students)) {
    students.forEach((s) => {
      if (!s || !s.email) return;
       const sEmail = s.email.toLowerCase().trim();
       const existing = users.find(
         (u) => (u.studentId && u.studentId === s.id) || (u.email && u.email.toLowerCase().trim() === sEmail) || (u.altEmail && u.altEmail.toLowerCase().trim() === sEmail)
       );
      if (!existing) {
        const altEmail = s.name.toLowerCase().replace(/[^a-z]/g, "").replace(/\s+/g, "") + "@eduxyzbd.com";
        users.push({
          id: "u-" + s.id,
          name: s.name,
          email: s.email,
          altEmail: altEmail,
          role: "student",
          studentId: s.id,
          password: KNOWN_PASSWORDS.student123,
          phone: s.phone || "",
        });
        changed = true;
      } else if (!existing.studentId) {
        existing.studentId = s.id;
        changed = true;
      }
    });
  }

  return changed;
}

async function seed() {
  const users = getDefaultUsers();
  const students = [
    { id: "st-1", studentCode: "XYZ-2026-001", name: "Ayesha Karim", email: "ayesha@eduxyzbd.com", phone: "+880 1711 220011", interestType: "both", targetCountry: "United Kingdom", createdAt: "2026-08-12T09:00:00.000Z" },
    { id: "st-2", studentCode: "XYZ-2026-002", name: "Rahim Uddin Chowdhury", email: "rahim.u@gmail.com", phone: "+880 1812 334455", interestType: "study-abroad", targetCountry: "Canada", createdAt: "2026-07-04T09:00:00.000Z" },
    { id: "st-3", studentCode: "XYZ-2026-003", name: "Samiha Noor", email: "samiha.noor@gmail.com", phone: "+880 1913 556677", interestType: "IELTS", targetCountry: "Australia", createdAt: "2026-08-20T09:00:00.000Z" },
    { id: "st-4", studentCode: "XYZ-2026-004", name: "Tanvir Hasan", email: "tanvir.hasan@yahoo.com", phone: "+880 1614 778899", interestType: "both", targetCountry: "Australia", createdAt: "2026-09-01T09:00:00.000Z" },
    { id: "st-5", studentCode: "XYZ-2026-005", name: "Lamiya Chowdhury", email: "lamiya.c@gmail.com", phone: "+880 1515 990011", interestType: "study-abroad", targetCountry: "Germany", createdAt: "2026-06-18T09:00:00.000Z" },
    { id: "st-6", studentCode: "XYZ-2026-006", name: "Arif Mahmud", email: "arif.mahmud@gmail.com", phone: "+880 1316 112233", interestType: "study-abroad", targetCountry: "USA", createdAt: "2026-09-02T09:00:00.000Z" },
    { id: "st-7", studentCode: "XYZ-2026-007", name: "Shahriar Kabir", email: "shahriar.k@gmail.com", phone: "+880 1712 334455", interestType: "both", targetCountry: "Canada", createdAt: "2026-08-15T09:00:00.000Z" },
    { id: "st-8", studentCode: "XYZ-2026-008", name: "Farzana Haque", email: "farzana.haque@gmail.com", phone: "+880 1813 445566", interestType: "study-abroad", targetCountry: "United Kingdom", createdAt: "2026-08-18T10:00:00.000Z" },
    { id: "st-9", studentCode: "XYZ-2026-009", name: "Mustafizur Rahman", email: "mustafiz.r@gmail.com", phone: "+880 1914 556677", interestType: "both", targetCountry: "Australia", createdAt: "2026-08-22T11:00:00.000Z" },
    { id: "st-10", studentCode: "XYZ-2026-010", name: "Nusrat Parveen", email: "nusrat.p@yahoo.com", phone: "+880 1615 667788", interestType: "study-abroad", targetCountry: "Sweden", createdAt: "2026-08-25T14:00:00.000Z" },
    { id: "st-11", studentCode: "XYZ-2026-011", name: "Imran Nazir", email: "imran.nazir@gmail.com", phone: "+880 1516 778899", interestType: "both", targetCountry: "USA", createdAt: "2026-08-28T09:30:00.000Z" },
    { id: "st-12", studentCode: "XYZ-2026-012", name: "Tasnim Tabassum", email: "tasnim.t@gmail.com", phone: "+880 1317 889900", interestType: "study-abroad", targetCountry: "Germany", createdAt: "2026-09-01T10:00:00.000Z" },
    { id: "st-13", studentCode: "XYZ-2026-013", name: "Shafiul Alam", email: "shafiul.a@gmail.com", phone: "+880 1718 990011", interestType: "both", targetCountry: "Malaysia", createdAt: "2026-09-02T11:30:00.000Z" },
    { id: "st-14", studentCode: "XYZ-2026-014", name: "Sabrina Akhter", email: "sabrina.akhter@gmail.com", phone: "+880 1819 001122", interestType: "study-abroad", targetCountry: "Japan", createdAt: "2026-09-02T15:00:00.000Z" },
    { id: "st-15", studentCode: "XYZ-2026-015", name: "Zulfiqar Ali", email: "zulfiqar.ali@gmail.com", phone: "+880 1920 112233", interestType: "both", targetCountry: "United Kingdom", createdAt: "2026-09-03T09:00:00.000Z" },
    { id: "st-16", studentCode: "XYZ-2026-016", name: "Jannatul Ferdous", email: "jannat.f@gmail.com", phone: "+880 1621 223344", interestType: "both", targetCountry: "Canada", createdAt: "2026-09-03T14:30:00.000Z" },
    { id: "st-17", studentCode: "XYZ-2026-017", name: "Sumaiya Binte Rafiq", email: "sumaiya.r@gmail.com", phone: "+880 1722 334455", interestType: "both", targetCountry: "United Kingdom", createdAt: "2026-09-04T09:00:00.000Z" },
    { id: "st-18", studentCode: "XYZ-2026-018", name: "Mahbubul Alam", email: "mahbubul.a@gmail.com", phone: "+880 1823 445566", interestType: "IELTS", targetCountry: "Australia", createdAt: "2026-09-04T10:30:00.000Z" },
    { id: "st-19", studentCode: "XYZ-2026-019", name: "Nafisa Tahnin", email: "nafisa.t@gmail.com", phone: "+880 1924 556677", interestType: "study-abroad", targetCountry: "Canada", createdAt: "2026-09-04T11:00:00.000Z" },
    { id: "st-20", studentCode: "XYZ-2026-020", name: "Rakibul Hasan", email: "rakibul.h@yahoo.com", phone: "+880 1625 667788", interestType: "both", targetCountry: "USA", createdAt: "2026-09-04T14:00:00.000Z" },
    { id: "st-21", studentCode: "XYZ-2026-021", name: "Tanzeela Chowdhury", email: "tanzeela.c@gmail.com", phone: "+880 1726 778899", interestType: "both", targetCountry: "Germany", createdAt: "2026-09-04T15:30:00.000Z" },
    { id: "st-22", studentCode: "XYZ-2026-022", name: "Md. Habibur Rahman", email: "habibur.r@gmail.com", phone: "+880 1827 889900", interestType: "IELTS", targetCountry: "United Kingdom", createdAt: "2026-09-05T09:00:00.000Z" },
    { id: "st-23", studentCode: "XYZ-2026-023", name: "Farzana Mostafa", email: "farzana.m@gmail.com", phone: "+880 1928 990011", interestType: "study-abroad", targetCountry: "Australia", createdAt: "2026-09-05T10:00:00.000Z" },
    { id: "st-24", studentCode: "XYZ-2026-024", name: "Saiful Islam", email: "saiful.i@gmail.com", phone: "+880 1629 001122", interestType: "both", targetCountry: "Malaysia", createdAt: "2026-09-05T11:30:00.000Z" },
    { id: "st-25", studentCode: "XYZ-2026-025", name: "Washiqa Noor", email: "washiqa.n@yahoo.com", phone: "+880 1730 112233", interestType: "IELTS", targetCountry: "Canada", createdAt: "2026-09-05T14:00:00.000Z" },
    { id: "st-26", studentCode: "XYZ-2026-026", name: "Anisur Rahman", email: "anisur.r@gmail.com", phone: "+880 1831 223344", interestType: "both", targetCountry: "Sweden", createdAt: "2026-09-05T15:00:00.000Z" },
    { id: "st-27", studentCode: "XYZ-2026-027", name: "Priya Das", email: "priya.d@gmail.com", phone: "+880 1932 334455", interestType: "study-abroad", targetCountry: "United Kingdom", createdAt: "2026-09-06T09:00:00.000Z" },
    { id: "st-28", studentCode: "XYZ-2026-028", name: "Mohammad Kaif", email: "mkaif@gmail.com", phone: "+880 1633 445566", interestType: "IELTS", targetCountry: "Australia", createdAt: "2026-09-06T10:00:00.000Z" },
    { id: "st-29", studentCode: "XYZ-2026-029", name: "Shirin Akter", email: "shirin.a@gmail.com", phone: "+880 1734 556677", interestType: "both", targetCountry: "USA", createdAt: "2026-09-06T11:00:00.000Z" },
    { id: "st-30", studentCode: "XYZ-2026-030", name: "Kamal Uddin", email: "kamal.u@yahoo.com", phone: "+880 1835 667788", interestType: "study-abroad", targetCountry: "Germany", createdAt: "2026-09-06T13:30:00.000Z" },
    { id: "st-31", studentCode: "XYZ-2026-031", name: "Nusrat Jahan", email: "nusrat.j@gmail.com", phone: "+880 1936 778899", interestType: "IELTS", targetCountry: "Canada", createdAt: "2026-09-06T14:00:00.000Z" },
    { id: "st-32", studentCode: "XYZ-2026-032", name: "Tanvir Hossain", email: "tanvir.h@gmail.com", phone: "+880 1637 889900", interestType: "both", targetCountry: "Japan", createdAt: "2026-09-06T15:00:00.000Z" },
    { id: "st-33", studentCode: "XYZ-2026-033", name: "Sabrina Yeasmin", email: "sabrina.y@gmail.com", phone: "+880 1738 990011", interestType: "study-abroad", targetCountry: "United Kingdom", createdAt: "2026-09-07T09:00:00.000Z" },
    { id: "st-34", studentCode: "XYZ-2026-034", name: "Afzal Hossain", email: "afzal.h@gmail.com", phone: "+880 1839 001122", interestType: "both", targetCountry: "Australia", createdAt: "2026-09-07T10:00:00.000Z" },
    { id: "st-35", studentCode: "XYZ-2026-035", name: "Tasnia Rahman", email: "tasnia.r@gmail.com", phone: "+880 1940 112233", interestType: "IELTS", targetCountry: "USA", createdAt: "2026-09-07T11:30:00.000Z" },
    { id: "st-36", studentCode: "XYZ-2026-036", name: "Raihan Siddique", email: "raihan.s@yahoo.com", phone: "+880 1641 223344", interestType: "both", targetCountry: "Canada", createdAt: "2026-09-07T14:00:00.000Z" },
    { id: "st-37", studentCode: "XYZ-2026-037", name: "Farida Begum", email: "farida.b@gmail.com", phone: "+880 1742 334455", interestType: "study-abroad", targetCountry: "Malaysia", createdAt: "2026-09-07T15:00:00.000Z" },
    { id: "st-38", studentCode: "XYZ-2026-038", name: "Zahidul Islam", email: "zahidul.i@gmail.com", phone: "+880 1843 445566", interestType: "IELTS", targetCountry: "Germany", createdAt: "2026-09-08T09:00:00.000Z" },
    { id: "st-39", studentCode: "XYZ-2026-039", name: "Rumaisa Khan", email: "rumaisa.k@gmail.com", phone: "+880 1944 556677", interestType: "both", targetCountry: "United Kingdom", createdAt: "2026-09-08T10:00:00.000Z" },
    { id: "st-40", studentCode: "XYZ-2026-040", name: "Sohel Rana", email: "sohel.r@gmail.com", phone: "+880 1645 667788", interestType: "study-abroad", targetCountry: "Australia", createdAt: "2026-09-08T11:00:00.000Z" },
    { id: "st-41", studentCode: "XYZ-2026-041", name: "Maliha Haque", email: "maliha.h@yahoo.com", phone: "+880 1746 778899", interestType: "both", targetCountry: "Canada", createdAt: "2026-09-08T14:00:00.000Z" },
    { id: "st-42", studentCode: "XYZ-2026-042", name: "Fahim Ahmed", email: "fahim.a@gmail.com", phone: "+880 1847 889900", interestType: "IELTS", targetCountry: "Sweden", createdAt: "2026-09-08T15:00:00.000Z" },
    { id: "st-43", studentCode: "XYZ-2026-043", name: "Nafisat Jahan", email: "nafisat.j@gmail.com", phone: "+880 1948 990011", interestType: "study-abroad", targetCountry: "USA", createdAt: "2026-09-09T09:00:00.000Z" },
    { id: "st-44", studentCode: "XYZ-2026-044", name: "Al Mamun", email: "almamun@gmail.com", phone: "+880 1649 001122", interestType: "both", targetCountry: "Germany", createdAt: "2026-09-09T10:00:00.000Z" },
    { id: "st-45", studentCode: "XYZ-2026-045", name: "Bushra Khatun", email: "bushra.k@gmail.com", phone: "+880 1750 112233", interestType: "IELTS", targetCountry: "United Kingdom", createdAt: "2026-09-09T11:30:00.000Z" },
    { id: "st-46", studentCode: "XYZ-2026-046", name: "Shahin Alam", email: "shahin.a@gmail.com", phone: "+880 1851 223344", interestType: "both", targetCountry: "Australia", createdAt: "2026-09-09T14:00:00.000Z" },
    { id: "st-47", studentCode: "XYZ-2026-047", name: "Rubaiyat Khan", email: "rubaiyat.k@yahoo.com", phone: "+880 1952 334455", interestType: "study-abroad", targetCountry: "Canada", createdAt: "2026-09-09T15:00:00.000Z" },
    { id: "st-48", studentCode: "XYZ-2026-048", name: "Hasina Akhter", email: "hasina.a@gmail.com", phone: "+880 1653 445566", interestType: "IELTS", targetCountry: "Malaysia", createdAt: "2026-09-10T09:00:00.000Z" },
    { id: "st-49", studentCode: "XYZ-2026-049", name: "Mominul Haque", email: "mominul.h@gmail.com", phone: "+880 1754 556677", interestType: "both", targetCountry: "Japan", createdAt: "2026-09-10T10:00:00.000Z" },
    { id: "st-50", studentCode: "XYZ-2026-050", name: "Samira Rahman", email: "samira.r@gmail.com", phone: "+880 1855 667788", interestType: "study-abroad", targetCountry: "United Kingdom", createdAt: "2026-09-10T11:00:00.000Z" },
    { id: "st-51", studentCode: "XYZ-2026-051", name: "Yusuf Ali", email: "yusuf.ali@gmail.com", phone: "+880 1956 778899", interestType: "both", targetCountry: "USA", createdAt: "2026-09-10T14:00:00.000Z" },
    { id: "st-52", studentCode: "XYZ-2026-052", name: "Rokeya Khatun", email: "rokeya.k@gmail.com", phone: "+880 1657 889900", interestType: "IELTS", targetCountry: "Australia", createdAt: "2026-09-10T15:00:00.000Z" },
    { id: "st-53", studentCode: "XYZ-2026-053", name: "Aminul Islam", email: "aminul.i@gmail.com", phone: "+880 1758 990011", interestType: "both", targetCountry: "Germany", createdAt: "2026-09-11T09:00:00.000Z" },
    { id: "st-54", studentCode: "XYZ-2026-054", name: "Fatima Rahman", email: "fatima.r@gmail.com", phone: "+880 1859 001122", interestType: "study-abroad", targetCountry: "Canada", createdAt: "2026-09-11T10:00:00.000Z" },
    { id: "st-55", studentCode: "XYZ-2026-055", name: "Habib Rahman", email: "habib.r@yahoo.com", phone: "+880 1960 112233", interestType: "IELTS", targetCountry: "United Kingdom", createdAt: "2026-09-11T11:30:00.000Z" },
    { id: "st-56", studentCode: "XYZ-2026-056", name: "Shabnam Ara", email: "shabnam.a@gmail.com", phone: "+880 1661 223344", interestType: "both", targetCountry: "Australia", createdAt: "2026-09-11T14:00:00.000Z" },
    { id: "st-57", studentCode: "XYZ-2026-057", name: "Jamal Uddin", email: "jamal.u@gmail.com", phone: "+880 1762 334455", interestType: "study-abroad", targetCountry: "Sweden", createdAt: "2026-09-11T15:00:00.000Z" },
    { id: "st-58", studentCode: "XYZ-2026-058", name: "Salma Khatun", email: "salma.k@gmail.com", phone: "+880 1863 445566", interestType: "both", targetCountry: "USA", createdAt: "2026-09-12T09:00:00.000Z" },
    { id: "st-59", studentCode: "XYZ-2026-059", name: "Rashedul Islam", email: "rashedul.i@yahoo.com", phone: "+880 1964 556677", interestType: "IELTS", targetCountry: "Germany", createdAt: "2026-09-12T10:00:00.000Z" },
    { id: "st-60", studentCode: "XYZ-2026-060", name: "Nazma Begum", email: "nazma.b@gmail.com", phone: "+880 1665 667788", interestType: "study-abroad", targetCountry: "Malaysia", createdAt: "2026-09-12T11:00:00.000Z" },
    { id: "st-61", studentCode: "XYZ-2026-061", name: "Sakib Al Hasan", email: "sakib.h@gmail.com", phone: "+880 1766 778899", interestType: "both", targetCountry: "Canada", createdAt: "2026-09-12T14:00:00.000Z" },
    { id: "st-62", studentCode: "XYZ-2026-062", name: "Mst. Roksana", email: "roksana.m@gmail.com", phone: "+880 1867 889900", interestType: "IELTS", targetCountry: "United Kingdom", createdAt: "2026-09-12T15:00:00.000Z" },
    { id: "st-63", studentCode: "XYZ-2026-063", name: "Shariful Islam", email: "shariful.i@gmail.com", phone: "+880 1968 990011", interestType: "both", targetCountry: "Australia", createdAt: "2026-09-13T09:00:00.000Z" },
    { id: "st-64", studentCode: "XYZ-2026-064", name: "Ruma Akter", email: "ruma.a@gmail.com", phone: "+880 1669 001122", interestType: "study-abroad", targetCountry: "Japan", createdAt: "2026-09-13T10:00:00.000Z" },
    { id: "st-65", studentCode: "XYZ-2026-065", name: "Biplob Kumar", email: "biplob.k@yahoo.com", phone: "+880 1770 112233", interestType: "both", targetCountry: "Germany", createdAt: "2026-09-13T11:30:00.000Z" },
    { id: "st-66", studentCode: "XYZ-2026-066", name: "Farhana Parveen", email: "farhana.p@gmail.com", phone: "+880 1871 223344", interestType: "IELTS", targetCountry: "Canada", createdAt: "2026-09-13T14:00:00.000Z" },
  ];
  const note = (at, by, text, type) => ({ at, by, text, type });
  const applications = [
    {
      id: "ap-1", studentId: "st-1", counselorId: "u-c1",
      targetCountry: "United Kingdom", targetUniversity: "University of Manchester", targetProgram: "MSc Data Science", intake: "Sept 2026",
      stage: "documents", visaDeadline: "2026-11-15",
      interviewDate: "2026-10-05", interviewType: "University Credibility", interviewNotes: "Online interview with admissions panel scheduled.",
      cvReviewStatus: "approved", cvReviewNotes: "Academic CV reviewed and approved for submission.",
      notes: [
        note("2026-08-12T10:00:00.000Z", "u-c1", "Initial counseling completed. Target intake Sept 2026.", "note"),
        note("2026-08-18T10:00:00.000Z", "u-c1", "Application documentation checklist shared with student.", "stage")
      ],
      updatedAt: "2026-08-18T10:00:00.000Z",
    },
    {
      id: "ap-2", studentId: "st-2", counselorId: "u-c2",
      targetCountry: "Canada", targetUniversity: "University of Toronto", targetProgram: "Master of Engineering", intake: "Jan 2027",
      stage: "visa", visaDeadline: "2026-09-20",
      interviewDate: "2026-09-15", interviewType: "Embassy Visa", interviewNotes: "Visa interview at Canadian High Commission, Dhaka.",
      cvReviewStatus: "approved", cvReviewNotes: "CV and SOP verified for visa submission.",
      notes: [
        note("2026-07-04T10:00:00.000Z", "u-c2", "Profile assessment completed. High CGPA.", "note"),
        note("2026-08-15T14:30:00.000Z", "u-c2", "Offer letter confirmed. GIC payment done.", "note"),
        note("2026-08-30T10:00:00.000Z", "u-c2", "Biometrics appointed for Sept 10. Visa file lodged.", "stage")
      ],
      updatedAt: "2026-08-30T10:00:00.000Z",
    },
    {
      id: "ap-4", studentId: "st-4", counselorId: "u-c1",
      targetCountry: "Australia", targetUniversity: "Monash University", targetProgram: "Bachelor of Business Analytics", intake: "Feb 2027",
      stage: "inquiry", visaDeadline: "",
      interviewDate: "", interviewType: "", interviewNotes: "",
      cvReviewStatus: "pending", cvReviewNotes: "",
      notes: [note("2026-09-01T11:00:00.000Z", "u-c1", "Walk-in consultation. Comparing Monash and Melbourne.", "note")],
      updatedAt: "2026-09-01T11:00:00.000Z",
    },
    {
      id: "ap-5", studentId: "st-5", counselorId: "u-c1",
      targetCountry: "Germany", targetUniversity: "TU Munich", targetProgram: "MSc Informatics", intake: "Winter 2026",
      stage: "offer", visaDeadline: "2026-10-05",
      interviewDate: "", interviewType: "", interviewNotes: "",
      cvReviewStatus: "approved", cvReviewNotes: "German academic CV (Lebenslauf) format approved.",
      notes: [note("2026-07-22T10:00:00.000Z", "u-c1", "Conditional Admission Offer letter received.", "note")],
      updatedAt: "2026-08-14T10:00:00.000Z",
    },
    {
      id: "ap-6", studentId: "st-6", counselorId: "u-c2",
      targetCountry: "USA", targetUniversity: "Arizona State University", targetProgram: "MS Computer Science", intake: "Spring 2027",
      stage: "inquiry", visaDeadline: "",
      interviewDate: "", interviewType: "", interviewNotes: "",
      cvReviewStatus: "pending", cvReviewNotes: "",
      notes: [note("2026-09-02T09:30:00.000Z", "u-c2", "Preparing GRE and IELTS requirements.", "note")],
      updatedAt: "2026-09-02T09:30:00.000Z",
    },
    {
      id: "ap-7", studentId: "st-3", counselorId: "u-c1",
      targetCountry: "Australia", targetUniversity: "University of Sydney", targetProgram: "Master of Nursing", intake: "Feb 2027",
      stage: "rejected", visaDeadline: "",
      interviewDate: "", interviewType: "", interviewNotes: "",
      cvReviewStatus: "approved", cvReviewNotes: "CV acceptable but IELTS score below university minimum.",
      notes: [
        note("2026-08-25T10:00:00.000Z", "u-c1", "Application submitted to University of Sydney.", "stage"),
        note("2026-09-01T14:00:00.000Z", "u-c1", "University declined: IELTS Overall 6.0 below 7.0 requirement.", "note")
      ],
      updatedAt: "2026-09-01T14:00:00.000Z",
    },
    {
      id: "ap-8", studentId: "st-7", counselorId: "u-c2",
      targetCountry: "Canada", targetUniversity: "University of Waterloo", targetProgram: "Master of Mathematics (CS)", intake: "Jan 2027",
      stage: "offer", visaDeadline: "2026-11-01",
      interviewDate: "2026-09-18", interviewType: "Scholarship Interview", interviewNotes: "Faculty entrance scholarship interview online.",
      cvReviewStatus: "approved", cvReviewNotes: "Exceptional undergraduate research paper in algorithms.",
      notes: [note("2026-08-16T11:00:00.000Z", "u-c2", "Waterloo graduate admission offer received.", "note")],
      updatedAt: "2026-08-29T10:00:00.000Z",
    },
    {
      id: "ap-9", studentId: "st-8", counselorId: "u-c1",
      targetCountry: "United Kingdom", targetUniversity: "Queen Mary University of London", targetProgram: "LLM International Commercial Law", intake: "Sept 2026",
      stage: "visa", visaDeadline: "2026-09-28",
      interviewDate: "", interviewType: "", interviewNotes: "",
      cvReviewStatus: "approved", cvReviewNotes: "Bar Council background and advocacy moot competition laurels included.",
      notes: [note("2026-08-20T14:00:00.000Z", "u-c1", "CAS issued by QMUL. Visa appointment booked at VFS Sylhet.", "stage")],
      updatedAt: "2026-09-01T10:00:00.000Z",
    },
    {
      id: "ap-10", studentId: "st-9", counselorId: "u-c1",
      targetCountry: "Australia", targetUniversity: "University of Queensland", targetProgram: "Master of Public Health", intake: "Feb 2027",
      stage: "documents", visaDeadline: "2026-12-10",
      interviewDate: "", interviewType: "", interviewNotes: "",
      cvReviewStatus: "pending", cvReviewNotes: "Medical degree transcript translation verification ongoing.",
      notes: [note("2026-08-23T10:00:00.000Z", "u-c1", "Awaiting official BMDC registration certificate copy.", "note")],
      updatedAt: "2026-08-28T09:00:00.000Z",
    },
    {
      id: "ap-11", studentId: "st-10", counselorId: "u-c3",
      targetCountry: "Sweden", targetUniversity: "KTH Royal Institute of Technology", targetProgram: "MSc Sustainable Energy Engineering", intake: "Autumn 2027",
      stage: "inquiry", visaDeadline: "",
      interviewDate: "", interviewType: "", interviewNotes: "",
      cvReviewStatus: "pending", cvReviewNotes: "Preparing Swedish university admission portal documentation.",
      notes: [note("2026-08-26T15:00:00.000Z", "u-c3", "Consultation on Swedish Institute scholarship eligibility.", "note")],
      updatedAt: "2026-08-26T15:00:00.000Z",
    },
    {
      id: "ap-12", studentId: "st-11", counselorId: "u-c3",
      targetCountry: "USA", targetUniversity: "Northeastern University", targetProgram: "MS Data Analytics & AI", intake: "Spring 2027",
      stage: "documents", visaDeadline: "2026-11-20",
      interviewDate: "2026-10-12", interviewType: "Credibility", interviewNotes: "Preparing DS-160 financial documentation.",
      cvReviewStatus: "approved", cvReviewNotes: "Solid Python and ML GitHub project portfolio verified.",
      notes: [note("2026-08-30T12:00:00.000Z", "u-c3", "I-20 request submitted to Northeastern admissions desk.", "note")],
      updatedAt: "2026-09-02T10:00:00.000Z",
    },
    {
      id: "ap-13", studentId: "st-12", counselorId: "u-c1",
      targetCountry: "Germany", targetUniversity: "RWTH Aachen", targetProgram: "MSc Automotive Systems", intake: "Summer 2027",
      stage: "offer", visaDeadline: "2026-12-05",
      interviewDate: "", interviewType: "", interviewNotes: "",
      cvReviewStatus: "approved", cvReviewNotes: "APS certificate and blocked account confirmation received.",
      notes: [note("2026-09-01T14:30:00.000Z", "u-c1", "Admission offer issued. Fintiba blocked account funded.", "stage")],
      updatedAt: "2026-09-03T11:00:00.000Z",
    },
    {
      id: "ap-14", studentId: "st-13", counselorId: "u-c1",
      targetCountry: "Malaysia", targetUniversity: "University of Malaya", targetProgram: "Bachelor of Software Engineering", intake: "Oct 2026",
      stage: "completed", visaDeadline: "2026-09-15",
      interviewDate: "", interviewType: "", interviewNotes: "",
      cvReviewStatus: "approved", cvReviewNotes: "EMGS VAL (Visa Approval Letter) received.",
      notes: [note("2026-09-02T16:00:00.000Z", "u-c1", "Single Entry Visa approved by Malaysian High Commission. Flight booked.", "stage")],
      updatedAt: "2026-09-02T16:00:00.000Z",
    },
    {
      id: "ap-15", studentId: "st-14", counselorId: "u-c3",
      targetCountry: "Japan", targetUniversity: "Kyoto University", targetProgram: "Kyoto-iUP Global Undergraduate", intake: "Spring 2027",
      stage: "inquiry", visaDeadline: "",
      interviewDate: "", interviewType: "", interviewNotes: "",
      cvReviewStatus: "pending", cvReviewNotes: "Reviewing Japanese language JLPT requirements.",
      notes: [note("2026-09-02T15:30:00.000Z", "u-c3", "Japanese embassy scholarship guidelines provided.", "note")],
      updatedAt: "2026-09-02T15:30:00.000Z",
    },
    {
      id: "ap-16", studentId: "st-15", counselorId: "u-c1",
      targetCountry: "United Kingdom", targetUniversity: "University of Birmingham", targetProgram: "MBA International Business", intake: "Jan 2027",
      stage: "offer", visaDeadline: "2026-11-25",
      interviewDate: "2026-09-22", interviewType: "University Pre-CAS", interviewNotes: "Pre-CAS interview preparation with senior counselor.",
      cvReviewStatus: "approved", cvReviewNotes: "Executive CV with 4 years corporate banking experience.",
      notes: [note("2026-09-03T10:00:00.000Z", "u-c1", "Unconditional offer letter secured with £4,000 dean scholarship.", "note")],
      updatedAt: "2026-09-03T10:00:00.000Z",
    },
    {
      id: "ap-17", studentId: "st-16", counselorId: "u-c2",
      targetCountry: "Canada", targetUniversity: "Humber College", targetProgram: "Postgraduate Certificate in Project Management", intake: "Jan 2027",
      stage: "visa", visaDeadline: "2026-10-15",
      interviewDate: "", interviewType: "", interviewNotes: "",
      cvReviewStatus: "approved", cvReviewNotes: "SOP explains clear career progression back to Bangladesh.",
      notes: [note("2026-09-03T15:00:00.000Z", "u-c2", "Tuition fee transferred. SDS visa stream checklist ready.", "stage")],
      updatedAt: "2026-09-03T15:00:00.000Z",
    },
    {
      id: "ap-18", studentId: "st-17", counselorId: "u-c5",
      targetCountry: "United Kingdom", targetUniversity: "University of Leeds", targetProgram: "MSc International Marketing", intake: "Jan 2027",
      stage: "documents", visaDeadline: "2026-11-30",
      interviewDate: "2026-10-10", interviewType: "University Credibility", interviewNotes: "Online credibility interview scheduled.",
      cvReviewStatus: "approved", cvReviewNotes: "Marketing background with strong internship portfolio.",
      notes: [note("2026-09-04T10:00:00.000Z", "u-c5", "Initial counseling done. Target Jan 2027 intake.", "note")],
      updatedAt: "2026-09-05T10:00:00.000Z",
    },
    {
      id: "ap-19", studentId: "st-19", counselorId: "u-c6",
      targetCountry: "Canada", targetUniversity: "University of British Columbia", targetProgram: "BSc Computer Science", intake: "Jan 2027",
      stage: "visa", visaDeadline: "2026-10-20",
      interviewDate: "", interviewType: "", interviewNotes: "",
      cvReviewStatus: "approved", cvReviewNotes: "GIC funded. Tuition deposit confirmed.",
      notes: [note("2026-09-05T11:30:00.000Z", "u-c6", "Study permit application lodged with IRCC.", "stage")],
      updatedAt: "2026-09-10T09:00:00.000Z",
    },
    {
      id: "ap-20", studentId: "st-20", counselorId: "u-c2",
      targetCountry: "USA", targetUniversity: "University of Texas at Austin", targetProgram: "MS Business Analytics", intake: "Spring 2027",
      stage: "applied", visaDeadline: "",
      interviewDate: "2026-10-15", interviewType: "University Credibility", interviewNotes: "GRE score submission pending.",
      cvReviewStatus: "approved", cvReviewNotes: "Strong quant background. GRE 320+.",
      notes: [note("2026-09-06T10:00:00.000Z", "u-c2", "Application submitted via Common App.", "stage")],
      updatedAt: "2026-09-08T10:00:00.000Z",
    },
    {
      id: "ap-21", studentId: "st-21", counselorId: "u-c5",
      targetCountry: "Germany", targetUniversity: "TU Berlin", targetProgram: "MSc Data Science", intake: "Summer 2027",
      stage: "inquiry", visaDeadline: "",
      interviewDate: "", interviewType: "", interviewNotes: "",
      cvReviewStatus: "pending", cvReviewNotes: "",
      notes: [note("2026-09-05T16:00:00.000Z", "u-c5", "Walk-in inquiry. Comparing TU Berlin and RWTH Aachen.", "note")],
      updatedAt: "2026-09-05T16:00:00.000Z",
    },
    {
      id: "ap-22", studentId: "st-25", counselorId: "u-c6",
      targetCountry: "Canada", targetUniversity: "McGill University", targetProgram: "MSc Computer Science", intake: "Sept 2027",
      stage: "inquiry", visaDeadline: "",
      interviewDate: "", interviewType: "", interviewNotes: "",
      cvReviewStatus: "pending", cvReviewNotes: "",
      notes: [note("2026-09-06T09:30:00.000Z", "u-c6", "Online inquiry. Wants to apply for Sept 2027.", "note")],
      updatedAt: "2026-09-06T09:30:00.000Z",
    },
    {
      id: "ap-23", studentId: "st-30", counselorId: "u-c5",
      targetCountry: "Germany", targetUniversity: "Heidelberg University", targetProgram: "MSc Molecular Biology", intake: "Winter 2027",
      stage: "documents", visaDeadline: "2027-03-01",
      interviewDate: "", interviewType: "", interviewNotes: "",
      cvReviewStatus: "approved", cvReviewNotes: "APS certificate under processing.",
      notes: [note("2026-09-08T10:00:00.000Z", "u-c5", "uni-assist documentation checklist sent.", "note")],
      updatedAt: "2026-09-09T10:00:00.000Z",
    },
    {
      id: "ap-24", studentId: "st-34", counselorId: "u-c5",
      targetCountry: "Australia", targetUniversity: "University of Melbourne", targetProgram: "Master of Finance", intake: "Feb 2027",
      stage: "offer", visaDeadline: "2026-12-15",
      interviewDate: "", interviewType: "", interviewNotes: "",
      cvReviewStatus: "approved", cvReviewNotes: "Unconditional offer with 15% international merit scholarship.",
      notes: [note("2026-09-09T11:00:00.000Z", "u-c5", "Offer letter secured. Scholarship confirmed.", "note")],
      updatedAt: "2026-09-10T10:00:00.000Z",
    },
    {
      id: "ap-25", studentId: "st-39", counselorId: "u-c1",
      targetCountry: "United Kingdom", targetUniversity: "University of Edinburgh", targetProgram: "MSc Artificial Intelligence", intake: "Sept 2027",
      stage: "inquiry", visaDeadline: "",
      interviewDate: "", interviewType: "", interviewNotes: "",
      cvReviewStatus: "pending", cvReviewNotes: "",
      notes: [note("2026-09-08T10:30:00.000Z", "u-c1", "Initial consultation. Strong CS background.", "note")],
      updatedAt: "2026-09-08T10:30:00.000Z",
    },
    {
      id: "ap-26", studentId: "st-41", counselorId: "u-c6",
      targetCountry: "Canada", targetUniversity: "York University", targetProgram: "MBA International Business", intake: "Jan 2027",
      stage: "documents", visaDeadline: "2026-11-20",
      interviewDate: "", interviewType: "", interviewNotes: "",
      cvReviewStatus: "approved", cvReviewNotes: "5 years corporate experience verified.",
      notes: [note("2026-09-08T14:30:00.000Z", "u-c6", "SOP and LOR submitted. Awaiting York admissions decision.", "note")],
      updatedAt: "2026-09-09T10:00:00.000Z",
    },
    {
      id: "ap-27", studentId: "st-46", counselorId: "u-c5",
      targetCountry: "Australia", targetUniversity: "University of New South Wales", targetProgram: "MSc Information Technology", intake: "Feb 2027",
      stage: "applied", visaDeadline: "",
      interviewDate: "", interviewType: "", interviewNotes: "",
      cvReviewStatus: "approved", cvReviewNotes: "Application lodged via UNSW online portal.",
      notes: [note("2026-09-09T14:30:00.000Z", "u-c5", "Application submitted. COE expected within 4 weeks.", "stage")],
      updatedAt: "2026-09-10T10:00:00.000Z",
    },
    {
      id: "ap-28", studentId: "st-50", counselorId: "u-c1",
      targetCountry: "United Kingdom", targetUniversity: "King's College London", targetProgram: "MA Digital Culture & Society", intake: "Sept 2027",
      stage: "inquiry", visaDeadline: "",
      interviewDate: "", interviewType: "", interviewNotes: "",
      cvReviewStatus: "pending", cvReviewNotes: "",
      notes: [note("2026-09-10T11:30:00.000Z", "u-c1", "Phone inquiry about KCL digital humanities programs.", "note")],
      updatedAt: "2026-09-10T11:30:00.000Z",
    },
    {
      id: "ap-29", studentId: "st-54", counselorId: "u-c6",
      targetCountry: "Canada", targetUniversity: "University of Alberta", targetProgram: "MEng Civil Engineering", intake: "Jan 2027",
      stage: "offer", visaDeadline: "2026-11-25",
      interviewDate: "", interviewType: "", interviewNotes: "",
      cvReviewStatus: "approved", cvReviewNotes: "Offer letter with 20% tuition scholarship received.",
      notes: [note("2026-09-11T11:00:00.000Z", "u-c6", "Offer confirmed. Proceeding with SDS study permit.", "note")],
      updatedAt: "2026-09-12T10:00:00.000Z",
    },
    {
      id: "ap-30", studentId: "st-61", counselorId: "u-c6",
      targetCountry: "Canada", targetUniversity: "University of Calgary", targetProgram: "MBA", intake: "Sept 2027",
      stage: "inquiry", visaDeadline: "",
      interviewDate: "", interviewType: "", interviewNotes: "",
      cvReviewStatus: "pending", cvReviewNotes: "",
      notes: [note("2026-09-12T14:30:00.000Z", "u-c6", "Walk-in inquiry. Interested in Canadian MBA programs.", "note")],
      updatedAt: "2026-09-12T14:30:00.000Z",
    },
    {
      id: "ap-31", studentId: "st-65", counselorId: "u-c5",
      targetCountry: "Germany", targetUniversity: "University of Stuttgart", targetProgram: "MSc Automotive Engineering", intake: "Summer 2027",
      stage: "inquiry", visaDeadline: "",
      interviewDate: "", interviewType: "", interviewNotes: "",
      cvReviewStatus: "pending", cvReviewNotes: "",
      notes: [note("2026-09-13T11:00:00.000Z", "u-c5", "Phone consultation on APS and blocked account.", "note")],
      updatedAt: "2026-09-13T11:00:00.000Z",
    },
  ];
  const documents = [
    { id: "dc-1", studentId: "st-1", applicationId: "ap-1", docType: "Passport", fileName: "ayesha_passport_scan.pdf", fileUrl: "", status: "approved", reviewedBy: "u-c1", updatedAt: "2026-08-19T09:00:00.000Z" },
    { id: "dc-2", studentId: "st-1", applicationId: "ap-1", docType: "Academic transcripts", fileName: "ayesha_bsc_transcripts.pdf", fileUrl: "", status: "pending", reviewedBy: "", updatedAt: "2026-08-20T09:00:00.000Z" },
    { id: "dc-3", studentId: "st-1", applicationId: "ap-1", docType: "Statement of purpose (SOP)", fileName: "ayesha_sop_manchester_v1.docx", fileUrl: "", status: "rejected", reviewedBy: "u-c1", remarks: "Please expand academic reasons for selecting Manchester.", updatedAt: "2026-08-21T09:00:00.000Z" },
    { id: "dc-4", studentId: "st-2", applicationId: "ap-2", docType: "Passport", fileName: "rahim_passport_valid2030.pdf", fileUrl: "", status: "approved", reviewedBy: "u-c2", updatedAt: "2026-07-20T09:00:00.000Z" },
    { id: "dc-5", studentId: "st-2", applicationId: "ap-2", docType: "Bank solvency certificate", fileName: "rahim_bank_solvency_verified.pdf", fileUrl: "", status: "approved", reviewedBy: "u-c2", updatedAt: "2026-08-01T09:00:00.000Z" },
  ];
  const batches = [
    { id: "bt-1", batchCode: "IEL-EVE", batchName: "IELTS Regular Evening (Batch 01)", instructorId: "u-i1", schedule: "Sun, Tue, Thu · 6:30 PM – 8:30 PM", room: "Studio A (Dhaka)", startDate: "2026-08-01", endDate: "2026-10-15", maxCapacity: 25 },
    { id: "bt-2", batchCode: "IEL-WKD", batchName: "IELTS Executive Weekend (Batch 02)", instructorId: "u-i2", schedule: "Fri & Sat · 10:00 AM – 1:00 PM", room: "Studio B (Online Live)", startDate: "2026-09-05", endDate: "2026-11-20", maxCapacity: 25 },
    { id: "bt-3", batchCode: "IEL-MORN", batchName: "IELTS Intensive Morning Crash Course (Batch 03)", instructorId: "u-i1", schedule: "Mon, Wed, Thu · 9:00 AM – 11:30 AM", room: "Studio A (Dhaka)", startDate: "2026-09-08", endDate: "2026-11-10", maxCapacity: 20 },
    { id: "bt-4", batchCode: "SPK-ENG", batchName: "Spoken English & Accent Fluency Club (Batch 04)", instructorId: "u-i2", schedule: "Fri & Sat · 4:00 PM – 6:00 PM", room: "Language Lounge", startDate: "2026-09-01", endDate: "2026-11-30", maxCapacity: 25 },
    { id: "bt-5", batchCode: "PTE-ACAD", batchName: "PTE Academic Fast-Track Masterclass (Batch 05)", instructorId: "u-i2", schedule: "Sun, Tue, Thu · 4:30 PM – 6:30 PM", room: "Computer Lab 1", startDate: "2026-09-10", endDate: "2026-11-15", maxCapacity: 20 },
    { id: "bt-6", batchCode: "GRE-SAT", batchName: "GRE / SAT Quantitative & Verbal Prep (Batch 06)", instructorId: "u-i1", schedule: "Mon, Wed, Fri · 6:30 PM – 8:30 PM", room: "Studio B (Online Live)", startDate: "2026-09-12", endDate: "2026-12-15", maxCapacity: 25 },
    { id: "bt-7", batchCode: "IEL-ADV", batchName: "IELTS Band 8+ Advanced Writing & Speaking Clinic (Batch 07)", instructorId: "u-i1", schedule: "Sat & Sun · 2:00 PM – 4:30 PM", room: "Executive Seminar Room", startDate: "2026-09-15", endDate: "2026-11-25", maxCapacity: 15 },
  ];
  const enrollments = [
    // Batch 1: IELTS Regular Evening - 15 students (75% of 20)
    { id: "en-1", studentId: "st-1", batchId: "bt-1", classStudentId: "XYZ-IEL-001", enrolledAt: "2026-08-02T09:00:00.000Z", status: "active" },
    { id: "en-2", studentId: "st-3", batchId: "bt-1", classStudentId: "XYZ-IEL-002", enrolledAt: "2026-08-04T09:00:00.000Z", status: "active" },
    { id: "en-4", studentId: "st-4", batchId: "bt-1", classStudentId: "XYZ-IEL-003", enrolledAt: "2026-08-10T09:00:00.000Z", status: "active" },
    { id: "en-5", studentId: "st-5", batchId: "bt-1", classStudentId: "XYZ-IEL-004", enrolledAt: "2026-08-12T09:00:00.000Z", status: "active" },
    { id: "en-18", studentId: "st-17", batchId: "bt-1", classStudentId: "XYZ-IEL-005", enrolledAt: "2026-09-04T10:00:00.000Z", status: "active" },
    { id: "en-19", studentId: "st-19", batchId: "bt-1", classStudentId: "XYZ-IEL-006", enrolledAt: "2026-09-05T11:00:00.000Z", status: "active" },
    { id: "en-20", studentId: "st-21", batchId: "bt-1", classStudentId: "XYZ-IEL-007", enrolledAt: "2026-09-05T15:00:00.000Z", status: "active" },
    { id: "en-21", studentId: "st-25", batchId: "bt-1", classStudentId: "XYZ-IEL-008", enrolledAt: "2026-09-06T09:00:00.000Z", status: "active" },
    { id: "en-22", studentId: "st-27", batchId: "bt-1", classStudentId: "XYZ-IEL-009", enrolledAt: "2026-09-06T11:00:00.000Z", status: "active" },
    { id: "en-23", studentId: "st-33", batchId: "bt-1", classStudentId: "XYZ-IEL-010", enrolledAt: "2026-09-07T10:00:00.000Z", status: "active" },
    { id: "en-24", studentId: "st-39", batchId: "bt-1", classStudentId: "XYZ-IEL-011", enrolledAt: "2026-09-08T10:00:00.000Z", status: "active" },
    { id: "en-25", studentId: "st-45", batchId: "bt-1", classStudentId: "XYZ-IEL-012", enrolledAt: "2026-09-09T11:00:00.000Z", status: "active" },
    { id: "en-26", studentId: "st-50", batchId: "bt-1", classStudentId: "XYZ-IEL-013", enrolledAt: "2026-09-10T11:00:00.000Z", status: "active" },
    { id: "en-27", studentId: "st-55", batchId: "bt-1", classStudentId: "XYZ-IEL-014", enrolledAt: "2026-09-11T11:00:00.000Z", status: "active" },
    { id: "en-28", studentId: "st-62", batchId: "bt-1", classStudentId: "XYZ-IEL-015", enrolledAt: "2026-09-12T15:00:00.000Z", status: "active" },

    // Batch 2: IELTS Executive Weekend - 19 students (75% of 25)
    { id: "en-3", studentId: "st-4", batchId: "bt-2", classStudentId: "XYZ-IEL-101", enrolledAt: "2026-09-01T12:00:00.000Z", status: "active" },
    { id: "en-6", studentId: "st-6", batchId: "bt-2", classStudentId: "XYZ-IEL-102", enrolledAt: "2026-09-02T10:00:00.000Z", status: "active" },
    { id: "en-29", studentId: "st-18", batchId: "bt-2", classStudentId: "XYZ-IEL-103", enrolledAt: "2026-09-05T10:00:00.000Z", status: "active" },
    { id: "en-30", studentId: "st-20", batchId: "bt-2", classStudentId: "XYZ-IEL-104", enrolledAt: "2026-09-05T14:00:00.000Z", status: "active" },
    { id: "en-31", studentId: "st-22", batchId: "bt-2", classStudentId: "XYZ-IEL-105", enrolledAt: "2026-09-06T09:00:00.000Z", status: "active" },
    { id: "en-32", studentId: "st-28", batchId: "bt-2", classStudentId: "XYZ-IEL-106", enrolledAt: "2026-09-06T10:00:00.000Z", status: "active" },
    { id: "en-33", studentId: "st-34", batchId: "bt-2", classStudentId: "XYZ-IEL-107", enrolledAt: "2026-09-07T10:00:00.000Z", status: "active" },
    { id: "en-34", studentId: "st-40", batchId: "bt-2", classStudentId: "XYZ-IEL-108", enrolledAt: "2026-09-08T11:00:00.000Z", status: "active" },
    { id: "en-35", studentId: "st-46", batchId: "bt-2", classStudentId: "XYZ-IEL-109", enrolledAt: "2026-09-09T14:00:00.000Z", status: "active" },
    { id: "en-36", studentId: "st-52", batchId: "bt-2", classStudentId: "XYZ-IEL-110", enrolledAt: "2026-09-10T15:00:00.000Z", status: "active" },
    { id: "en-37", studentId: "st-56", batchId: "bt-2", classStudentId: "XYZ-IEL-111", enrolledAt: "2026-09-11T14:00:00.000Z", status: "active" },
    { id: "en-38", studentId: "st-63", batchId: "bt-2", classStudentId: "XYZ-IEL-112", enrolledAt: "2026-09-13T09:00:00.000Z", status: "active" },

    // Batch 3: IELTS Intensive Morning - 15 students (75% of 20)
    { id: "en-7", studentId: "st-7", batchId: "bt-3", classStudentId: "XYZ-IEL-301", enrolledAt: "2026-09-04T09:00:00.000Z", status: "active" },
    { id: "en-8", studentId: "st-8", batchId: "bt-3", classStudentId: "XYZ-IEL-302", enrolledAt: "2026-09-04T10:00:00.000Z", status: "active" },
    { id: "en-9", studentId: "st-11", batchId: "bt-3", classStudentId: "XYZ-IEL-303", enrolledAt: "2026-09-05T09:00:00.000Z", status: "active" },
    { id: "en-39", studentId: "st-23", batchId: "bt-3", classStudentId: "XYZ-IEL-304", enrolledAt: "2026-09-05T11:00:00.000Z", status: "active" },
    { id: "en-40", studentId: "st-29", batchId: "bt-3", classStudentId: "XYZ-IEL-305", enrolledAt: "2026-09-06T11:00:00.000Z", status: "active" },
    { id: "en-41", studentId: "st-35", batchId: "bt-3", classStudentId: "XYZ-IEL-306", enrolledAt: "2026-09-07T11:00:00.000Z", status: "active" },
    { id: "en-42", studentId: "st-41", batchId: "bt-3", classStudentId: "XYZ-IEL-307", enrolledAt: "2026-09-08T14:00:00.000Z", status: "active" },
    { id: "en-43", studentId: "st-48", batchId: "bt-3", classStudentId: "XYZ-IEL-308", enrolledAt: "2026-09-10T09:00:00.000Z", status: "active" },
    { id: "en-44", studentId: "st-53", batchId: "bt-3", classStudentId: "XYZ-IEL-309", enrolledAt: "2026-09-11T09:00:00.000Z", status: "active" },
    { id: "en-45", studentId: "st-59", batchId: "bt-3", classStudentId: "XYZ-IEL-310", enrolledAt: "2026-09-12T10:00:00.000Z", status: "active" },

    // Batch 4: Spoken English - 19 students (75% of 25)
    { id: "en-10", studentId: "st-9", batchId: "bt-4", classStudentId: "XYZ-SPK-401", enrolledAt: "2026-09-01T11:00:00.000Z", status: "active" },
    { id: "en-11", studentId: "st-13", batchId: "bt-4", classStudentId: "XYZ-SPK-402", enrolledAt: "2026-09-02T14:00:00.000Z", status: "active" },
    { id: "en-12", studentId: "st-14", batchId: "bt-4", classStudentId: "XYZ-SPK-403", enrolledAt: "2026-09-02T15:00:00.000Z", status: "active" },
    { id: "en-46", studentId: "st-24", batchId: "bt-4", classStudentId: "XYZ-SPK-404", enrolledAt: "2026-09-05T14:00:00.000Z", status: "active" },
    { id: "en-47", studentId: "st-30", batchId: "bt-4", classStudentId: "XYZ-SPK-405", enrolledAt: "2026-09-06T14:00:00.000Z", status: "active" },
    { id: "en-48", studentId: "st-37", batchId: "bt-4", classStudentId: "XYZ-SPK-406", enrolledAt: "2026-09-07T15:00:00.000Z", status: "active" },
    { id: "en-49", studentId: "st-42", batchId: "bt-4", classStudentId: "XYZ-SPK-407", enrolledAt: "2026-09-08T15:00:00.000Z", status: "active" },
    { id: "en-50", studentId: "st-49", batchId: "bt-4", classStudentId: "XYZ-SPK-408", enrolledAt: "2026-09-10T10:00:00.000Z", status: "active" },
    { id: "en-51", studentId: "st-57", batchId: "bt-4", classStudentId: "XYZ-SPK-409", enrolledAt: "2026-09-11T15:00:00.000Z", status: "active" },
    { id: "en-52", studentId: "st-60", batchId: "bt-4", classStudentId: "XYZ-SPK-410", enrolledAt: "2026-09-12T11:00:00.000Z", status: "active" },

    // Batch 5: PTE Academic - 14 students (75% of 18)
    { id: "en-13", studentId: "st-10", batchId: "bt-5", classStudentId: "XYZ-PTE-501", enrolledAt: "2026-09-05T12:00:00.000Z", status: "active" },
    { id: "en-14", studentId: "st-12", batchId: "bt-5", classStudentId: "XYZ-PTE-502", enrolledAt: "2026-09-06T10:00:00.000Z", status: "active" },
    { id: "en-53", studentId: "st-26", batchId: "bt-5", classStudentId: "XYZ-PTE-503", enrolledAt: "2026-09-06T15:00:00.000Z", status: "active" },
    { id: "en-54", studentId: "st-31", batchId: "bt-5", classStudentId: "XYZ-PTE-504", enrolledAt: "2026-09-07T14:00:00.000Z", status: "active" },
    { id: "en-55", studentId: "st-36", batchId: "bt-5", classStudentId: "XYZ-PTE-505", enrolledAt: "2026-09-08T14:00:00.000Z", status: "active" },
    { id: "en-56", studentId: "st-43", batchId: "bt-5", classStudentId: "XYZ-PTE-506", enrolledAt: "2026-09-09T09:00:00.000Z", status: "active" },
    { id: "en-57", studentId: "st-51", batchId: "bt-5", classStudentId: "XYZ-PTE-507", enrolledAt: "2026-09-10T14:00:00.000Z", status: "active" },
    { id: "en-58", studentId: "st-58", batchId: "bt-5", classStudentId: "XYZ-PTE-508", enrolledAt: "2026-09-12T09:00:00.000Z", status: "active" },
    { id: "en-59", studentId: "st-64", batchId: "bt-5", classStudentId: "XYZ-PTE-509", enrolledAt: "2026-09-13T10:00:00.000Z", status: "active" },

    // Batch 6: GRE/SAT - 17 students (75% of 22)
    { id: "en-15", studentId: "st-6", batchId: "bt-6", classStudentId: "XYZ-GRE-601", enrolledAt: "2026-09-05T15:00:00.000Z", status: "active" },
    { id: "en-60", studentId: "st-20", batchId: "bt-6", classStudentId: "XYZ-GRE-602", enrolledAt: "2026-09-06T10:00:00.000Z", status: "active" },
    { id: "en-61", studentId: "st-29", batchId: "bt-6", classStudentId: "XYZ-GRE-603", enrolledAt: "2026-09-07T11:00:00.000Z", status: "active" },
    { id: "en-62", studentId: "st-32", batchId: "bt-6", classStudentId: "XYZ-GRE-604", enrolledAt: "2026-09-07T14:00:00.000Z", status: "active" },
    { id: "en-63", studentId: "st-38", batchId: "bt-6", classStudentId: "XYZ-GRE-605", enrolledAt: "2026-09-08T10:00:00.000Z", status: "active" },
    { id: "en-64", studentId: "st-44", batchId: "bt-6", classStudentId: "XYZ-GRE-606", enrolledAt: "2026-09-09T10:00:00.000Z", status: "active" },
    { id: "en-65", studentId: "st-51", batchId: "bt-6", classStudentId: "XYZ-GRE-607", enrolledAt: "2026-09-10T14:00:00.000Z", status: "active" },
    { id: "en-66", studentId: "st-54", batchId: "bt-6", classStudentId: "XYZ-GRE-608", enrolledAt: "2026-09-11T10:00:00.000Z", status: "active" },
    { id: "en-67", studentId: "st-59", batchId: "bt-6", classStudentId: "XYZ-GRE-609", enrolledAt: "2026-09-12T10:00:00.000Z", status: "active" },
    { id: "en-68", studentId: "st-65", batchId: "bt-6", classStudentId: "XYZ-GRE-610", enrolledAt: "2026-09-13T11:00:00.000Z", status: "active" },

    // Batch 7: IELTS Advanced Writing - 11 students (75% of 15)
    { id: "en-16", studentId: "st-1", batchId: "bt-7", classStudentId: "XYZ-ADV-701", enrolledAt: "2026-09-06T09:00:00.000Z", status: "active" },
    { id: "en-17", studentId: "st-15", batchId: "bt-7", classStudentId: "XYZ-ADV-702", enrolledAt: "2026-09-06T14:00:00.000Z", status: "active" },
    { id: "en-69", studentId: "st-17", batchId: "bt-7", classStudentId: "XYZ-ADV-703", enrolledAt: "2026-09-07T09:00:00.000Z", status: "active" },
    { id: "en-70", studentId: "st-27", batchId: "bt-7", classStudentId: "XYZ-ADV-704", enrolledAt: "2026-09-08T10:00:00.000Z", status: "active" },
    { id: "en-71", studentId: "st-33", batchId: "bt-7", classStudentId: "XYZ-ADV-705", enrolledAt: "2026-09-09T11:00:00.000Z", status: "active" },
    { id: "en-72", studentId: "st-39", batchId: "bt-7", classStudentId: "XYZ-ADV-706", enrolledAt: "2026-09-10T10:00:00.000Z", status: "active" },
    { id: "en-73", studentId: "st-45", batchId: "bt-7", classStudentId: "XYZ-ADV-707", enrolledAt: "2026-09-11T11:00:00.000Z", status: "active" },
    { id: "en-74", studentId: "st-50", batchId: "bt-7", classStudentId: "XYZ-ADV-708", enrolledAt: "2026-09-12T11:00:00.000Z", status: "active" },
  ];
  const attendance = [
    // Session 1: 2026-08-20 (Diagnostic & Overview)
    { id: "at-101", batchId: "bt-1", studentId: "st-1", date: "2026-08-20", present: true, status: "present", note: "On time", topic: "IELTS Diagnostic Assessment & Band Rubrics" },
    { id: "at-102", batchId: "bt-1", studentId: "st-3", date: "2026-08-20", present: true, status: "present", note: "", topic: "IELTS Diagnostic Assessment & Band Rubrics" },
    { id: "at-103", batchId: "bt-1", studentId: "st-4", date: "2026-08-20", present: true, status: "present", note: "", topic: "IELTS Diagnostic Assessment & Band Rubrics" },
    { id: "at-104", batchId: "bt-1", studentId: "st-5", date: "2026-08-20", present: true, status: "present", note: "", topic: "IELTS Diagnostic Assessment & Band Rubrics" },

    // Session 2: 2026-08-23 (Writing Task 1)
    { id: "at-105", batchId: "bt-1", studentId: "st-1", date: "2026-08-23", present: true, status: "present", note: "", topic: "Academic Writing Task 1: Trends & Comparisons" },
    { id: "at-106", batchId: "bt-1", studentId: "st-3", date: "2026-08-23", present: true, status: "present", note: "", topic: "Academic Writing Task 1: Trends & Comparisons" },
    { id: "at-107", batchId: "bt-1", studentId: "st-4", date: "2026-08-23", present: false, status: "absent", note: "Unexcused absence", topic: "Academic Writing Task 1: Trends & Comparisons" },
    { id: "at-108", batchId: "bt-1", studentId: "st-5", date: "2026-08-23", present: true, status: "present", note: "", topic: "Academic Writing Task 1: Trends & Comparisons" },

    // Session 3: 2026-08-25 (Writing Task 2)
    { id: "at-1", batchId: "bt-1", studentId: "st-1", date: "2026-08-25", present: true, status: "present", note: "Participated actively", topic: "Writing Task 2: Band 8 Essay Structures" },
    { id: "at-2", batchId: "bt-1", studentId: "st-3", date: "2026-08-25", present: true, status: "present", note: "", topic: "Writing Task 2: Band 8 Essay Structures" },
    { id: "at-109", batchId: "bt-1", studentId: "st-4", date: "2026-08-25", present: true, status: "late", note: "Arrived 15m late due to traffic", topic: "Writing Task 2: Band 8 Essay Structures" },
    { id: "at-110", batchId: "bt-1", studentId: "st-5", date: "2026-08-25", present: true, status: "present", note: "", topic: "Writing Task 2: Band 8 Essay Structures" },

    // Session 4: 2026-08-27 (Reading Skills)
    { id: "at-3", batchId: "bt-1", studentId: "st-1", date: "2026-08-27", present: true, status: "present", note: "", topic: "Reading: True / False / Not Given Mastery" },
    { id: "at-4", batchId: "bt-1", studentId: "st-3", date: "2026-08-27", present: false, status: "absent", note: "Medical leave informed", topic: "Reading: True / False / Not Given Mastery" },
    { id: "at-111", batchId: "bt-1", studentId: "st-4", date: "2026-08-27", present: false, status: "absent", note: "Unexcused absence", topic: "Reading: True / False / Not Given Mastery" },
    { id: "at-112", batchId: "bt-1", studentId: "st-5", date: "2026-08-27", present: true, status: "present", note: "", topic: "Reading: True / False / Not Given Mastery" },

    // Session 5: 2026-08-30 (Listening Strategies)
    { id: "at-113", batchId: "bt-1", studentId: "st-1", date: "2026-08-30", present: true, status: "present", note: "", topic: "Listening Section 3 & 4 Note Completion" },
    { id: "at-114", batchId: "bt-1", studentId: "st-3", date: "2026-08-30", present: true, status: "late", note: "Late by 10 mins", topic: "Listening Section 3 & 4 Note Completion" },
    { id: "at-115", batchId: "bt-1", studentId: "st-4", date: "2026-08-30", present: true, status: "present", note: "", topic: "Listening Section 3 & 4 Note Completion" },
    { id: "at-116", batchId: "bt-1", studentId: "st-5", date: "2026-08-30", present: true, status: "present", note: "", topic: "Listening Section 3 & 4 Note Completion" },

    // Session 6: 2026-09-01 (Speaking Masterclass)
    { id: "at-5", batchId: "bt-1", studentId: "st-1", date: "2026-09-01", present: true, status: "present", note: "Excellent cue card", topic: "Speaking Part 2 & 3 Fluency Framework" },
    { id: "at-6", batchId: "bt-1", studentId: "st-3", date: "2026-09-01", present: true, status: "present", note: "", topic: "Speaking Part 2 & 3 Fluency Framework" },
    { id: "at-117", batchId: "bt-1", studentId: "st-4", date: "2026-09-01", present: true, status: "present", note: "", topic: "Speaking Part 2 & 3 Fluency Framework" },
    { id: "at-118", batchId: "bt-1", studentId: "st-5", date: "2026-09-01", present: true, status: "excused", note: "University mid-term exam", topic: "Speaking Part 2 & 3 Fluency Framework" },

    // Session 7: 2026-09-03 (Clinic & Mock Preparation)
    { id: "at-119", batchId: "bt-1", studentId: "st-1", date: "2026-09-03", present: true, status: "late", note: "Late 5m", topic: "Academic Grammar & Lexical Resource Clinic" },
    { id: "at-120", batchId: "bt-1", studentId: "st-3", date: "2026-09-03", present: true, status: "present", note: "", topic: "Academic Grammar & Lexical Resource Clinic" },
    { id: "at-121", batchId: "bt-1", studentId: "st-4", date: "2026-09-03", present: true, status: "present", note: "", topic: "Academic Grammar & Lexical Resource Clinic" },
    { id: "at-122", batchId: "bt-1", studentId: "st-5", date: "2026-09-03", present: true, status: "present", note: "", topic: "Academic Grammar & Lexical Resource Clinic" },
  ];
  const mockScores = [
    { id: "sc-1", studentId: "st-1", batchId: "bt-1", listening: 7.5, reading: 7.0, writing: 6.5, speaking: 7.0, date: "2026-08-28" },
    { id: "sc-2", studentId: "st-3", batchId: "bt-1", listening: 6.5, reading: 6.0, writing: 6.0, speaking: 6.5, date: "2026-08-28" },
    { id: "sc-3", studentId: "st-4", batchId: "bt-1", listening: 7.0, reading: 6.5, writing: 6.0, speaking: 6.5, date: "2026-09-02" },
    { id: "sc-4", studentId: "st-7", batchId: "bt-3", listening: 8.0, reading: 7.5, writing: 7.0, speaking: 7.5, date: "2026-09-03" },
    { id: "sc-5", studentId: "st-8", batchId: "bt-3", listening: 7.0, reading: 7.5, writing: 6.5, speaking: 7.0, date: "2026-09-03" },
    { id: "sc-6", studentId: "st-11", batchId: "bt-6", listening: 8.0, reading: 8.0, writing: 7.0, speaking: 7.5, date: "2026-09-04" },
    { id: "sc-7", studentId: "st-15", batchId: "bt-7", listening: 8.5, reading: 8.0, writing: 7.5, speaking: 8.0, date: "2026-09-04" },
    { id: "sc-8", studentId: "st-17", batchId: "bt-1", listening: 7.0, reading: 6.5, writing: 6.0, speaking: 6.5, date: "2026-09-06" },
    { id: "sc-9", studentId: "st-19", batchId: "bt-1", listening: 6.5, reading: 6.0, writing: 5.5, speaking: 6.0, date: "2026-09-06" },
    { id: "sc-10", studentId: "st-21", batchId: "bt-1", listening: 7.5, reading: 7.0, writing: 6.5, speaking: 7.0, date: "2026-09-06" },
    { id: "sc-11", studentId: "st-25", batchId: "bt-1", listening: 6.0, reading: 6.5, writing: 5.5, speaking: 6.0, date: "2026-09-06" },
    { id: "sc-12", studentId: "st-18", batchId: "bt-2", listening: 7.0, reading: 7.5, writing: 6.0, speaking: 6.5, date: "2026-09-07" },
    { id: "sc-13", studentId: "st-20", batchId: "bt-2", listening: 7.5, reading: 7.0, writing: 7.0, speaking: 7.0, date: "2026-09-07" },
    { id: "sc-14", studentId: "st-22", batchId: "bt-2", listening: 6.5, reading: 6.0, writing: 6.0, speaking: 6.5, date: "2026-09-07" },
    { id: "sc-15", studentId: "st-23", batchId: "bt-3", listening: 7.5, reading: 7.0, writing: 6.5, speaking: 7.0, date: "2026-09-08" },
    { id: "sc-16", studentId: "st-29", batchId: "bt-3", listening: 6.0, reading: 5.5, writing: 5.5, speaking: 6.0, date: "2026-09-08" },
    { id: "sc-17", studentId: "st-9", batchId: "bt-4", listening: 7.0, reading: 6.5, writing: 6.5, speaking: 7.5, date: "2026-09-07" },
    { id: "sc-18", studentId: "st-24", batchId: "bt-4", listening: 6.5, reading: 6.0, writing: 6.0, speaking: 7.0, date: "2026-09-07" },
    { id: "sc-19", studentId: "st-10", batchId: "bt-5", listening: 68, reading: 65, writing: 62, speaking: 70, date: "2026-09-08" },
    { id: "sc-20", studentId: "st-26", batchId: "bt-5", listening: 72, reading: 70, writing: 68, speaking: 75, date: "2026-09-08" },
    { id: "sc-21", studentId: "st-6", batchId: "bt-6", listening: 160, reading: 162, writing: 4.0, speaking: 3.5, date: "2026-09-08" },
    { id: "sc-22", studentId: "st-32", batchId: "bt-6", listening: 155, reading: 158, writing: 3.5, speaking: 3.5, date: "2026-09-08" },
    { id: "sc-23", studentId: "st-27", batchId: "bt-7", listening: 8.0, reading: 7.5, writing: 7.5, speaking: 8.0, date: "2026-09-09" },
    { id: "sc-24", studentId: "st-33", batchId: "bt-7", listening: 7.5, reading: 7.0, writing: 7.0, speaking: 7.5, date: "2026-09-09" },
    { id: "sc-25", studentId: "st-28", batchId: "bt-2", listening: 7.0, reading: 7.0, writing: 6.0, speaking: 6.5, date: "2026-09-09" },
    { id: "sc-26", studentId: "st-34", batchId: "bt-2", listening: 7.5, reading: 7.5, writing: 6.5, speaking: 7.0, date: "2026-09-09" },
    { id: "sc-27", studentId: "st-39", batchId: "bt-1", listening: 7.0, reading: 6.5, writing: 6.5, speaking: 7.0, date: "2026-09-10" },
    { id: "sc-28", studentId: "st-40", batchId: "bt-2", listening: 6.5, reading: 6.0, writing: 6.0, speaking: 6.5, date: "2026-09-10" },
    { id: "sc-29", studentId: "st-35", batchId: "bt-3", listening: 7.0, reading: 7.0, writing: 6.0, speaking: 6.5, date: "2026-09-10" },
    { id: "sc-30", studentId: "st-46", batchId: "bt-2", listening: 7.0, reading: 7.0, writing: 6.5, speaking: 7.0, date: "2026-09-11" },
  ];
  const invoices = [
    { id: "inv-1", invoiceNo: "INV-2026-001", studentId: "st-1", serviceType: "IELTS Intensive Batch Course Fee", totalAmount: 18500, paidAmount: 18500, dueAmount: 0, currency: "BDT", status: "paid", paymentMethod: "bKash", trxId: "BK9X7721LA", date: "2026-08-05", collectedBy: "u-acc" },
    { id: "inv-2", invoiceNo: "INV-2026-002", studentId: "st-1", serviceType: "UK University Application & CAS Processing", totalAmount: 25000, paidAmount: 15000, dueAmount: 10000, currency: "BDT", status: "partial", paymentMethod: "Bank Transfer (EBL)", trxId: "EBL-882910", date: "2026-08-15", collectedBy: "u-acc" },
    { id: "inv-3", invoiceNo: "INV-2026-003", studentId: "st-2", serviceType: "Canada Study Permit & Visa Processing Fee", totalAmount: 35000, paidAmount: 35000, dueAmount: 0, currency: "BDT", status: "paid", paymentMethod: "Nagad", trxId: "NG771900KP", date: "2026-08-16", collectedBy: "u-acc" },
    { id: "inv-4", invoiceNo: "INV-2026-004", studentId: "st-3", serviceType: "IELTS Regular Batch Course Fee", totalAmount: 18500, paidAmount: 18500, dueAmount: 0, currency: "BDT", status: "paid", paymentMethod: "bKash", trxId: "BK331002QQ", date: "2026-08-22", collectedBy: "u-acc" },
    { id: "inv-5", invoiceNo: "INV-2026-005", studentId: "st-4", serviceType: "Australia University Counseling & Enrollment", totalAmount: 30000, paidAmount: 10000, dueAmount: 20000, currency: "BDT", status: "partial", paymentMethod: "Cash", trxId: "CSH-2026-08", date: "2026-09-01", collectedBy: "u-acc" },
    { id: "inv-6", invoiceNo: "INV-2026-006", studentId: "st-5", serviceType: "Germany University Documentation Package", totalAmount: 28000, paidAmount: 0, dueAmount: 28000, currency: "BDT", status: "overdue", paymentMethod: "Pending", trxId: "—", date: "2026-08-25", collectedBy: "u-acc" },
    { id: "inv-7", invoiceNo: "INV-2026-007", studentId: "st-7", serviceType: "Canada University Application & GIC Advisory", totalAmount: 32000, paidAmount: 32000, dueAmount: 0, currency: "BDT", status: "paid", paymentMethod: "Bank Transfer (City Bank)", trxId: "CTY-991204", date: "2026-08-18", collectedBy: "u-acc" },
    { id: "inv-8", invoiceNo: "INV-2026-008", studentId: "st-8", serviceType: "UK Bar Course & LLM Visa Processing", totalAmount: 28000, paidAmount: 28000, dueAmount: 0, currency: "BDT", status: "paid", paymentMethod: "bKash", trxId: "BK881920TT", date: "2026-08-20", collectedBy: "u-acc" },
    { id: "inv-9", invoiceNo: "INV-2026-009", studentId: "st-11", serviceType: "USA Graduate Admission & I-20 Advisory", totalAmount: 40000, paidAmount: 20000, dueAmount: 20000, currency: "BDT", status: "partial", paymentMethod: "Nagad", trxId: "NG992144KL", date: "2026-08-29", collectedBy: "u-acc" },
    { id: "inv-10", invoiceNo: "INV-2026-010", studentId: "st-15", serviceType: "UK MBA Direct Admissions Package", totalAmount: 35000, paidAmount: 35000, dueAmount: 0, currency: "BDT", status: "paid", paymentMethod: "bKash", trxId: "BK773344ZZ", date: "2026-09-03", collectedBy: "u-acc" },
    { id: "inv-11", invoiceNo: "INV-2026-011", studentId: "st-17", serviceType: "IELTS Regular Batch Course Fee", totalAmount: 18500, paidAmount: 18500, dueAmount: 0, currency: "BDT", status: "paid", paymentMethod: "bKash", trxId: "BK882100AB", date: "2026-09-04", collectedBy: "u-acc" },
    { id: "inv-12", invoiceNo: "INV-2026-012", studentId: "st-19", serviceType: "Canada Study Permit & GIC Processing", totalAmount: 35000, paidAmount: 35000, dueAmount: 0, currency: "BDT", status: "paid", paymentMethod: "Bank Transfer (EBL)", trxId: "EBL-991022", date: "2026-09-05", collectedBy: "u-acc" },
    { id: "inv-13", invoiceNo: "INV-2026-013", studentId: "st-20", serviceType: "USA Graduate Admission Package", totalAmount: 40000, paidAmount: 20000, dueAmount: 20000, currency: "BDT", status: "partial", paymentMethod: "Nagad", trxId: "NG881233AA", date: "2026-09-06", collectedBy: "u-acc" },
    { id: "inv-14", invoiceNo: "INV-2026-014", studentId: "st-21", serviceType: "Germany University Application Package", totalAmount: 28000, paidAmount: 0, dueAmount: 28000, currency: "BDT", status: "overdue", paymentMethod: "Pending", trxId: "—", date: "2026-09-05", collectedBy: "u-acc" },
    { id: "inv-15", invoiceNo: "INV-2026-015", studentId: "st-23", serviceType: "IELTS Intensive Batch Course Fee", totalAmount: 18500, paidAmount: 18500, dueAmount: 0, currency: "BDT", status: "paid", paymentMethod: "bKash", trxId: "BK992301CC", date: "2026-09-05", collectedBy: "u-acc" },
    { id: "inv-16", invoiceNo: "INV-2026-016", studentId: "st-25", serviceType: "Canada Application Package", totalAmount: 32000, paidAmount: 0, dueAmount: 32000, currency: "BDT", status: "overdue", paymentMethod: "Pending", trxId: "—", date: "2026-09-06", collectedBy: "u-acc" },
    { id: "inv-17", invoiceNo: "INV-2026-017", studentId: "st-27", serviceType: "IELTS Advanced Writing Batch Fee", totalAmount: 12000, paidAmount: 12000, dueAmount: 0, currency: "BDT", status: "paid", paymentMethod: "Cash", trxId: "CSH-2026-09", date: "2026-09-06", collectedBy: "u-acc" },
    { id: "inv-18", invoiceNo: "INV-2026-018", studentId: "st-29", serviceType: "IELTS Intensive Batch Course Fee", totalAmount: 18500, paidAmount: 10000, dueAmount: 8500, currency: "BDT", status: "partial", paymentMethod: "bKash", trxId: "BK110099DD", date: "2026-09-06", collectedBy: "u-acc" },
    { id: "inv-19", invoiceNo: "INV-2026-019", studentId: "st-30", serviceType: "Germany Documentation Package", totalAmount: 28000, paidAmount: 15000, dueAmount: 13000, currency: "BDT", status: "partial", paymentMethod: "Bank Transfer (City Bank)", trxId: "CTY-110033", date: "2026-09-08", collectedBy: "u-acc" },
    { id: "inv-20", invoiceNo: "INV-2026-020", studentId: "st-34", serviceType: "Australia Counseling & Application Package", totalAmount: 30000, paidAmount: 30000, dueAmount: 0, currency: "BDT", status: "paid", paymentMethod: "bKash", trxId: "BK332211EE", date: "2026-09-09", collectedBy: "u-acc" },
    { id: "inv-21", invoiceNo: "INV-2026-021", studentId: "st-39", serviceType: "UK University Application Package", totalAmount: 25000, paidAmount: 0, dueAmount: 25000, currency: "BDT", status: "overdue", paymentMethod: "Pending", trxId: "—", date: "2026-09-08", collectedBy: "u-acc" },
    { id: "inv-22", invoiceNo: "INV-2026-022", studentId: "st-41", serviceType: "Canada MBA Admission Package", totalAmount: 35000, paidAmount: 35000, dueAmount: 0, currency: "BDT", status: "paid", paymentMethod: "Nagad", trxId: "NG443322FF", date: "2026-09-08", collectedBy: "u-acc" },
    { id: "inv-23", invoiceNo: "INV-2026-023", studentId: "st-46", serviceType: "Australia Application Package", totalAmount: 30000, paidAmount: 30000, dueAmount: 0, currency: "BDT", status: "paid", paymentMethod: "bKash", trxId: "BK554433GG", date: "2026-09-09", collectedBy: "u-acc" },
    { id: "inv-24", invoiceNo: "INV-2026-024", studentId: "st-50", serviceType: "UK University Application Package", totalAmount: 25000, paidAmount: 0, dueAmount: 25000, currency: "BDT", status: "overdue", paymentMethod: "Pending", trxId: "—", date: "2026-09-10", collectedBy: "u-acc" },
    { id: "inv-25", invoiceNo: "INV-2026-025", studentId: "st-54", serviceType: "Canada Admission & Visa Package", totalAmount: 35000, paidAmount: 35000, dueAmount: 0, currency: "BDT", status: "paid", paymentMethod: "Bank Transfer (EBL)", trxId: "EBL-665544", date: "2026-09-11", collectedBy: "u-acc" },
    { id: "inv-26", invoiceNo: "INV-2026-026", studentId: "st-59", serviceType: "IELTS Intensive Batch Course Fee", totalAmount: 18500, paidAmount: 18500, dueAmount: 0, currency: "BDT", status: "paid", paymentMethod: "bKash", trxId: "BK776655HH", date: "2026-09-12", collectedBy: "u-acc" },
    { id: "inv-27", invoiceNo: "INV-2026-027", studentId: "st-61", serviceType: "Canada MBA Application Package", totalAmount: 35000, paidAmount: 0, dueAmount: 35000, currency: "BDT", status: "overdue", paymentMethod: "Pending", trxId: "—", date: "2026-09-12", collectedBy: "u-acc" },
    { id: "inv-28", invoiceNo: "INV-2026-028", studentId: "st-65", serviceType: "Germany Engineering Application Package", totalAmount: 28000, paidAmount: 0, dueAmount: 28000, currency: "BDT", status: "overdue", paymentMethod: "Pending", trxId: "—", date: "2026-09-13", collectedBy: "u-acc" },
  ];

  const classContents = [
    {
      id: "cc-1",
      batchId: "bt-1",
      module: "Writing",
      title: "IELTS Academic Task 2: Band 8+ Essay Structures",
      description: "Comprehensive breakdown of Agree/Disagree, Discussion, and Problem-Solution essay formats with high-scoring cohesive devices and sample essays.",
      date: "2026-09-02",
      instructorId: "u-i1",
      downloads: 42,
      tag: "Handout & Strategy",
      content: `IELTS Academic Task 2: Band 8+ Master Guide

1. Essay Organization Blueprint:
   • Introduction (45-50 words): Paraphrase question prompt + definitive thesis statement.
   • Body Paragraph 1 (90 words): Primary argument, logical reasoning, concrete real-world evidence.
   • Body Paragraph 2 (90 words): Counter-argument or secondary dimension with analysis.
   • Conclusion (35-40 words): Summarize core insights without introducing extraneous claims.

2. Band 8+ Cohesive Vocabulary:
   • "It is broadly acknowledged that..."
   • "This trend is predominantly driven by..."
   • "A quintessential demonstration of this occurs when..."
   • "Notwithstanding the aforementioned benefits..."

3. Common Traps:
   • Overgeneralization: Avoid "Everyone knows" or "Always" – use hedged language: "Evidence tends to suggest..."`,
      imageUrl: ""
    },
    {
      id: "cc-2",
      batchId: "bt-1",
      module: "Reading",
      title: "Mastering 'True / False / Not Given' & Headings",
      description: "Key techniques to avoid common pitfalls in Academic Reading Section 2 & 3. Includes authentic practice strategies with keyword mapping.",
      date: "2026-08-28",
      instructorId: "u-i1",
      downloads: 58,
      tag: "Practice Set",
      content: `IELTS Academic Reading Strategy: True / False / Not Given

1. Three Golden Distinctions:
   • TRUE: The text conveys the identical meaning (even if using subtle synonyms).
   • FALSE: The text directly contradicts or negates the question premise.
   • NOT GIVEN: The topic might be mentioned, but the factual comparison is missing.

2. Paragraph Heading Matching:
   • Read the title and skim the first and last sentence of each paragraph.
   • Beware of keyword traps: examiners place identical words in multiple paragraphs to mislead careless readers.`,
      imageUrl: ""
    },
    {
      id: "cc-3",
      batchId: "bt-1",
      module: "Listening",
      title: "Section 3 & 4 Academic Discussions & Note Completion",
      description: "Techniques for rapid spelling, predicting grammar in summary completion, and managing British and Australian accent transitions.",
      date: "2026-08-25",
      instructorId: "u-i1",
      downloads: 36,
      tag: "Audio Walkthrough",
      content: `Listening Sections 3 & 4 Strategies:

1. Prediction Technique:
   • In the 30 seconds reading time, determine the part of speech required (noun, verb, date, percentage).
2. Distractor Management:
   • Listen for self-correction: "We initially booked on Friday, but the venue moved it to Sunday morning."
3. Word Count Compliance:
   • Always verify "NO MORE THAN TWO WORDS AND/OR A NUMBER". Hyphenated words count as one single word.`,
      imageUrl: ""
    },
    {
      id: "cc-4",
      batchId: "bt-1",
      module: "Speaking",
      title: "Speaking Part 2: Cue Card 2-Minute Fluency Map",
      description: "Framework to maintain unbroken fluency, idiomatic language, and natural intonation without hesitation.",
      date: "2026-08-20",
      instructorId: "u-i1",
      downloads: 49,
      tag: "Vocabulary & Audio",
      content: `Speaking Cue Card Strategy:

1. 1-Minute Note Preparation:
   • Draw 4 quadrants on your scratch paper: (1) Background (2) Main Story (3) Turning Point (4) Personal Reflection.
2. Advanced Sentence Starters:
   • "If my memory serves me correctly..."
   • "What struck me most profoundly about this experience was..."
   • "Looking back in retrospect, I would venture to say..."`,
      imageUrl: ""
    }
  ];

  const languageClubs = [
    {
      id: "lc-1",
      title: "Friday Global Debates & Fluency Club",
      topic: "Artificial Intelligence in Higher Education: Catalyst or Obstacle?",
      date: "2026-09-04",
      time: "4:00 PM – 5:30 PM (BST)",
      room: "Studio B (Dhaka Campus) & Zoom Live Room",
      moderatorId: "u-i1",
      moderatorName: "Nasir Uddin (Lead Trainer)",
      description: "Weekly interactive student speaking circles, timed debate rounds, pronunciation drills, and instant vocabulary coaching.",
      speakingPrompts: [
        "In what ways will AI tutors transform the traditional university seminar experience?",
        "Does heavy reliance on predictive algorithms diminish authentic student problem solving?",
        "If you could study at any university abroad with full AI lab access, which would you pick and why?"
      ],
      attendees: ["st-1", "st-3"]
    },
    {
      id: "lc-2",
      title: "IELTS Speaking Part 3 Mastermind Circle",
      topic: "Urban Living, Sustainable Mobility & Quality of Life",
      date: "2026-09-11",
      time: "4:00 PM – 5:30 PM (BST)",
      room: "Studio A Main Campus",
      moderatorId: "u-i1",
      moderatorName: "Nasir Uddin (Lead Trainer)",
      description: "Focused simulation on abstract Part 3 questions with real-time peer evaluations and Band 8.5 phrasing rubrics.",
      speakingPrompts: [
        "Should governments subsidize public transit over building wider highways in megacities?",
        "How has remote work altered people's relationship with urban center living?"
      ],
      attendees: ["st-1"]
    }
  ];

  const messages = [
    // --- Thread: Student Ayesha Karim <-> Instructor Nasir Uddin ---
    {
      id: "msg-1",
      fromUserId: "u-i1",
      toUserId: "u-s1",
      channel: "instructor",
      text: "Hello Ayesha! Great work on your recent Mock Test Reading score (Band 7.0). For Writing Task 2, make sure your thesis statement in the introduction directly answers both sides.",
      sentAt: "2026-09-02T11:20:00.000Z",
      read: true
    },
    {
      id: "msg-2",
      fromUserId: "u-s1",
      toUserId: "u-i1",
      channel: "instructor",
      text: "Thank you so much Sir! I have reviewed the Task 2 template from the Class Materials. Could you check if my body paragraph examples sound natural in today's class?",
      sentAt: "2026-09-02T14:15:00.000Z",
      read: true
    },
    {
      id: "msg-2b",
      fromUserId: "u-i1",
      toUserId: "u-s1",
      channel: "instructor",
      text: "Absolutely! Bring your draft to Studio A at 6:15 PM before the regular evening session begins.",
      sentAt: "2026-09-02T15:00:00.000Z",
      read: true
    },

    // --- Thread: Student Ayesha Karim <-> Counselor Farzana Yasmin ---
    {
      id: "msg-3",
      fromUserId: "u-c1",
      toUserId: "u-s1",
      channel: "counselor",
      text: "Hi Ayesha! Your Manchester application document checklist is progressing nicely. Please make sure to re-upload your revised SOP focusing on your data analytics research proposal.",
      sentAt: "2026-09-01T09:40:00.000Z",
      read: true
    },
    {
      id: "msg-3b",
      fromUserId: "u-s1",
      toUserId: "u-c1",
      channel: "counselor",
      text: "Thank you Ma'am, I have updated the SOP with the specific course modules and professor research citations.",
      sentAt: "2026-09-01T16:30:00.000Z",
      read: true
    },
    {
      id: "msg-3c",
      fromUserId: "u-c1",
      toUserId: "u-s1",
      channel: "counselor",
      text: "Excellent! I will review the file tomorrow and update the portal status to Applied.",
      sentAt: "2026-09-02T10:00:00.000Z",
      read: false
    },

    // --- Thread: Student Ayesha Karim <-> Admin MD. Rafiqul Islam ---
    {
      id: "msg-4",
      fromUserId: "u-admin",
      toUserId: "u-s1",
      channel: "admin",
      text: "Official Notice from IT & Accounts: Your verified Class ID is XYZ-IEL-001. All digital materials and Language Club registrations are active.",
      sentAt: "2026-08-12T10:00:00.000Z",
      read: true
    },

    // --- Thread: Student Ayesha Karim <-> Accountant Kamrul Hasan ---
    {
      id: "msg-5",
      fromUserId: "u-acc",
      toUserId: "u-s1",
      channel: "accountant",
      text: "Dear Ayesha, your invoice INV-2026-001 for IELTS batch tuition (18,500 BDT) is fully paid and verified. Your payment receipt voucher is available in the portal.",
      sentAt: "2026-08-05T12:30:00.000Z",
      read: true
    },

    // --- Thread: Counselor Farzana <-> Admin MD. Rafiqul Islam ---
    {
      id: "msg-6",
      fromUserId: "u-c1",
      toUserId: "u-admin",
      channel: "staff",
      text: "Sir, we have 4 new Russell Group applicants ready for file submission this week. Shall we schedule the university delegate session for next Tuesday?",
      sentAt: "2026-09-03T11:00:00.000Z",
      read: false
    },
    {
      id: "msg-7",
      fromUserId: "u-admin",
      toUserId: "u-c1",
      channel: "staff",
      text: "Yes Farzana, please coordinate with the front desk to book Conference Room 1 for Tuesday 2:00 PM.",
      sentAt: "2026-09-03T11:45:00.000Z",
      read: true
    },

    // --- Thread: Instructor Nasir <-> Admin MD. Rafiqul Islam ---
    {
      id: "msg-8",
      fromUserId: "u-i1",
      toUserId: "u-admin",
      channel: "staff",
      text: "Director Sir, the upcoming Saturday mock exam registration has reached 22 candidates. We will need 2 additional test invigilators in Studio A.",
      sentAt: "2026-09-02T16:00:00.000Z",
      read: false
    },

    // --- Thread: Accountant Kamrul <-> Admin MD. Rafiqul Islam ---
    {
      id: "msg-9",
      fromUserId: "u-acc",
      toUserId: "u-admin",
      channel: "staff",
      text: "Sir, monthly fee reconciliation report for August 2026 is ready with total collected amount of 145,000 BDT.",
      sentAt: "2026-09-01T15:20:00.000Z",
      read: true
    },

    // --- Thread: Counselor Farzana <-> Student Rahim Uddin Chowdhury ---
    {
      id: "msg-10",
      fromUserId: "u-c1",
      toUserId: "u-s-rahim",
      channel: "counselor",
      text: "Dear Rahim, your Canada study permit file has been lodged with IRCC. Please remember to complete your biometrics appointment at VFS Global on September 10th.",
      sentAt: "2026-08-31T10:15:00.000Z",
      read: true
    },
    {
      id: "msg-11",
      fromUserId: "u-s-rahim",
      toUserId: "u-c1",
      channel: "counselor",
      text: "Thank you Farzana Ma'am! I have my appointment confirmation letter printed and ready.",
      sentAt: "2026-08-31T12:00:00.000Z",
      read: true
    },

    // --- Thread: Counselor Tanvir <-> Student Tanvir Hasan ---
    {
      id: "msg-12",
      fromUserId: "u-c2",
      toUserId: "u-s-tanvir",
      channel: "counselor",
      text: "Hi Tanvir, Monash University admissions team contacted us regarding your Year 12 transcript equivalence. Let us meet tomorrow at 11 AM.",
      sentAt: "2026-09-03T14:20:00.000Z",
      read: false
    },

    // --- Thread: Peer to Peer: Student Ayesha Karim <-> Student Samiha Noor ---
    {
      id: "msg-13",
      fromUserId: "u-s-samiha",
      toUserId: "u-s1",
      channel: "student",
      text: "Hi Ayesha! Did Sir Nasir post the Task 1 sample charts for this Friday's debate session?",
      sentAt: "2026-09-03T16:40:00.000Z",
      read: false
    },

    // --- Thread: Admission Officer Zubaida Khanam <-> Student Ayesha Karim ---
    {
      id: "msg-14",
      fromUserId: "u-ado-1",
      toUserId: "u-s1",
      channel: "admission_officer",
      text: "Dear Ayesha, excellent news! We have received your official conditional offer letter from the University of Manchester for MSc Data Science (September 2026 Intake). We are now initiating your CAS document verification checklist.",
      sentAt: "2026-09-03T17:15:00.000Z",
      read: true
    },
    {
      id: "msg-15",
      fromUserId: "u-s1",
      toUserId: "u-ado-1",
      channel: "admission_officer",
      text: "That is wonderful news, Ma'am! Thank you so much. I have the tuition deposit payment voucher ready to submit to the admissions desk.",
      sentAt: "2026-09-03T17:45:00.000Z",
      read: false
    },

    // --- Thread: Admission Officer Zubaida Khanam <-> Counselor Farzana Yasmin ---
    {
      id: "msg-16",
      fromUserId: "u-ado-1",
      toUserId: "u-c1",
      channel: "staff",
      text: "Farzana, University of Melbourne has updated entry requirements for the upcoming intake. Please check the admissions dashboard for the updated English proficiency guidelines.",
      sentAt: "2026-09-03T14:10:00.000Z",
      read: true
    },

    // --- Thread: HR Mahmudur Rahman <-> Admin MD. Rafiqul Islam ---
    {
      id: "msg-17",
      fromUserId: "u-hr-1",
      toUserId: "u-admin",
      channel: "staff",
      text: "Director Sir, monthly staff attendance reconciliation and performance appraisals for August 2026 have been finalized. We have also shortlisted 3 qualified candidates for the Senior Study-Abroad Counselor opening.",
      sentAt: "2026-09-03T15:30:00.000Z",
      read: false
    },
    {
      id: "msg-18",
      fromUserId: "u-admin",
      toUserId: "u-hr-1",
      channel: "staff",
      text: "Well done Mahmud. Please schedule the final interview panel for the shortlisted counselor candidates for this Thursday at 3:00 PM.",
      sentAt: "2026-09-03T16:00:00.000Z",
      read: true
    },

    // --- Thread: HR Mahmudur Rahman <-> Instructor Nasir Uddin ---
    {
      id: "msg-19",
      fromUserId: "u-hr-1",
      toUserId: "u-i1",
      channel: "staff",
      text: "Hello Nasir Sir, British Council is organizing an advanced IELTS train-the-trainer workshop next weekend. Please review the faculty roster for nominated trainers.",
      sentAt: "2026-09-02T13:00:00.000Z",
      read: true
    }
  ];

  const announcements = [
    {
      id: "anc-1",
      title: "Urgent Notice: IELTS Classes Cancelled",
      category: "class_cancel",
      effectiveDate: "2026-09-05",
      affectedBatch: "All IELTS Batches (Batch 01 & Batch 02)",
      targetAudience: "all",
      priority: "urgent",
      message: "Please be informed that all IELTS Regular Evening and Executive Weekend classes scheduled for Saturday, 5th September 2026 are cancelled due to official campus maintenance and British Council test center facility setup. All cancelled sessions will be compensated with a makeup class on Monday, 7th September at 6:30 PM. For urgent queries, contact our front desk at 01781-827022.",
      createdBy: "u-admin",
      createdAt: "2026-09-03T10:00:00.000Z",
      isActive: true,
      popOnDashboard: true,
    },
    {
      id: "anc-2",
      title: "HR Policy Update: Annual Leave & Staff Health Welfare Guidelines 2026",
      category: "general",
      effectiveDate: "2026-09-01",
      affectedBatch: "All Office Staff",
      targetAudience: "staff",
      priority: "normal",
       message: "Notice to all Education XYZ BD team members: The updated 2026 Staff Leave & Welfare Guidelines are now in effect. All leave requests must be submitted to the HR desk at least 3 business days in advance. For questions regarding employee health insurance or professional training allowances, please reach out to HR at hr@eduxyzbd.com.",
      createdBy: "u-hr-1",
      createdAt: "2026-09-01T09:00:00.000Z",
      isActive: true,
      popOnDashboard: false,
    },
  ];

  const jobApplications = [
    {
      id: "ja-1", applicantCode: "JA-2026-001", name: "Mahmudul Haque", email: "mahmudul.haque@gmail.com", phone: "+880 1711 345678",
      positionTitle: "Senior Study-Abroad Counselor", department: "Counseling",
      experience: "3+ years in UK & Canadian university admissions",
      cvText: "Mahmudul Haque\nBBA, University of Dhaka (CGPA 3.72)\nPGD in Education Counseling, BRAC University\n\nExperience:\n- Education Consultant at Global Study Solutions (2023-2026)\n- Russell Group & Go8 applications specialist\n- Successfully placed 120+ students in UK, Canada & Australia\n- IELTS Score: 8.0 Overall\n\nSkills: CAS Processing, Visa Documentation, SOP Review, Student Counseling",
      cvFileName: "mahmudul_haque_cv_2026.pdf",
      cvReviewStatus: "shortlisted", cvReviewNotes: "Strong profile. Russell Group experience is excellent. Proceed to final interview.", cvRating: 4,
      interviewDate: "2026-09-10", interviewTime: "10:00 AM", interviewLocation: "Conference Room A, Education XYZ BD",
      interviewNotes: "Panel: MD Rafiqul Islam + Farzana Yasmin. Prepare case study on UK Tier 4 visa refusal handling.",
      status: "interview", appliedAt: "2026-08-20T09:00:00.000Z", updatedAt: "2026-09-02T14:00:00.000Z"
    },
    {
      id: "ja-2", applicantCode: "JA-2026-002", name: "Sharmin Akter", email: "sharmin.akter@yahoo.com", phone: "+880 1812 567890",
      positionTitle: "Senior Study-Abroad Counselor", department: "Counseling",
      experience: "4 years at British Council certified center",
      cvText: "Sharmin Akter\nMSS in Public Administration, Jagannath University\nCertified Education Agent (British Council PIE)\n\nExperience:\n- Assistant Manager, IDP Education Bangladesh (2022-2026)\n- Counseled 200+ students for UK, Australia & NZ\n- SOP & scholarship application specialist\n- IELTS Overall: 7.5\n\nSkills: Scholarship Applications, University Liaisons, Document Scrutiny",
      cvFileName: "sharmin_akter_resume.pdf",
      cvReviewStatus: "shortlisted", cvReviewNotes: "4 years IDP experience. Excellent candidate for Canadian visa specialist role.", cvRating: 5,
      interviewDate: "2026-09-10", interviewTime: "11:30 AM", interviewLocation: "Conference Room A, Education XYZ BD",
      interviewNotes: "Same panel. Focus on scholarship and financial documentation expertise.",
      status: "interview", appliedAt: "2026-08-22T10:00:00.000Z", updatedAt: "2026-09-02T14:30:00.000Z"
    },
    {
      id: "ja-3", applicantCode: "JA-2026-003", name: "Kamrul Islam", email: "kamrul.edu@gmail.com", phone: "+880 1913 112233",
      positionTitle: "Senior Study-Abroad Counselor", department: "Counseling",
      experience: "2 years tutoring, 1 year admissions",
      cvText: "Kamrul Islam\nBA in English, National University\n\nExperience:\n- IELTS Tutor at ABC Coaching (2024-2026)\n- Junior Admissions Assistant at XYZ Education (2023-2024)\n- IELTS Overall: 7.0\n\nSkills: English Language Teaching, Basic Counseling",
      cvFileName: "kamrul_islam_cv.pdf",
      cvReviewStatus: "rejected", cvReviewNotes: "Insufficient senior counseling experience. Only 1 year in admissions. Consider for junior role if available.", cvRating: 2,
      interviewDate: "", interviewTime: "", interviewLocation: "",
      interviewNotes: "",
      status: "rejected", appliedAt: "2026-08-25T08:00:00.000Z", updatedAt: "2026-09-01T10:00:00.000Z"
    },
    {
      id: "ja-4", applicantCode: "JA-2026-004", name: "Rasel Uddin", email: "rasel.uddin@outlook.com", phone: "+880 1614 998877",
      positionTitle: "IELTS Master Trainer & Examiner", department: "Faculty",
      experience: "5+ years CELTA-certified IELTS training",
      cvText: "Rasel Uddin\nMA in Applied Linguistics, University of Dhaka\nCELTA (Cambridge)\nIELTS Band Score: 8.5\n\nExperience:\n- Head IELTS Trainer, Mentors English Academy (2021-2026)\n- British Council IELTS Speaking Examiner (Part-time, 2023-present)\n- Trained 500+ IELTS candidates, avg improvement +1.5 bands\n- Published IELTS prep guide (Academic Module)\n\nSkills: Band 9 Writing, Speaking Examination, Curriculum Design, Student Motivation",
      cvFileName: "rasel_uddin_master_trainer_cv.pdf",
      cvReviewStatus: "shortlisted", cvReviewNotes: "Exceptional profile. CELTA + published author + BC examiner. Schedule demo lecture immediately.", cvRating: 5,
      interviewDate: "2026-09-12", interviewTime: "2:00 PM", interviewLocation: "Studio A, Education XYZ BD (Demo Lecture)",
      interviewNotes: "Conduct 30-minute demo lecture on Writing Task 2 to current Batch 01 students. Nasir Uddin to observe.",
      status: "interview", appliedAt: "2026-08-18T14:00:00.000Z", updatedAt: "2026-09-02T16:00:00.000Z"
    },
    {
      id: "ja-5", applicantCode: "JA-2026-005", name: "Farhana Mitul", email: "farhana.mitul@gmail.com", phone: "+880 1515 445566",
      positionTitle: "IELTS Master Trainer & Examiner", department: "Faculty",
      experience: "2 years private tutoring",
      cvText: "Farhana Mitul\nBA in English Literature, East West University\nIELTS Band: 7.5\n\nExperience:\n- Private IELTS Tutor (Freelance, 2024-2026)\n- 40+ students coached, avg improvement +1.0 bands\n\nSkills: Speaking Practice, Vocabulary Building",
      cvFileName: "farhana_mitul_cv.pdf",
      cvReviewStatus: "reviewed", cvReviewNotes: "Decent English skills but lacks formal teaching certification. Hold for now.", cvRating: 3,
      interviewDate: "", interviewTime: "", interviewLocation: "",
      interviewNotes: "",
      status: "reviewing", appliedAt: "2026-08-28T11:00:00.000Z", updatedAt: "2026-09-01T12:00:00.000Z"
    },
    {
      id: "ja-6", applicantCode: "JA-2026-006", name: "Nadia Islam", email: "nadia.islam@gmail.com", phone: "+880 1316 778899",
      positionTitle: "Digital Marketing & Student Outreach Officer", department: "Marketing",
      experience: "2+ years social media & campus campaigns",
      cvText: "Nadia Islam\nBBA in Marketing, North South University (CGPA 3.85)\nGoogle Digital Marketing Certificate\n\nExperience:\n- Social Media Executive, Pathao Ltd (2024-2026)\n- Campus Ambassador Lead, Grameenphone (2023-2024)\n- Managed 50K+ follower growth across Instagram & Facebook\n\nSkills: Content Strategy, Meta Ads, Student Engagement, Event Planning, Canva Pro",
      cvFileName: "nadia_islam_marketing_cv.pdf",
      cvReviewStatus: "pending", cvReviewNotes: "", cvRating: 0,
      interviewDate: "", interviewTime: "", interviewLocation: "",
      interviewNotes: "",
      status: "applied", appliedAt: "2026-09-01T09:00:00.000Z", updatedAt: "2026-09-01T09:00:00.000Z"
    },
    {
      id: "ja-7", applicantCode: "JA-2026-007", name: "Touhid Alam", email: "touhid.alam@gmail.com", phone: "+880 1711 223344",
      positionTitle: "Digital Marketing & Student Outreach Officer", department: "Marketing",
      experience: "1 year graphic design internship",
      cvText: "Touhid Alam\nBFA in Graphic Design, Shanto-Mariam University\n\nExperience:\n- Graphic Design Intern, AdComm Agency (2025-2026)\n- Freelance poster and banner design\n\nSkills: Photoshop, Illustrator, Video Editing",
      cvFileName: "touhid_alam_cv.pdf",
      cvReviewStatus: "pending", cvReviewNotes: "", cvRating: 0,
      interviewDate: "", interviewTime: "", interviewLocation: "",
      interviewNotes: "",
      status: "applied", appliedAt: "2026-09-02T10:00:00.000Z", updatedAt: "2026-09-02T10:00:00.000Z"
    },
    {
      id: "ja-8", applicantCode: "JA-2026-008", name: "Sabrina Chowdhury", email: "sabrina.ch@gmail.com", phone: "+880 1812 998877",
      positionTitle: "Admission Executive", department: "Admissions",
      experience: "1.5 years in university admissions processing",
      cvText: "Sabrina Chowdhury\nBSS, Dhaka University\nCertificate in Immigration Law Basics\n\nExperience:\n- Admissions Coordinator, SI-UK Bangladesh (2025-2026)\n- Processed 80+ CAS and offer letters\n- IELTS Overall: 7.0\n\nSkills: CAS Processing, University Portals (UCAS, StudyLink), Document Verification",
      cvFileName: "sabrina_chowdhury_cv.pdf",
      cvReviewStatus: "reviewed", cvReviewNotes: "Good admissions experience. SI-UK background valuable. Shortlist for interview.", cvRating: 4,
      interviewDate: "", interviewTime: "", interviewLocation: "",
      interviewNotes: "",
      status: "reviewing", appliedAt: "2026-08-30T14:00:00.000Z", updatedAt: "2026-09-02T11:00:00.000Z"
    },
  ];

  const leads = students.map((student, index) => ({
    id: `lead-${student.id}`,
    name: student.name,
    email: student.email,
    phone: student.phone || "",
    targetCountry: student.targetCountry || "Undecided",
    interestType: student.interestType || "both",
    source: index % 3 === 0 ? "Website Inquiry" : index % 3 === 1 ? "Referral" : "Facebook Campaign",
    status: "new",
    assignedTo: "u-rec-1",
    notes: "Imported from existing student registration.",
    createdAt: student.createdAt || new Date().toISOString(),
    createdBy: "system",
  }));

  return { users, students, applications, documents, batches, enrollments, attendance, mockScores, invoices, classContents, languageClubs, messages, announcements, jobApplications, leads };
}

const Store = {
  data: null,
  async init() {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      try {
        this.data = JSON.parse(raw);
        const required = ["users", "students", "applications", "documents", "batches", "enrollments", "attendance", "mockScores", "invoices", "classContents", "languageClubs", "messages", "announcements", "jobApplications", "leads"];
        let needsPersist = false;
        required.forEach((c) => {
          if (!Array.isArray(this.data[c])) {
            this.data[c] = [];
            needsPersist = true;
          }
        });
        if (!this.data.leads.length && this.data.students.length) {
          const fresh = await seed();
          this.data.leads = fresh.leads;
          needsPersist = true;
        }
        // Migrate legacy staff addresses to the current official domain.
        ["users", "students"].forEach((collection) => {
          this.data[collection].forEach((record) => {
            ["email", "altEmail"].forEach((field) => {
              if (typeof record[field] === "string" && record[field].toLowerCase().includes("@educationxyzbd.com")) {
                record[field] = record[field].replace(/@educationxyzbd\.com/gi, "@eduxyzbd.com");
                needsPersist = true;
              }
            });
          });
        });
        // Always repair and sync default accounts so login credentials, Staff IDs, and student user accounts are always set
        if (ensureDefaultAccounts(this.data.users, this.data.students)) {
          needsPersist = true;
        }
        if (!this.data.invoices || !this.data.invoices.length) {
          const fresh = await seed();
          this.data.invoices = fresh.invoices;
          needsPersist = true;
        }
        if (!this.data.classContents || !this.data.classContents.length) {
          const fresh = await seed();
          this.data.classContents = fresh.classContents;
          needsPersist = true;
        }
        if (!this.data.languageClubs || !this.data.languageClubs.length) {
          const fresh = await seed();
          this.data.languageClubs = fresh.languageClubs;
          needsPersist = true;
        }
        if (!this.data.messages || !this.data.messages.length) {
          const fresh = await seed();
          this.data.messages = fresh.messages;
          needsPersist = true;
        } else if (this.data.messages.length < 8) {
          // Merge missing initial seed messages for rich testing
          const fresh = await seed();
          fresh.messages.forEach((m) => {
            if (!this.data.messages.some((existing) => existing.id === m.id)) {
              this.data.messages.push(m);
              needsPersist = true;
            }
          });
        }
        if (!this.data.announcements || !this.data.announcements.length) {
          const fresh = await seed();
          this.data.announcements = fresh.announcements;
          needsPersist = true;
        }
        if (Array.isArray(this.data.attendance)) {
          if (this.data.attendance.length < 50) {
            const fresh = await seed();
            this.data.attendance = fresh.attendance;
            needsPersist = true;
          } else {
            this.data.attendance.forEach((a) => {
              if (!a.status) {
                a.status = a.present ? "present" : "absent";
                needsPersist = true;
              }
            });
          }
        }
        if (Array.isArray(this.data.enrollments) && this.data.enrollments.length < 60) {
          const fresh = await seed();
          fresh.enrollments.forEach((e) => {
            if (!this.data.enrollments.some((existing) => existing.id === e.id)) {
              this.data.enrollments.push(e);
              needsPersist = true;
            }
          });
        }
        if (Array.isArray(this.data.students) && this.data.students.length < 50) {
          const fresh = await seed();
          fresh.students.forEach((s) => {
            if (!this.data.students.some((existing) => existing.id === s.id)) {
              this.data.students.push(s);
              needsPersist = true;
            }
          });
          fresh.applications.forEach((a) => {
            if (!this.data.applications.some((existing) => existing.id === a.id)) {
              this.data.applications.push(a);
              needsPersist = true;
            }
          });
          fresh.invoices.forEach((inv) => {
            if (!this.data.invoices.some((existing) => existing.id === inv.id)) {
              this.data.invoices.push(inv);
              needsPersist = true;
            }
          });
          fresh.mockScores.forEach((ms) => {
            if (!this.data.mockScores.some((existing) => existing.id === ms.id)) {
              this.data.mockScores.push(ms);
              needsPersist = true;
            }
          });
        }
        if (Array.isArray(this.data.batches) && this.data.batches.length < 7) {
          const fresh = await seed();
          fresh.batches.forEach((b) => {
            if (!this.data.batches.some((existing) => existing.id === b.id)) {
              this.data.batches.push(b);
              needsPersist = true;
            }
          });
        }
        if (!this.data.jobApplications || !this.data.jobApplications.length) {
          const fresh = await seed();
          this.data.jobApplications = fresh.jobApplications;
          needsPersist = true;
        }
        if (needsPersist) this.persist();
        return;
      } catch (e) {
        console.warn("Storage corruption detected, reseeding database...", e);
      }
    }
    this.data = await seed();
    this.persist();
  },
  persist() {
    try {
      localStorage.setItem(KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error("Local storage write failed:", e);
    }
  },
  async reset() {
    localStorage.removeItem(KEY);
    this.data = await seed();
    this.persist();
  },
  getStats() {
    const collections = [
      "users", "students", "applications", "documents", "batches", "enrollments",
      "attendance", "mockScores", "invoices", "classContents", "languageClubs",
      "messages", "announcements", "jobApplications", "leads"
    ];
    let totalRecords = 0;
    const details = {};
    collections.forEach((c) => {
      const count = (this.data && Array.isArray(this.data[c])) ? this.data[c].length : 0;
      details[c] = count;
      totalRecords += count;
    });
    const raw = JSON.stringify(this.data || {});
    const bytes = raw.length;
    const kb = (bytes / 1024).toFixed(1);
    return { collections, details, totalRecords, bytes, kb, key: KEY };
  },
  clearCollection(col) {
    col = this._col(col);
    if (!this.data || !Array.isArray(this.data[col])) return;
    this.data[col] = [];
    this.persist();
  },
  _col(col) {
    return col === "candidates" ? "jobApplications" : col;
  },
  list(col) {
    col = this._col(col);
    return (this.data && this.data[col]) || [];
  },
  isOfficialStaffDirectoryUser(user) {
    if (!user || user.role === "student") return false;
    const email = (user.email || "").toLowerCase().trim();
    return Boolean(user.staffId && email.endsWith("@eduxyzbd.com"));
  },
  listStaffDirectory() {
    const seenStaffIds = new Set();
    return this.list("users").filter((user) => {
      if (!this.isOfficialStaffDirectoryUser(user) || seenStaffIds.has(user.staffId)) return false;
      seenStaffIds.add(user.staffId);
      return true;
    });
  },
  get(col, id) {
    col = this._col(col);
    return this.list(col).find((x) => x.id === id);
  },
  add(col, rec) {
    col = this._col(col);
    if (!this.data[col]) this.data[col] = [];
    if (!rec.id) rec.id = uid(col === "jobApplications" ? "ja" : col.slice(0, 2));
    if (col === "jobApplications" && !rec.applicantCode) {
      const num = this.data[col].length + 1;
      rec.applicantCode = `JA-2026-${String(num).padStart(3, "0")}`;
    }
    this.data[col].push(rec);
    this.persist();
    return rec;
  },
  update(col, id, patch) {
    col = this._col(col);
    if (!this.data[col]) return null;
    const i = this.data[col].findIndex((x) => x.id === id);
    if (i < 0) return null;
    this.data[col][i] = { ...this.data[col][i], ...patch };
    this.persist();
    return this.data[col][i];
  },
  remove(col, id) {
    col = this._col(col);
    if (!this.data[col]) return;
    this.data[col] = this.data[col].filter((x) => x.id !== id);
    this.persist();
  },
  user(id) {
    return this.get("users", id);
  },
  student(id) {
    return this.get("students", id);
  },
  candidate(id) {
    return this.get("jobApplications", id);
  },
  jobApplication(id) {
    return this.get("jobApplications", id);
  },
  getUserForStudent(studentId) {
    if (!studentId) return null;
    let u = this.list("users").find((x) => x.studentId === studentId);
    if (!u) {
      const s = this.student(studentId);
      if (s) {
        u = this.list("users").find(
          (x) => x.email && x.email.toLowerCase().trim() === s.email.toLowerCase().trim()
        );
      }
    }
    if (!u) {
      const s = this.student(studentId);
      if (s) {
        u = this.add("users", {
          id: "u-" + s.id,
          name: s.name,
          email: s.email,
          role: "student",
          studentId: s.id,
          password: KNOWN_PASSWORDS.student123,
          phone: s.phone || "",
        });
      }
    }
    return u;
  },
  getAllMessageableUsers(currentUserId) {
    const users = this.list("users") || [];
    const students = this.list("students") || [];
    const result = [];
    const seenEmails = new Set();
    const seenStudentIds = new Set();

    // Map each user and enrich with studentCode or staffId
    users.forEach((u) => {
      if (!u || !u.id || u.id === currentUserId) return;
      const email = (u.email || "").toLowerCase().trim();
      if (email && seenEmails.has(email)) return;
      if (email) seenEmails.add(email);

      let sub = u.title || (u.role ? u.role.charAt(0).toUpperCase() + u.role.slice(1) : "");
      let code = u.staffId || "";

      if (u.studentId) {
        seenStudentIds.add(u.studentId);
        const st = this.student(u.studentId);
        if (st) {
          code = st.studentCode || st.id;
          sub = `Student · ${st.targetCountry || "Study Abroad"}`;
        }
      }

      result.push({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role || "member",
        sub,
        code,
        phone: u.phone || "",
        studentId: u.studentId || null,
        photoUrl: u.photoUrl || "",
      });
    });

    // Ensure any student in students list without a user record is also available
    students.forEach((s) => {
      if (seenStudentIds.has(s.id)) return;
      const email = (s.email || "").toLowerCase().trim();
      if (email && seenEmails.has(email)) return;

      let u = this.getUserForStudent(s.id);
      if (u && u.id !== currentUserId) {
        result.push({
          id: u.id,
          name: s.name,
          email: s.email,
          role: "student",
          sub: `Student · ${s.targetCountry || "Study Abroad"}`,
          code: s.studentCode || s.id,
          phone: s.phone || "",
          studentId: s.id,
          photoUrl: "",
        });
      }
    });

    return result;
  },
  getConversations(currentUserId) {
    if (!currentUserId) return [];
    const allMsgs = this.list("messages") || [];
    const userMsgs = allMsgs.filter(
      (m) => m.fromUserId === currentUserId || m.toUserId === currentUserId
    );

    const partnerMap = new Map();

    userMsgs.forEach((m) => {
      const partnerId = m.fromUserId === currentUserId ? m.toUserId : m.fromUserId;
      if (!partnerId) return;

      if (!partnerMap.has(partnerId)) {
        partnerMap.set(partnerId, {
          partnerId,
          messages: [],
          unreadCount: 0,
          lastMessage: null,
        });
      }

      const conv = partnerMap.get(partnerId);
      conv.messages.push(m);
      if (m.toUserId === currentUserId && !m.read) {
        conv.unreadCount++;
      }
      if (!conv.lastMessage || new Date(m.sentAt) > new Date(conv.lastMessage.sentAt)) {
        conv.lastMessage = m;
      }
    });

    const result = [];
    partnerMap.forEach((conv, partnerId) => {
      let partner = this.user(partnerId);
      let st = null;
      if (partner && partner.studentId) {
        st = this.student(partner.studentId);
      } else if (!partner && partnerId.startsWith("u-st-")) {
        const studentId = partnerId.replace(/^u-/, "");
        st = this.student(studentId);
        if (st) {
          partner = {
            id: partnerId,
            name: st.name,
            role: "student",
            email: st.email,
            studentId: st.id,
          };
        }
      }

      result.push({
        partnerId,
        partner: partner || {
          id: partnerId,
          name: "User " + partnerId,
          role: "member",
          email: "",
        },
        partnerStudent: st,
        unreadCount: conv.unreadCount,
        lastMessage: conv.lastMessage,
        messageCount: conv.messages.length,
      });
    });

    // Sort by most recent message descending
    result.sort((a, b) => {
      const timeA = a.lastMessage ? new Date(a.lastMessage.sentAt).getTime() : 0;
      const timeB = b.lastMessage ? new Date(b.lastMessage.sentAt).getTime() : 0;
      return timeB - timeA;
    });

    return result;
  },
  getThread(currentUserId, partnerId) {
    if (!currentUserId || !partnerId) return [];
    const allMsgs = this.list("messages") || [];
    return allMsgs
      .filter(
        (m) =>
          (m.fromUserId === currentUserId && m.toUserId === partnerId) ||
          (m.fromUserId === partnerId && m.toUserId === currentUserId)
      )
      .sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));
  },
  sendMessage(fromUserId, toUserId, text, channel = "") {
    if (!fromUserId || !toUserId || !text || !text.trim()) return null;
    const msg = this.add("messages", {
      fromUserId,
      toUserId,
      text: text.trim(),
      channel: channel || "",
      sentAt: new Date().toISOString(),
      read: false,
    });
    return msg;
  },
  markConversationRead(currentUserId, partnerId) {
    if (!currentUserId || !partnerId || !this.data || !this.data.messages) return;
    let changed = false;
    this.data.messages.forEach((m) => {
      if (m.toUserId === currentUserId && m.fromUserId === partnerId && !m.read) {
        m.read = true;
        changed = true;
      }
    });
    if (changed) this.persist();
  },
  getUnreadMessageCount(currentUserId) {
    if (!currentUserId) return 0;
    const all = this.list("messages") || [];
    return all.filter((m) => m.toUserId === currentUserId && !m.read).length;
  },
  generateStaffId(role) {
    const rolePrefixes = {
      admin: "XYZ-ADM",
      branch_manager: "XYZ-MGR",
      counselor: "XYZ-CSL",
      instructor: "XYZ-INS",
      accountant: "XYZ-ACC",
      admission_officer: "XYZ-ADO",
      hr: "XYZ-HR",
      front_desk: "XYZ-REC",
      receptionist: "XYZ-REC",
      marketing: "XYZ-MKT",
      compliance_officer: "XYZ-CMP",
    };
    const prefix = rolePrefixes[role] || "XYZ-STF";
    const staffList = this.list("users").filter((u) => u.role === role && u.staffId);
    const num = staffList.length + 1;
    return prefix + "-" + String(num).padStart(3, "0");
  },
  generateInvoiceNo() {
    const list = this.list("invoices");
    const year = new Date().getFullYear();
    const num = list.length + 1;
    return "INV-" + year + "-" + String(num).padStart(3, "0");
  },
  generateStudentCode() {
    const list = this.list("students");
    const year = new Date().getFullYear();
    const count = list.length + 1;
    return "XYZ-" + year + "-" + String(count).padStart(3, "0");
  },
  generateClassStudentId(batchId) {
    const batch = this.get("batches", batchId);
    const prefix = batch && batch.batchCode ? "XYZ-" + batch.batchCode : "XYZ-IEL";
    const enrolls = this.list("enrollments").filter((e) => e.batchId === batchId);
    const num = enrolls.length + 1;
    return prefix + "-" + String(num).padStart(3, "0");
  },
  getEnrollment(studentId, batchId) {
    return this.list("enrollments").find((e) => e.studentId === studentId && e.batchId === batchId);
  },
  getClassStudentId(studentId, batchId) {
    if (batchId) {
      const e = this.getEnrollment(studentId, batchId);
      if (e && e.classStudentId) return e.classStudentId;
    }
    const anyE = this.list("enrollments").find((e) => e.studentId === studentId);
    return anyE && anyE.classStudentId ? anyE.classStudentId : "—";
  },
  getBatchAttendanceMatrix(batchId) {
    const enrollments = this.list("enrollments").filter((e) => e.batchId === batchId);
    const allAttendance = this.list("attendance").filter((a) => a.batchId === batchId);
    const dates = [...new Set(allAttendance.map((a) => a.date))].sort();

    // Map each date to session topic if available
    const topicByDate = {};
    allAttendance.forEach((a) => {
      if (a.topic && !topicByDate[a.date]) topicByDate[a.date] = a.topic;
    });

    const students = enrollments.map((e) => {
      const st = this.student(e.studentId);
      const studentRecords = allAttendance.filter((a) => a.studentId === e.studentId);
      const recordByDate = Object.fromEntries(studentRecords.map((a) => [a.date, a]));

      let present = 0;
      let late = 0;
      let absent = 0;
      let excused = 0;

      dates.forEach((d) => {
        const rec = recordByDate[d];
        if (!rec) return;
        const s = rec.status || (rec.present ? "present" : "absent");
        if (s === "present") present++;
        else if (s === "late") late++;
        else if (s === "absent") absent++;
        else if (s === "excused") excused++;
      });

      const totalSessions = dates.length;
      const effectivePresent = present + late;
      const rate = totalSessions ? Math.round((effectivePresent / totalSessions) * 100) : 0;

      return {
        studentId: e.studentId,
        classStudentId: e.classStudentId || "—",
        studentCode: st ? st.studentCode : e.studentId,
        studentName: st ? st.name : "Student",
        phone: st ? st.phone : "—",
        records: recordByDate,
        present,
        late,
        absent,
        excused,
        totalSessions,
        effectivePresent,
        rate,
        standing: rate >= 85 ? "excellent" : rate >= 75 ? "good" : "warning",
      };
    });

    return {
      batch: this.get("batches", batchId),
      dates,
      topicByDate,
      students,
      totalSessions: dates.length,
      averageRate: students.length ? Math.round(students.reduce((acc, s) => acc + s.rate, 0) / students.length) : 0,
    };
  },
  getStudentAttendanceStats(studentId, batchId) {
    const records = this.list("attendance").filter((a) => {
      if (a.studentId !== studentId) return false;
      if (batchId && a.batchId !== batchId) return false;
      return true;
    }).sort((a, b) => (a.date < b.date ? 1 : -1));

    const total = records.length;
    const present = records.filter((a) => (a.status === "present" || (!a.status && a.present))).length;
    const late = records.filter((a) => a.status === "late").length;
    const absent = records.filter((a) => a.status === "absent" || (!a.status && !a.present)).length;
    const excused = records.filter((a) => a.status === "excused").length;
    const effectivePresent = present + late;
    const rate = total ? Math.round((effectivePresent / total) * 100) : 0;

    return {
      records,
      total,
      present,
      late,
      absent,
      excused,
      effectivePresent,
      rate,
      standing: rate >= 85 ? "excellent" : rate >= 75 ? "good" : "warning",
      standingText: rate >= 85 ? "Excellent (85%+)" : rate >= 75 ? "Good Standing (75-84%)" : "Attendance Warning (<75%)",
    };
  },
  exportData() {
    const jsonStr = JSON.stringify(this.data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = "education-xyz-bd-backup-" + date + ".json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
  importData(jsonStr) {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed.users || !parsed.students) {
        throw new Error("Invalid backup file structure.");
      }
      this.data = parsed;
      this.persist();
      return true;
    } catch (e) {
      console.error("Backup import error:", e);
      return false;
    }
  },
  getJobApplicationStats() {
    const all = this.list("jobApplications");
    return {
      total: all.length,
      applied: all.filter((j) => j.status === "applied").length,
      reviewing: all.filter((j) => j.status === "reviewing").length,
      interview: all.filter((j) => j.status === "interview").length,
      hired: all.filter((j) => j.status === "hired").length,
      rejected: all.filter((j) => j.status === "rejected").length,
    };
  },
  getUniversityApplicationStats() {
    const all = this.list("applications");
    return {
      total: all.length,
      inquiry: all.filter((a) => a.stage === "inquiry").length,
      documents: all.filter((a) => a.stage === "documents").length,
      applied: all.filter((a) => a.stage === "applied").length,
      offer: all.filter((a) => a.stage === "offer").length,
      visa: all.filter((a) => a.stage === "visa").length,
      completed: all.filter((a) => a.stage === "completed").length,
      rejected: all.filter((a) => a.stage === "rejected").length,
      withInterview: all.filter((a) => a.interviewDate).length,
      cvPending: all.filter((a) => a.cvReviewStatus === "pending" || !a.cvReviewStatus).length,
      cvApproved: all.filter((a) => a.cvReviewStatus === "approved").length,
    };
  },
  generateApplicantCode() {
    const list = this.list("jobApplications");
    const year = new Date().getFullYear();
    const num = list.length + 1;
    return "JA-" + year + "-" + String(num).padStart(3, "0");
  },
};

window.Store = Store;
window.sha256 = sha256;
window.uid = uid;
window.STAGES = STAGES;
window.DOC_TYPES = DOC_TYPES;
window.INTEREST = INTEREST;

