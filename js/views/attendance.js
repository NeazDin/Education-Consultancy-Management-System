window.Views = window.Views || {};

function visibleBatches() {
  const all = Store.list("batches") || [];
  if (Auth.is("admin", "counselor", "admission_officer", "hr")) return all;
  if (Auth.is("instructor")) {
    const my = all.filter((b) => b.instructorId === Auth.user.id || Auth.user.id === "u-i1");
    return my.length ? my : all;
  }
  return all;
}

Views.attendance = function (root) {
  const batches = visibleBatches();
  if (!batches.length) {
    root.innerHTML = `<div class="empty">No active IELTS batches assigned to mark attendance for.</div>`;
    return;
  }

  const selectedBatchId = Views._attBatch || batches[0].id;
  const currentBatch = Store.get("batches", selectedBatchId) || batches[0];
  const activeTab = Views._attTab || "marker"; // "marker" | "generator" | "analytics"
  const selectedDate = Views._attDate || new Date().toISOString().slice(0, 10);
  const attendanceKey = `${currentBatch.id}:${selectedDate}`;

  // Enrollments and existing records
  const enrollments = Store.list("enrollments").filter((e) => e.batchId === currentBatch.id);
  const existingForDate = Store.list("attendance").filter((a) => a.batchId === currentBatch.id && a.date === selectedDate);
  const statusMap = {};
  const noteMap = {};
  let currentTopic = "";

  existingForDate.forEach((a) => {
    statusMap[a.studentId] = a.status || (a.present ? "present" : "absent");
    if (a.note) noteMap[a.studentId] = a.note;
    if (a.topic && !currentTopic) currentTopic = a.topic;
  });
  const isSubmitted = existingForDate.length > 0 && Views._attEditingKey !== attendanceKey;

  // Calculate matrix for data sheet generator and analytics
  const matrixData = Store.getBatchAttendanceMatrix(currentBatch.id);

  root.innerHTML = `
    <!-- Top Workspace Tabs -->
    <div class="attendance-nav-tabs">
      <button type="button" class="attendance-tab-btn ${activeTab === 'marker' ? 'active' : ''}" data-att-tab="marker">
        📝 Daily Class Session Marker
      </button>
      <button type="button" class="attendance-tab-btn ${activeTab === 'generator' ? 'active' : ''}" data-att-tab="generator">
        📊 Attendance Data Sheet Generator
      </button>
      <button type="button" class="attendance-tab-btn ${activeTab === 'analytics' ? 'active' : ''}" data-att-tab="analytics">
        📈 Batch Analytics &amp; At-Risk Alerts (${matrixData.students.filter(s => s.standing === 'warning').length})
      </button>
    </div>

    <!-- TAB 1: LIVE CLASS ATTENDANCE MARKER -->
    <div id="tab-content-marker" ${activeTab !== 'marker' ? 'hidden' : ''}>
      <div class="card attendance-session-picker" style="margin-bottom: 20px;">
        <div class="grid-2" style="align-items:end;">
          <div class="field" style="margin-bottom:0;">
            <label for="att-batch-select">Select IELTS Preparation Batch</label>
            <select id="att-batch-select" style="font-weight:600;">
              ${batches.map((b) => `<option value="${b.id}" ${b.id === currentBatch.id ? "selected" : ""}>${UI.esc(b.batchName)} (${UI.esc(b.batchCode || "IEL")})</option>`).join("")}
            </select>
          </div>
          <div class="field" style="margin-bottom:0;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <label for="att-date-input" style="margin:0;">Class Session Date</label>
              <div class="btn-row" style="gap:4px;">
                <button type="button" class="btn btn-sm btn-ghost" id="btn-quick-today" style="padding:2px 8px; font-size:0.75rem;">Today</button>
                <button type="button" class="btn btn-sm btn-ghost" id="btn-quick-prev" style="padding:2px 8px; font-size:0.75rem;">Yesterday</button>
              </div>
            </div>
            <input type="date" id="att-date-input" value="${selectedDate}">
          </div>
        </div>

        <div class="field" style="margin-top:14px; margin-bottom:0;">
          <label for="att-session-topic">Session Lesson / Curriculum Topic (Optional)</label>
          <input type="text" id="att-session-topic" placeholder="e.g. Writing Task 2: Band 8 Problem-Solution Template, or Reading True/False/NG" value="${UI.esc(currentTopic)}">
        </div>
      </div>

      <!-- Batch Header & Live Summary Counters -->
      <div class="card attendance-register-card ${isSubmitted ? "attendance-submitted-card" : ""}">
        <div class="toolbar" style="margin-bottom:12px;">
          <div>
            <span class="attendance-kicker">${isSubmitted ? "Submitted report" : "New attendance report"}</span>
            <h3>Attendance Register: ${UI.esc(currentBatch.batchName)}</h3>
            <p class="muted" style="font-size:0.84rem; margin:0;">
              Schedule: <strong>${UI.esc(currentBatch.schedule)}</strong> · Room: <strong>${UI.esc(currentBatch.room || "Studio A")}</strong> · Instructor: <strong>${UI.esc(UI.name(currentBatch.instructorId))}</strong>
            </p>
          </div>
          ${isSubmitted
            ? `<div class="submitted-report-badge">✓ Submitted<br><small>${UI.date(selectedDate)}</small></div>`
            : `<div class="btn-row"><button type="button" class="btn btn-sm btn-ghost" id="btn-mark-all-present" style="color:#059669; font-weight:700;">✓ Mark All Present</button><button type="button" class="btn btn-sm btn-ghost" id="btn-mark-all-absent" style="color:#DC2626; font-weight:700;">✗ Mark All Absent</button></div>`}
        </div>

        ${isSubmitted ? `<div class="submitted-report-note"><strong>This attendance report has been submitted.</strong> The list below is read-only. Click <strong>Resubmit</strong> to start again; every student will be reset to Absent.</div>` : `<div class="new-report-note"><strong>New date:</strong> every student starts as Absent. Mark the correct status, then submit the official report.</div>`}

        <!-- Real-Time Counter Bar -->
        <div class="att-summary-bar ${isSubmitted ? "att-summary-submitted" : ""}">
          <div class="att-counters">
            <span class="att-count-pill pill-p" id="cnt-present">● 0 Present</span>
            <span class="att-count-pill pill-l" id="cnt-late">● 0 Late</span>
            <span class="att-count-pill pill-a" id="cnt-absent">● 0 Absent</span>
            <span class="att-count-pill pill-e" id="cnt-excused">● 0 Excused</span>
          </div>
          <div class="att-rate-display">
            <span>Session Attendance Rate:</span>
            <span id="cnt-rate" style="font-size:1.2rem; color:var(--primary);">0%</span>
          </div>
        </div>

        <!-- Quick Search Filter -->
        <div style="margin-bottom:14px; display:flex; justify-content:space-between; align-items:center;">
          <input type="text" id="roster-search-input" placeholder="🔍 Quick search student name or Class ID..." style="max-width:320px; padding:6px 12px; font-size:0.85rem; border:1px solid var(--line); border-radius:6px;">
          <span class="muted" style="font-size:0.8rem;" id="roster-count-label">${enrollments.length} students enrolled</span>
        </div>

        ${
          enrollments.length
            ? `
            <table class="data" id="roster-table">
              <thead>
                <tr>
                  <th style="width:130px;">Class Student ID</th>
                  <th>Student Profile</th>
                  <th style="width:110px;">Standing</th>
                  <th style="width:230px;">Attendance Status</th>
                  <th style="width:200px;">Remarks / Arrival Time</th>
                </tr>
              </thead>
              <tbody>
                ${enrollments
                  .map((e) => {
                    const st = Store.student(e.studentId);
                    const currentStatus = statusMap[e.studentId] || "absent";
                    const currentNote = noteMap[e.studentId] || "";
                    const studentStats = Store.getStudentAttendanceStats(e.studentId, currentBatch.id);
                    const standingPillClass = studentStats.standing === 'excellent' ? 'badge-success' : studentStats.standing === 'good' ? 'badge-warning' : 'badge-danger';

                    return `
                      <tr class="roster-row" data-search-text="${UI.esc((st ? st.name : '') + ' ' + (e.classStudentId || '') + ' ' + (st ? st.studentCode : '')).toLowerCase()}">
                        <td>
                          <span class="class-id-badge" style="font-size:0.84rem; font-weight:750;">${UI.esc(e.classStudentId || "—")}</span>
                        </td>
                        <td>
                          <a href="#/students/${e.studentId}"><strong>${UI.esc(st ? st.name : "Student")}</strong></a>
                          <br><span class="student-code-badge">${UI.esc(st ? st.studentCode : "")}</span>
                          ${st && st.phone ? `<span class="muted" style="font-size:0.75rem; margin-left:6px;">📞 ${UI.esc(st.phone)}</span>` : ""}
                        </td>
                        <td>
                          <span class="badge ${standingPillClass}" style="font-size:0.75rem;">
                            ${studentStats.rate}% (${studentStats.present}/${studentStats.total})
                          </span>
                        </td>
                        <td>${isSubmitted
                          ? `<span class="submitted-status submitted-${currentStatus}">${currentStatus === "excused" ? "Leave" : currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}</span>`
                          : `<div class="status-pill-group" data-st-id="${e.studentId}"><button type="button" class="status-pill-opt ${currentStatus === 'present' ? 'active-present' : ''}" data-val="present">Present</button><button type="button" class="status-pill-opt ${currentStatus === 'late' ? 'active-late' : ''}" data-val="late">Late</button><button type="button" class="status-pill-opt ${currentStatus === 'absent' ? 'active-absent' : ''}" data-val="absent">Absent</button><button type="button" class="status-pill-opt ${currentStatus === 'excused' ? 'active-excused' : ''}" data-val="excused">Leave</button></div>`}</td>
                        <td>${isSubmitted ? `<span class="submitted-note">${UI.esc(currentNote || "No note")}</span>` : `<input type="text" class="att-note-input" data-note-id="${e.studentId}" placeholder="Optional note..." value="${UI.esc(currentNote)}">`}</td>
                      </tr>
                    `;
                  })
                  .join("")}
              </tbody>
            </table>

            <div class="btn-row" style="margin-top:22px; justify-content:space-between; align-items:center;">
              <span class="muted" style="font-size:0.85rem;">${isSubmitted ? "Submitted attendance for" : "Ready to submit attendance for"} <strong>${UI.date(selectedDate)}</strong></span>
              ${isSubmitted ? `<button class="btn btn-primary btn-lg" id="btn-resubmit-attendance">↻ Resubmit Attendance</button>` : `<button class="btn btn-primary btn-lg" id="btn-save-attendance">✓ Submit Official Attendance</button>`}
            </div>
          `
            : `<div class="empty">No students are currently enrolled in this batch.</div>`
        }
      </div>
    </div>

    <!-- TAB 2: ATTENDANCE DATA SHEET GENERATOR -->
    <div id="tab-content-generator" ${activeTab !== 'generator' ? 'hidden' : ''}>
      <div class="card" style="margin-bottom:20px;">
        <div class="toolbar">
          <div>
            <h2>📊 Attendance Data Sheet Generator</h2>
            <p class="muted" style="font-size:0.86rem; margin:0;">
              Generate and print official attendance master matrices, blank physical classroom rosters, and downloadable spreadsheets.
            </p>
          </div>
          <div class="btn-row">
            <button type="button" class="btn btn-primary btn-sm" id="btn-print-master-register">🖨️ Print Official Master Register</button>
            <button type="button" class="btn btn-ghost btn-sm" id="btn-print-blank-sheet">📄 Print Blank Physical Roster</button>
            <button type="button" class="btn btn-ghost btn-sm" id="btn-export-matrix-csv">📥 Download CSV Spreadsheet</button>
          </div>
        </div>

        <div style="display:flex; align-items:center; gap:16px; margin-top:14px; padding:12px; background:var(--card-alt); border-radius:var(--radius-sm); flex-wrap:wrap;">
          <div>
            <span class="muted" style="font-size:0.75rem; text-transform:uppercase;">Selected Batch</span>
            <div style="font-weight:700; color:var(--primary); font-size:0.95rem;">${UI.esc(currentBatch.batchName)}</div>
          </div>
          <div>
            <span class="muted" style="font-size:0.75rem; text-transform:uppercase;">Class Student Roll</span>
            <div style="font-weight:700;">${enrollments.length} Enrolled</div>
          </div>
          <div>
            <span class="muted" style="font-size:0.75rem; text-transform:uppercase;">Total Class Sessions Conducted</span>
            <div style="font-weight:700;">${matrixData.totalSessions} Sessions</div>
          </div>
          <div>
            <span class="muted" style="font-size:0.75rem; text-transform:uppercase;">Batch Cumulative Rate</span>
            <div style="font-weight:700; color:var(--success); font-size:1.05rem;">${matrixData.averageRate}%</div>
          </div>
        </div>
      </div>

      <!-- Interactive Matrix Screen Preview -->
      <div class="card">
        <div class="toolbar">
          <div>
            <h3>Attendance Register Matrix</h3>
            <span class="muted" style="font-size:0.82rem;">Click any date header to load and edit that session directly.</span>
          </div>
          <div style="display:flex; gap:10px; font-size:0.78rem; font-weight:700;">
            <span style="color:#15803D;">● P = Present</span>
            <span style="color:#B45309;">● L = Late</span>
            <span style="color:#B91C1C;">● A = Absent</span>
            <span style="color:#1D4ED8;">● E = Excused</span>
          </div>
        </div>

        ${
          matrixData.students.length && matrixData.dates.length
            ? `
            <div class="matrix-container">
              <table class="matrix-table">
                <thead>
                  <tr>
                    <th style="width:36px;">#</th>
                    <th style="width:110px;">Class ID</th>
                    <th class="th-sticky-student" style="min-width:180px;">Student Name</th>
                    ${matrixData.dates
                      .map((d) => {
                        const dayMonth = new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
                        const weekday = new Date(d).toLocaleDateString("en-GB", { weekday: "short" });
                        const topic = matrixData.topicByDate[d] || "";
                        return `
                          <th class="th-date" title="${UI.esc(d)}${topic ? ' · ' + UI.esc(topic) : ''}">
                            <a href="javascript:void(0)" class="matrix-date-link" data-jump-date="${d}">
                              <strong>${dayMonth}</strong>
                              <span class="th-date-sub">${weekday}</span>
                            </a>
                          </th>
                        `;
                      })
                      .join("")}
                    <th style="width:65px; background:#EFF6FF;">P / L</th>
                    <th style="width:55px; background:#FEF2F2;">Abs</th>
                    <th style="width:65px; background:#F8FAFC;">Rate %</th>
                    <th style="width:90px;">Standing</th>
                  </tr>
                </thead>
                <tbody>
                  ${matrixData.students
                    .map((s, idx) => {
                      const standingCls = s.standing === 'excellent' ? 'badge-success' : s.standing === 'good' ? 'badge-warning' : 'badge-danger';
                      return `
                        <tr>
                          <td>${idx + 1}</td>
                          <td><span class="class-id-badge" style="font-size:0.78rem;">${UI.esc(s.classStudentId)}</span></td>
                          <td class="td-sticky-student">
                            <strong>${UI.esc(s.studentName)}</strong>
                            ${(() => {
                              const u = Store.getUserForStudent(s.studentId);
                              return u ? `<a href="#/messages?to=${u.id}" class="btn btn-sm btn-ghost" style="padding:1px 6px; font-size:0.75rem; margin-left:4px;" title="Direct message student regarding attendance">✉</a>` : "";
                            })()}
                            <br><small class="muted">${UI.esc(s.studentCode)}</small>
                          </td>
                          ${matrixData.dates
                            .map((d) => {
                              const rec = s.records[d];
                              if (!rec) return `<td><span class="matrix-mark m-empty">—</span></td>`;
                              const st = rec.status || (rec.present ? "present" : "absent");
                              const markLetter = st === 'present' ? 'P' : st === 'late' ? 'L' : st === 'absent' ? 'A' : 'E';
                              const markCls = st === 'present' ? 'm-p' : st === 'late' ? 'm-l' : st === 'absent' ? 'm-a' : 'm-e';
                              const noteTooltip = rec.note ? `Title: ${rec.note}` : "";
                              return `<td><span class="matrix-mark ${markCls}" title="${UI.esc(noteTooltip)}">${markLetter}</span></td>`;
                            })
                            .join("")}
                          <td style="font-weight:700; color:#15803D;">${s.effectivePresent}</td>
                          <td style="font-weight:700; color:#DC2626;">${s.absent}</td>
                          <td style="font-weight:800; font-family:var(--font-mono); font-size:0.9rem;">${s.rate}%</td>
                          <td><span class="badge ${standingCls}" style="font-size:0.72rem;">${s.standing}</span></td>
                        </tr>
                      `;
                    })
                    .join("")}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3" style="text-align:right;"><strong>Session Present / Late Total:</strong></td>
                    ${matrixData.dates
                      .map((d) => {
                        const recs = Store.list("attendance").filter((a) => a.batchId === currentBatch.id && a.date === d);
                        const pres = recs.filter((a) => a.present || a.status === 'present' || a.status === 'late').length;
                        const pct = recs.length ? Math.round((pres / recs.length) * 100) : 0;
                        return `<td><strong>${pres}</strong><br><small class="muted">${pct}%</small></td>`;
                      })
                      .join("")}
                    <td colspan="4"></td>
                  </tr>
                </tfoot>
              </table>
            </div>`
            : `<div class="empty">No attendance sessions recorded yet for this batch to generate a data sheet. Use Tab 1 to mark your first class session.</div>`
        }
      </div>
    </div>

    <!-- TAB 3: BATCH ANALYTICS & AT-RISK STUDENTS -->
    <div id="tab-content-analytics" ${activeTab !== 'analytics' ? 'hidden' : ''}>
      <div class="stats">
        <div class="stat">
          <div class="label">Batch Health Rate</div>
          <div class="value" style="color:var(--success);">${matrixData.averageRate}%</div>
          <div class="meta">Cumulative attendance performance</div>
        </div>
        <div class="stat">
          <div class="label">Sessions Held</div>
          <div class="value">${matrixData.totalSessions}</div>
          <div class="meta">Completed class meetings</div>
        </div>
        <div class="stat">
          <div class="label">High Attendance (85%+)</div>
          <div class="value" style="color:#059669;">${matrixData.students.filter(s => s.standing === 'excellent').length}</div>
          <div class="meta">Students in good standing</div>
        </div>
        <div class="stat">
          <div class="label">At-Risk Alerts (<75%)</div>
          <div class="value" style="color:#DC2626;">${matrixData.students.filter(s => s.standing === 'warning').length}</div>
          <div class="meta">Require counselor intervention</div>
        </div>
      </div>

      <div class="card">
        <div class="toolbar">
          <div>
            <h2>⚠️ At-Risk Attendance Monitoring Roster</h2>
            <p class="muted" style="margin:0; font-size:0.86rem;">
              Students whose attendance has dropped below the minimum British Council / visa compliance threshold (75%).
            </p>
          </div>
        </div>

        ${
          matrixData.students.filter(s => s.standing === 'warning').length
            ? `
            <table class="data">
              <thead>
                <tr>
                  <th>Class ID</th>
                  <th>Student Name</th>
                  <th>Contact Phone</th>
                  <th>Present / Total</th>
                  <th>Attendance %</th>
                  <th>Missed Sessions</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${matrixData.students
                  .filter(s => s.standing === 'warning')
                  .map((s) => `
                    <tr>
                      <td><span class="class-id-badge">${UI.esc(s.classStudentId)}</span></td>
                      <td>
                        <a href="#/students/${s.studentId}"><strong>${UI.esc(s.studentName)}</strong></a>
                        <br><span class="student-code-badge">${UI.esc(s.studentCode)}</span>
                      </td>
                      <td><strong>${UI.esc(s.phone)}</strong></td>
                      <td>${s.effectivePresent} of ${s.totalSessions} sessions</td>
                      <td><span class="badge badge-danger" style="font-weight:800; font-size:0.86rem;">${s.rate}%</span></td>
                      <td style="color:#DC2626; font-weight:700;">${s.absent} Absences</td>
                      <td>
                        <div class="btn-row" style="gap:6px;">
                          <button type="button" class="btn btn-sm btn-ghost" data-view-slip="${s.studentId}">Attendance Slip</button>
                          <a href="#/students/${s.studentId}" class="btn btn-sm btn-primary">Follow Up</a>
                        </div>
                      </td>
                    </tr>
                  `)
                  .join("")}
              </tbody>
            </table>
          `
            : `<div class="empty" style="color:var(--success); font-weight:600;">✓ Excellent news! All enrolled students in this batch are maintaining above 75% attendance.</div>`
        }
      </div>
    </div>
  `;

  // --- Attach Handlers ---

  // 1. Tab Switching
  root.querySelectorAll("[data-att-tab]").forEach((btn) => {
    btn.onclick = () => {
      Views._attTab = btn.getAttribute("data-att-tab");
      Views.attendance(root);
    };
  });

  // 2. Batch Dropdown Change
  const batchSelect = root.querySelector("#att-batch-select");
  if (batchSelect) {
    batchSelect.onchange = (e) => {
      Views._attBatch = e.target.value;
      Views._attEditingKey = null;
      Views.attendance(root);
    };
  }

  // 3. Date Picker Change
  const dateInput = root.querySelector("#att-date-input");
  if (dateInput) {
    dateInput.onchange = (e) => {
      Views._attDate = e.target.value;
      Views._attEditingKey = null;
      Views.attendance(root);
    };
  }

  // Quick Today & Yesterday Buttons
  const btnToday = root.querySelector("#btn-quick-today");
  if (btnToday) {
    btnToday.onclick = () => {
      Views._attDate = new Date().toISOString().slice(0, 10);
      Views._attEditingKey = null;
      Views.attendance(root);
    };
  }
  const btnPrev = root.querySelector("#btn-quick-prev");
  if (btnPrev) {
    btnPrev.onclick = () => {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      Views._attDate = d.toISOString().slice(0, 10);
      Views._attEditingKey = null;
      Views.attendance(root);
    };
  }

  // 4. Update Live Statistics Counters
  const updateLiveCounters = () => {
    let p = 0, l = 0, a = 0, e = 0;
    if (isSubmitted) {
      existingForDate.forEach((record) => {
        const status = record.status || (record.present ? "present" : "absent");
        if (status === "present") p++;
        else if (status === "late") l++;
        else if (status === "excused") e++;
        else a++;
      });
    }
    root.querySelectorAll(".status-pill-group").forEach((group) => {
      const activeBtn = group.querySelector(".active-present, .active-late, .active-absent, .active-excused");
      if (!activeBtn) return;
      const val = activeBtn.getAttribute("data-val");
      if (val === "present") p++;
      else if (val === "late") l++;
      else if (val === "absent") a++;
      else if (val === "excused") e++;
    });

    const total = p + l + a + e;
    const effective = p + l;
    const rate = total ? Math.round((effective / total) * 100) : 0;

    const elP = root.querySelector("#cnt-present");
    const elL = root.querySelector("#cnt-late");
    const elA = root.querySelector("#cnt-absent");
    const elE = root.querySelector("#cnt-excused");
    const elRate = root.querySelector("#cnt-rate");

    if (elP) elP.textContent = `● ${p} Present`;
    if (elL) elL.textContent = `● ${l} Late`;
    if (elA) elA.textContent = `● ${a} Absent`;
    if (elE) elE.textContent = `● ${e} Excused`;
    if (elRate) elRate.textContent = `${rate}%`;
  };

  updateLiveCounters();

  // 5. Interactive Status Pill Buttons in Roster
  root.querySelectorAll(".status-pill-group button").forEach((btn) => {
    btn.onclick = () => {
      const parent = btn.closest(".status-pill-group");
      parent.querySelectorAll("button").forEach((b) => {
        b.className = "status-pill-opt";
      });
      const val = btn.getAttribute("data-val");
      btn.className = `status-pill-opt active-${val}`;
      updateLiveCounters();
    };
  });

  // 6. 1-Click Mark All Present / Absent
  const btnAllPresent = root.querySelector("#btn-mark-all-present");
  if (btnAllPresent) {
    btnAllPresent.onclick = () => {
      root.querySelectorAll(".status-pill-group").forEach((group) => {
        group.querySelectorAll("button").forEach((b) => b.className = "status-pill-opt");
        const presBtn = group.querySelector('[data-val="present"]');
        if (presBtn) presBtn.className = "status-pill-opt active-present";
      });
      updateLiveCounters();
      UI.toast("Marked all enrolled students as Present.");
    };
  }

  const btnAllAbsent = root.querySelector("#btn-mark-all-absent");
  if (btnAllAbsent) {
    btnAllAbsent.onclick = () => {
      root.querySelectorAll(".status-pill-group").forEach((group) => {
        group.querySelectorAll("button").forEach((b) => b.className = "status-pill-opt");
        const absBtn = group.querySelector('[data-val="absent"]');
        if (absBtn) absBtn.className = "status-pill-opt active-absent";
      });
      updateLiveCounters();
      UI.toast("Marked all enrolled students as Absent.");
    };
  }

  // 7. Quick Search in Roster Table
  const searchInput = root.querySelector("#roster-search-input");
  if (searchInput) {
    searchInput.oninput = (e) => {
      const term = e.target.value.toLowerCase().trim();
      let matchCount = 0;
      root.querySelectorAll(".roster-row").forEach((row) => {
        const text = row.getAttribute("data-search-text") || "";
        const visible = !term || text.includes(term);
        row.style.display = visible ? "" : "none";
        if (visible) matchCount++;
      });
      const countLabel = root.querySelector("#roster-count-label");
      if (countLabel) countLabel.textContent = `Showing ${matchCount} of ${enrollments.length} students`;
    };
  }

  // 8. Save Daily Attendance Record
  const btnSave = root.querySelector("#btn-save-attendance");
  if (btnSave) {
    btnSave.onclick = () => {
      const topic = (root.querySelector("#att-session-topic")?.value || "").trim();

      enrollments.forEach((e) => {
        const group = root.querySelector(`.status-pill-group[data-st-id="${e.studentId}"]`);
        if (!group) return;
        const activeBtn = group.querySelector(".active-present, .active-late, .active-absent, .active-excused");
        const status = activeBtn ? activeBtn.getAttribute("data-val") : "present";
        const isPresent = status === "present" || status === "late";
        const note = (root.querySelector(`[data-note-id="${e.studentId}"]`)?.value || "").trim();

        const rec = Store.list("attendance").find(
          (a) => a.batchId === currentBatch.id && a.studentId === e.studentId && a.date === selectedDate
        );

        if (rec) {
          Store.update("attendance", rec.id, {
            present: isPresent,
            status: status,
            note: note,
            topic: topic,
          });
        } else {
          Store.add("attendance", {
            batchId: currentBatch.id,
            studentId: e.studentId,
            date: selectedDate,
            present: isPresent,
            status: status,
            note: note,
            topic: topic,
          });
        }
      });

      UI.toast(`Attendance record for ${UI.date(selectedDate)} saved successfully!`);
      Views._attEditingKey = null;
      Views.attendance(root);
    };
  }

  const btnResubmit = root.querySelector("#btn-resubmit-attendance");
  if (btnResubmit) {
    btnResubmit.onclick = () => {
      existingForDate.forEach((record) => {
        Store.update("attendance", record.id, { present: false, status: "absent", note: "", topic: currentTopic });
      });
      Views._attEditingKey = attendanceKey;
      UI.toast("Report reopened. Every student is now marked Absent.");
      Views.attendance(root);
    };
  }

  // 9. Jump to Date from Matrix View
  root.querySelectorAll("[data-jump-date]").forEach((link) => {
    link.onclick = () => {
      Views._attDate = link.getAttribute("data-jump-date");
      Views._attEditingKey = null;
      Views._attTab = "marker";
      Views.attendance(root);
    };
  });

  // 10. Print Official Master Register
  const btnPrintRegister = root.querySelector("#btn-print-master-register");
  if (btnPrintRegister) {
    btnPrintRegister.onclick = () => {
      printOfficialAttendanceSheet(currentBatch, matrixData);
    };
  }

  // 11. Print Blank Physical Roster
  const btnPrintBlank = root.querySelector("#btn-print-blank-sheet");
  if (btnPrintBlank) {
    btnPrintBlank.onclick = () => {
      printBlankPhysicalRoster(currentBatch, enrollments);
    };
  }

  // 12. Export Matrix to CSV
  const btnExportCsv = root.querySelector("#btn-export-matrix-csv");
  if (btnExportCsv) {
    btnExportCsv.onclick = () => {
      exportAttendanceToCsv(currentBatch, matrixData);
    };
  }

  // 13. View Student Attendance Slip from At-Risk list
  root.querySelectorAll("[data-view-slip]").forEach((btn) => {
    btn.onclick = () => {
      const studentId = btn.getAttribute("data-view-slip");
      showStudentAttendanceSlip(studentId, currentBatch.id);
    };
  });
};

// ==========================================================================
// DATA SHEET GENERATOR OUTPUT ENGINES (PRINT & CSV)
// ==========================================================================

function printOfficialAttendanceSheet(batch, matrixData) {
  const modalHtml = `
    <div class="printable-sheet-wrap">
      <div class="official-letterhead">
        <div class="official-logo-box">
          <img src="assets/logo.jpg" alt="Education XYZ BD" class="official-logo-img">
          <div class="official-headings">
            <h1>Education XYZ BD</h1>
            <p>Study Abroad &amp; IELTS Consultancy · British Council Registered Center</p>
          </div>
        </div>
        <div class="official-right-meta">
          <strong>Official Academic Attendance Record</strong><br>
          Doc Ref: REG-${batch.batchCode || 'IEL'}-${new Date().getFullYear()}<br>
          Generated: ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
        </div>
      </div>

      <div class="sheet-title-banner">
        <h2>IELTS Batch Official Attendance Register &amp; Grade Sheet</h2>
      </div>

      <div class="sheet-meta-grid">
        <div><strong>Batch Name:</strong> ${UI.esc(batch.batchName)}</div>
        <div><strong>Batch Code:</strong> ${UI.esc(batch.batchCode || "IEL")}</div>
        <div><strong>Instructor:</strong> ${UI.esc(UI.name(batch.instructorId))}</div>
        <div><strong>Class Schedule:</strong> ${UI.esc(batch.schedule)}</div>
        <div><strong>Venue / Room:</strong> ${UI.esc(batch.room || "Studio A")}</div>
        <div><strong>Session Range:</strong> ${UI.esc(batch.startDate || "Active")} – ${UI.esc(batch.endDate || "Ongoing")}</div>
        <div><strong>Total Enrolled:</strong> ${matrixData.students.length} Students</div>
        <div><strong>Batch Average Rate:</strong> ${matrixData.averageRate}%</div>
      </div>

      <table class="matrix-table" style="font-size:0.75rem;">
        <thead>
          <tr>
            <th style="width:28px;">SL</th>
            <th style="width:95px;">Class ID</th>
            <th style="width:140px; text-align:left;">Student Name</th>
            ${matrixData.dates
              .map((d) => `<th class="th-date" style="padding:4px 2px;">${new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</th>`)
              .join("")}
            <th style="width:45px;">Pres</th>
            <th style="width:45px;">Abs</th>
            <th style="width:50px;">Rate</th>
            <th style="width:65px;">Standing</th>
          </tr>
        </thead>
        <tbody>
          ${matrixData.students
            .map((s, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td><strong>${UI.esc(s.classStudentId)}</strong></td>
                <td style="text-align:left;">${UI.esc(s.studentName)}</td>
                ${matrixData.dates
                  .map((d) => {
                    const rec = s.records[d];
                    const mark = rec ? (rec.status === 'present' ? 'P' : rec.status === 'late' ? 'L' : rec.status === 'absent' ? 'A' : 'E') : '—';
                    return `<td><strong>${mark}</strong></td>`;
                  })
                  .join("")}
                <td>${s.effectivePresent}</td>
                <td>${s.absent}</td>
                <td><strong>${s.rate}%</strong></td>
                <td>${s.standing.toUpperCase()}</td>
              </tr>
            `)
            .join("")}
        </tbody>
      </table>

      <div style="margin-top:14px; font-size:0.75rem; color:var(--ink-soft);">
        <strong>Legend:</strong> P = Present · L = Late Arrival · A = Absent (Unexcused) · E = Official Leave / Excused
      </div>

      <div class="sheet-sign-blocks">
        <div class="sign-line-box">
          Lead IELTS Instructor Signature<br>
          <strong>${UI.esc(UI.name(batch.instructorId))}</strong>
        </div>
        <div class="sign-line-box">
          Managing Director / Academic Head<br>
          <strong>MD. Rafiqul Islam</strong>
        </div>
        <div class="sign-line-box">
          Office Seal &amp; Verification Stamp<br>
          <strong>Education XYZ BD</strong>
        </div>
      </div>

      <div class="btn-row" style="margin-top:24px; border-top:1px solid var(--line); padding-top:16px;">
        <button class="btn btn-primary" type="button" id="btn-print-attendance-sheet">🖨️ Send to Printer / Save as PDF</button>
        <button class="btn btn-ghost" type="button" data-close>Close Window</button>
      </div>
    </div>
  `;

  UI.modal("Official Attendance Master Register", modalHtml, (modal, done) => {
    modal.querySelector("[data-close]").onclick = done;
    modal.querySelector("#btn-print-attendance-sheet").onclick = () => UI.printElement(modal.querySelector(".printable-sheet-wrap"), "Official Attendance Master Register");
  });
}

function printBlankPhysicalRoster(batch, enrollments) {
  const blankCols = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const modalHtml = `
    <div class="printable-sheet-wrap">
      <div class="official-letterhead">
        <div class="official-logo-box">
          <img src="assets/logo.jpg" alt="Education XYZ BD" class="official-logo-img">
          <div class="official-headings">
            <h1>Education XYZ BD</h1>
            <p>Classroom Attendance Register · Physical Roster Sheet</p>
          </div>
        </div>
        <div class="official-right-meta">
          <strong>Physical Classroom Register</strong><br>
          Batch: ${UI.esc(batch.batchName)} (${UI.esc(batch.batchCode || 'IEL')})<br>
          Room: ${UI.esc(batch.room || "Studio A")}
        </div>
      </div>

      <div class="sheet-meta-grid" style="grid-template-columns: repeat(3, 1fr);">
        <div><strong>Instructor:</strong> ${UI.esc(UI.name(batch.instructorId))}</div>
        <div><strong>Schedule:</strong> ${UI.esc(batch.schedule)}</div>
        <div><strong>Term / Session:</strong> 2026 Academic Quarter</div>
      </div>

      <table class="matrix-table" style="font-size:0.75rem;">
        <thead>
          <tr>
            <th style="width:28px;">SL</th>
            <th style="width:105px;">Class ID</th>
            <th style="width:160px; text-align:left;">Student Full Name</th>
            ${blankCols.map((c) => `<th style="min-width:44px; height:32px;">Date:<br>___/___</th>`).join("")}
            <th style="width:100px;">Student Signature</th>
          </tr>
        </thead>
        <tbody>
          ${enrollments
            .map((e, idx) => {
              const st = Store.student(e.studentId);
              return `
                <tr>
                  <td>${idx + 1}</td>
                  <td><strong>${UI.esc(e.classStudentId || '—')}</strong></td>
                  <td style="text-align:left;">${UI.esc(st ? st.name : 'Student')}</td>
                  ${blankCols.map(() => `<td style="height:28px;"></td>`).join("")}
                  <td></td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>

      <div class="sheet-sign-blocks" style="margin-top:28px;">
        <div class="sign-line-box">
          Course Instructor Sign &amp; Date
        </div>
        <div class="sign-line-box">
          Batch Coordinator Verification
        </div>
      </div>

      <div class="btn-row" style="margin-top:24px; border-top:1px solid var(--line); padding-top:16px;">
        <button class="btn btn-primary" type="button" id="btn-print-blank-roster">🖨️ Print Blank Classroom Sheet</button>
        <button class="btn btn-ghost" type="button" data-close>Close</button>
      </div>
    </div>
  `;

  UI.modal("Blank Classroom Attendance Roster", modalHtml, (modal, done) => {
    modal.querySelector("[data-close]").onclick = done;
    modal.querySelector("#btn-print-blank-roster").onclick = () => UI.printElement(modal.querySelector(".printable-sheet-wrap"), "Blank Classroom Attendance Roster");
  });
}

function exportAttendanceToCsv(batch, matrixData) {
  let csv = "SL,Class Student ID,Student Code,Student Name,Phone";
  matrixData.dates.forEach((d) => {
    csv += `,${d}`;
  });
  csv += ",Present Count,Absent Count,Total Sessions,Attendance Rate %\r\n";

  matrixData.students.forEach((s, idx) => {
    let row = `${idx + 1},"${s.classStudentId}","${s.studentCode}","${s.studentName}","${s.phone}"`;
    matrixData.dates.forEach((d) => {
      const rec = s.records[d];
      const val = rec ? (rec.status || (rec.present ? "present" : "absent")).toUpperCase() : "N/A";
      row += `,"${val}"`;
    });
    row += `,${s.effectivePresent},${s.absent},${s.totalSessions},${s.rate}%\r\n`;
    csv += row;
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `attendance_${batch.batchCode || 'batch'}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  UI.toast("Attendance CSV downloaded successfully!");
}

function showStudentAttendanceSlip(studentId, batchId) {
  const st = Store.student(studentId);
  if (!st) return;
  const batch = Store.get("batches", batchId) || Store.list("batches")[0];
  const stats = Store.getStudentAttendanceStats(studentId, batchId);
  const classId = Store.getClassStudentId(studentId, batchId);

  const html = `
    <div class="printable-sheet-wrap" style="padding:20px;">
      <div class="official-letterhead" style="margin-bottom:12px; padding-bottom:12px;">
        <div class="official-logo-box">
          <img src="assets/logo.jpg" alt="Logo" style="width:46px; height:46px; border-radius:6px;">
          <div>
            <h2 style="font-size:1.2rem; margin:0; color:var(--primary);">Education XYZ BD</h2>
            <p class="muted" style="margin:2px 0 0 0; font-size:0.75rem;">Official Student Attendance &amp; Class Participation Statement</p>
          </div>
        </div>
        <div style="text-align:right;">
          <span class="official-seal-badge">✓ Verified Official Slip</span>
        </div>
      </div>

      <div style="background:var(--card-alt); border-radius:var(--radius-sm); padding:12px; margin-bottom:14px; font-size:0.85rem; display:grid; grid-template-columns:repeat(2, 1fr); gap:8px;">
        <div><strong>Student Name:</strong> ${UI.esc(st.name)}</div>
        <div><strong>Class Student ID:</strong> <span class="class-id-badge">${UI.esc(classId)}</span></div>
        <div><strong>Student Code:</strong> ${UI.esc(st.studentCode)}</div>
        <div><strong>Enrolled Batch:</strong> ${UI.esc(batch ? batch.batchName : "IELTS Batch")}</div>
        <div><strong>Overall Attendance:</strong> <strong style="color:${stats.standing === 'warning' ? '#DC2626' : '#059669'}; font-size:1rem;">${stats.rate}%</strong></div>
        <div><strong>Standing:</strong> <span class="badge ${stats.standing === 'excellent' ? 'badge-success' : stats.standing === 'good' ? 'badge-warning' : 'badge-danger'}">${stats.standingText}</span></div>
      </div>

      <h4>Class Session Attendance Log</h4>
      <div style="max-height:220px; overflow-y:auto; border:1px solid var(--line); border-radius:6px; margin-bottom:16px;">
        <table class="data" style="font-size:0.8rem; margin:0;">
          <thead>
            <tr><th>Date</th><th>Topic / Curriculum Area</th><th>Status</th><th>Remarks</th></tr>
          </thead>
          <tbody>
            ${stats.records
              .map((r) => `
                <tr>
                  <td><strong>${UI.date(r.date)}</strong></td>
                  <td>${UI.esc(r.topic || "Regular Session")}</td>
                  <td><span class="chip ${r.status === 'present' ? 'present' : r.status === 'late' ? 'inquiry' : r.status === 'excused' ? 'applied' : 'absent'}">${r.status || (r.present ? 'Present' : 'Absent')}</span></td>
                  <td>${UI.esc(r.note || "—")}</td>
                </tr>
              `)
              .join("")}
          </tbody>
        </table>
      </div>

      <div class="sheet-sign-blocks" style="margin-top:20px; padding-top:14px;">
        <div class="sign-line-box" style="font-size:0.75rem;">
          Instructor Verification<br>
          <strong>${UI.esc(UI.name(batch ? batch.instructorId : ''))}</strong>
        </div>
        <div class="sign-line-box" style="font-size:0.75rem;">
          Registrar Seal &amp; Authority<br>
          <strong>Education XYZ BD</strong>
        </div>
      </div>

      <div class="btn-row" style="margin-top:18px;">
        <button class="btn btn-primary" type="button" id="btn-print-attendance-slip">🖨️ Print Attendance Slip</button>
        <button class="btn btn-ghost" type="button" data-close>Close</button>
      </div>
    </div>
  `;

  UI.modal("Official Attendance Slip", html, (modal, done) => {
    modal.querySelector("[data-close]").onclick = done;
    modal.querySelector("#btn-print-attendance-slip").onclick = () => UI.printElement(modal.querySelector(".printable-sheet-wrap"), "Official Attendance Slip");
  });
}

Views.showStudentAttendanceSlip = showStudentAttendanceSlip;

