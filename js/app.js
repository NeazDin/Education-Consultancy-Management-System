const NAV = {
  admin: [
    ["#/dashboard", "Dashboard"],
    ["#/accounts", "Accounts & Finance"],
    ["#/students", "Students Directory"],
    ["#/applications", "Applications Pipeline"],
    ["#/documents", "Document Approvals"],
    ["#/recruitment", "Job Candidates & CVs"],
    ["#/batches", "IELTS Batches"],
    ["#/attendance", "Class Attendance"],
    ["#/scores", "Mock Scores"],
    ["#/announcements", "Announcements"],
    ["#/staff", "Staff Directory"],
    ["#/database", "System Database"],
  ],
  branch_manager: [
    ["#/dashboard", "Branch Dashboard"],
    ["#/students", "Students Directory"],
    ["#/applications", "Applications Pipeline"],
    ["#/documents", "Document Approvals"],
    ["#/accounts", "Accounts & Revenue"],
    ["#/batches", "Class Batches"],
    ["#/attendance", "Class Attendance"],
    ["#/scores", "Mock Exam Scores"],
    ["#/recruitment", "Job Candidates & CVs"],
    ["#/staff", "Staff Directory"],
    ["#/database", "System Database"],
    ["#/announcements", "Announcements"],
  ],
  front_desk: [
    ["#/dashboard", "Reception Dashboard"],
    ["#/leads", "Lead Handoff Queue"],
    ["#/batches", "Batch Class Schedules"],
  ],
  marketing: [
    ["#/dashboard", "Marketing Dashboard"],
    ["#/leads", "Lead Generator"],
    ["#/announcements", "Campaign Announcements"],
  ],
  compliance_officer: [
    ["#/dashboard", "Compliance Dashboard"],
    ["#/applications", "Applications & Visa Files"],
    ["#/documents", "Document Approvals & Audit"],
    ["#/students", "Student Registry"],
    ["#/announcements", "Announcements"],
  ],
  accountant: [
    ["#/dashboard", "Accounts Dashboard"],
    ["#/accounts", "Fee Ledger & Invoices"],
    ["#/students", "Students Directory"],
  ],
  admission_officer: [
    ["#/dashboard", "Admissions Dashboard"],
    ["#/leads", "Incoming Lead Queue"],
    ["#/applications", "Applications Pipeline"],
    ["#/documents", "Document Approvals"],
    ["#/students", "Students Directory"],
    ["#/batches", "IELTS Batches"],
    ["#/announcements", "Announcements"],
  ],
  hr: [
    ["#/dashboard", "HR Dashboard"],
    ["#/recruitment", "Job Candidates & CVs"],
    ["#/staff", "Staff & HR Directory"],
    ["#/database", "System Database"],
    ["#/announcements", "Notices & Staff Broadcasts"],
    ["#/students", "Students Directory"],
    ["#/batches", "Faculty Batches"],
  ],
  counselor: [
    ["#/dashboard", "My Dashboard"],
    ["#/students", "My Students"],
    ["#/applications", "Applications"],
    ["#/documents", "Documents Review"],
    ["#/batches", "IELTS Batches"],
  ],
  instructor: [
    ["#/dashboard", "My Dashboard"],
    ["#/batches", "My IELTS Batches"],
    ["#/attendance", "Mark Attendance"],
    ["#/scores", "Mock Exam Scores"],
    ["#/students", "Students"],
  ],
  student: [
    ["#/portal", "My Student Portal"],
    ["#/portal/accounts", "My Fee Receipts"],
    ["#/portal/pay", "Pay Online"],
    ["#/portal/documents", "Document Checklist"],
    ["#/portal/ielts", "IELTS Record & Mocks"],
  ],
};

const TITLES = {
  dashboard: ["Dashboard", "Overview of applications, finance, enrollments, and performance"],
  messages: ["Messages & Inbox", "Direct messaging and communication across all users"],
  accounts: ["Fee Ledger & Accounts", "Student tuition payments, consultancy fees, and invoices"],
  students: ["Students Directory", "Student profiles and counseling records"],
  applications: ["Applications Pipeline", "Study-abroad university admissions & visa progress"],
  documents: ["Document Verification", "Student file inspection, checklist, and approvals"],
  batches: ["IELTS Class Batches", "Class groups, room schedules, and enrolled roster"],
  attendance: ["Class Attendance", "Official attendance register and session logs"],
  scores: ["Mock Test Scores", "Band evaluations: Listening, Reading, Writing, Speaking"],
  announcements: ["Announcements & Notices", "Official broadcasts, class cancellations with dates, and emergency alerts"],
  staff: ["Staff & Organization Directory", "Office team accounts with Staff IDs and department roster"],
  database: ["System Database & Backups", "Local collection inspector, storage diagnostics, and JSON backup/restore"],
  recruitment: ["Job Candidates & CVs", "Recruitment pipeline, CV review, interview scheduling, and applicant tracking"],
  leads: ["Leads & Enquiries", "Capture, qualify, and hand off prospective students to Front Desk and Admissions"],
  portal: ["Student Portal", "Your official profile, Class ID, and study-abroad status"],
  "portal/accounts": ["My Fee Receipts", "Your official payment vouchers and tuition balances"],
  "portal/pay": ["Pay Online", "Pay your tuition fees and outstanding dues securely"],
  "portal/documents": ["My Documents", "Required visa & admission checklist"],
  "portal/ielts": ["My IELTS Record", "Class attendance and mock test band results"],
};

function parseHash() {
  const raw = (location.hash || "#/login").replace(/^#/, "");
  const [path, query] = raw.split("?");
  const parts = path.split("/").filter(Boolean);
  return { parts, query: query || "", path: parts.join("/") };
}

function showLogin(err, success) {
  document.getElementById("login-screen").hidden = false;
  document.getElementById("app-screen").hidden = true;
  const box = document.getElementById("login-error");
  const sBox = document.getElementById("login-success");
  if (err) {
    box.hidden = false;
    box.textContent = err;
  } else {
    box.hidden = true;
  }
  if (success) {
    sBox.hidden = false;
    sBox.textContent = success;
  } else {
    sBox.hidden = true;
  }
}

function showApp() {
  document.getElementById("login-screen").hidden = true;
  document.getElementById("app-screen").hidden = false;
  const nav = document.getElementById("nav");
  const items = NAV[Auth.role()] || [];
  const { path } = parseHash();

  nav.innerHTML = items
    .map(([href, label]) => {
      const key = href.slice(2);
      const activeKey = items
        .map(([itemHref]) => itemHref.slice(2))
        .filter((itemKey) => path === itemKey || path.startsWith(itemKey + "/"))
        .sort((a, b) => b.length - a.length)[0];
      const active = key === activeKey;
      return `<a href="${href}" class="${active ? "active" : ""}">${label}</a>`;
    })
    .join("");

   document.getElementById("who-name").textContent = Auth.user.name;
   const emailHint = document.getElementById("who-email");
   if (emailHint) {
     const primary = Auth.user.email || "";
     const alt = Auth.user.altEmail || "";
     emailHint.textContent = alt ? `${primary} / ${alt}` : primary;
   }
   document.getElementById("who-role").textContent = Auth.user.role + (Auth.user.title ? ` · ${Auth.user.title}` : "");

  // Avatar initial
  const avatarEl = document.getElementById("who-avatar");
  if (avatarEl) {
    avatarEl.textContent = (Auth.user.name || "U").charAt(0).toUpperCase();
  }

  // Live date badge in topbar
  const dateBadge = document.getElementById("today-date-badge");
  if (dateBadge) {
    const options = { weekday: "short", day: "numeric", month: "short", year: "numeric" };
    dateBadge.textContent = new Date().toLocaleDateString("en-GB", options);
  }

  // Live announcement badge in topbar
  UI.updateAnnouncementBell();

  // Keep the floating message bubble in sync.
  UI.updateMessageBadge();
}

function setTitle(key) {
  if (key === "dashboard") {
    const r = Auth.role();
    if (r === "branch_manager") {
      document.getElementById("page-title").textContent = "Branch & Operations Dashboard";
      document.getElementById("page-sub").textContent = "Multi-branch KPIs, counselor capacity, student pipeline, and operations";
      return;
    }
    if (r === "front_desk") {
      document.getElementById("page-title").textContent = "Front Desk & Reception Dashboard";
      document.getElementById("page-sub").textContent = "Walk-in student inquiries, counselor appointments, and batch schedules";
      return;
    }
    if (r === "marketing") {
      document.getElementById("page-title").textContent = "Marketing & Outreach Dashboard";
      document.getElementById("page-sub").textContent = "Student recruitment campaigns, events, and education expos";
      return;
    }
    if (r === "compliance_officer") {
      document.getElementById("page-title").textContent = "Visa & Compliance Dashboard";
      document.getElementById("page-sub").textContent = "Embassy integrity compliance, student file auditing, and visa clearances";
      return;
    }
    if (r === "admission_officer") {
      document.getElementById("page-title").textContent = "Admissions Dashboard";
      document.getElementById("page-sub").textContent = "University applications pipeline, offer letters, and CAS/COE processing";
      return;
    }
    if (r === "hr") {
      document.getElementById("page-title").textContent = "HR & Team Dashboard";
      document.getElementById("page-sub").textContent = "Staff personnel, departments, attendance records, and recruitment pipeline";
      return;
    }
  }
  const t = TITLES[key] || TITLES[key.split("/")[0]] || ["Education XYZ BD", ""];
  document.getElementById("page-title").textContent = t[0];
  document.getElementById("page-sub").textContent = t[1];
}

function defaultRoute() {
  if (Auth.is("admin", "branch_manager", "front_desk", "marketing", "compliance_officer", "accountant", "counselor", "instructor", "admission_officer", "hr")) return "#/dashboard";
  return "#/portal";
}

let currentRouteKey = null;

function getPageTitle(parts, query) {
  const p0 = parts[0];
  const p1 = parts[1];
  if (p0 === "dashboard") {
    if (Auth.role() === "branch_manager") return "Branch Dashboard";
    if (Auth.role() === "front_desk") return "Reception Dashboard";
    if (Auth.role() === "marketing") return "Marketing Dashboard";
    if (Auth.role() === "compliance_officer") return "Compliance Dashboard";
    if (Auth.role() === "admission_officer") return "Admissions Dashboard";
    if (Auth.role() === "hr") return "HR Dashboard";
    return "Dashboard";
  }
  if (p0 === "messages") return "Messages & Inbox";
  if (p0 === "accounts") return "Accounts & Finance";
  if (p0 === "announcements") return "Announcements & Notices";
  if (p0 === "staff") return "Staff Directory";
  if (p0 === "database") return "System Database & Backups";
  if (p0 === "students") {
    if (p1) {
      const s = Store.get("students", p1);
      return s ? `${s.name}'s Profile` : "Student Profile";
    }
    return "Students Directory";
  }
  if (p0 === "applications") {
    if (p1) {
      const a = Store.get("applications", p1);
      const s = a ? Store.get("students", a.studentId) : null;
      return s ? `${s.name}'s Application` : "Application File";
    }
    return "Applications Pipeline";
  }
  if (p0 === "documents") return "Document Approvals";
  if (p0 === "batches") {
    if (p1) {
      const b = Store.get("batches", p1);
      return b ? b.batchName : "Batch Details";
    }
    return "IELTS Batches";
  }
  if (p0 === "attendance") return "Class Attendance";
  if (p0 === "scores") return "Mock Exam Scores";
  if (p0 === "portal") {
    if (p1 === "accounts") return "My Fee Receipts";
    if (p1 === "pay") return "Pay Online";
    if (p1 === "documents") return "My Document Checklist";
    if (p1 === "ielts") return "My IELTS Record";
    return "Student Portal";
  }
  if (p0 === "recruitment") return "Job Candidates & CVs";
  return "Education XYZ BD";
}

function route(forceTransition = false) {
  const { parts, query } = parseHash();
  if (!Auth.user) {
    if (parts[0] && parts[0] !== "login") {
      location.hash = "#/login";
      return;
    }
    currentRouteKey = "login";
    showLogin();
    UI.hideLoader(1000);
    return;
  }
  if (!parts[0] || parts[0] === "login") {
    location.hash = defaultRoute();
    return;
  }
  const role = Auth.role();
  const allowed = {
    admin: true,
    branch_manager: true,
    front_desk: { dashboard: 1, leads: 1, batches: 1 },
    marketing: { dashboard: 1, leads: 1, announcements: 1 },
    compliance_officer: { dashboard: 1, messages: 1, applications: 1, documents: 1, students: 1, announcements: 1 },
    admission_officer: { dashboard: 1, leads: 1, applications: 1, documents: 1, students: 1, batches: 1, announcements: 1 },
    hr: { dashboard: 1, messages: 1, staff: 1, database: 1, announcements: 1, students: 1, batches: 1, recruitment: 1 },
    accountant: { dashboard: 1, messages: 1, accounts: 1, students: 1 },
    counselor: { dashboard: 1, messages: 1, students: 1, applications: 1, documents: 1, batches: 1 },
    instructor: { dashboard: 1, messages: 1, batches: 1, attendance: 1, scores: 1, students: 1 },
    student: { portal: 1, messages: 1 },
  };
  if (role !== "admin" && role !== "branch_manager") {
    const ok = allowed[role] && allowed[role][parts[0]];
    if (!ok) {
      location.hash = defaultRoute();
      return;
    }
  }

  const key = parts.join("/");
  const routeIdentifier = key + (query ? `?${query}` : "");
  const isSameModule = currentRouteKey && currentRouteKey.split("?")[0] === key;
  const isPageSwitch = forceTransition || (!isSameModule && currentRouteKey !== routeIdentifier);

  if (isPageSwitch) {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    UI.showLoader({ message: `Loading ${getPageTitle(parts, query)}...` });
  }

  currentRouteKey = routeIdentifier;
  showApp();
  const root = document.getElementById("view");

  try {
    if (parts[0] === "dashboard") {
      setTitle("dashboard");
      Views.dashboard(root);
      UI.checkAnnouncementPopup();
    } else if (parts[0] === "messages") {
      setTitle("messages");
      Views.messages(root, query);
    } else if (parts[0] === "accounts") {
      setTitle("accounts");
      Views.accounts(root);
    } else if (parts[0] === "announcements") {
      setTitle("announcements");
      Views.announcements(root);
    } else if (parts[0] === "staff") {
      setTitle("staff");
      Views.staff(root);
    } else if (parts[0] === "leads") {
      setTitle("leads");
      Views.leads(root);
    } else if (parts[0] === "students" && parts[1]) {
      setTitle("students");
      Views.studentDetail(root, parts[1]);
    } else if (parts[0] === "students") {
      setTitle("students");
      Views.students(root);
    } else if (parts[0] === "applications" && parts[1]) {
      setTitle("applications");
      Views.applicationDetail(root, parts[1]);
    } else if (parts[0] === "applications") {
      setTitle("applications");
      Views.applications(root);
    } else if (parts[0] === "documents") {
      setTitle("documents");
      Views.documents(root, query);
    } else if (parts[0] === "batches" && parts[1]) {
      setTitle("batches");
      Views.batchDetail(root, parts[1]);
    } else if (parts[0] === "batches") {
      setTitle("batches");
      Views.batches(root);
    } else if (parts[0] === "attendance") {
      setTitle("attendance");
      if (query) {
        const qParams = new URLSearchParams(query);
        if (qParams.get("batch")) Views._attBatch = qParams.get("batch");
      }
      Views.attendance(root);
    } else if (parts[0] === "scores") {
      setTitle("scores");
      Views.scores(root);
    } else if (parts[0] === "portal" && parts[1] === "accounts") {
      setTitle("portal/accounts");
      Views.portalAccounts(root);
    } else if (parts[0] === "portal" && parts[1] === "pay") {
      setTitle("portal/pay");
      Views.portalPay(root);
    } else if (parts[0] === "portal" && parts[1] === "documents") {
      setTitle("portal/documents");
      Views.portalDocuments(root);
    } else if (parts[0] === "portal" && parts[1] === "ielts") {
      setTitle("portal/ielts");
      Views.portalIelts(root);
    } else if (parts[0] === "recruitment") {
      setTitle("recruitment");
      Views.recruitment(root, query);
    } else if (parts[0] === "database") {
      setTitle("database");
      Views.database(root, query);
    } else if (parts[0] === "portal") {
      setTitle("portal");
      Views.portal(root);
      UI.checkAnnouncementPopup();
    } else {
      location.hash = defaultRoute();
      return;
    }
  } catch (err) {
    console.error("View rendering error:", err);
    root.innerHTML = `
      <div class="card">
        <div class="empty">
          <h3>Error loading view</h3>
          <p class="muted">${UI.esc(err.message || "An unexpected error occurred.")}</p>
          <button class="btn btn-primary btn-sm" onclick="location.hash='${defaultRoute()}'">Go to Dashboard</button>
        </div>
      </div>
    `;
  } finally {
    // Hide loader (minWait 1s for full page switch, instant for intra-page actions)
    UI.hideLoader(isPageSwitch ? 1000 : 0);
  }
}

async function boot() {
  await Store.init();
  Auth.restore();

  // Tab switching on login screen
  const tabSignIn = document.getElementById("tab-signin");
  const tabRegister = document.getElementById("tab-register");
  const formSignIn = document.getElementById("login-form");
  const formRegister = document.getElementById("register-form");

  if (tabSignIn && tabRegister) {
    tabSignIn.onclick = () => {
      tabSignIn.classList.add("active");
      tabRegister.classList.remove("active");
      formSignIn.hidden = false;
      formRegister.hidden = true;
      document.getElementById("login-error").hidden = true;
      document.getElementById("login-success").hidden = true;
    };
    tabRegister.onclick = () => {
      tabRegister.classList.add("active");
      tabSignIn.classList.remove("active");
      formRegister.hidden = false;
      formSignIn.hidden = true;
      document.getElementById("login-error").hidden = true;
      document.getElementById("login-success").hidden = true;
    };
  }

  // Sign in submit
  formSignIn.onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const email = fd.get("email");
    const password = fd.get("password");

    UI.showLoader({
      brand: "EduXYZ Portal",
      message: "Signing to EduXYZ Portal...",
    });

    try {
      const [user] = await Promise.all([
        Auth.login(email, password),
        new Promise((r) => setTimeout(r, 1000)),
      ]);

      if (!user) {
        UI.hideLoader(0);
        showLogin("Email/ID or password is not recognised. Please verify credentials or use the helper below.");
        return;
      }

      currentRouteKey = null;
      const targetHash = defaultRoute();
      if (location.hash === targetHash) {
        route(true);
      } else {
        location.hash = targetHash;
      }
    } catch (err) {
      UI.hideLoader(0);
      console.error("Login exception:", err);
      showLogin("Login error: " + (err.message || "Please check credentials."));
    }
  };

  // 1-Click quick fill buttons inside credentials hint drawer
  document.addEventListener("click", (e) => {
    const credBtn = e.target.closest(".btn-quick-cred");
    if (!credBtn) return;
    const email = credBtn.getAttribute("data-email");
    const pw = credBtn.getAttribute("data-pw");
    if (email) document.getElementById("email").value = email;
    if (pw) document.getElementById("password").value = pw;
    document.getElementById("login-error").hidden = true;
    UI.toast(`Loaded credentials for ${credBtn.querySelector("strong")?.innerText || email}`);
  });

  // Student registration submit
  formRegister.onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    UI.showLoader({
      brand: "EduXYZ Portal",
      message: "Creating your student profile...",
    });
    try {
      const [user] = await Promise.all([
        Auth.registerStudent({
          name: fd.get("name"),
          email: fd.get("email"),
          phone: fd.get("phone"),
          password: fd.get("password"),
          interestType: fd.get("interestType"),
          targetCountry: fd.get("targetCountry"),
        }),
        new Promise((r) => setTimeout(r, 1000)),
      ]);
      UI.toast("Account created successfully! Welcome to Education XYZ BD.");
      currentRouteKey = null;
      const targetHash = "#/portal";
      if (location.hash === targetHash) {
        route(true);
      } else {
        location.hash = targetHash;
      }
    } catch (err) {
      UI.hideLoader(0);
      showLogin(err.message);
    }
  };

  // Forgot password click
  const forgotPw = document.getElementById("btn-forgot-pw");
  if (forgotPw) {
    forgotPw.onclick = () => {
      UI.modal(
        "Account Recovery & Support",
        `<p>For security, password resets are processed through our central office administrator.</p>
          <p>Please contact our helpdesk with your registered email and National ID/Student ID:</p>
          <div style="background:var(--card-alt); padding:12px; border-radius:var(--radius-sm); margin:12px 0;">
            <strong>Hotline:</strong> 01781-827022<br>
             <strong>Email:</strong> support@eduxyzbd.com<br>
            <strong>Office:</strong> 3rd floor, Ka-5/C, Jagannatpur, Bashundhara Residencial Area Main Road, Vatara, Dhaka, Bangladesh
          </div>
         <div class="btn-row"><button class="btn btn-primary" type="button" data-close>Close</button></div>`,
        (modal, done) => {
          modal.querySelector("[data-close]").onclick = done;
        }
      );
    };
  }

  // Show / Hide password toggles
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-toggle-password");
    if (!btn) return;
    const targetId = btn.getAttribute("data-target");
    const input = targetId ? document.getElementById(targetId) : btn.parentElement.querySelector("input");
    if (!input) return;
    const isPassword = input.type === "password";
    input.type = isPassword ? "text" : "password";
    const eye = btn.querySelector(".eye-icon");
    const eyeOff = btn.querySelector(".eye-off-icon");
    if (eye && eyeOff) {
      eye.style.display = isPassword ? "none" : "";
      eyeOff.style.display = isPassword ? "" : "none";
    }
    const newAction = isPassword ? "Hide password" : "Show password";
    btn.setAttribute("aria-label", newAction);
    btn.setAttribute("title", newAction);
    input.focus();
  });

  // Logout with confirmation popup
  const logoutBtn = document.getElementById("logout");
  if (logoutBtn) {
    logoutBtn.onclick = () => {
      const userName = (Auth.user && Auth.user.name) || "User";
      const userRole = (Auth.user && Auth.user.role) || "Member";
      const badgeText = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline-block;vertical-align:-2px;margin-right:4px;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>Signed in as <strong>${UI.esc(userName)}</strong> (${UI.esc(userRole)})`;

      UI.confirm({
        title: "Confirm Sign Out",
        message: "Are you sure you want to sign out of your account? You will need to enter your credentials to access the portal again.",
        confirmText: "Sign Out",
        cancelText: "Stay Signed In",
        isDanger: true,
        userBadge: badgeText,
        onConfirm: () => {
          UI.showLoader({ message: "Signing out..." });
          setTimeout(() => {
            Auth.logout();
            currentRouteKey = null;
            if (location.hash === "#/login") {
              route(true);
            } else {
              location.hash = "#/login";
            }
            UI.toast("You have been signed out safely.");
          }, 1000);
        },
      });
    };
  }

  // Sidebar visibility toggle, remembered across all authenticated pages.
  const menuBtn = document.getElementById("menuBtn");
  const sidebarCloseBtn = document.getElementById("sidebarCloseBtn");
  const appSidebar = document.getElementById("appSidebar");
  const appShell = document.getElementById("app-screen");
  if (menuBtn && appSidebar && appShell) {
    const sidebarStorageKey = "xyz-sidebar-hidden";
    const setSidebarVisibility = (hidden) => {
      appShell.classList.toggle("sidebar-collapsed", hidden);
      appSidebar.classList.toggle("open", !hidden && window.innerWidth <= 768);
      menuBtn.setAttribute("aria-expanded", String(!hidden));
      menuBtn.setAttribute("aria-label", hidden ? "Show sidebar" : "Hide sidebar");
      menuBtn.title = hidden ? "Show sidebar" : "Hide sidebar";
      if (sidebarCloseBtn) {
        sidebarCloseBtn.setAttribute("aria-label", hidden ? "Sidebar hidden" : "Hide sidebar");
        sidebarCloseBtn.title = hidden ? "Sidebar hidden" : "Hide sidebar";
      }
      localStorage.setItem(sidebarStorageKey, hidden ? "1" : "0");
    };
    const savedSidebarState = localStorage.getItem(sidebarStorageKey) === "1";
    setSidebarVisibility(savedSidebarState);
    menuBtn.onclick = () => setSidebarVisibility(!appShell.classList.contains("sidebar-collapsed"));
    if (sidebarCloseBtn) sidebarCloseBtn.onclick = () => setSidebarVisibility(true);
    document.getElementById("nav").addEventListener("click", () => {
      appSidebar.classList.remove("open");
    });
  }

  // Floating Message / Inbox bubble click
  const floatingMsgBtn = document.getElementById("floating-message-bubble");
  if (floatingMsgBtn) {
    floatingMsgBtn.onclick = () => {
      if (!Auth.user) return;
      location.hash = "#/messages";
    };
  }

  // Topbar Announcement Bell button click
  const topbarAncBtn = document.getElementById("topbar-announcement-btn");
  if (topbarAncBtn) {
    topbarAncBtn.onclick = () => {
      if (!Auth.user) return;
      const all = Store.list("announcements") || [];
      const role = Auth.role();
      const active = all.filter((a) => {
        if (!a.isActive) return false;
        if (a.targetAudience === "all" || !a.targetAudience) return true;
        if (a.targetAudience === "students" && role === "student") return true;
        if (a.targetAudience === "staff" && role !== "student") return true;
        return a.targetAudience === role;
      });
      if (!active.length) {
        UI.toast("No active announcements at this time.");
        return;
      }
      const latest = active[active.length - 1];
      UI.showAnnouncementPopup(latest, () => {
        sessionStorage.setItem("edu-anc-seen-" + latest.id + "-" + Auth.user.id, "true");
        UI.updateAnnouncementBell();
      });
    };
  }

  window.addEventListener("hashchange", () => route(false));
  UI.showLoader({ message: "Welcome to Education XYZ BD..." });
  route(true);
}

boot();

