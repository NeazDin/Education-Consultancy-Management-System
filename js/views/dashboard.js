window.Views = window.Views || {};

function monthStart() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function attendancePct(batchId) {
  const rows = Store.list("attendance").filter((a) => a.batchId === batchId);
  if (!rows.length) return 0;
  const present = rows.filter((a) => a.present).length;
  return Math.round((present / rows.length) * 100);
}

Views.dashboard = function (root) {
  const role = Auth.role();
  if (role === "admission_officer") {
    Views.admissionOfficerDashboard(root);
    return;
  }
  if (role === "hr") {
    Views.hrDashboard(root);
    return;
  }
  if (role === "front_desk") {
    Views.frontDeskDashboard(root);
    return;
  }
  if (role === "marketing") {
    Views.marketingDashboard(root);
    return;
  }
  if (role === "counselor") {
    Views.counselorDashboard(root);
    return;
  }
  if (role === "instructor") {
    Views.instructorDashboard(root);
    return;
  }
  if (role === "accountant") {
    Views.accountantDashboard(root);
    return;
  }
  if (role === "student") {
    Views.portal(root);
    return;
  }
  // Default: Admin Dashboard
  Views.adminDashboard(root);
};

Views.adminDashboard = function (root) {
  const students = Store.list("students");
  const apps = Store.list("applications");
  const enrolls = Store.list("enrollments");
  const docs = Store.list("documents");
  const batches = Store.list("batches");
  const invoices = Store.list("invoices") || [];

  const start = monthStart();
  const leadsMonth = students.filter((s) => new Date(s.createdAt) >= start).length;
  const pendingDocs = docs.filter((d) => d.status === "pending").length;
  const activeApps = apps.filter((a) => a.stage !== "completed").length;

  const totalCollected = invoices.reduce((sum, i) => sum + (Number(i.paidAmount) || 0), 0);
  const totalDue = invoices.reduce((sum, i) => sum + (Number(i.dueAmount) || 0), 0);

  const enrolledIds = new Set(enrolls.map((e) => e.studentId));
  const conversion = students.length ? Math.round((enrolledIds.size / students.length) * 100) : 0;
  const byStage = STAGES.map((st) => ({ st, n: apps.filter((a) => a.stage === st).length }));
  const maxStage = Math.max(1, ...byStage.map((x) => x.n));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const visas = apps
    .filter((a) => a.visaDeadline && a.stage !== "completed")
    .map((a) => ({ ...a, d: new Date(a.visaDeadline) }))
    .filter((a) => !Number.isNaN(a.d.getTime()))
    .sort((a, b) => a.d - b.d)
    .slice(0, 5);

  root.innerHTML = `
    ${UI.getAnnouncementBannerHtml("admin")}

    <div class="stats">
      <div class="stat">
        <div class="label">Total Students</div>
        <div class="value">${students.length}</div>
        <div class="meta"><strong style="color:var(--accent)">+${leadsMonth}</strong> registered this month</div>
      </div>
      <div class="stat">
        <div class="label">Total Revenue Realized</div>
        <div class="value" style="color:var(--success);">৳ ${totalCollected.toLocaleString()}</div>
        <div class="meta">BDT Collected · <span style="color:#dc2626; font-weight:600;">৳ ${totalDue.toLocaleString()} Due</span></div>
      </div>
      <div class="stat">
        <div class="label">Active Applications</div>
        <div class="value">${activeApps}</div>
        <div class="meta">${apps.filter((a) => a.stage === "visa" || a.stage === "offer").length} in Offer/Visa stage</div>
      </div>
      <div class="stat">
        <div class="label">Pending Doc Reviews</div>
        <div class="value" style="color:${pendingDocs ? "var(--warning)" : "var(--success)"}">${pendingDocs}</div>
        <div class="meta">Documents awaiting verification</div>
      </div>
    </div>

    <!-- Financial & Accounts Overview Section on Admin Dashboard -->
    <div class="card" style="margin-bottom:20px; border-left: 4px solid var(--primary);">
      <div class="toolbar">
        <div>
          <h2>Financial &amp; Fee Collection Radar</h2>
          <p class="muted" style="margin:0;">Overview of tuition and consultancy fees managed by Accounts Department.</p>
        </div>
        <a href="#/accounts" class="btn btn-sm btn-primary">Open Full Accounts Ledger →</a>
      </div>
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:14px; margin-top:14px; padding:12px; background:var(--card-alt); border-radius:var(--radius-sm);">
        <div>
          <span class="muted" style="font-size:0.75rem; text-transform:uppercase;">Total Collected</span>
          <div style="font-size:1.3rem; font-weight:700; color:var(--success);">৳ ${totalCollected.toLocaleString()} BDT</div>
        </div>
        <div>
          <span class="muted" style="font-size:0.75rem; text-transform:uppercase;">Pending Student Dues</span>
          <div style="font-size:1.3rem; font-weight:700; color:#dc2626;">৳ ${totalDue.toLocaleString()} BDT</div>
        </div>
        <div>
          <span class="muted" style="font-size:0.75rem; text-transform:uppercase;">Total Invoices Issued</span>
          <div style="font-size:1.3rem; font-weight:700; color:var(--primary);">${invoices.length} Vouchers</div>
        </div>
        <div>
          <span class="muted" style="font-size:0.75rem; text-transform:uppercase;">Payment Clear Rate</span>
          <div style="font-size:1.3rem; font-weight:700; color:var(--accent);">
            ${invoices.length ? Math.round((invoices.filter((i) => i.status === "paid").length / invoices.length) * 100) : 0}% Cleared
          </div>
        </div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="toolbar">
          <h2>Application Pipeline</h2>
          <a href="#/applications" class="btn btn-sm btn-ghost">View All Pipelines →</a>
        </div>
        ${byStage
          .map(
            (x) => `<div class="bar-row"><span class="name">${UI.chip(x.st)}</span><div class="bar"><span style="width:${Math.round((x.n / maxStage) * 100)}%"></span></div><span class="pct">${x.n} files</span></div>`
          )
          .join("")}
      </div>

      <div class="card">
        <div class="toolbar">
          <h2>Upcoming Visa &amp; CAS Deadlines</h2>
          <span class="chip visa">Priority Monitor</span>
        </div>
        ${
          visas.length
            ? `<table class="data"><thead><tr><th>Student</th><th>Country</th><th>Deadline</th><th>Stage</th></tr></thead><tbody>${visas
                .map((a) => {
                  const s = Store.student(a.studentId);
                  const diffDays = Math.ceil((a.d - today) / (1000 * 60 * 60 * 24));
                  const urgencyClass = diffDays <= 30 ? "style='color:var(--danger);font-weight:700'" : "";
                  return `<tr><td><a href="#/applications/${a.id}">${UI.esc(s ? s.name : "Student")}</a><br><span class="student-code-badge">${UI.esc(s ? s.studentCode : "")}</span></td><td>${UI.esc(a.targetCountry)}</td><td ${urgencyClass}>${UI.esc(a.visaDeadline)}<br><small class="muted">(${diffDays} days left)</small></td><td>${UI.chip(a.stage)}</td></tr>`;
                })
                .join("")}</tbody></table>`
            : `<div class="empty">No approaching visa deadlines on file.</div>`
        }
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="toolbar">
          <h2>Batch Attendance Overview</h2>
          <a href="#/attendance" class="btn btn-sm btn-ghost">Mark Attendance →</a>
        </div>
        ${batches
          .map((b) => {
            const pct = attendancePct(b.id);
            const ens = Store.list("enrollments").filter((e) => e.batchId === b.id).length;
            return `<div class="bar-row"><span class="name" title="${UI.esc(b.batchName)}">${UI.esc(b.batchName)}<br><small class="muted">${ens} students enrolled</small></span><div class="bar"><span style="width:${pct}%"></span></div><span class="pct">${pct}%</span></div>`;
          })
          .join("")}
      </div>

      <div class="card">
        <h2>Quick Office Shortcuts</h2>
        <div class="btn-row" style="margin-top:12px;">
          <a href="#/announcements" class="btn btn-primary" style="background:#DC2626; border-color:#DC2626;">📢 Manage Announcements</a>
          <a href="#/students" class="btn btn-ghost">+ Register Student</a>
          <a href="#/accounts" class="btn btn-ghost">Fee Ledger &amp; Invoices</a>
          <a href="#/applications" class="btn btn-ghost">+ New Study Abroad File</a>
          <a href="#/batches" class="btn btn-ghost">+ Create IELTS Batch</a>
          <a href="#/documents" class="btn btn-ghost">Review Documents (${pendingDocs})</a>
        </div>
      </div>
    </div>
  `;

  UI.bindAnnouncementBannerClicks(root);
};

Views.counselorDashboard = function (root) {
  const counselorId = Auth.user.id;
  const myApps = Store.list("applications").filter((a) => a.counselorId === counselorId);
  const myStudentIds = new Set(myApps.map((a) => a.studentId));
  const myStudents = Store.list("students").filter((s) => myStudentIds.has(s.id));
  const myDocs = Store.list("documents").filter((d) => {
    const app = Store.get("applications", d.applicationId);
    return app && app.counselorId === counselorId;
  });
  const myPendingDocs = myDocs.filter((d) => d.status === "pending").length;

  root.innerHTML = `
    ${UI.getAnnouncementBannerHtml("counselor")}

    <div class="stats">
      <div class="stat">
        <div class="label">My Assigned Students</div>
        <div class="value">${myStudents.length}</div>
        <div class="meta">Under direct guidance</div>
      </div>
      <div class="stat">
        <div class="label">Active Files</div>
        <div class="value">${myApps.filter((a) => a.stage !== "completed").length}</div>
        <div class="meta">${myApps.length} total applications</div>
      </div>
      <div class="stat">
        <div class="label">Pending Reviews</div>
        <div class="value" style="color:${myPendingDocs ? "var(--warning)" : "var(--success)"}">${myPendingDocs}</div>
        <div class="meta">Student documents to verify</div>
      </div>
      <div class="stat">
        <div class="label">Visa Files</div>
        <div class="value">${myApps.filter((a) => a.stage === "visa").length}</div>
        <div class="meta">In final processing</div>
      </div>
    </div>

    <div class="card">
      <div class="toolbar">
        <h2>My Current Applications Pipeline</h2>
        <a href="#/applications" class="btn btn-sm btn-ghost">Manage Applications →</a>
      </div>
      ${
        myApps.length
          ? `<table class="data"><thead><tr><th>Student</th><th>Destination</th><th>Stage</th><th>Visa Deadline</th><th>Actions</th></tr></thead><tbody>${myApps
              .map((a) => {
                const s = Store.student(a.studentId);
                return `<tr><td><a href="#/applications/${a.id}">${UI.esc(s ? s.name : "Student")}</a><br><span class="student-code-badge">${UI.esc(s ? s.studentCode : "")}</span></td><td>${UI.esc(a.targetCountry)}${a.targetUniversity ? " · <small class='muted'>" + UI.esc(a.targetUniversity) + "</small>" : ""}</td><td>${UI.chip(a.stage)}</td><td>${UI.esc(a.visaDeadline) || "—"}</td><td><a href="#/applications/${a.id}" class="btn btn-sm btn-ghost">Open File</a></td></tr>`;
              })
              .join("")}</tbody></table>`
          : `<div class="empty">No applications currently assigned to you.</div>`
      }
    </div>
  `;

  UI.bindAnnouncementBannerClicks(root);
};

Views.instructorDashboard = function (root) {
  const instructorId = Auth.user.id;
  const currentInstructor = Store.user(instructorId) || Auth.user;
  const myBatches = Store.list("batches").filter((b) => b.instructorId === instructorId || instructorId === "u-i1");
  const myBatchIds = new Set(myBatches.map((b) => b.id));
  const myEnrollments = Store.list("enrollments").filter((e) => myBatchIds.has(e.batchId));
  const myScores = Store.list("mockScores").filter((s) => myBatchIds.has(s.batchId));

  const clubs = Store.list("languageClubs") || [];
  const currentClub = clubs[0] || {
    id: "lc-1",
    title: "Friday Global Debates & Fluency Club",
    topic: "Artificial Intelligence in Higher Education",
    time: "Friday · 4:00 PM – 5:30 PM",
    speakingPrompts: ["Prompt 1", "Prompt 2"],
    attendees: ["st-1"]
  };

  const myMaterials = (Store.list("classContents") || []).filter(
    (c) => c.instructorId === instructorId || !c.instructorId || c.instructorId === "u-i1"
  );

  const studentMessages = (Store.list("messages") || []).filter(
    (m) => m.channel === "instructor" || m.toUserId === instructorId
  );

  root.innerHTML = `
    ${UI.getAnnouncementBannerHtml("instructor")}

    <!-- Top Stats Row -->
    <div class="stats">
      <div class="stat">
        <div class="label">Assigned Batches</div>
        <div class="value">${myBatches.length}</div>
        <div class="meta">Active IELTS classes</div>
      </div>
      <div class="stat">
        <div class="label">Enrolled Students</div>
        <div class="value">${myEnrollments.length}</div>
        <div class="meta">Across assigned batches</div>
      </div>
      <div class="stat">
        <div class="label">Mock Tests Evaluated</div>
        <div class="value">${myScores.length}</div>
        <div class="meta">Recent exam records</div>
      </div>
      <div class="stat">
        <div class="label">Today's Class</div>
        <div class="value">${myBatches[0] ? myBatches[0].batchCode : "IEL-EVE"}</div>
        <div class="meta">${myBatches[0] ? UI.esc(myBatches[0].schedule) : "6:30 PM Studio A"}</div>
      </div>
    </div>

    <!-- Instructor Profile & Picture Option Banner -->
    <div class="card" style="margin-bottom: 24px;">
      <div class="photo-uploader-box">
        <div class="photo-uploader-avatar">
          ${
            currentInstructor.photoUrl
              ? `<img src="${currentInstructor.photoUrl}" alt="${UI.esc(currentInstructor.name)}">`
              : `<span>${UI.esc((currentInstructor.name || "N").charAt(0))}</span>`
          }
        </div>
        <div class="photo-uploader-desc">
          <h4>${UI.esc(currentInstructor.name)} · <span class="chip approved">${UI.esc(currentInstructor.title || "Lead IELTS Instructor")}</span></h4>
          <p>
            ${UI.esc(currentInstructor.credentials || "Cambridge CELTA Certified · IELTS Band 8.5")} · 
            Office Hours: <strong>${UI.esc(currentInstructor.officeHours || "Sun, Tue, Thu · 4:00 PM – 6:15 PM")}</strong>
          </p>
          <div class="btn-row">
            <button class="btn btn-sm btn-primary" id="btn-change-photo" type="button">📷 Change Profile Picture</button>
            <button class="btn btn-sm btn-ghost" id="btn-edit-bio" type="button">✏️ Edit Credentials &amp; Hours</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Class Batches & Quick Attendance Grid -->
    <div class="grid-2" style="margin-bottom: 24px;">
      <div class="card">
        <div class="toolbar">
          <h2>My IELTS Batches</h2>
          <a href="#/attendance" class="btn btn-sm btn-primary">Take Class Attendance →</a>
        </div>
        ${
          myBatches.length
            ? `<table class="data"><thead><tr><th>Batch &amp; Code</th><th>Schedule</th><th>Students</th><th>Attendance</th><th>Action</th></tr></thead><tbody>${myBatches
                .map((b) => {
                  const ens = Store.list("enrollments").filter((e) => e.batchId === b.id).length;
                  const pct = attendancePct(b.id);
                  return `
                    <tr>
                      <td><a href="#/batches/${b.id}"><strong>${UI.esc(b.batchName)}</strong></a><br><span class="class-id-badge">${UI.esc(b.batchCode || "")}</span></td>
                      <td>${UI.esc(b.schedule)}<br><span class="muted" style="font-size:0.75rem;">${UI.esc(b.room || "Studio A")}</span></td>
                      <td><strong>${ens}</strong></td>
                      <td><strong>${pct}%</strong></td>
                      <td><a href="#/attendance?batch=${b.id}" class="btn btn-sm btn-ghost">Mark Attn</a></td>
                    </tr>
                  `;
                })
                .join("")}</tbody></table>`
            : `<div class="empty">No batches assigned yet.</div>`
        }
      </div>

      <!-- Curriculum Progress Tracker -->
      <div class="card">
        <div class="toolbar">
          <h2>Syllabus &amp; Curriculum Progress</h2>
          <span class="chip applied">Batch 01 Progress</span>
        </div>
        <div style="display:flex; flex-direction:column; gap:14px; margin-top:8px;">
          <div>
            <div style="display:flex; justify-content:space-between; font-size:0.86rem; margin-bottom:4px;">
              <span><strong>✍️ Writing Module (Task 1 &amp; Task 2)</strong></span>
              <span><strong>80% Completed</strong></span>
            </div>
            <div style="background:var(--card-alt); border-radius:9999px; height:8px; overflow:hidden; border:1px solid var(--line);">
              <div style="background:#2563EB; width:80%; height:100%;"></div>
            </div>
          </div>
          <div>
            <div style="display:flex; justify-content:space-between; font-size:0.86rem; margin-bottom:4px;">
              <span><strong>📖 Reading Module (Skimming &amp; True/False/NG)</strong></span>
              <span><strong>75% Completed</strong></span>
            </div>
            <div style="background:var(--card-alt); border-radius:9999px; height:8px; overflow:hidden; border:1px solid var(--line);">
              <div style="background:#10B981; width:75%; height:100%;"></div>
            </div>
          </div>
          <div>
            <div style="display:flex; justify-content:space-between; font-size:0.86rem; margin-bottom:4px;">
              <span><strong>🎧 Listening Module (Audio Distractors &amp; Map Drills)</strong></span>
              <span><strong>90% Completed</strong></span>
            </div>
            <div style="background:var(--card-alt); border-radius:9999px; height:8px; overflow:hidden; border:1px solid var(--line);">
              <div style="background:#F59E0B; width:90%; height:100%;"></div>
            </div>
          </div>
          <div>
            <div style="display:flex; justify-content:space-between; font-size:0.86rem; margin-bottom:4px;">
              <span><strong>🗣️ Speaking Module (Cue Cards &amp; Part 3 Abstract)</strong></span>
              <span><strong>70% Completed</strong></span>
            </div>
            <div style="background:var(--card-alt); border-radius:9999px; height:8px; overflow:hidden; border:1px solid var(--line);">
              <div style="background:#8B5CF6; width:70%; height:100%;"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Class Materials & Whiteboard Picture Option Section -->
    <div class="card" style="margin-bottom: 24px;">
      <div class="toolbar">
        <div>
          <h2>Class Study Materials &amp; Whiteboard Photos</h2>
          <p class="muted" style="font-size:0.86rem; margin:0;">
            Share lecture handouts, exam strategies, and whiteboard photos directly with your students.
          </p>
        </div>
        <button class="btn btn-sm btn-primary" id="btn-post-material" type="button">+ Post Material / Photo</button>
      </div>

      <div class="contents-grid">
        ${
          myMaterials.length
            ? myMaterials.map((c) => {
                const tagClass = `tag-${(c.module || 'writing').toLowerCase()}`;
                return `
                  <div class="content-item-card">
                    <div>
                      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                        <span class="content-tag-badge ${tagClass}">${UI.esc(c.module)}</span>
                        <span class="muted" style="font-size:0.75rem;">${UI.esc(c.date)}</span>
                      </div>
                      ${c.imageUrl ? `<img src="${c.imageUrl}" alt="Class Material" class="content-img-thumb" style="cursor:pointer;" data-zoom-img="${c.imageUrl}">` : ""}
                      <h3 style="font-size:1.02rem; font-weight:700; margin:0 0 6px 0; color:var(--ink);">${UI.esc(c.title)}</h3>
                      <p style="font-size:0.85rem; color:var(--ink-soft); line-height:1.45; margin-bottom:12px;">${UI.esc(c.description)}</p>
                    </div>
                    <div style="border-top:1px solid var(--line); padding-top:10px; display:flex; justify-content:space-between; align-items:center;">
                      <span class="muted" style="font-size:0.78rem;">📥 ${c.downloads || 0} student views</span>
                      <button class="btn btn-sm btn-ghost" data-view-material="${c.id}" type="button">Inspect Notes</button>
                    </div>
                  </div>
                `;
              }).join("")
            : `<div class="empty">No materials uploaded yet. Use the button above to upload lecture notes or whiteboard photos.</div>`
        }
      </div>
    </div>

    <!-- Language Club Coordination & Student Inquiries Grid -->
    <div class="grid-2" style="margin-bottom: 24px;">
      <!-- Language Club Management -->
      <div class="card">
        <div class="toolbar">
          <h2>🗣️ Language Club Coordination</h2>
          <button class="btn btn-sm btn-ghost" id="btn-edit-club" type="button">✏️ Update Topic &amp; Prompts</button>
        </div>
        <div style="background:var(--card-alt); border:1px solid var(--line); border-radius:var(--radius); padding:14px; margin-bottom:14px;">
          <div style="font-size:0.78rem; text-transform:uppercase; color:var(--accent); font-weight:700;">Active Weekly Session</div>
          <h3 style="font-size:1.1rem; margin:4px 0;">"${UI.esc(currentClub.topic)}"</h3>
          <p class="muted" style="font-size:0.85rem; margin:0;">${UI.esc(currentClub.time)} · Studio B &amp; Zoom Live</p>
        </div>

        <h4>Registered Student Attendees (${currentClub.attendees ? currentClub.attendees.length : 0})</h4>
        <div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:8px;">
          ${
            currentClub.attendees && currentClub.attendees.length
              ? currentClub.attendees.map((sid) => {
                  const st = Store.student(sid);
                  return `<span class="chip approved" style="font-size:0.82rem;">✓ ${UI.esc(st ? st.name : sid)} (${UI.esc(st?.studentCode || 'Student')})</span>`;
                }).join("")
              : `<span class="muted" style="font-size:0.85rem;">No students registered yet.</span>`
          }
        </div>
      </div>

      <!-- Student Messages / Inquiries Hub -->
      <div class="card">
        <div class="toolbar">
          <h2>💬 Student Questions &amp; Inquiries</h2>
          <span class="chip applied">${studentMessages.length} Messages</span>
        </div>
        ${
          studentMessages.length
            ? `<div style="display:flex; flex-direction:column; gap:10px; max-height:280px; overflow-y:auto;">${studentMessages
                .slice(-5)
                .reverse()
                .map((m) => {
                  const sender = Store.user(m.fromUserId);
                  const isFromMe = m.fromUserId === instructorId;
                  const time = new Date(m.sentAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
                  return `
                    <div style="background:${isFromMe ? 'var(--card-alt)' : '#EFF6FF'}; border:1px solid var(--line); border-radius:var(--radius-sm); padding:10px 12px; font-size:0.86rem;">
                      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                        <strong>${UI.esc(isFromMe ? "You (Instructor)" : sender ? sender.name : "Enrolled Student")}</strong>
                        <span class="muted" style="font-size:0.75rem;">${time}</span>
                      </div>
                      <div style="color:var(--ink);">${UI.esc(m.text)}</div>
                    </div>
                  `;
                })
                .join("")}</div>`
            : `<div class="empty">No student inquiries received yet.</div>`
        }
        <div style="margin-top:14px; text-align:right;">
          <button class="btn btn-sm btn-primary" id="btn-instructor-quick-reply" type="button">✍️ Send Quick Message to Batch</button>
        </div>
      </div>
    </div>
  `;

  // --- Attach Handlers ---

  // 1. Profile Picture Change Modal
  const btnChangePhoto = root.querySelector("#btn-change-photo");
  if (btnChangePhoto) {
    btnChangePhoto.onclick = () => {
      const defaultAvatars = [
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80",
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80",
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80"
      ];

      const html = `
        <div style="font-size:0.92rem;">
          <p>Upload a custom photo or choose from professional faculty avatars:</p>
          
          <div class="field" style="margin-bottom:18px;">
            <label>Upload From Computer / Phone (Max 400 KB)</label>
            <input type="file" id="instructor-file-input" accept="image/*">
            <div id="photo-preview-container" style="margin-top:10px; display:none;">
              <img id="photo-preview-elem" src="" alt="Preview" style="width:80px; height:80px; border-radius:18px; object-fit:cover; border:2px solid var(--accent);">
            </div>
          </div>

          <div style="margin-bottom:14px;">
            <label style="font-weight:700; font-size:0.86rem;">Or Select a Faculty Avatar Preset:</label>
            <div style="display:flex; gap:12px; margin-top:8px;">
              ${defaultAvatars.map((av, idx) => `
                <img src="${av}" class="preset-avatar" data-url="${av}" style="width:56px; height:56px; border-radius:14px; object-fit:cover; cursor:pointer; border:2px solid transparent; transition:transform 0.15s;" title="Avatar ${idx+1}">
              `).join("")}
            </div>
          </div>

          <div class="btn-row" style="margin-top:20px;">
            <button class="btn btn-primary" id="btn-save-photo" type="button">Save Profile Picture</button>
            <button class="btn btn-ghost" type="button" data-close>Cancel</button>
          </div>
        </div>
      `;

      UI.modal("Update Instructor Profile Picture", html, (modal, done) => {
        modal.querySelector("[data-close]").onclick = done;
        let selectedPhoto = currentInstructor.photoUrl || "";

        const fileInput = modal.querySelector("#instructor-file-input");
        const prevCont = modal.querySelector("#photo-preview-container");
        const prevImg = modal.querySelector("#photo-preview-elem");

        fileInput.onchange = async () => {
          const f = fileInput.files[0];
          if (!f) return;
          try {
            selectedPhoto = await UI.readFile(f, 400 * 1024);
            prevImg.src = selectedPhoto;
            prevCont.style.display = "block";
          } catch (err) {
            UI.toast(err.message);
          }
        };

        modal.querySelectorAll(".preset-avatar").forEach((img) => {
          img.onclick = () => {
            modal.querySelectorAll(".preset-avatar").forEach((i) => i.style.borderColor = "transparent");
            img.style.borderColor = "var(--accent)";
            selectedPhoto = img.getAttribute("data-url");
            prevImg.src = selectedPhoto;
            prevCont.style.display = "block";
          };
        });

        modal.querySelector("#btn-save-photo").onclick = () => {
          if (!selectedPhoto) {
            UI.toast("Please select or upload a photo first.");
            return;
          }
          currentInstructor.photoUrl = selectedPhoto;
          Auth.user.photoUrl = selectedPhoto;

          // Sync in store
          const users = Store.list("users");
          const uIdx = users.findIndex((u) => u.id === currentInstructor.id || u.email === currentInstructor.email);
          if (uIdx !== -1) {
            users[uIdx].photoUrl = selectedPhoto;
          }
          Store.persist();
          UI.toast("Profile picture updated successfully!");
          done();
          Views.instructorDashboard(root);
        };
      });
    };
  }

  // 2. Edit Bio & Consultation Hours
  const btnEditBio = root.querySelector("#btn-edit-bio");
  if (btnEditBio) {
    btnEditBio.onclick = () => {
      const html = `
        <form id="edit-bio-form">
          <div class="field">
            <label>Professional Credentials &amp; Degrees</label>
            <input type="text" name="credentials" value="${UI.esc(currentInstructor.credentials || '')}" required>
          </div>
          <div class="field">
            <label>Office Consultation Hours</label>
            <input type="text" name="officeHours" value="${UI.esc(currentInstructor.officeHours || '')}" required>
          </div>
          <div class="field">
            <label>Faculty Bio &amp; Specialty</label>
            <textarea name="bio" rows="4" required>${UI.esc(currentInstructor.bio || '')}</textarea>
          </div>
          <div class="btn-row">
            <button class="btn btn-primary" type="submit">Save Changes</button>
            <button class="btn btn-ghost" type="button" data-close>Cancel</button>
          </div>
        </form>
      `;

      UI.modal("Edit Faculty Credentials &amp; Office Hours", html, (modal, done) => {
        modal.querySelector("[data-close]").onclick = done;
        modal.querySelector("#edit-bio-form").onsubmit = (e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          currentInstructor.credentials = fd.get("credentials");
          currentInstructor.officeHours = fd.get("officeHours");
          currentInstructor.bio = fd.get("bio");

          const users = Store.list("users");
          const uIdx = users.findIndex((u) => u.id === currentInstructor.id || u.email === currentInstructor.email);
          if (uIdx !== -1) {
            users[uIdx].credentials = currentInstructor.credentials;
            users[uIdx].officeHours = currentInstructor.officeHours;
            users[uIdx].bio = currentInstructor.bio;
          }
          Store.persist();
          UI.toast("Faculty credentials updated!");
          done();
          Views.instructorDashboard(root);
        };
      });
    };
  }

  // 3. Post New Class Material with Picture Option
  const btnPostMaterial = root.querySelector("#btn-post-material");
  if (btnPostMaterial) {
    btnPostMaterial.onclick = () => {
      const html = `
        <form id="post-material-form">
          <div class="grid-2">
            <div class="field">
              <label>Module Area</label>
              <select name="module" required>
                <option value="Writing">Writing Module</option>
                <option value="Reading">Reading Module</option>
                <option value="Listening">Listening Module</option>
                <option value="Speaking">Speaking Module</option>
              </select>
            </div>
            <div class="field">
              <label>Tag / Category</label>
              <input type="text" name="tag" placeholder="e.g. Handout, Whiteboard Notes, Audio" required>
            </div>
          </div>
          <div class="field">
            <label>Lesson / Document Title</label>
            <input type="text" name="title" placeholder="e.g. Band 8+ Task 2 Problem-Solution Template" required>
          </div>
          <div class="field">
            <label>Short Summary</label>
            <input type="text" name="description" placeholder="Brief 1-line overview for students" required>
          </div>
          <div class="field">
            <label>Attach Whiteboard Photo or Diagram (Optional, Max 400 KB)</label>
            <input type="file" id="material-img-file" accept="image/*">
            <div id="mat-img-prev-wrap" style="margin-top:8px; display:none;">
              <img id="mat-img-prev" src="" alt="Whiteboard Preview" style="max-height:140px; border-radius:8px; border:1px solid var(--line);">
            </div>
          </div>
          <div class="field">
            <label>Full Lesson Text &amp; Study Guide</label>
            <textarea name="content" rows="6" placeholder="Type key rules, vocabulary items, or model answers..." required></textarea>
          </div>
          <div class="btn-row">
            <button class="btn btn-primary" type="submit">Publish to Student Portal</button>
            <button class="btn btn-ghost" type="button" data-close>Cancel</button>
          </div>
        </form>
      `;

      UI.modal("Post Study Material &amp; Whiteboard Photo", html, (modal, done) => {
        modal.querySelector("[data-close]").onclick = done;
        let uploadedImgUrl = "";

        const imgInput = modal.querySelector("#material-img-file");
        const prevWrap = modal.querySelector("#mat-img-prev-wrap");
        const prevImg = modal.querySelector("#mat-img-prev");

        imgInput.onchange = async () => {
          const f = imgInput.files[0];
          if (!f) return;
          try {
            uploadedImgUrl = await UI.readFile(f, 400 * 1024);
            prevImg.src = uploadedImgUrl;
            prevWrap.style.display = "block";
          } catch (err) {
            UI.toast(err.message);
          }
        };

        modal.querySelector("#post-material-form").onsubmit = (e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          Store.add("classContents", {
            batchId: myBatches[0] ? myBatches[0].id : "bt-1",
            module: fd.get("module"),
            title: fd.get("title"),
            description: fd.get("description"),
            content: fd.get("content"),
            tag: fd.get("tag"),
            date: new Date().toISOString().split("T")[0],
            instructorId: instructorId,
            downloads: 0,
            imageUrl: uploadedImgUrl,
          });

          UI.toast("New material published! Students can now view it on their dashboard.");
          done();
          Views.instructorDashboard(root);
        };
      });
    };
  }

  // 4. Zoom Image on Click
  root.querySelectorAll("[data-zoom-img]").forEach((img) => {
    img.onclick = () => {
      const src = img.getAttribute("data-zoom-img");
      UI.modal(
        "Whiteboard / Diagram View",
        `<div style="text-align:center;"><img src="${src}" style="max-width:100%; max-height:75vh; border-radius:8px; border:1px solid var(--line);"><div class="btn-row" style="margin-top:16px;"><button class="btn btn-primary" type="button" data-close>Close</button></div></div>`,
        (m, done) => { m.querySelector("[data-close]").onclick = done; }
      );
    };
  });

  // 5. Inspect Notes Button
  root.querySelectorAll("[data-view-material]").forEach((b) => {
    b.onclick = () => {
      const id = b.getAttribute("data-view-material");
      const m = (Store.list("classContents") || []).find((x) => x.id === id);
      if (!m) return;
      UI.modal(
        m.title,
        `<div>
          <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
            <span class="chip approved">${UI.esc(m.module)} Module</span>
            <span class="muted" style="font-size:0.82rem;">${UI.esc(m.date)}</span>
          </div>
          ${m.imageUrl ? `<img src="${m.imageUrl}" style="width:100%; max-height:280px; object-fit:contain; border-radius:8px; margin-bottom:12px; border:1px solid var(--line);">` : ""}
          <div style="background:var(--card-alt); padding:14px; border-radius:var(--radius); font-family:monospace; font-size:0.86rem; white-space:pre-wrap; max-height:300px; overflow-y:auto; border:1px solid var(--line);">${UI.esc(m.content || m.description)}</div>
          <div class="btn-row" style="margin-top:16px;"><button class="btn btn-primary" type="button" data-close>Close</button></div>
        </div>`,
        (modal, done) => { modal.querySelector("[data-close]").onclick = done; }
      );
    };
  });

  // 6. Update Language Club Topic
  const btnEditClub = root.querySelector("#btn-edit-club");
  if (btnEditClub) {
    btnEditClub.onclick = () => {
      const html = `
        <form id="edit-club-form">
          <div class="field">
            <label>Speaking Session Title</label>
            <input type="text" name="title" value="${UI.esc(currentClub.title || '')}" required>
          </div>
          <div class="field">
            <label>Weekly Debate / Discussion Topic</label>
            <input type="text" name="topic" value="${UI.esc(currentClub.topic || '')}" required>
          </div>
          <div class="field">
            <label>Meeting Time &amp; Room</label>
            <input type="text" name="time" value="${UI.esc(currentClub.time || '')}" required>
          </div>
          <div class="btn-row">
            <button class="btn btn-primary" type="submit">Update Club Session</button>
            <button class="btn btn-ghost" type="button" data-close>Cancel</button>
          </div>
        </form>
      `;

      UI.modal("Update Language Club Topic", html, (modal, done) => {
        modal.querySelector("[data-close]").onclick = done;
        modal.querySelector("#edit-club-form").onsubmit = (e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          currentClub.title = fd.get("title");
          currentClub.topic = fd.get("topic");
          currentClub.time = fd.get("time");
          Store.persist();
          UI.toast("Language Club details updated for all students!");
          done();
          Views.instructorDashboard(root);
        };
      });
    };
  }

  // 7. Quick Message to Batch
  const btnQuickReply = root.querySelector("#btn-instructor-quick-reply");
  if (btnQuickReply) {
    btnQuickReply.onclick = () => {
      const html = `
        <form id="quick-msg-form">
          <div class="field">
            <label>Send Announcement / Reply to Students</label>
            <textarea name="text" rows="4" placeholder="Type your message or homework tip to the batch..." required></textarea>
          </div>
          <div class="btn-row">
            <button class="btn btn-primary" type="submit">Send Message</button>
            <button class="btn btn-ghost" type="button" data-close>Cancel</button>
          </div>
        </form>
      `;

      UI.modal("Send Message to Enrolled Students", html, (modal, done) => {
        modal.querySelector("[data-close]").onclick = done;
        modal.querySelector("#quick-msg-form").onsubmit = (e) => {
          e.preventDefault();
          const text = new FormData(e.target).get("text").trim();
          if (!text) return;

          Store.add("messages", {
            fromUserId: instructorId,
            toUserId: "u-s1",
            channel: "instructor",
            text: text,
            sentAt: new Date().toISOString(),
            read: true,
          });

          UI.toast("Message dispatched to student portal!");
          done();
          Views.instructorDashboard(root);
        };
      });
    };
  }

  UI.bindAnnouncementBannerClicks(root);
};

Views.accountantDashboard = function (root) {
  const invoices = Store.list("invoices") || [];
  const students = Store.list("students") || [];

  const totalCollected = invoices.reduce((sum, i) => sum + (Number(i.paidAmount) || 0), 0);
  const totalDue = invoices.reduce((sum, i) => sum + (Number(i.dueAmount) || 0), 0);
  const totalBilled = totalCollected + totalDue;
  const overdueCount = invoices.filter((i) => i.status === "overdue").length;
  const partialCount = invoices.filter((i) => i.status === "partial").length;

  const recentInvoices = [...invoices].reverse().slice(0, 6);
  const pendingDues = invoices.filter((i) => i.dueAmount > 0).slice(0, 5);

  root.innerHTML = `
    <div class="view-header">
      <div>
        <h2>Accounts &amp; Finance Dashboard</h2>
        <p>Real-time financial performance, collections progress, and outstanding tuition balances.</p>
      </div>
      <div class="btn-row">
        <a href="#/accounts" class="btn btn-primary">+ Record Payment / Issue Voucher</a>
      </div>
    </div>

    ${UI.getAnnouncementBannerHtml("accountant")}

    <!-- Accounts Metrics Grid -->
    <div class="stats">
      <div class="stat">
        <div class="label">Total Realized Collections</div>
        <div class="value" style="color:var(--success);">৳ ${totalCollected.toLocaleString()}</div>
        <div class="meta">BDT Received to date</div>
      </div>
      <div class="stat">
        <div class="label">Outstanding Receivables</div>
        <div class="value" style="color:#dc2626;">৳ ${totalDue.toLocaleString()}</div>
        <div class="meta">Pending from ${partialCount + overdueCount} student files</div>
      </div>
      <div class="stat">
        <div class="label">Total Invoices Issued</div>
        <div class="value" style="color:var(--primary);">${invoices.length}</div>
        <div class="meta">৳ ${totalBilled.toLocaleString()} BDT Total Billed</div>
      </div>
      <div class="stat">
        <div class="label">Collection Rate</div>
        <div class="value" style="color:var(--accent);">
          ${totalBilled ? Math.round((totalCollected / totalBilled) * 100) : 0}%
        </div>
        <div class="meta">${invoices.filter((i) => i.status === "paid").length} fully cleared files</div>
      </div>
    </div>

    <div class="grid-2">
      <!-- Recent Collections Ledger -->
      <div class="card">
        <div class="toolbar">
          <h2>Recent Payment Collections</h2>
          <a href="#/accounts" class="btn btn-sm btn-ghost">Full Ledger →</a>
        </div>
        ${
          recentInvoices.length
            ? `<table class="data">
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Student</th>
                    <th>Paid Amount</th>
                    <th>Method</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${recentInvoices
                    .map((inv) => {
                      const st = Store.student(inv.studentId);
                      return `
                        <tr>
                          <td><strong style="font-family:var(--font-mono); color:var(--primary); font-size:0.84rem;">${UI.esc(inv.invoiceNo)}</strong></td>
                          <td><strong>${UI.esc(st ? st.name : "Student")}</strong><br><span class="student-code-badge">${UI.esc(st ? st.studentCode : "")}</span></td>
                          <td style="font-weight:700; color:var(--success);">৳ ${Number(inv.paidAmount).toLocaleString()}</td>
                          <td>${UI.esc(inv.paymentMethod)}</td>
                          <td><span class="badge ${inv.status === "paid" ? "badge-success" : inv.status === "partial" ? "badge-warning" : "badge-danger"}">${inv.status}</span></td>
                        </tr>
                      `;
                    })
                    .join("")}
                </tbody>
              </table>`
            : `<div class="empty">No invoice transactions recorded yet.</div>`
        }
      </div>

      <!-- Outstanding Student Dues Queue -->
      <div class="card">
        <div class="toolbar">
          <h2>High-Priority Dues Follow-Up</h2>
          <span class="badge badge-danger">Receivables</span>
        </div>
        ${
          pendingDues.length
            ? `<table class="data">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Service</th>
                    <th>Due (BDT)</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${pendingDues
                    .map((inv) => {
                      const st = Store.student(inv.studentId);
                      return `
                        <tr>
                          <td><strong>${UI.esc(st ? st.name : "Student")}</strong><br><span class="student-code-badge">${UI.esc(st ? st.studentCode : "")}</span></td>
                          <td>${UI.esc(inv.serviceType)}</td>
                          <td style="color:#dc2626; font-weight:700;">৳ ${Number(inv.dueAmount).toLocaleString()}</td>
                          <td>
                            <a href="#/accounts" class="btn btn-sm btn-primary">Collect</a>
                          </td>
                        </tr>
                      `;
                    })
                    .join("")}
                </tbody>
              </table>`
            : `<div class="empty">No pending dues! All student fees are cleared.</div>`
        }
      </div>
    </div>
  `;

  UI.bindAnnouncementBannerClicks(root);
};

Views.admissionOfficerDashboard = function (root) {
  const students = Store.list("students") || [];
  const apps = Store.list("applications") || [];
  const docs = Store.list("documents") || [];
  const batches = Store.list("batches") || [];

  const activeApps = apps.filter((a) => a.stage !== "completed");
  const offerApps = apps.filter((a) => a.stage === "offer");
  const visaApps = apps.filter((a) => a.stage === "visa");
  const appliedApps = apps.filter((a) => a.stage === "applied");
  const pendingDocs = docs.filter((d) => d.status === "pending").length;
  const approvedDocs = docs.filter((d) => d.status === "approved").length;

  // Calculate country breakdown
  const countryCounts = {};
  apps.forEach((a) => {
    const c = a.targetCountry || "Other";
    countryCounts[c] = (countryCounts[c] || 0) + 1;
  });
  const maxCountry = Math.max(1, ...Object.values(countryCounts));

  // Upcoming visa / application deadlines
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const urgentDeadlines = apps
    .filter((a) => a.visaDeadline && a.stage !== "completed")
    .map((a) => ({ ...a, d: new Date(a.visaDeadline) }))
    .filter((a) => !Number.isNaN(a.d.getTime()))
    .sort((a, b) => a.d - b.d)
    .slice(0, 5);

  root.innerHTML = `
    <div class="view-header">
      <div>
        <h2>Admissions &amp; University Processing Dashboard</h2>
        <p>Manage international university liaisons, student offer letters, CAS/COE issuance, and academic document scrutiny.</p>
      </div>
      <div class="btn-row">
        <a href="#/applications" class="btn btn-primary">+ Manage Applications Pipeline</a>
        <a href="#/documents" class="btn btn-ghost">Review Documents (${pendingDocs})</a>
      </div>
    </div>

    ${UI.getAnnouncementBannerHtml("admission_officer")}

    <!-- Admission Metrics Grid -->
    <div class="stats">
      <div class="stat">
        <div class="label">Active University Files</div>
        <div class="value" style="color:var(--primary);">${activeApps.length}</div>
        <div class="meta">${appliedApps.length} files lodged with universities</div>
      </div>
      <div class="stat">
        <div class="label">Offer Letters Received</div>
        <div class="value" style="color:#7E22CE;">${offerApps.length}</div>
        <div class="meta">Conditional &amp; Unconditional offers</div>
      </div>
      <div class="stat">
        <div class="label">CAS / Visa Stage Files</div>
        <div class="value" style="color:var(--accent);">${visaApps.length}</div>
        <div class="meta">Visa document checks underway</div>
      </div>
      <div class="stat">
        <div class="label">Pending Document Scrutiny</div>
        <div class="value" style="color:${pendingDocs ? "var(--warning)" : "var(--success)"};">${pendingDocs}</div>
        <div class="meta">${approvedDocs} files verified and passed</div>
      </div>
    </div>

    <div class="grid-2">
      <!-- Destination Radar -->
      <div class="card">
        <div class="toolbar">
          <h2>University Destination Radar</h2>
          <span class="chip applied">Partner Network</span>
        </div>
        <div style="margin-top:10px;">
          ${Object.entries(countryCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([country, count]) => {
              const pct = Math.round((count / maxCountry) * 100);
              return `
                <div class="bar-row">
                  <span class="name"><strong>${UI.esc(country)}</strong></span>
                  <div class="bar"><span style="width:${pct}%; background:linear-gradient(90deg, var(--primary), var(--accent));"></span></div>
                  <span class="pct">${count} applicants</span>
                </div>
              `;
            })
            .join("")}
        </div>
      </div>

      <!-- Approaching Deadlines & CAS Targets -->
      <div class="card">
        <div class="toolbar">
          <h2>Priority University Deadlines &amp; CAS Targets</h2>
          <span class="chip visa">Action Required</span>
        </div>
        ${
          urgentDeadlines.length
            ? `<table class="data">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Destination</th>
                    <th>Deadline</th>
                    <th>Stage</th>
                  </tr>
                </thead>
                <tbody>
                  ${urgentDeadlines
                    .map((a) => {
                      const s = Store.student(a.studentId);
                      const diffDays = Math.ceil((a.d - today) / (1000 * 60 * 60 * 24));
                      const urgencyClass = diffDays <= 30 ? "style='color:var(--danger);font-weight:700'" : "";
                      return `
                        <tr>
                          <td>
                            <a href="#/applications/${a.id}"><strong>${UI.esc(s ? s.name : "Student")}</strong></a>
                            <br><span class="student-code-badge">${UI.esc(s ? s.studentCode : "")}</span>
                          </td>
                          <td>${UI.esc(a.targetCountry)}${a.targetUniversity ? "<br><small class='muted'>" + UI.esc(a.targetUniversity) + "</small>" : ""}</td>
                          <td ${urgencyClass}>${UI.esc(a.visaDeadline)}<br><small class="muted">(${diffDays} days left)</small></td>
                          <td>${UI.chip(a.stage)}</td>
                        </tr>
                      `;
                    })
                    .join("")}
                </tbody>
              </table>`
            : `<div class="empty">No approaching admission deadlines.</div>`
        }
      </div>
    </div>

    <!-- Active University Admissions Pipeline Table -->
    <div class="card">
      <div class="toolbar">
        <div>
          <h2>Current University Lodgements &amp; Progress</h2>
          <p class="muted" style="margin:0;">Overview of active student study-abroad applications under admission officer coordination.</p>
        </div>
        <a href="#/applications" class="btn btn-sm btn-ghost">All Applications (${apps.length}) →</a>
      </div>
      ${
        apps.length
          ? `<table class="data">
              <thead>
                <tr>
                  <th>Student ID &amp; Name</th>
                  <th>Destination &amp; Target University</th>
                  <th>Program / Intake</th>
                  <th>Application Stage</th>
                  <th>Counselor</th>
                  <th>Visa Target</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${apps
                  .slice(0, 8)
                  .map((a) => {
                    const s = Store.student(a.studentId);
                    const c = Store.user(a.counselorId);
                    return `
                      <tr>
                        <td>
                          <a href="#/applications/${a.id}"><strong>${UI.esc(s ? s.name : "Student")}</strong></a>
                          <br><span class="student-code-badge">${UI.esc(s ? s.studentCode : "")}</span>
                        </td>
                        <td>
                          <strong>${UI.esc(a.targetCountry)}</strong>
                          ${a.targetUniversity ? `<br><small class="muted">${UI.esc(a.targetUniversity)}</small>` : ""}
                        </td>
                        <td>
                          ${UI.esc(a.targetProgram || "—")}
                          ${a.intake ? `<br><small class="muted">${UI.esc(a.intake)}</small>` : ""}
                        </td>
                        <td>${UI.chip(a.stage)}</td>
                        <td>${UI.esc(c ? c.name : "Unassigned")}</td>
                        <td>${UI.esc(a.visaDeadline) || "—"}</td>
                        <td>
                          <div class="btn-row" style="gap:6px;">
                            <a href="#/applications/${a.id}" class="btn btn-sm btn-ghost">Open File</a>
                            <a href="#/documents?app=${a.id}" class="btn btn-sm btn-primary">Docs</a>
                          </div>
                        </td>
                      </tr>
                    `;
                  })
                  .join("")}
              </tbody>
            </table>`
          : `<div class="empty">No university applications recorded yet.</div>`
      }
    </div>

    <!-- Quick Shortcuts Card -->
    <div class="card">
      <h2>Admissions Office Shortcuts</h2>
      <div class="btn-row" style="margin-top:12px;">
        <a href="#/applications" class="btn btn-primary">+ Study Abroad Application Files</a>
        <a href="#/documents" class="btn btn-ghost">Review Student Document Checklist (${pendingDocs})</a>
        <a href="#/students" class="btn btn-ghost">Browse Students Directory (${students.length})</a>
        <a href="#/batches" class="btn btn-ghost">View IELTS Batches (${batches.length})</a>
        <a href="#/leads" class="btn btn-ghost">🎯 Review Incoming Leads</a>
      </div>
    </div>
  `;

  UI.bindAnnouncementBannerClicks(root);
};

Views.hrDashboard = function (root) {
  const staff = Store.listStaffDirectory();
  const staffCount = staff.length;
  const counselors = staff.filter((u) => u.role === "counselor");
  const instructors = staff.filter((u) => u.role === "instructor");
  const accountants = staff.filter((u) => u.role === "accountant");
  const admissionOfficers = staff.filter((u) => u.role === "admission_officer");
  const admins = staff.filter((u) => u.role === "admin");
  const hrMembers = staff.filter((u) => u.role === "hr");

  root.innerHTML = `
    <div class="view-header">
      <div>
        <h2>Human Resources &amp; Personnel Dashboard</h2>
        <p>Staff directory, department allocations, daily attendance logs, talent recruitment pipeline, and internal announcements.</p>
      </div>
      <div class="btn-row">
        <button class="btn btn-primary" id="hr-dash-btn-add-staff">+ Add New Staff Member</button>
        <a href="#/announcements" class="btn btn-ghost">📢 Post Staff Notice</a>
        <a href="#/staff" class="btn btn-ghost">Full Staff Hub →</a>
      </div>
    </div>

    ${UI.getAnnouncementBannerHtml("hr")}

    <!-- HR Metrics Overview -->
    <div class="stats">
      <div class="stat">
        <div class="label">Total Office Staff</div>
        <div class="value" style="color:var(--primary);">${staff.length}</div>
        <div class="meta">${counselors.length} Counselors · ${instructors.length} Trainers · ${admissionOfficers.length} Admissions</div>
      </div>
      <div class="stat">
        <div class="label">Staff Attendance Today</div>
        <div class="value" style="color:var(--success);">${staffCount ? Math.max(0, staffCount - 1) : 0} / ${staffCount}</div>
        <div class="meta"><span class="pulse-dot-sm" style="display:inline-block;vertical-align:middle;margin-right:4px;"></span> Active &amp; On-Site (1 Approved Leave)</div>
      </div>
      <div class="stat">
        <div class="label">Departments Managed</div>
        <div class="value" style="color:var(--accent);">5</div>
        <div class="meta">Admissions, Counseling, Faculty, Finance, Admin</div>
      </div>
      <div class="stat">
        <div class="label">Open Recruitment Roles</div>
        <div class="value" style="color:#BE185D;">3</div>
        <div class="meta">Active job candidate screenings</div>
      </div>
    </div>

    <div class="grid-2">
      <!-- Department Breakdown Chart -->
      <div class="card">
        <div class="toolbar">
          <h2>Department Headcount Allocation</h2>
          <span class="chip approved">All Active</span>
        </div>
        <div style="margin-top:10px;">
          <div class="bar-row">
            <span class="name"><strong>Study-Abroad Counseling</strong></span>
            <div class="bar"><span style="width:${staffCount ? Math.round((counselors.length / staffCount) * 100) : 0}%; background:linear-gradient(90deg, #2563EB, #3B82F6);"></span></div>
            <span class="pct">${counselors.length} team members</span>
          </div>
          <div class="bar-row">
            <span class="name"><strong>IELTS Training Faculty</strong></span>
            <div class="bar"><span style="width:${staffCount ? Math.round((instructors.length / staffCount) * 100) : 0}%; background:linear-gradient(90deg, #059669, #10B981);"></span></div>
            <span class="pct">${instructors.length} trainers</span>
          </div>
          <div class="bar-row">
            <span class="name"><strong>International Admissions</strong></span>
            <div class="bar"><span style="width:${staffCount ? Math.round((admissionOfficers.length / staffCount) * 100) : 0}%; background:linear-gradient(90deg, #0284C7, #38BDF8);"></span></div>
            <span class="pct">${admissionOfficers.length} officers</span>
          </div>
          <div class="bar-row">
            <span class="name"><strong>Accounts &amp; Finance</strong></span>
            <div class="bar"><span style="width:${staffCount ? Math.round((accountants.length / staffCount) * 100) : 0}%; background:linear-gradient(90deg, #D97706, #F59E0B);"></span></div>
            <span class="pct">${accountants.length} officers</span>
          </div>
          <div class="bar-row">
            <span class="name"><strong>Human Resources &amp; Admin</strong></span>
            <div class="bar"><span style="width:${staffCount ? Math.round(((hrMembers.length + admins.length) / staffCount) * 100) : 0}%; background:linear-gradient(90deg, #BE185D, #EC4899);"></span></div>
            <span class="pct">${hrMembers.length + admins.length} executives</span>
          </div>
        </div>
      </div>

      <!-- Staff Availability & Attendance Status Today -->
      <div class="card">
        <div class="toolbar">
          <h2>Today's Staff Availability &amp; Roster</h2>
          <span class="chip approved">Live Roster</span>
        </div>
        <div style="display:flex; flex-direction:column; gap:10px; margin-top:8px;">
          <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 12px; background:var(--card-alt); border-radius:var(--radius-sm); border-left:3px solid var(--success);">
            <div>
              <strong>MD. Rafiqul Islam</strong> (Managing Director)
              <div class="muted" style="font-size:0.8rem;">Executive Chamber · Available On-Site</div>
            </div>
            <span class="chip approved">● In Office</span>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 12px; background:var(--card-alt); border-radius:var(--radius-sm); border-left:3px solid var(--success);">
            <div>
              <strong>Zubaida Khanam</strong> (Senior Admission Officer)
              <div class="muted" style="font-size:0.8rem;">Admissions Desk · CAS Verifications</div>
            </div>
            <span class="chip approved">● In Office</span>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 12px; background:var(--card-alt); border-radius:var(--radius-sm); border-left:3px solid var(--success);">
            <div>
              <strong>Farzana Yasmin</strong> (Senior Counselor)
              <div class="muted" style="font-size:0.8rem;">Counseling Room 2 · Student Consultations</div>
            </div>
            <span class="chip approved">● In Office</span>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 12px; background:var(--card-alt); border-radius:var(--radius-sm); border-left:3px solid var(--success);">
            <div>
              <strong>Nasir Uddin</strong> (Lead IELTS Trainer)
              <div class="muted" style="font-size:0.8rem;">Studio A · Regular Batch 01 Session</div>
            </div>
            <span class="chip approved">● In Class</span>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 12px; background:var(--card-alt); border-radius:var(--radius-sm); border-left:3px solid var(--warning);">
            <div>
              <strong>Tanvir Ahmed</strong> (Study-Abroad Advisor)
              <div class="muted" style="font-size:0.8rem;">Approved Casual Leave · Returns Tomorrow</div>
            </div>
            <span class="chip pending">On Leave</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Active Recruitment & Hiring Pipeline Section -->
    <div class="card" style="margin-bottom:20px;">
      <div class="toolbar">
        <div>
          <h2>Open Job Openings &amp; Recruitment Pipeline</h2>
          <p class="muted" style="margin:0;">Current talent acquisition requisitions managed by HR Department.</p>
        </div>
        <div class="btn-row">
          <a href="#/recruitment" class="btn btn-sm btn-primary">Open Recruitment &amp; CVs →</a>
        </div>
      </div>
      <table class="data" style="margin-top:12px;">
        <thead>
          <tr>
            <th>Position Title</th>
            <th>Department</th>
            <th>Type / Experience</th>
            <th>Applicants</th>
            <th>Current Stage</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Senior Study-Abroad Counselor</strong><br><small class="muted">Russell Group &amp; Canadian Visas</small></td>
            <td><span class="chip counseling">Counseling</span></td>
            <td>Full-time · 3+ Years</td>
            <td><strong style="color:var(--primary);">8 Candidates</strong></td>
            <td><span class="chip shortlisted">Shortlisted (3 Finalists)</span></td>
            <td><a href="#/recruitment?dept=Counseling" class="btn btn-sm btn-ghost">Review Candidates →</a></td>
          </tr>
          <tr>
            <td><strong>IELTS Master Trainer &amp; Examiner</strong><br><small class="muted">Band 8.5+ &amp; CELTA Preferred</small></td>
            <td><span class="chip faculty">Faculty</span></td>
            <td>Full-time · 2+ Years</td>
            <td><strong style="color:var(--primary);">5 Candidates</strong></td>
            <td><span class="chip interview">Demo Lecture Assessment</span></td>
            <td><a href="#/recruitment?dept=Faculty" class="btn btn-sm btn-ghost">Review Candidates →</a></td>
          </tr>
          <tr>
            <td><strong>Digital Marketing &amp; Student Outreach Officer</strong><br><small class="muted">Social Media &amp; Campus Campaigns</small></td>
            <td><span class="chip marketing">Marketing</span></td>
            <td>Full-time · 1+ Years</td>
            <td><strong style="color:var(--primary);">14 Candidates</strong></td>
            <td><span class="chip reviewing">Application Review</span></td>
            <td><a href="#/recruitment?dept=Marketing" class="btn btn-sm btn-ghost">Review Candidates →</a></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Staff Directory Table Preview -->
    <div class="card">
      <div class="toolbar">
        <div>
          <h2>Official Team Directory</h2>
          <p class="muted" style="margin:0;">Only staff with one official Staff ID and a primary @eduxyzbd.com email are shown.</p>
        </div>
        <a href="#/staff" class="btn btn-sm btn-primary">Manage All Staff &amp; IDs →</a>
      </div>
      <table class="data" style="margin-top:12px;">
        <thead>
          <tr>
            <th>Staff ID</th>
            <th>Name &amp; Designation</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${staff.length ? staff
            .slice(0, 8)
            .map(
              (u) => `
                <tr>
                  <td><span class="code-badge" style="background:var(--primary-light); color:var(--primary); font-weight:700; font-family:var(--font-mono);">${UI.esc(u.staffId || "—")}</span></td>
                  <td><strong>${UI.esc(u.name)}</strong>${u.title ? "<br><small class='muted'>" + UI.esc(u.title) + "</small>" : ""}</td>
                   <td><code>${UI.esc(u.email)}</code>${u.altEmail ? "<br><small class='muted'>" + UI.esc(u.altEmail) + "</small>" : ""}</td>
                   <td>${UI.chip(u.role)}</td>
                   <td><span class="chip approved">Active</span></td>
                   <td>
                     ${u.id !== Auth.user.id ? `<a href="#/messages?to=${u.id}" class="btn btn-sm btn-ghost">✉ Message</a>` : `<span class="muted" style="font-size:0.8rem;">You</span>`}
                   </td>
                 </tr>
               `
             )
               .join("") : `<tr><td colspan="6"><div class="empty">No eligible staff accounts are available in the directory.</div></td></tr>`}
         </tbody>
       </table>
    </div>
  `;

  // Bind add staff button in HR dashboard
  const addBtn = root.querySelector("#hr-dash-btn-add-staff");
  if (addBtn) {
    addBtn.onclick = () => {
      location.hash = "#/staff";
      setTimeout(() => {
        const staffAddBtn = document.getElementById("btn-add-staff");
        if (staffAddBtn) staffAddBtn.click();
      }, 300);
    };
  }

  UI.bindAnnouncementBannerClicks(root);
};

Views.staff = function (root) {
  if (!Auth.is("admin", "branch_manager", "hr")) {
    root.innerHTML = `<div class="empty">Only administrators, branch managers, and HR personnel can manage staff and system database.</div>`;
    return;
  }
  const staff = Store.listStaffDirectory();

  root.innerHTML = `
    <div class="toolbar">
      <div>
        <h2>Staff &amp; Role Management</h2>
        <p class="muted">Only staff with one official Staff ID and a primary @eduxyzbd.com email are shown.</p>
      </div>
      <div class="btn-row">
        <button class="btn btn-primary btn-sm" id="btn-add-staff">+ Add Staff Member</button>
        <a href="#/database" class="btn btn-ghost btn-sm">⚡ Database &amp; Storage Hub</a>
        <button class="btn btn-ghost btn-sm" id="btn-export-db">Export Database (JSON)</button>
        <button class="btn btn-ghost btn-sm" id="btn-import-db">Import Backup</button>
        <input type="file" id="db-file-input" accept=".json" style="display:none">
        <button class="btn btn-danger btn-sm" id="btn-reset-db">Reset Demo Data</button>
      </div>
    </div>

    <div class="card">
      <div class="picker-role-pills" id="staff-dept-filter" style="margin-bottom:16px; flex-wrap:wrap; gap:6px;">
        <button type="button" class="picker-pill active" data-dept="all">All (${staff.length})</button>
        <button type="button" class="picker-pill" data-dept="branch_manager">Management (${staff.filter((u) => u.role === "branch_manager").length})</button>
        <button type="button" class="picker-pill" data-dept="front_desk">Reception (${staff.filter((u) => u.role === "front_desk").length})</button>
        <button type="button" class="picker-pill" data-dept="marketing">Marketing (${staff.filter((u) => u.role === "marketing").length})</button>
        <button type="button" class="picker-pill" data-dept="compliance_officer">Compliance (${staff.filter((u) => u.role === "compliance_officer").length})</button>
        <button type="button" class="picker-pill" data-dept="counselor">Counselors (${staff.filter((u) => u.role === "counselor").length})</button>
        <button type="button" class="picker-pill" data-dept="admission_officer">Admissions (${staff.filter((u) => u.role === "admission_officer").length})</button>
        <button type="button" class="picker-pill" data-dept="instructor">Faculty (${staff.filter((u) => u.role === "instructor").length})</button>
        <button type="button" class="picker-pill" data-dept="hr">HR (${staff.filter((u) => u.role === "hr").length})</button>
        <button type="button" class="picker-pill" data-dept="accountant">Accounts (${staff.filter((u) => u.role === "accountant").length})</button>
        <button type="button" class="picker-pill" data-dept="admin">Admin (${staff.filter((u) => u.role === "admin").length})</button>
      </div>

      <table class="data">
        <thead>
          <tr><th>Staff ID</th><th>Name &amp; Designation</th><th>Email / Username</th><th>Role</th><th>Status</th><th>Action</th></tr>
        </thead>
        <tbody id="staff-table-body">
          ${staff.length ? staff
            .map(
              (u) =>
                 `<tr data-staff-role="${UI.esc(u.role)}">
                   <td><span class="code-badge" style="background:var(--primary-light); color:var(--primary); font-weight:700; font-family:var(--font-mono);">${UI.esc(u.staffId || "—")}</span></td>
                   <td><strong>${UI.esc(u.name)}</strong>${u.title ? "<br><small class='muted'>" + UI.esc(u.title) + "</small>" : ""}</td>
                   <td><code>${UI.esc(u.email)}</code>${u.altEmail ? "<br><small class='muted'>" + UI.esc(u.altEmail) + "</small>" : ""}</td>
                   <td>${UI.chip(u.role)}</td>
                   <td><span class="chip approved">Active</span></td>
                   <td>
                     ${u.id !== Auth.user.id ? `<a href="#/messages?to=${u.id}" class="btn btn-sm btn-ghost">✉ Message</a>` : `<span class="muted" style="font-size:0.8rem;">You</span>`}
                   </td>
                 </tr>`
            )
            .join("") : `<tr><td colspan="6"><div class="empty">No eligible staff accounts are available in the directory.</div></td></tr>`}
        </tbody>
      </table>
    </div>

    <div class="card">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <h2 style="margin:0;">Local Database Status</h2>
        <a href="#/database" class="btn btn-primary btn-sm">Explore Collection Inspector →</a>
      </div>
      <dl class="dl">
        <dt>Storage Type</dt><dd>Browser Local Database (Persistent JSON Store)</dd>
        <dt>Database Key</dt><dd><code class="mono">${Store.data ? "xyz_consultancy_db_v1" : "—"}</code></dd>
        <dt>Total Records</dt><dd>${Store.list("students").length} Students, ${Store.list("applications").length} Applications, ${Store.list("batches").length} Batches, ${Store.list("invoices").length} Invoices, ${Store.list("users").length} Accounts</dd>
      </dl>
    </div>
  `;

  // Department filter pills
  const deptFilterPills = root.querySelectorAll("#staff-dept-filter .picker-pill");
  const tableRows = root.querySelectorAll("#staff-table-body tr");
  deptFilterPills.forEach((pill) => {
    pill.onclick = () => {
      deptFilterPills.forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      const targetDept = pill.getAttribute("data-dept");
      tableRows.forEach((row) => {
        const rowRole = row.getAttribute("data-staff-role");
        if (targetDept === "all" || rowRole === targetDept) {
          row.style.display = "";
        } else {
          row.style.display = "none";
        }
      });
    };
  });

  // Add staff member
  root.querySelector("#btn-add-staff").onclick = () => {
    const defaultStaffId = Store.generateStaffId("counselor");
    const html =
      UI.formFields([
        { name: "name", label: "Full Name", required: true },
        { name: "staffId", label: "Staff ID (Official Roll)", value: defaultStaffId, required: true },
         { name: "email", label: "Work Email / Username", type: "text", required: true, placeholder: "e.g. name@eduxyzbd.com" },
        { name: "title", label: "Designation / Title", placeholder: "e.g. Senior Counselor / Accounts Officer" },
        {
          name: "role",
          label: "Assigned Role",
          type: "select",
          options: [
            { value: "branch_manager", label: "Branch Manager (Branch Operations & Roster)" },
            { value: "front_desk", label: "Front Desk & Receptionist (Walk-in & Inquiries)" },
            { value: "marketing", label: "Marketing & Outreach (Student Recruitment & Campaigns)" },
            { value: "compliance_officer", label: "Visa Compliance Officer (Integrity & File Audit)" },
            { value: "counselor", label: "Counselor (Student & Application Management)" },
            { value: "admission_officer", label: "Admission Officer (University Admissions & Offer Processing)" },
            { value: "hr", label: "HR (Human Resources & Staff Management)" },
            { value: "instructor", label: "Instructor (IELTS Batches & Attendance)" },
            { value: "accountant", label: "Accountant (Fees, Invoices & Financial Ledger)" },
            { value: "admin", label: "Administrator (Full System Access)" },
          ],
        },
        { name: "password", label: "Initial Password", type: "password", required: true },
      ]) + `<div class="btn-row"><button class="btn btn-primary" type="submit">Create Staff Account</button><button class="btn btn-ghost" type="button" data-close>Cancel</button></div>`;

    UI.modal("Add Staff Account", `<form id="staff-form">${html}</form>`, (modal, done) => {
      modal.querySelector("[data-close]").onclick = done;
      const roleSelect = modal.querySelector('select[name="role"]');
      const staffIdInput = modal.querySelector('input[name="staffId"]');

      if (roleSelect && staffIdInput) {
        roleSelect.onchange = () => {
          staffIdInput.value = Store.generateStaffId(roleSelect.value);
        };
      }

      modal.querySelector("#staff-form").onsubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const email = fd.get("email").trim().toLowerCase();
        const staffId = fd.get("staffId").trim();

        if (Store.list("users").some((u) => u.email.toLowerCase() === email || (u.altEmail && u.altEmail.toLowerCase() === email))) {
          UI.toast("An account with this email already exists.");
          return;
        }
        const hash = await sha256(fd.get("password"));
        Store.add("users", {
          name: fd.get("name").trim(),
          staffId,
          email,
          title: fd.get("title").trim(),
          role: fd.get("role"),
          password: hash,
        });
        UI.toast("Staff account created with Staff ID: " + staffId);
        done();
        Views.staff(root);
      };
    });
  };

  // Export database
  root.querySelector("#btn-export-db").onclick = () => {
    Store.exportData();
    UI.toast("Database backup exported to JSON.");
  };

  // Import database
  const fileInput = root.querySelector("#db-file-input");
  root.querySelector("#btn-import-db").onclick = () => fileInput.click();
  fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const ok = Store.importData(ev.target.result);
      if (ok) {
        UI.toast("Database restored successfully! Reloading...");
        setTimeout(() => location.reload(), 800);
      } else {
        UI.toast("Failed to import database file.");
      }
    };
    reader.readAsText(file);
  };

  // Reset database
  root.querySelector("#btn-reset-db").onclick = async () => {
    if (!confirm("Are you sure you want to reset all records to the original Education XYZ BD demo state? All custom changes will be overwritten.")) return;
    await Store.reset();
    UI.toast("Database reset to initial state.");
    location.reload();
  };
};

function dashboardReviewBadge(status) {
  const labels = { pending: "CV Pending", reviewed: "Reviewed", shortlisted: "Shortlisted", rejected: "Not Suitable" };
  const classes = { pending: "pending", reviewed: "reviewing", shortlisted: "shortlisted", rejected: "rejected" };
  return `<span class="chip ${classes[status] || "pending"}">${labels[status] || "CV Pending"}</span>`;
}

function roleHeroHtml(className, eyebrow, title, description, mark, primaryHref, primaryLabel, secondaryHref, secondaryLabel) {
  return `<section class="role-dashboard-hero ${className}"><div><span class="role-hero-eyebrow">${eyebrow}</span><h2>${title}</h2><p>${description}</p></div><div class="role-hero-orb">${mark}<br><small>EDUCATION XYZ BD</small></div><div class="role-hero-actions"><a href="${primaryHref}" class="btn btn-light btn-sm">${primaryLabel}</a><a href="${secondaryHref}" class="btn btn-hero-ghost btn-sm">${secondaryLabel}</a></div></section>`;
}

Views.hrDashboard = function (root) {
  const staff = Store.listStaffDirectory();
  const candidates = Store.list("candidates") || [];
  const hiring = candidates.filter((c) => !["hired", "rejected"].includes(c.status || c.stage));
  const shortlist = candidates.filter((c) => c.cvReviewStatus === "shortlisted" || c.status === "interview");
  const functions = [["Counseling", "counselor", "#2563EB"], ["Admissions", "admission_officer", "#0891B2"], ["Faculty", "instructor", "#059669"], ["Operations", "branch_manager", "#7C3AED"], ["Reception", "front_desk", "#D97706"]];
  root.innerHTML = `${roleHeroHtml("hr-dashboard-hero", "People operations · team readiness", "HR Team Command Center", "Keep the consultancy staffed, supported, and ready for every student intake.", "HR", "#/staff", "View Staff Directory", "#/recruitment", "Review Candidates")}${UI.getAnnouncementBannerHtml("hr")}<div class="stats role-stats"><div class="stat"><div class="label">Official Team</div><div class="value">${staff.length}</div><div class="meta">Unique staff IDs on roster</div></div><div class="stat"><div class="label">Hiring In Progress</div><div class="value" style="color:var(--accent);">${hiring.length}</div><div class="meta">Candidate files still active</div></div><div class="stat"><div class="label">Interview Ready</div><div class="value" style="color:var(--warning);">${shortlist.length}</div><div class="meta">Shortlisted or scheduled</div></div><div class="stat"><div class="label">Core Functions</div><div class="value" style="color:var(--success);">${functions.length}</div><div class="meta">Student-service departments</div></div></div><div class="grid-2"><div class="card role-panel"><div class="section-kicker">Roster health</div><h2>Team Coverage by Function</h2><p class="muted">People supporting each stage of the student journey.</p><div class="role-department-list">${functions.map(([label, role, color]) => { const count = staff.filter((u) => u.role === role).length; const pct = staff.length ? Math.round(count / staff.length * 100) : 0; return `<div class="role-department-row"><div><strong>${label}</strong><small>${count} team member${count === 1 ? "" : "s"}</small></div><div class="role-progress"><span style="width:${pct}%;background:${color};"></span></div><b>${pct}%</b></div>`; }).join("")}</div></div><div class="card role-panel"><div class="section-kicker">People actions</div><h2>Today’s HR Queue</h2><div class="role-action-list"><a href="#/recruitment"><span class="role-action-icon">CV</span><span><strong>${hiring.length} candidate files</strong><small>Continue screening and interview decisions</small></span><b>→</b></a><a href="#/staff"><span class="role-action-icon">ID</span><span><strong>${staff.length} staff records</strong><small>Check roles and official contact details</small></span><b>→</b></a><a href="#/announcements"><span class="role-action-icon">!</span><span><strong>Team communication</strong><small>Publish policy, leave, or training notices</small></span><b>→</b></a></div></div></div><div class="card role-panel"><div class="toolbar"><div><div class="section-kicker">Talent pipeline</div><h2>Priority Hiring Files</h2></div><a href="#/recruitment" class="btn btn-sm btn-primary">Open Candidate Hub</a></div>${hiring.length ? `<table class="data"><thead><tr><th>Candidate</th><th>Role</th><th>Department</th><th>Review</th><th>Next step</th></tr></thead><tbody>${hiring.slice(0, 5).map((c) => `<tr><td><strong>${UI.esc(c.name)}</strong><br><small class="muted">${UI.esc(c.applicantCode || c.id)}</small></td><td>${UI.esc(c.positionTitle)}</td><td>${UI.esc(c.department || "General")}</td><td>${dashboardReviewBadge(c.cvReviewStatus)}</td><td><a href="#/recruitment?id=${c.id}" class="btn btn-sm btn-ghost">Open CV</a></td></tr>`).join("")}</tbody></table>` : `<div class="empty">No candidate files are waiting for HR review.</div>`}</div>`;
  UI.bindAnnouncementBannerClicks(root);
};

Views.frontDeskDashboard = function (root) {
  const students = Store.list("students");
  const apps = Store.list("applications");
  const batches = Store.list("batches");
  const recent = students.filter((s) => new Date(s.createdAt) >= new Date(Date.now() - 7 * 86400000));
  const inquiries = apps.filter((a) => a.stage === "inquiry");
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = batches.filter((b) => b.startDate >= today).slice(0, 4);
  root.innerHTML = `${roleHeroHtml("frontdesk-dashboard-hero", "Reception desk · student first contact", "Front Desk Welcome Board", "Turn every walk-in, phone call, and web registration into a well-organized counseling appointment.", "FD", "#/students", "Register Student", "#/batches", "Check Class Seats")}${UI.getAnnouncementBannerHtml("front_desk")}<div class="stats role-stats"><div class="stat"><div class="label">New This Week</div><div class="value" style="color:var(--accent);">${recent.length}</div><div class="meta">Fresh student registrations</div></div><div class="stat"><div class="label">Unassigned Inquiries</div><div class="value" style="color:var(--warning);">${inquiries.length}</div><div class="meta">Need counselor follow-up</div></div><div class="stat"><div class="label">Active Students</div><div class="value">${students.length}</div><div class="meta">Profiles in the system</div></div><div class="stat"><div class="label">Upcoming Batches</div><div class="value" style="color:var(--success);">${upcoming.length}</div><div class="meta">Next class options</div></div></div><div class="grid-2"><div class="card role-panel"><div class="section-kicker">Front desk queue</div><h2>People to Welcome</h2><p class="muted">Recent registrations needing a first response or appointment.</p>${recent.length ? `<div class="role-contact-list">${recent.slice(0, 5).map((s) => `<div><span class="role-avatar">${UI.esc((s.name || "S").charAt(0))}</span><span><strong>${UI.esc(s.name)}</strong><small>${UI.esc(s.targetCountry || "Destination undecided")} · ${UI.esc(s.phone || "No phone")}</small></span><a href="#/students/${s.id}" class="btn btn-sm btn-ghost">Open</a></div>`).join("")}</div>` : `<div class="empty">No new registrations in the last seven days.</div>`}</div><div class="card role-panel"><div class="section-kicker">Classroom calendar</div><h2>Upcoming Student Touchpoints</h2><div class="role-action-list">${upcoming.length ? upcoming.map((b) => `<a href="#/batches/${b.id}"><span class="role-action-icon">${UI.esc((b.batchCode || "IEL").slice(0, 3))}</span><span><strong>${UI.esc(b.batchName)}</strong><small>${UI.esc(b.schedule || "Schedule pending")} · ${UI.esc(b.room || "Room pending")}</small></span><b>→</b></a>`).join("") : `<div class="empty">No upcoming batches found.</div>`}</div></div></div><div class="card role-panel"><div class="toolbar"><div><div class="section-kicker">Service handoff</div><h2>Inquiry Handoff Board</h2></div><a href="#/students" class="btn btn-sm btn-primary">Open Student Directory</a></div>${inquiries.length ? `<table class="data"><thead><tr><th>Student</th><th>Destination</th><th>Stage</th><th>Action</th></tr></thead><tbody>${inquiries.slice(0, 6).map((a) => { const s = Store.student(a.studentId); return `<tr><td><strong>${UI.esc(s ? s.name : "Student")}</strong><br><small class="muted">${UI.esc(s ? s.phone || s.email : "Contact unavailable")}</small></td><td>${UI.esc(a.targetCountry || "Undecided")}</td><td><span class="chip applied">Needs counselor</span></td><td><a href="#/applications/${a.id}" class="btn btn-sm btn-ghost">Prepare Handoff</a></td></tr>`; }).join("")}</tbody></table>` : `<div class="empty">All current inquiries have a next step assigned.</div>`}</div>`;
  root.querySelectorAll('a[href^="#/applications/"]').forEach((link) => {
    link.onclick = (event) => {
      event.preventDefault();
      const applicationId = link.getAttribute("href").split("/").pop();
      const application = Store.get("applications", applicationId);
      if (application) location.hash = `#/leads?handoff=${encodeURIComponent(application.studentId)}`;
    };
  });
  UI.bindAnnouncementBannerClicks(root);
};

Views.marketingDashboard = function (root) {
  const students = Store.list("students");
  const apps = Store.list("applications");
  const candidates = Store.list("candidates") || [];
  const countries = Object.entries(students.reduce((result, student) => { const country = student.targetCountry || "Undecided"; result[country] = (result[country] || 0) + 1; return result; }, {})).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const newLeads = students.filter((s) => new Date(s.createdAt) >= new Date(Date.now() - 30 * 86400000)).length;
  const activeApps = apps.filter((a) => a.stage !== "completed").length;
  root.innerHTML = `${roleHeroHtml("marketing-dashboard-hero", "Growth desk · education consultancy outreach", "Student Growth Studio", "Turn destination interest into qualified counseling conversations, applications, and successful enrollments.", "MKT", "#/students", "Explore Student Leads", "#/announcements", "Create Outreach Notice")}${UI.getAnnouncementBannerHtml("marketing")}<div class="stats role-stats"><div class="stat"><div class="label">New Leads · 30 Days</div><div class="value" style="color:var(--accent);">${newLeads}</div><div class="meta">Fresh prospects in the funnel</div></div><div class="stat"><div class="label">Active Application Demand</div><div class="value">${activeApps}</div><div class="meta">Students moving toward admission</div></div><div class="stat"><div class="label">Top Destination</div><div class="value" style="font-size:1.4rem;">${UI.esc(countries[0] ? countries[0][0] : "—")}</div><div class="meta">${countries[0] ? countries[0][1] : 0} student interests</div></div><div class="stat"><div class="label">Talent Reach</div><div class="value" style="color:var(--warning);">${candidates.length}</div><div class="meta">Recruitment profiles available</div></div></div><div class="grid-2"><div class="card role-panel"><div class="section-kicker">Audience signals</div><h2>Destination Interest</h2><p class="muted">Use demand signals to shape social posts, seminars, and university campaigns.</p><div class="role-department-list">${countries.map(([country, count], index) => { const pct = students.length ? Math.round(count / students.length * 100) : 0; return `<div class="role-department-row"><div><strong>${UI.esc(country)}</strong><small>${count} interested student${count === 1 ? "" : "s"}</small></div><div class="role-progress"><span style="width:${pct}%;background:${["#2563EB", "#0891B2", "#059669", "#D97706", "#7C3AED"][index]};"></span></div><b>${pct}%</b></div>`; }).join("")}</div></div><div class="card role-panel"><div class="section-kicker">Campaign ideas</div><h2>What to Promote Next</h2><div class="role-action-list"><a href="#/announcements"><span class="role-action-icon">UK</span><span><strong>UK application readiness week</strong><small>Highlight CAS, SOP, and document support</small></span><b>→</b></a><a href="#/batches"><span class="role-action-icon">IEL</span><span><strong>IELTS intake spotlight</strong><small>Promote classes and available seats</small></span><b>→</b></a><a href="#/applications"><span class="role-action-icon">VIS</span><span><strong>Visa success story series</strong><small>Build trust with destination guidance</small></span><b>→</b></a></div></div></div><div class="card role-panel"><div class="toolbar"><div><div class="section-kicker">Conversion watch</div><h2>Leads Ready for a Conversation</h2></div><a href="#/students" class="btn btn-sm btn-primary">Open Lead Directory</a></div><table class="data"><thead><tr><th>Student</th><th>Interest</th><th>Destination</th><th>Next move</th></tr></thead><tbody>${students.slice(0, 6).map((s) => `<tr><td><strong>${UI.esc(s.name)}</strong><br><small class="muted">${UI.esc(s.email)}</small></td><td>${UI.esc(s.interestType || "Study abroad")}</td><td>${UI.esc(s.targetCountry || "Undecided")}</td><td><span class="chip reviewing">Personalized follow-up</span></td></tr>`).join("")}</tbody></table></div>`;
  UI.bindAnnouncementBannerClicks(root);
};

