const SESSION_KEY = "cms-session";

const Auth = {
  user: null,
  async login(emailOrId, password) {
    if (!emailOrId || !password) return null;
    const cleanId = String(emailOrId).trim().toLowerCase();
    const cleanPw = String(password).trim();
    const rawPw = String(password);

    let hash = "";
    try {
      hash = await sha256(cleanPw);
    } catch (e) {
      console.warn("SHA-256 hashing fallback:", e);
    }

    const users = Store.list("users");

     // 1. Direct matching by email, altEmail, id, staffId, or role shortcut
     let user = users.find((u) => {
       const uEmail = (u.email || "").toLowerCase().trim();
       const uAltEmail = (u.altEmail || "").toLowerCase().trim();
       const uId = (u.id || "").toLowerCase().trim();
       const uStaffId = (u.staffId || "").toLowerCase().trim();
       const uRole = (u.role || "").toLowerCase().trim();

       if (uEmail === cleanId || uAltEmail === cleanId || uId === cleanId || (uStaffId && uStaffId === cleanId)) return true;
      if (cleanId === uRole) return true;
      if (cleanId === "admin" && uRole === "admin") return true;
      if (cleanId === "branch_manager" && uRole === "branch_manager") return true;
      if (cleanId === "manager" && uRole === "branch_manager") return true;
      if (cleanId === "front_desk" && uRole === "front_desk") return true;
      if (cleanId === "reception" && uRole === "front_desk") return true;
      if (cleanId === "receptionist" && uRole === "front_desk") return true;
      if (cleanId === "marketing" && uRole === "marketing") return true;
      if (cleanId === "compliance" && uRole === "compliance_officer") return true;
      if (cleanId === "compliance_officer" && uRole === "compliance_officer") return true;
      if (cleanId === "accountant" && uRole === "accountant") return true;
      if (cleanId === "accounts" && uRole === "accountant") return true;
      if (cleanId === "counselor" && uRole === "counselor") return true;
      if (cleanId === "instructor" && uRole === "instructor") return true;
      if (cleanId === "admission" && uRole === "admission_officer") return true;
      if (cleanId === "admissions" && uRole === "admission_officer") return true;
      if (cleanId === "admission_officer" && uRole === "admission_officer") return true;
      if (cleanId === "hr" && uRole === "hr") return true;
      if (cleanId === "humanresources" && uRole === "hr") return true;
      if (cleanId === "student" && uRole === "student") return true;
      return false;
    });

    // 2. Match student by Student Code (e.g. XYZ-2026-001 or st-1)
    if (!user) {
      const s = Store.list("students").find(
        (st) =>
          (st.studentCode && st.studentCode.toLowerCase().trim() === cleanId) ||
          (st.id && st.id.toLowerCase().trim() === cleanId) ||
          (st.email && st.email.toLowerCase().trim() === cleanId)
      );
       if (s) {
         user = users.find(
           (u) =>
             u.studentId === s.id ||
             (u.email && u.email.toLowerCase().trim() === s.email.toLowerCase().trim()) ||
             (u.altEmail && u.altEmail.toLowerCase().trim() === s.email.toLowerCase().trim())
         );
       }
    }

    // 3. Match against known email aliases
    if (!user) {
      const aliasMap = {
        "admin1@eduxyzbd.com": ["admin", "director@eduxyzbd.com", "xyz-adm-001", "rafiqul@eduxyzbd.com"],
        "manager1@eduxyzbd.com": ["manager", "branch_manager", "xyz-mgr-001", "anisur@eduxyzbd.com"],
        "frontdesk1@eduxyzbd.com": ["reception", "receptionist", "front_desk", "frontdesk", "xyz-rec-001", "sadia@eduxyzbd.com"],
        "frontdesk2@eduxyzbd.com": ["frontdesk2", "farhana.b@eduxyzbd.com"],
        "marketing1@eduxyzbd.com": ["marketing", "outreach", "xyz-mkt-001", "nafis@eduxyzbd.com"],
        "compliance1@eduxyzbd.com": ["compliance", "compliance_officer", "xyz-cmp-001", "tahmina@eduxyzbd.com"],
        "counselor1@eduxyzbd.com": ["counselor", "farzana@eduxyzbd.com", "xyz-csl-001"],
        "counselor2@eduxyzbd.com": ["counselor2", "tanvir@eduxyzbd.com", "xyz-csl-002"],
        "counselor3@eduxyzbd.com": ["counselor3", "nusrat@eduxyzbd.com", "xyz-csl-003"],
        "counselor4@eduxyzbd.com": ["counselor4", "sultana@eduxyzbd.com", "xyz-csl-004"],
        "counselor5@eduxyzbd.com": ["counselor5", "taslima@eduxyzbd.com", "xyz-csl-005"],
        "counselor6@eduxyzbd.com": ["counselor6", "imran@eduxyzbd.com", "xyz-csl-006"],
        "instructor1@eduxyzbd.com": ["instructor", "nasir@eduxyzbd.com", "ielts@eduxyzbd.com", "xyz-ins-001"],
        "instructor2@eduxyzbd.com": ["instructor2", "rafiqul.i@eduxyzbd.com", "xyz-ins-002"],
        "instructor3@eduxyzbd.com": ["instructor3", "sumaiya@eduxyzbd.com", "xyz-ins-003"],
        "instructor4@eduxyzbd.com": ["instructor4", "ahmed@eduxyzbd.com", "xyz-ins-004"],
        "instructor5@eduxyzbd.com": ["instructor5", "rebecca@eduxyzbd.com", "xyz-ins-005"],
        "instructor6@eduxyzbd.com": ["instructor6", "kamal@eduxyzbd.com", "xyz-ins-006"],
        "instructor7@eduxyzbd.com": ["instructor7", "farhana.r@eduxyzbd.com", "xyz-ins-007"],
        "accountant1@eduxyzbd.com": ["accountant", "accounts", "xyz-acc-001", "kamrul@eduxyzbd.com"],
        "accountant2@eduxyzbd.com": ["accountant2", "xyz-acc-002", "kamrul.h@eduxyzbd.com"],
        "admission1@eduxyzbd.com": ["admission", "admissions", "admission_officer", "xyz-ado-001", "zubaida@eduxyzbd.com"],
        "admission2@eduxyzbd.com": ["admission2", "sultana.r@eduxyzbd.com", "xyz-ado-002"],
        "admission3@eduxyzbd.com": ["admission3", "nafisa@eduxyzbd.com", "xyz-ado-003"],
        "hr1@eduxyzbd.com": ["hr", "humanresources", "mahmudur@eduxyzbd.com", "xyz-hr-001"],
        "hr2@eduxyzbd.com": ["hr2", "sabrina@eduxyzbd.com", "xyz-hr-002"],
        "student1@eduxyzbd.com": ["student", "student@eduxyzbd.com", "ayesha@eduxyzbd.com", "xyz-2026-001"],
      };

      for (const [primaryEmail, aliases] of Object.entries(aliasMap)) {
        if (aliases.includes(cleanId) || primaryEmail === cleanId) {
          user = users.find((u) => u.email && u.email.toLowerCase().trim() === primaryEmail);
          if (user) break;
        }
      }
    }

    if (!user) return null;

    // Check password: SHA-256 hash match, plaintext match, or standard role defaults
    const knownRoleDefaults = {
      admin: ["admin123", "admin"],
      branch_manager: ["manager123", "manager", "admin123"],
      front_desk: ["reception123", "reception", "frontdesk123", "frontdesk"],
      receptionist: ["reception123", "reception", "frontdesk123", "frontdesk"],
      marketing: ["marketing123", "marketing"],
      compliance_officer: ["compliance123", "compliance"],
      counselor: ["counselor123", "counselor"],
      instructor: ["instructor123", "instructor"],
      accountant: ["accounts123", "accountant", "accounts"],
      admission_officer: ["admission123", "admission", "admissions123", "admissions"],
      hr: ["hr123", "hr", "admin123"],
      student: ["student123", "student"],
    };

    const isMatch =
      (hash && user.password === hash) ||
      user.password === cleanPw ||
      user.password === rawPw ||
      (knownRoleDefaults[user.role] &&
        (knownRoleDefaults[user.role].includes(cleanPw) ||
          knownRoleDefaults[user.role].includes(rawPw)));

    if (!isMatch) return null;

    // Auto-update hash if not already hashed properly
    if (hash && user.password !== hash) {
      user.password = hash;
      Store.persist();
    }

    this.user = user;
    sessionStorage.setItem(SESSION_KEY, user.id);
    return user;
  },
  restore() {
    const id = sessionStorage.getItem(SESSION_KEY);
    this.user = id ? Store.get("users", id) : null;
    return this.user;
  },
  logout() {
    this.user = null;
    sessionStorage.removeItem(SESSION_KEY);
  },
  role() {
    return this.user && this.user.role;
  },
  is(...roles) {
    return this.user && roles.includes(this.user.role);
  },
  studentId() {
    return this.user && this.user.studentId;
  },
  async registerStudent({ name, email, phone, password, interestType, targetCountry }) {
    const trimmedEmail = email.trim().toLowerCase();
    const existing = Store.list("users").find((u) => u.email.toLowerCase() === trimmedEmail);
    if (existing) {
      throw new Error("An account with this email address already exists. Please sign in.");
    }
    const studentCode = Store.generateStudentCode();
    const student = Store.add("students", {
      studentCode,
      name: name.trim(),
      email: email.trim(),
      phone: (phone || "").trim(),
      interestType: interestType || "both",
      targetCountry: (targetCountry || "").trim(),
      createdAt: new Date().toISOString(),
    });
     const hash = await sha256(password);
     const altEmail = name.trim().toLowerCase().replace(/[^a-z]/g, "").replace(/\s+/g, "") + "@eduxyzbd.com";
     const user = Store.add("users", {
       name: name.trim(),
       email: email.trim(),
       altEmail: altEmail,
       password: hash,
       role: "student",
       studentId: student.id,
     });
    if (interestType !== "IELTS") {
      const counselors = Store.list("users").filter((u) => u.role === "counselor");
      const assigned = counselors.length ? counselors[0].id : "u-c1";
      Store.add("applications", {
        studentId: student.id,
        counselorId: assigned,
        targetCountry: targetCountry || "United Kingdom",
        targetUniversity: "",
        targetProgram: "",
        intake: "Next Intake",
        stage: "inquiry",
        visaDeadline: "",
        notes: [{ at: new Date().toISOString(), by: user.id, text: "Online student registration inquiry received.", type: "inquiry" }],
        updatedAt: new Date().toISOString(),
      });
    }
    this.user = user;
    sessionStorage.setItem(SESSION_KEY, user.id);
    return user;
  },
};

window.Auth = Auth;
