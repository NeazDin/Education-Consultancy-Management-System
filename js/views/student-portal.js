window.Views = window.Views || {};

function myStudent() {
  return Store.student(Auth.studentId());
}

let portalCalendarDate = new Date();
let portalActiveChatChannel = "instructor";
let portalActiveContentModule = "all";

Views.portal = function (root) {
  const s = myStudent();
  if (!s) {
    root.innerHTML = `<div class="empty">No student profile is linked to this account. Contact the office if you need assistance.</div>`;
    return;
  }
  const apps = Store.list("applications").filter((a) => a.studentId === s.id);
  const ens = Store.list("enrollments").filter((e) => e.studentId === s.id);
  const primaryEnroll = ens[0];
  const primaryBatch = primaryEnroll ? Store.get("batches", primaryEnroll.batchId) : null;
  const classId = primaryEnroll && primaryEnroll.classStudentId ? primaryEnroll.classStudentId : "—";

  const primaryApp = apps[0];
  const currentStage = primaryApp ? primaryApp.stage : "inquiry";
  const stageIdx = STAGES.indexOf(currentStage);

  const mockScores = Store.list("mockScores").filter((m) => m.studentId === s.id);
  const latestMock = mockScores.length ? mockScores[mockScores.length - 1] : null;
  const latestBand = latestMock
    ? ((latestMock.listening + latestMock.reading + latestMock.writing + latestMock.speaking) / 4).toFixed(1)
    : "—";

  const assignedInstructor = primaryBatch ? Store.user(primaryBatch.instructorId) : Store.list("users").find((u) => u.role === "instructor");
  const assignedCounselor = primaryApp ? Store.user(primaryApp.counselorId) : Store.list("users").find((u) => u.role === "counselor");
  const adminUser = Store.list("users").find((u) => u.role === "admin");

  const clubs = Store.list("languageClubs") || [];
  const nextClub = clubs[0] || {
    title: "Friday Speaking & Fluency Club",
    topic: "Global Affairs & University Interviews",
    date: "2026-09-04",
    time: "4:00 PM – 5:30 PM",
    room: "Studio B & Zoom Live",
    moderatorName: "Nasir Uddin (Lead Trainer)",
    speakingPrompts: [
      "What are the most challenging adjustments students face when studying abroad?",
      "How can international scholars contribute to cross-cultural innovation?"
    ],
    attendees: ["st-1"]
  };
  const isClubRegistered = nextClub.attendees && nextClub.attendees.includes(s.id);

  const contents = (Store.list("classContents") || []).filter((c) => {
    if (portalActiveContentModule === "all") return true;
    return (c.module || "").toLowerCase() === portalActiveContentModule.toLowerCase();
  });

  // Render main portal frame
  root.innerHTML = `
    ${UI.getAnnouncementBannerHtml("student")}

    <!-- Top Welcome Banner & Digital Student ID -->
    <div class="grid-2" style="margin-bottom: 24px; align-items: start;">
      <div>
        <div class="card" style="background: linear-gradient(135deg, #EFF6FF 0%, #FFFFFF 100%); border-color: var(--primary-border); margin-bottom: 20px;">
          <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px; flex-wrap:wrap;">
            <span class="chip visa">Student Self-Service Portal</span>
            <span class="student-code-badge">${UI.esc(s.studentCode || s.id)}</span>
            <span class="class-id-badge" style="background:#DBEAFE; color:#1E40AF;">Class ID: ${UI.esc(classId)}</span>
          </div>
          <h2 style="font-size:1.6rem; color:var(--primary); margin-bottom:8px;">Welcome, ${UI.esc(s.name)}</h2>
          <p class="muted" style="margin-bottom:18px;">
            Your personal Education XYZ BD portal for active IELTS classes, study-abroad milestones, class schedules, language club sessions, and direct communication with faculty.
          </p>
          <div class="btn-row">
            <a href="#/portal/documents" class="btn btn-primary btn-sm">My Documents Checklist →</a>
            <a href="#/portal/pay" class="btn btn-sm" style="background:#059669; color:#fff; border-color:#059669;">Pay Fees Online →</a>
            <a href="#/portal/ielts" class="btn btn-ghost btn-sm">IELTS Attendance &amp; Mocks →</a>
            <button class="btn btn-ghost btn-sm" id="btn-quick-chat" type="button">💬 Live Faculty Chat</button>
          </div>
        </div>

        <!-- Application Progress Stepper -->
        ${
          primaryApp
            ? `
            <div class="card" style="margin-bottom: 0;">
              <div class="toolbar">
                <h2>Study Abroad Milestones: ${UI.esc(primaryApp.targetCountry)}</h2>
                <span class="chip ${primaryApp.stage}">${primaryApp.stage}</span>
              </div>
              <p class="muted" style="font-size:0.88rem; margin-top:-8px; margin-bottom:16px;">
                ${primaryApp.targetUniversity ? "Target Institution: <strong>" + UI.esc(primaryApp.targetUniversity) + "</strong> (" + UI.esc(primaryApp.intake || "Next Intake") + ")" : "Counselor is matching suitable universities."}
              </p>
              <div class="app-stepper">
                <div class="stepper-track-bar">
                  <div class="stepper-progress-fill" style="width: ${Math.round((stageIdx / (STAGES.length - 1)) * 100)}%"></div>
                </div>
                ${STAGES.map((st, i) => {
                  const stateCls = i < stageIdx ? "done" : i === stageIdx ? "active" : "";
                  const icon = i < stageIdx ? "✓" : i + 1;
                  return `
                    <div class="step-item ${stateCls}">
                      <div class="step-circle">${icon}</div>
                      <span class="step-label">${st}</span>
                    </div>
                  `;
                }).join("")}
              </div>
              <div style="background:var(--card-alt); border-radius:var(--radius-sm); padding:12px 14px; font-size:0.85rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                <div><strong>Assigned Counselor:</strong> ${UI.esc(UI.name(primaryApp.counselorId))}</div>
                <div><strong>Visa Target Date:</strong> ${UI.esc(primaryApp.visaDeadline) || "Not scheduled yet"}</div>
              </div>
            </div>`
            : `<div class="card"><p class="muted">No study abroad application is currently open. Click to request counselor matching.</p></div>`
        }
      </div>

      <!-- Digital Student ID Card -->
      <div class="student-id-card-wrapper">
        <div class="student-id-card">
          <div class="card-header-band">
            <img src="assets/logo.jpg" alt="Logo" class="card-logo-mini">
            <div class="card-institution">
              <div class="corp-name">Education XYZ BD</div>
              <div class="corp-tag">Official Student Identity Card</div>
            </div>
          </div>

          <div class="card-main-body">
            <div class="card-photo-box">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              <span>STUDENT</span>
            </div>
            <div class="card-details-box">
              <div class="card-student-name">${UI.esc(s.name)}</div>
              <div class="id-field-row">
                <span class="lbl">Student ID:</span>
                <span class="val">${UI.esc(s.studentCode || s.id)}</span>
              </div>
              <div class="id-field-row">
                <span class="lbl">Class ID:</span>
                <span class="val class-highlight-val">${UI.esc(classId)}</span>
              </div>
              <div class="id-field-row">
                <span class="lbl">Batch:</span>
                <span class="val" style="font-size:0.75rem;">${UI.esc(primaryBatch ? primaryBatch.batchCode || primaryBatch.batchName : "Not Enrolled")}</span>
              </div>
            </div>
          </div>

          <div class="card-footer-band">
            <div><strong>Academic Session:</strong> 2026–2027</div>
            <div class="card-verified-tag">✓ Verified Student</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 1. Next Class Schedule Hero -->
    <div class="schedule-hero">
      <div class="schedule-top-row">
        <div class="schedule-live-badge">
          <span class="pulse-dot" style="background:#10B981;"></span> Next Scheduled Session
        </div>
        <div style="font-size:0.88rem; color:#93C5FD; font-weight:600;">
          Enrolled Batch: <strong>${UI.esc(primaryBatch ? primaryBatch.batchName : "IELTS Intensive Batch")}</strong>
        </div>
      </div>

      <h3 class="schedule-topic-title">IELTS Academic Task 2: Advanced Cohesion &amp; Complex Sentence Formation</h3>
      <p style="margin:0; color:#E2E8F0; font-size:0.95rem; max-width:720px; line-height:1.5;">
        Live interactive workshop focusing on band 8.0 grammatical range, avoiding run-on sentences, and structuring counter-argument paragraphs.
      </p>

      <div class="schedule-meta-grid">
        <div class="sched-meta-item">
          <span class="sched-meta-lbl">Date &amp; Time</span>
          <span class="sched-meta-val">Sunday · 6:30 PM – 8:30 PM</span>
        </div>
        <div class="sched-meta-item">
          <span class="sched-meta-lbl">Classroom / Studio</span>
          <span class="sched-meta-val">${UI.esc(primaryBatch ? primaryBatch.room : "Studio A (Dhaka Campus)")}</span>
        </div>
        <div class="sched-meta-item">
          <span class="sched-meta-lbl">Instructor</span>
          <span class="sched-meta-val">${UI.esc(assignedInstructor ? assignedInstructor.name : "Nasir Uddin")}</span>
        </div>
        <div class="sched-meta-item">
          <span class="sched-meta-lbl">Session Format</span>
          <span class="sched-meta-val" style="color:#6EE7B7;">In-Person &amp; Hybrid Online</span>
        </div>
      </div>

      <div class="btn-row" style="margin-top: 18px;">
        <button class="btn btn-sm btn-primary" id="btn-view-agenda" type="button">📋 View Class Agenda</button>
        <button class="btn btn-sm btn-ghost" id="btn-join-zoom" type="button" style="background:rgba(255,255,255,0.15); border-color:rgba(255,255,255,0.25); color:#ffffff;">🔗 Join Live Zoom Room</button>
      </div>
    </div>

    <!-- 2. Instructor Information Card & Language Club Card Grid -->
    <div class="grid-2" style="margin-bottom: 24px;">
      <!-- Instructor Information Card -->
      <div class="card">
        <div class="toolbar">
          <h2>Your IELTS Instructor</h2>
          <span class="chip approved">Assigned Faculty</span>
        </div>
        <div class="instructor-profile-card">
          <div class="instructor-avatar-wrap">
            ${
              assignedInstructor && assignedInstructor.photoUrl
                ? `<img src="${assignedInstructor.photoUrl}" alt="${UI.esc(assignedInstructor.name)}" class="instructor-avatar-img">`
                : `<div class="instructor-avatar-placeholder">${UI.esc((assignedInstructor?.name || "N").charAt(0))}</div>`
            }
          </div>
          <div class="instructor-bio-box">
            <div class="instructor-name">${UI.esc(assignedInstructor ? assignedInstructor.name : "Nasir Uddin")}</div>
            <div class="instructor-title-text">${UI.esc(assignedInstructor?.title || "Lead IELTS Instructor & Master Trainer")}</div>
            <div class="instructor-pills">
              <span class="instructor-pill">${UI.esc(assignedInstructor?.credentials || "Cambridge CELTA Certified · IELTS Band 8.5")}</span>
              <span class="instructor-pill">🕒 ${UI.esc(assignedInstructor?.officeHours || "Sun, Tue, Thu · 4:00 PM – 6:15 PM")}</span>
            </div>
            <p class="instructor-bio-text">
              ${UI.esc(assignedInstructor?.bio || "Master Trainer with 9+ years of experience training 3,500+ successful IELTS students. Focus on Writing Task 2 coherence and Speaking fluency.")}
            </p>
            <div class="btn-row">
              <button class="btn btn-sm btn-primary" id="btn-instructor-message" type="button">💬 Message Instructor</button>
               <a href="mailto:${UI.esc(assignedInstructor?.email || 'instructor@eduxyzbd.com')}" class="btn btn-sm btn-ghost">✉️ Send Email</a>
            </div>
          </div>
        </div>
      </div>

      <!-- Language Club Card -->
      <div class="club-hero">
        <div class="club-badge">🗣️ Education XYZ Language Club</div>
        <h3 style="font-size:1.25rem; font-weight:800; margin:0 0 6px 0; color:#FFFFFF;">${UI.esc(nextClub.title)}</h3>
        <p style="margin:0; font-size:0.88rem; color:#A7F3D0; line-height:1.45;">
          Weekly fluency circle for IELTS Speaking Part 3 simulations, debates, and public speaking confidence.
        </p>

        <div class="club-topic-box">
          <div style="font-size:0.76rem; text-transform:uppercase; color:#6EE7B7; font-weight:700; letter-spacing:0.04em;">This Week's Debate Topic:</div>
          <div style="font-size:1.02rem; font-weight:700; color:#FFFFFF; margin-top:2px;">"${UI.esc(nextClub.topic)}"</div>
          <div style="font-size:0.8rem; color:#D1FAE5; margin-top:6px;">Moderator: <strong>${UI.esc(nextClub.moderatorName)}</strong> · ${UI.esc(nextClub.time)}</div>
          
          <ul class="club-prompts-list">
            ${(nextClub.speakingPrompts || []).map((p) => `<li>${UI.esc(p)}</li>`).join("")}
          </ul>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
          <span style="font-size:0.82rem; color:#D1FAE5;">
            👥 <strong>${nextClub.attendees ? nextClub.attendees.length : 1} students</strong> registered for this session
          </span>
          <button class="btn btn-sm ${isClubRegistered ? 'btn-ghost' : 'btn-primary'}" id="btn-toggle-club" type="button" style="${isClubRegistered ? 'background:#FFFFFF; color:#065F46; border:none; font-weight:700;' : 'background:#10B981; border:none;'}">
            ${isClubRegistered ? "✓ Registered (Click to Cancel)" : "+ Register for Friday Club"}
          </button>
        </div>
      </div>
    </div>

    <!-- 3. Class Calendar & Class Schedule View -->
    <div class="card" style="margin-bottom: 24px;">
      <div class="toolbar">
        <div>
          <h2>Academic &amp; Class Calendar</h2>
          <p class="muted" style="font-size:0.86rem; margin:0;">
            Schedule of regular IELTS batch classes, mock exams, language club gatherings, and admissions deadlines.
          </p>
        </div>
        <div class="btn-row">
          <button class="btn btn-sm btn-ghost" id="btn-cal-prev" type="button">‹ Prev Month</button>
          <button class="btn btn-sm btn-ghost" id="btn-cal-today" type="button">Today</button>
          <button class="btn btn-sm btn-ghost" id="btn-cal-next" type="button">Next Month ›</button>
        </div>
      </div>

      <div class="calendar-wrap" id="portal-calendar-container">
        <!-- Calendar rendered dynamically via helper -->
      </div>
    </div>

    <!-- 4. Class Contents, Study Handouts & Syllabus -->
    <div class="card" style="margin-bottom: 24px;">
      <div class="toolbar">
        <div>
          <h2>Class Contents &amp; Study Materials</h2>
          <p class="muted" style="font-size:0.86rem; margin:0;">
            Official lecture notes, Band 8+ essay templates, listening answer keys, and teacher handouts.
          </p>
        </div>
        <div class="btn-row" id="content-module-filters">
          <button class="btn btn-sm ${portalActiveContentModule === 'all' ? 'btn-primary' : 'btn-ghost'}" data-mod="all" type="button">All Modules</button>
          <button class="btn btn-sm ${portalActiveContentModule === 'writing' ? 'btn-primary' : 'btn-ghost'}" data-mod="writing" type="button">Writing</button>
          <button class="btn btn-sm ${portalActiveContentModule === 'reading' ? 'btn-primary' : 'btn-ghost'}" data-mod="reading" type="button">Reading</button>
          <button class="btn btn-sm ${portalActiveContentModule === 'listening' ? 'btn-primary' : 'btn-ghost'}" data-mod="listening" type="button">Listening</button>
          <button class="btn btn-sm ${portalActiveContentModule === 'speaking' ? 'btn-primary' : 'btn-ghost'}" data-mod="speaking" type="button">Speaking</button>
        </div>
      </div>

      <div class="contents-grid" id="portal-contents-grid">
        ${
          contents.length
            ? contents.map((c) => {
                const tagClass = `tag-${(c.module || 'writing').toLowerCase()}`;
                return `
                  <div class="content-item-card">
                    <div>
                      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                        <span class="content-tag-badge ${tagClass}">${UI.esc(c.module)}</span>
                        <span class="muted" style="font-size:0.75rem;">${UI.esc(c.date)}</span>
                      </div>
                      ${c.imageUrl ? `<img src="${c.imageUrl}" alt="Class Material" class="content-img-thumb">` : ""}
                      <h3 style="font-size:1.02rem; font-weight:700; margin:0 0 6px 0; color:var(--ink); line-height:1.35;">${UI.esc(c.title)}</h3>
                      <p style="font-size:0.85rem; color:var(--ink-soft); line-height:1.45; margin-bottom:12px;">${UI.esc(c.description)}</p>
                    </div>
                    <div style="border-top:1px solid var(--line); padding-top:10px; display:flex; justify-content:space-between; align-items:center;">
                      <span class="muted" style="font-size:0.78rem;">📥 ${c.downloads || 25} downloads</span>
                      <button class="btn btn-sm btn-primary" data-view-content="${c.id}" type="button">View Notes &amp; Handout</button>
                    </div>
                  </div>
                `;
              }).join("")
            : `<div class="empty">No materials available for this module yet.</div>`
        }
      </div>
    </div>

    <!-- 5. 3-Channel Faculty Chat (Instructor, Counselor, Admin) -->
    <div class="card" id="chat-section-anchor">
      <div class="toolbar">
        <div>
          <h2>Direct Faculty &amp; Support Chat</h2>
          <p class="muted" style="font-size:0.86rem; margin:0;">
            Chat directly with your IELTS Trainer, Study-Abroad Advisor, or the Administrative Helpdesk.
          </p>
        </div>
        <div class="btn-row">
          <a href="#/messages" class="btn btn-sm btn-primary">✉ Open Full Direct Inbox (Message Anyone) →</a>
        </div>
      </div>

      <div class="chat-card">
        <div class="chat-channel-bar">
          <button type="button" class="chat-channel-btn ${portalActiveChatChannel === 'instructor' ? 'active' : ''}" data-channel="instructor">
            🎓 IELTS Instructor (${UI.esc(assignedInstructor?.name || 'Nasir Uddin')})
          </button>
          <button type="button" class="chat-channel-btn ${portalActiveChatChannel === 'counselor' ? 'active' : ''}" data-channel="counselor">
            🤝 Advisor (${UI.esc(assignedCounselor?.name || 'Farzana Yasmin')})
          </button>
          <button type="button" class="chat-channel-btn ${portalActiveChatChannel === 'admin' ? 'active' : ''}" data-channel="admin">
            🏢 Office &amp; Helpdesk (Admin)
          </button>
        </div>

        <div class="chat-active-header">
          <div>
            <strong id="chat-header-title">
              ${
                portalActiveChatChannel === 'instructor'
                  ? `🎓 ${UI.esc(assignedInstructor?.name || 'Nasir Uddin')} · IELTS Master Trainer`
                  : portalActiveChatChannel === 'counselor'
                  ? `🤝 ${UI.esc(assignedCounselor?.name || 'Farzana Yasmin')} · Senior Counselor`
                  : `🏢 Central Office &amp; IT Helpdesk`
              }
            </strong>
          </div>
          <span style="display:inline-flex; align-items:center; gap:6px; font-size:0.8rem; color:var(--success); font-weight:600;">
            <span class="pulse-dot" style="background:#10B981; width:6px; height:6px;"></span> Active Online
          </span>
        </div>

        <div class="chat-messages-scroll" id="chat-messages-box">
          <!-- Messages rendered via helper -->
        </div>

        <form class="chat-input-row" id="chat-send-form">
          <input type="text" id="chat-input-field" placeholder="Type your question or message..." autocomplete="off" required>
          <button class="btn btn-primary" type="submit">Send Message →</button>
        </form>
      </div>
    </div>
  `;

  // --- Attach Handlers & Renderers ---

  // Render Calendar
  renderPortalCalendar(root, portalCalendarDate, s, primaryApp);

  // Calendar Month Nav
  const btnPrev = root.querySelector("#btn-cal-prev");
  const btnToday = root.querySelector("#btn-cal-today");
  const btnNext = root.querySelector("#btn-cal-next");
  if (btnPrev && btnToday && btnNext) {
    btnPrev.onclick = () => {
      portalCalendarDate = new Date(portalCalendarDate.getFullYear(), portalCalendarDate.getMonth() - 1, 1);
      renderPortalCalendar(root, portalCalendarDate, s, primaryApp);
    };
    btnToday.onclick = () => {
      portalCalendarDate = new Date();
      renderPortalCalendar(root, portalCalendarDate, s, primaryApp);
    };
    btnNext.onclick = () => {
      portalCalendarDate = new Date(portalCalendarDate.getFullYear(), portalCalendarDate.getMonth() + 1, 1);
      renderPortalCalendar(root, portalCalendarDate, s, primaryApp);
    };
  }

  // Next Class Schedule Buttons
  const btnAgenda = root.querySelector("#btn-view-agenda");
  if (btnAgenda) {
    btnAgenda.onclick = () => {
      UI.modal(
        "Class Session Agenda",
        `<div style="font-size:0.92rem; line-height:1.6;">
          <p><strong>Topic:</strong> IELTS Academic Task 2: Advanced Cohesion &amp; Complex Sentence Formation</p>
          <p><strong>Batch:</strong> ${UI.esc(primaryBatch ? primaryBatch.batchName : "IELTS Intensive")}</p>
          <p><strong>Location:</strong> ${UI.esc(primaryBatch ? primaryBatch.room : "Studio A (Dhaka Campus)")}</p>
          <hr style="border:0; border-top:1px solid var(--line); margin:12px 0;">
          <h4>Class Timeline:</h4>
          <ul style="padding-left:20px; margin:8px 0;">
            <li><strong>6:30 – 7:00 PM:</strong> Review of previous homework essays &amp; vocabulary checklist.</li>
            <li><strong>7:00 – 7:45 PM:</strong> Lecture on Band 8+ hedging verbs and concession clauses (Although/While).</li>
            <li><strong>7:45 – 8:15 PM:</strong> Live 30-minute timed paragraph writing drill.</li>
            <li><strong>8:15 – 8:30 PM:</strong> 1-on-1 instant feedback &amp; Q&amp;A.</li>
          </ul>
          <div class="btn-row" style="margin-top:18px;">
            <button class="btn btn-primary" type="button" data-close>Close</button>
          </div>
        </div>`,
        (m, done) => { m.querySelector("[data-close]").onclick = done; }
      );
    };
  }

  const btnZoom = root.querySelector("#btn-join-zoom");
  if (btnZoom) {
    btnZoom.onclick = () => {
      UI.modal(
        "Hybrid Online Zoom Classroom",
        `<div style="font-size:0.92rem; line-height:1.6;">
          <p>You can attend your scheduled class in Studio A in person or join the live interactive audio/video stream:</p>
          <div style="background:var(--card-alt); border:1px solid var(--line); padding:14px; border-radius:var(--radius); margin:14px 0;">
            <strong>Meeting ID:</strong> 882 1094 3320<br>
            <strong>Passcode:</strong> XYZ2026<br>
            <strong>Direct Link:</strong> <a href="javascript:void(0)" style="color:var(--accent); text-decoration:underline;">https://zoom.us/j/88210943320</a>
          </div>
          <p class="muted" style="font-size:0.84rem;">Please ensure your microphone is tested and have your Cambridge practice book ready.</p>
          <div class="btn-row"><button class="btn btn-primary" type="button" data-close>Close</button></div>
        </div>`,
        (m, done) => { m.querySelector("[data-close]").onclick = done; }
      );
    };
  }

  // Quick Chat button & Instructor Message button
  const btnQuickChat = root.querySelector("#btn-quick-chat");
  const btnInstructorMsg = root.querySelector("#btn-instructor-message");
  const scrollToChat = (channel) => {
    portalActiveChatChannel = channel;
    const chatAnchor = root.querySelector("#chat-section-anchor");
    if (chatAnchor) chatAnchor.scrollIntoView({ behavior: "smooth" });
    Views.portal(root);
  };
  if (btnQuickChat) btnQuickChat.onclick = () => scrollToChat("instructor");
  if (btnInstructorMsg) btnInstructorMsg.onclick = () => scrollToChat("instructor");

  // Language Club Toggle Button
  const btnToggleClub = root.querySelector("#btn-toggle-club");
  if (btnToggleClub && nextClub) {
    btnToggleClub.onclick = () => {
      nextClub.attendees = nextClub.attendees || [];
      if (isClubRegistered) {
        nextClub.attendees = nextClub.attendees.filter((id) => id !== s.id);
        UI.toast("Canceled registration for this Friday's Language Club.");
      } else {
        nextClub.attendees.push(s.id);
        UI.toast("Registered successfully for Friday Language Club! See you at 4:00 PM.");
      }
      Store.persist();
      Views.portal(root);
    };
  }

  // Class Content Module Filter Buttons
  root.querySelectorAll("#content-module-filters button").forEach((b) => {
    b.onclick = () => {
      portalActiveContentModule = b.getAttribute("data-mod");
      Views.portal(root);
    };
  });

  // View Content / Handout Modal
  root.querySelectorAll("[data-view-content]").forEach((b) => {
    b.onclick = () => {
      const cid = b.getAttribute("data-view-content");
      const c = (Store.list("classContents") || []).find((x) => x.id === cid);
      if (!c) return;
      c.downloads = (c.downloads || 0) + 1;
      Store.persist();

      UI.modal(
        c.title,
        `<div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <span class="chip ${c.module === 'Writing' ? 'applied' : c.module === 'Reading' ? 'approved' : 'visa'}">${UI.esc(c.module)} Module</span>
            <span class="muted" style="font-size:0.82rem;">Published: ${UI.esc(c.date)}</span>
          </div>
          ${c.imageUrl ? `<img src="${c.imageUrl}" alt="Lecture Notes Photo" style="width:100%; max-height:300px; object-fit:contain; border-radius:8px; margin-bottom:14px; border:1px solid var(--line);">` : ""}
          <div style="background:var(--card-alt); border-radius:var(--radius); padding:16px; font-family:'JetBrains Mono', monospace; font-size:0.86rem; line-height:1.6; white-space:pre-wrap; max-height:340px; overflow-y:auto; border:1px solid var(--line); margin-bottom:16px;">${UI.esc(c.content || c.description)}</div>
          <div class="btn-row">
            <button class="btn btn-primary" type="button" id="btn-mock-download">📥 Download Document (.txt)</button>
            <button class="btn btn-ghost" type="button" data-close>Close</button>
          </div>
        </div>`,
        (modal, done) => {
          modal.querySelector("[data-close]").onclick = done;
          modal.querySelector("#btn-mock-download").onclick = () => {
            const blob = new Blob([c.content || c.description], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = (c.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()) + ".txt";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            UI.toast(`Downloaded: ${c.title}`);
          };
        }
      );
    };
  });

  // Chat Channel Switcher
  root.querySelectorAll(".chat-channel-btn").forEach((btn) => {
    btn.onclick = () => {
      portalActiveChatChannel = btn.getAttribute("data-channel");
      renderChatMessages(root, s);
      root.querySelectorAll(".chat-channel-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const headerTitle = root.querySelector("#chat-header-title");
      if (headerTitle) {
        headerTitle.innerHTML =
          portalActiveChatChannel === "instructor"
            ? `🎓 ${UI.esc(assignedInstructor?.name || 'Nasir Uddin')} · IELTS Master Trainer`
            : portalActiveChatChannel === "counselor"
            ? `🤝 ${UI.esc(assignedCounselor?.name || 'Farzana Yasmin')} · Senior Counselor`
            : `🏢 Central Office &amp; IT Helpdesk`;
      }
    };
  });

  // Render initial chat messages
  renderChatMessages(root, s);

  // Chat Form Submit
  const chatForm = root.querySelector("#chat-send-form");
  const chatInput = root.querySelector("#chat-input-field");
  if (chatForm && chatInput) {
    chatForm.onsubmit = (e) => {
      e.preventDefault();
      const text = chatInput.value.trim();
      if (!text) return;
      chatInput.value = "";

      const studentUserId = Auth.user.id;
      const targetUserId =
        portalActiveChatChannel === "instructor"
          ? (assignedInstructor?.id || "u-i1")
          : portalActiveChatChannel === "counselor"
          ? (assignedCounselor?.id || "u-c1")
          : (adminUser?.id || "u-admin");

      Store.add("messages", {
        fromUserId: studentUserId,
        toUserId: targetUserId,
        channel: portalActiveChatChannel,
        text,
        sentAt: new Date().toISOString(),
        read: true,
      });

      renderChatMessages(root, s);

      // Automated staff response simulation
      setTimeout(() => {
        let replyText = "Thank you for reaching out, Ayesha! I will review your inquiry and follow up shortly.";
        if (portalActiveChatChannel === "instructor") {
          replyText = `Hi Ayesha! I noted your question: "${text}". Let's discuss this during our upcoming class review session. Keep practicing!`;
        } else if (portalActiveChatChannel === "counselor") {
          replyText = `Hello Ayesha! I received your inquiry regarding your university application. Please make sure all checklist documents are updated.`;
        } else if (portalActiveChatChannel === "admin") {
          replyText = `Education XYZ BD Office: Received your message. Our helpdesk team is at your service. Contact 01781-827022 if urgent.`;
        }

        Store.add("messages", {
          fromUserId: targetUserId,
          toUserId: studentUserId,
          channel: portalActiveChatChannel,
          text: replyText,
          sentAt: new Date().toISOString(),
          read: true,
        });

        renderChatMessages(root, s);
        UI.toast(`New reply from ${portalActiveChatChannel === 'instructor' ? 'Instructor' : portalActiveChatChannel === 'counselor' ? 'Counselor' : 'Office'}`);
      }, 900);
    };
  }

  UI.bindAnnouncementBannerClicks(root);
};

function renderChatMessages(root, s) {
  const box = root.querySelector("#chat-messages-box");
  if (!box) return;

  const allMessages = Store.list("messages") || [];
  const studentUserId = Auth.user.id;

  // Filter messages for current channel and user
  const channelMsgs = allMessages.filter(
    (m) => m.channel === portalActiveChatChannel || (!m.channel && (m.fromUserId === studentUserId || m.toUserId === studentUserId))
  );

  if (!channelMsgs.length) {
    box.innerHTML = `<div class="empty" style="padding:20px; font-size:0.86rem;">No previous messages in this channel. Send a message below to begin consultation.</div>`;
    return;
  }

  box.innerHTML = channelMsgs
    .map((m) => {
      const isStudent = m.fromUserId === studentUserId;
      const timeStr = new Date(m.sentAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
      const senderName = isStudent ? "You" : UI.name(m.fromUserId);

      return `
        <div class="chat-bubble ${isStudent ? 'student' : 'staff'}">
          <div style="font-size:0.75rem; font-weight:700; margin-bottom:2px; opacity:0.9;">${UI.esc(senderName)}</div>
          <div>${UI.esc(m.text)}</div>
          <span class="chat-time">${timeStr}</span>
        </div>
      `;
    })
    .join("");

  box.scrollTop = box.scrollHeight;
}

function renderPortalCalendar(root, viewDate, student, primaryApp) {
  const container = root.querySelector("#portal-calendar-container");
  if (!container) return;

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  // Build weeks
  let daysHtml = "";

  // Previous month overflow days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    daysHtml += `<div class="cal-day-cell other-month"><div class="cal-day-number">${dayNum}</div></div>`;
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const isToday = isCurrentMonth && today.getDate() === day;
    const dayDate = new Date(year, month, day);
    const dayOfWeek = dayDate.getDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat

    const events = [];

    // Class Days (Sunday, Tuesday, Thursday)
    if (dayOfWeek === 0 || dayOfWeek === 2 || dayOfWeek === 4) {
      events.push({
        type: "class",
        title: "IELTS Class (6:30 PM)",
        detail: "Writing Task 2 & Reading Analysis in Studio A",
      });
    }

    // Language Club Days (Friday)
    if (dayOfWeek === 5) {
      events.push({
        type: "club",
        title: "Language Club (4 PM)",
        detail: "Global Debates & Pronunciation Circle in Studio B",
      });
    }

    // Mock Test Days (2nd and 4th Saturday of the month)
    if (dayOfWeek === 6 && (day > 7 && day <= 14 || day > 21 && day <= 28)) {
      events.push({
        type: "mock",
        title: "Mock Exam #2",
        detail: "Full-Length 4 Modules Mock Test Simulation at Dhaka Test Lab",
      });
    }

    // Visa Deadline
    if (primaryApp && primaryApp.visaDeadline) {
      const vd = new Date(primaryApp.visaDeadline);
      if (vd.getFullYear() === year && vd.getMonth() === month && vd.getDate() === day) {
        events.push({
          type: "deadline",
          title: "Visa Filing Target",
          detail: `Target submission deadline for ${primaryApp.targetCountry}`,
        });
      }
    }

    const eventsHtml = events
      .map(
        (ev) => `
          <div class="cal-event-pill cal-event-${ev.type}" data-ev-title="${UI.esc(ev.title)}" data-ev-detail="${UI.esc(ev.detail)}" data-ev-date="${day} ${monthNames[month]} ${year}">
            ${UI.esc(ev.title)}
          </div>
        `
      )
      .join("");

    daysHtml += `
      <div class="cal-day-cell ${isToday ? 'today' : ''}">
        <div class="cal-day-number">${day}</div>
        <div class="cal-events-stack">${eventsHtml}</div>
      </div>
    `;
  }

  // Next month fill days to complete grid
  const totalCells = (firstDayIndex + daysInMonth);
  const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (let d = 1; d <= remainingCells; d++) {
    daysHtml += `<div class="cal-day-cell other-month"><div class="cal-day-number">${d}</div></div>`;
  }

  container.innerHTML = `
    <div class="calendar-header">
      <div class="calendar-title">${monthNames[month]} ${year}</div>
      <div style="display:flex; gap:12px; font-size:0.78rem; flex-wrap:wrap;">
        <span style="display:inline-flex; align-items:center; gap:5px;"><span style="width:10px; height:10px; background:#2563EB; border-radius:2px;"></span> IELTS Classes</span>
        <span style="display:inline-flex; align-items:center; gap:5px;"><span style="width:10px; height:10px; background:#059669; border-radius:2px;"></span> Language Club</span>
        <span style="display:inline-flex; align-items:center; gap:5px;"><span style="width:10px; height:10px; background:#9333EA; border-radius:2px;"></span> Mock Tests</span>
        <span style="display:inline-flex; align-items:center; gap:5px;"><span style="width:10px; height:10px; background:#DC2626; border-radius:2px;"></span> Deadlines</span>
      </div>
    </div>
    <div class="calendar-weekdays">
      <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
    </div>
    <div class="calendar-days-grid">${daysHtml}</div>
  `;

  // Attach Event Detail Popup Click
  container.querySelectorAll(".cal-event-pill").forEach((pill) => {
    pill.onclick = (e) => {
      e.stopPropagation();
      const title = pill.getAttribute("data-ev-title");
      const detail = pill.getAttribute("data-ev-detail");
      const date = pill.getAttribute("data-ev-date");

      UI.modal(
        title,
        `<div>
          <div style="font-size:0.95rem; margin-bottom:12px;">
            📅 <strong>Date:</strong> ${UI.esc(date)}
          </div>
          <div style="background:var(--card-alt); border:1px solid var(--line); padding:14px; border-radius:var(--radius); margin-bottom:18px; font-size:0.9rem; line-height:1.5;">
            ${UI.esc(detail)}
          </div>
          <p class="muted" style="font-size:0.84rem;">Please ensure attendance is marked with your Class ID badge.</p>
          <div class="btn-row"><button class="btn btn-primary" type="button" data-close>Close</button></div>
        </div>`,
        (m, done) => { m.querySelector("[data-close]").onclick = done; }
      );
    };
  });
}

Views.portalDocuments = function (root) {
  const s = myStudent();
  if (!s) {
    root.innerHTML = `<div class="empty">No student profile is linked to this account.</div>`;
    return;
  }
  const docs = Store.list("documents").filter((d) => d.studentId === s.id);
  const apps = Store.list("applications").filter((a) => a.studentId === s.id);
  const primaryApp = apps[0];

  root.innerHTML = `
    <div class="toolbar">
      <p class="muted">Upload your official study-abroad application documents. Files are securely inspected by your counselor.</p>
      ${primaryApp ? `<button class="btn btn-primary btn-sm" id="btn-upload-new">+ Upload New Document</button>` : ""}
    </div>

    <div class="card">
      ${
        docs.length
          ? `<table class="data"><thead><tr><th>Document Type</th><th>Attached File</th><th>Review Status</th><th>Notes / Action</th></tr></thead><tbody>${docs
              .map((d) => {
                const file = d.fileUrl
                  ? `<a href="${d.fileUrl}" download="${UI.esc(d.fileName)}">📎 ${UI.esc(d.fileName)}</a>`
                  : UI.esc(d.fileName || "—");
                const action =
                  d.status === "rejected"
                    ? `<button class="btn btn-sm btn-primary" data-re="${d.id}">Re-upload Corrected File</button>`
                    : d.status === "approved"
                    ? `<span style="color:var(--success); font-size:0.82rem; font-weight:600;">✓ Verified</span>`
                    : `<span class="muted" style="font-size:0.82rem;">Under counselor review</span>`;
                return `<tr><td><strong>${UI.esc(d.docType)}</strong></td><td>${file}</td><td>${UI.chip(d.status)}</td><td>${d.remarks ? "<div style='color:var(--danger);font-size:0.8rem;margin-bottom:4px;'>" + UI.esc(d.remarks) + "</div>" : ""}${action}</td></tr>`;
              })
              .join("")}</tbody></table>`
          : `<div class="empty">No documents uploaded to your checklist yet. Use the upload button above to submit documents.</div>`
      }
    </div>
  `;

  // Upload new document
  const upBtn = root.querySelector("#btn-upload-new");
  if (upBtn) {
    upBtn.onclick = () => {
      const html =
        UI.formFields([
          { name: "docType", label: "Document Type", type: "select", options: DOC_TYPES },
        ]) +
        `<div class="field"><label>Select File (PDF, DOCX, JPG - Max 400 KB)</label><input type="file" name="file" required></div>
         <div class="btn-row"><button class="btn btn-primary" type="submit">Upload Document</button><button class="btn btn-ghost" type="button" data-close>Cancel</button></div>`;

      UI.modal("Upload Document", `<form id="up-form">${html}</form>`, (modal, done) => {
        modal.querySelector("[data-close]").onclick = done;
        modal.querySelector("#up-form").onsubmit = async (e) => {
          e.preventDefault();
          const file = e.target.file.files[0];
          try {
            const fileUrl = await UI.readFile(file, 400 * 1024);
            Store.add("documents", {
              studentId: s.id,
              applicationId: primaryApp ? primaryApp.id : "",
              docType: new FormData(e.target).get("docType"),
              fileName: file.name,
              fileUrl,
              status: "pending",
              reviewedBy: "",
              updatedAt: new Date().toISOString(),
            });
            UI.toast("Document uploaded for counselor review.");
            done();
            Views.portalDocuments(root);
          } catch (err) {
            UI.toast(err.message);
          }
        };
      });
    };
  }

  // Re-upload button
  root.querySelectorAll("[data-re]").forEach((b) => {
    b.onclick = () => {
      const id = b.getAttribute("data-re");
      const html = `<div class="field"><label>Replacement File (Max 400 KB)</label><input type="file" name="file" required></div><div class="btn-row"><button class="btn btn-primary" type="submit">Submit Replacement</button><button class="btn btn-ghost" type="button" data-close>Cancel</button></div>`;
      UI.modal("Re-upload Corrected Document", `<form id="rf">${html}</form>`, (modal, done) => {
        modal.querySelector("[data-close]").onclick = done;
        modal.querySelector("#rf").onsubmit = async (e) => {
          e.preventDefault();
          const file = e.target.file.files[0];
          try {
            const fileUrl = await UI.readFile(file, 400 * 1024);
            Store.update("documents", id, {
              fileName: file.name,
              fileUrl,
              status: "pending",
              reviewedBy: "",
              remarks: "",
              updatedAt: new Date().toISOString(),
            });
            UI.toast("Corrected file submitted. Counselor notified.");
            done();
            Views.portalDocuments(root);
          } catch (err) {
            UI.toast(err.message);
          }
        };
      });
    };
  });
};

Views.portalIelts = function (root) {
  const s = myStudent();
  if (!s) {
    root.innerHTML = `<div class="empty">No student profile is linked to this account.</div>`;
    return;
  }
  const ens = Store.list("enrollments").filter((e) => e.studentId === s.id);
  const primaryEnroll = ens[0];
  const primaryBatch = primaryEnroll ? Store.get("batches", primaryEnroll.batchId) : null;
  const classId = primaryEnroll && primaryEnroll.classStudentId ? primaryEnroll.classStudentId : "—";

  const stats = Store.getStudentAttendanceStats(s.id, primaryEnroll?.batchId);

  const scores = Store.list("mockScores")
    .filter((x) => x.studentId === s.id)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  const band = (x) => ((x.listening + x.reading + x.writing + x.speaking) / 4).toFixed(1);

  root.innerHTML = `
    <div class="stats">
      <div class="stat">
        <div class="label">My Class ID</div>
        <div class="value" style="font-size:1.6rem;"><span class="class-id-badge">${UI.esc(classId)}</span></div>
        <div class="meta">${primaryBatch ? UI.esc(primaryBatch.batchName) : "Active Enrollment"}</div>
      </div>
      <div class="stat">
        <div class="label">Class Attendance</div>
        <div class="value" style="color:${stats.standing === 'warning' ? '#DC2626' : '#059669'};">${stats.rate}%</div>
        <div class="meta">${stats.effectivePresent} of ${stats.total} sessions attended (${stats.standingText})</div>
      </div>
      <div class="stat">
        <div class="label">Mock Tests Taken</div>
        <div class="value">${scores.length}</div>
        <div class="meta">Full evaluations recorded</div>
      </div>
      <div class="stat">
        <div class="label">Latest Overall Band</div>
        <div class="value" style="color:var(--accent);">${scores.length ? band(scores[0]) : "—"}</div>
        <div class="meta">Target: Band 7.5+</div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="toolbar">
          <div>
            <h2>Session Attendance History</h2>
            <p class="muted" style="font-size:0.82rem; margin:0;">Official class log for ${UI.esc(primaryBatch ? primaryBatch.batchCode || primaryBatch.batchName : 'IELTS Batch')}</p>
          </div>
          <button type="button" class="btn btn-sm btn-primary" id="btn-student-att-slip">
            🖨️ Official Attendance Slip
          </button>
        </div>

        <div style="display:flex; gap:10px; margin-bottom:12px; font-size:0.78rem;">
          <span style="color:#059669; font-weight:700;">● ${stats.present} Present</span>
          <span style="color:#D97706; font-weight:700;">● ${stats.late} Late</span>
          <span style="color:#DC2626; font-weight:700;">● ${stats.absent} Absent</span>
          <span style="color:#2563EB; font-weight:700;">● ${stats.excused} Excused</span>
        </div>

        ${
          stats.records.length
            ? `<table class="data">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Lesson / Topic</th>
                    <th>Status</th>
                    <th>Note</th>
                  </tr>
                </thead>
                <tbody>
                  ${stats.records
                    .map((a) => {
                      const st = a.status || (a.present ? "present" : "absent");
                      const chipClass = st === 'present' ? 'approved' : st === 'late' ? 'applied' : st === 'excused' ? 'inquiry' : 'rejected';
                      const label = st === 'present' ? 'Present' : st === 'late' ? 'Late' : st === 'excused' ? 'Leave' : 'Absent';
                      return `
                        <tr>
                          <td><strong>${UI.date(a.date)}</strong></td>
                          <td><span style="font-size:0.84rem; color:var(--ink);">${UI.esc(a.topic || "Regular Classroom Session")}</span></td>
                          <td><span class="chip ${chipClass}">${label}</span></td>
                          <td><small class="muted">${UI.esc(a.note || "—")}</small></td>
                        </tr>
                      `;
                    })
                    .join("")}
                </tbody>
              </table>`
            : `<div class="empty">No attendance sessions recorded yet.</div>`
        }
      </div>

      <div class="card">
        <h2>Mock Exam Performance Breakdown</h2>
        ${
          scores.length
            ? `<table class="data"><thead><tr><th>Date</th><th>Listening</th><th>Reading</th><th>Writing</th><th>Speaking</th><th>Overall</th></tr></thead><tbody>${scores
                .map(
                  (x) => {
                    const ob = band(x);
                    return `<tr><td>${UI.esc(x.date)}</td><td>${x.listening}</td><td>${x.reading}</td><td>${x.writing}</td><td>${x.speaking}</td><td><span class="band-badge ${Number(ob) >= 7 ? "band-high" : "band-mid"}">${ob}</span></td></tr>`;
                  }
                )
                .join("")}</tbody></table>`
            : `<div class="empty">No mock exam scores recorded yet.</div>`
        }
      </div>
    </div>
  `;

  const btnSlip = root.querySelector("#btn-student-att-slip");
  if (btnSlip) {
    btnSlip.onclick = () => {
      if (Views.showStudentAttendanceSlip) {
        Views.showStudentAttendanceSlip(s.id, primaryEnroll?.batchId);
      }
    };
  }
};

Views.portalAccounts = function (root) {
  const s = myStudent();
  if (!s) {
    root.innerHTML = `<div class="empty">No student profile is linked to this account.</div>`;
    return;
  }
  const invoices = Store.list("invoices").filter((inv) => inv.studentId === s.id);
  const totalBilled = invoices.reduce((sum, i) => sum + (Number(i.totalAmount) || 0), 0);
  const totalPaid = invoices.reduce((sum, i) => sum + (Number(i.paidAmount) || 0), 0);
  const totalDue = invoices.reduce((sum, i) => sum + (Number(i.dueAmount) || 0), 0);

  root.innerHTML = `
    <div class="view-header">
      <div>
        <h2>My Tuition &amp; Fee Receipts</h2>
        <p>View your official payment vouchers, issued money receipts, and tuition balances.</p>
      </div>
      <a href="#/portal/pay" class="btn btn-primary">Pay Fees &amp; Due Online →</a>
    </div>

    <!-- Student Fee Metrics -->
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-top">
          <div class="metric-icon" style="background:var(--success-light); color:var(--success);">৳</div>
          <span class="badge badge-success">Cleared</span>
        </div>
        <div class="metric-value">৳ ${totalPaid.toLocaleString()}</div>
        <div class="metric-label">Total Paid Amount (BDT)</div>
      </div>

      <div class="metric-card">
        <div class="metric-top">
          <div class="metric-icon" style="background:#fee2e2; color:#dc2626;">৳</div>
          <span class="badge ${totalDue > 0 ? "badge-danger" : "badge-neutral"}">Balance Due</span>
        </div>
        <div class="metric-value" style="color:${totalDue > 0 ? "#dc2626" : "var(--ink);"}">৳ ${totalDue.toLocaleString()}</div>
        <div class="metric-label">Outstanding Due</div>
      </div>

      <div class="metric-card">
        <div class="metric-top">
          <div class="metric-icon" style="background:var(--primary-light); color:var(--primary);">📄</div>
          <span class="badge badge-primary">Receipts</span>
        </div>
        <div class="metric-value">${invoices.length}</div>
        <div class="metric-label">Total Invoices on Record</div>
      </div>
    </div>

    <!-- Invoices List -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">Fee Transactions &amp; Receipts</div>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Service / Purpose</th>
              <th>Date</th>
              <th>Total (BDT)</th>
              <th>Paid (BDT)</th>
              <th>Due (BDT)</th>
              <th>Payment Method</th>
              <th>Status</th>
              <th>Receipt</th>
            </tr>
          </thead>
          <tbody>
            ${
              invoices.length
                ? invoices
                    .map((inv) => {
                      return `
                        <tr>
                          <td><strong style="font-family:var(--font-mono); color:var(--primary);">${UI.esc(inv.invoiceNo)}</strong></td>
                          <td>${UI.esc(inv.serviceType)}</td>
                          <td>${UI.date(inv.date)}</td>
                          <td style="font-weight:600;">৳ ${Number(inv.totalAmount).toLocaleString()}</td>
                          <td style="font-weight:700; color:var(--success);">৳ ${Number(inv.paidAmount).toLocaleString()}</td>
                          <td style="font-weight:700; color:${inv.dueAmount > 0 ? "#dc2626" : "var(--ink-muted)"};">
                            ${inv.dueAmount > 0 ? `৳ ${Number(inv.dueAmount).toLocaleString()}` : "৳ 0"}
                          </td>
                          <td>
                            <span>${UI.esc(inv.paymentMethod)}</span><br>
                            <small class="muted" style="font-family:var(--font-mono);">${UI.esc(inv.trxId || "—")}</small>
                          </td>
                          <td>
                            <span class="badge ${inv.status === "paid" ? "badge-success" : inv.status === "partial" ? "badge-warning" : "badge-danger"}">${inv.status}</span>
                          </td>
                          <td>
                            <button class="btn btn-sm btn-ghost" data-portal-receipt="${inv.id}">
                              📄 Print Receipt
                            </button>
                          </td>
                        </tr>
                      `;
                    })
                    .join("")
                : `<tr><td colspan="9" style="text-align:center; padding:30px; color:var(--ink-muted);">No invoices or payment vouchers issued for your account yet.</td></tr>`
            }
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Bind receipt view
  root.querySelectorAll("[data-portal-receipt]").forEach((btn) => {
    btn.onclick = () => {
      const invId = btn.getAttribute("data-portal-receipt");
      const inv = Store.get("invoices", invId);
      if (inv && Views.accounts) {
        // Render receipt modal from accounts
        const collector = Store.user(inv.collectedBy);
        const receiptHtml = `
          <div id="printable-receipt" style="border:1px solid var(--line); border-radius:var(--radius); padding:24px; background:#fff; font-family:var(--font-sans);">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid var(--primary); padding-bottom:14px; margin-bottom:18px;">
              <div>
                <div style="display:flex; align-items:center; gap:10px; margin-bottom:4px;">
                  <img src="assets/logo.jpg" alt="Logo" style="height:38px; width:auto; border-radius:4px;">
                  <h3 style="margin:0; color:var(--primary); font-size:1.25rem;">EDUCATION XYZ BD</h3>
                </div>
                <div style="font-size:0.8rem; color:var(--ink-muted);">
                  3rd floor, Ka-5/C, Jagannatpur, Bashundhara Residencial Area Main Road, Vatara, Dhaka, Bangladesh<br>
                   Hotline: 01781-827022 · Email: accounts@eduxyzbd.com
                </div>
              </div>
              <div style="text-align:right;">
                <span class="badge ${inv.status === "paid" ? "badge-success" : inv.status === "partial" ? "badge-warning" : "badge-danger"}" style="font-size:0.85rem; padding:4px 10px;">
                  ${inv.status.toUpperCase()}
                </span>
                <div style="font-size:1.1rem; font-weight:700; margin-top:6px; color:var(--ink); font-family:var(--font-mono);">${UI.esc(inv.invoiceNo)}</div>
                <div style="font-size:0.8rem; color:var(--ink-muted);">Date: ${UI.date(inv.date)}</div>
              </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:18px; font-size:0.88rem; background:var(--card-alt); padding:12px; border-radius:var(--radius-sm);">
              <div>
                <span class="muted" style="font-size:0.75rem; text-transform:uppercase;">Student Information</span><br>
                <strong>${UI.esc(s.name)}</strong><br>
                <span>Student ID: <code style="color:var(--primary); font-weight:700;">${UI.esc(s.studentCode || s.id)}</code></span><br>
                <span>Phone: ${UI.esc(s.phone || "—")}</span>
              </div>
              <div>
                <span class="muted" style="font-size:0.75rem; text-transform:uppercase;">Payment Details</span><br>
                <span>Method: <strong>${UI.esc(inv.paymentMethod)}</strong></span><br>
                <span>Transaction ID: <code>${UI.esc(inv.trxId || "—")}</code></span><br>
                <span>Issued By: ${UI.esc(collector ? collector.name : "Accounts Officer")}</span>
              </div>
            </div>

            <table style="width:100%; border-collapse:collapse; margin-bottom:18px; font-size:0.88rem;">
              <thead>
                <tr style="background:var(--primary-light); color:var(--primary);">
                  <th style="padding:10px; text-align:left; border-bottom:1px solid var(--line);">Description / Particulars</th>
                  <th style="padding:10px; text-align:right; border-bottom:1px solid var(--line);">Amount (BDT)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="padding:12px 10px; border-bottom:1px solid var(--line);">${UI.esc(inv.serviceType)}</td>
                  <td style="padding:12px 10px; text-align:right; border-bottom:1px solid var(--line); font-weight:600;">৳ ${Number(inv.totalAmount).toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding:8px 10px; text-align:right; color:var(--ink-muted);">Total Billed:</td>
                  <td style="padding:8px 10px; text-align:right; font-weight:600;">৳ ${Number(inv.totalAmount).toLocaleString()}</td>
                </tr>
                <tr style="color:var(--success);">
                  <td style="padding:8px 10px; text-align:right; font-weight:700;">Amount Received / Paid:</td>
                  <td style="padding:8px 10px; text-align:right; font-weight:700;">৳ ${Number(inv.paidAmount).toLocaleString()}</td>
                </tr>
                ${
                  inv.dueAmount > 0
                    ? `<tr style="color:#dc2626;">
                        <td style="padding:8px 10px; text-align:right; font-weight:700;">Balance Due:</td>
                        <td style="padding:8px 10px; text-align:right; font-weight:700;">৳ ${Number(inv.dueAmount).toLocaleString()}</td>
                      </tr>`
                    : ""
                }
              </tbody>
            </table>

            <div style="display:flex; justify-content:space-between; align-items:flex-end; padding-top:20px; border-top:1px dashed var(--line); font-size:0.8rem; color:var(--ink-muted);">
              <div>
                * This is a computer generated payment acknowledgement receipt.<br>
                * All fees are non-refundable once enrollment or visa file processing has commenced.
              </div>
              <div style="text-align:center;">
                <div style="border-bottom:1px solid var(--ink); width:140px; margin-bottom:4px;"></div>
                Authorized Signature
              </div>
            </div>
          </div>

          <div class="btn-row" style="margin-top:16px;">
            <button class="btn btn-ghost" type="button" data-close>Close</button>
            <button class="btn btn-primary" type="button" id="btn-print-portal-receipt">
              🖨️ Print Official Receipt
            </button>
          </div>
        `;

        UI.modal(`Payment Receipt — ${inv.invoiceNo}`, receiptHtml, (modal, done) => {
          modal.querySelector("[data-close]").onclick = done;
          modal.querySelector("#btn-print-portal-receipt").onclick = () => UI.printElement(modal.querySelector("#printable-receipt"), `Payment Receipt - ${inv.invoiceNo}`);
        });
      }
    };
  });
};

Views.portalPay = function (root) {
  const s = myStudent();
  if (!s) {
    root.innerHTML = `<div class="empty">No student profile is linked to this account.</div>`;
    return;
  }

  const dueInvoices = Store.list("invoices").filter((inv) => inv.studentId === s.id && Number(inv.dueAmount) > 0);
  const totalDue = dueInvoices.reduce((sum, inv) => sum + Number(inv.dueAmount || 0), 0);

  root.innerHTML = `
    <div class="view-header">
      <div>
        <h2>Pay Fees &amp; Outstanding Due</h2>
        <p>Select an invoice and continue to the secure online payment page.</p>
      </div>
      <a href="#/portal/accounts" class="btn btn-ghost">← View Receipts</a>
    </div>

    <div class="card" style="max-width:760px; margin:0 auto;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:16px; flex-wrap:wrap; margin-bottom:20px;">
        <div>
          <span class="chip visa">Online Fee Payment</span>
          <h3 style="margin:10px 0 4px;">${UI.esc(s.name)}</h3>
          <p class="muted" style="margin:0;">Student ID: ${UI.esc(s.studentCode || s.id)}</p>
        </div>
        <div style="text-align:right;">
          <div class="muted" style="font-size:0.78rem; text-transform:uppercase;">Total outstanding</div>
          <strong style="font-size:1.7rem; color:${totalDue > 0 ? "#dc2626" : "var(--success)"};">৳ ${totalDue.toLocaleString()}</strong>
        </div>
      </div>

      ${
        dueInvoices.length
          ? `<form id="student-payment-form">
              <div class="field">
                <label for="payment-invoice">Fee or due to pay</label>
                <select id="payment-invoice" name="invoiceId" required>
                  ${dueInvoices
                    .map(
                      (inv) => `<option value="${UI.esc(inv.id)}" data-due="${Number(inv.dueAmount)}">${UI.esc(inv.serviceType)} — Due ৳ ${Number(inv.dueAmount).toLocaleString()}</option>`
                    )
                    .join("")}
                </select>
              </div>
              <div class="field">
                <label for="payment-amount">Amount to pay (BDT)</label>
                <input id="payment-amount" name="amount" type="number" min="1" step="1" value="${Number(dueInvoices[0].dueAmount)}" required>
                <small class="muted">You can pay the full due or a smaller partial amount.</small>
              </div>
              <div class="field">
                <label for="payment-method">Payment method</label>
                <select id="payment-method" name="method" required>
                  <option value="bKash">bKash</option>
                  <option value="Nagad">Nagad</option>
                  <option value="Card">Debit / Credit Card</option>
                  <option value="Bank Transfer">Online Bank Transfer</option>
                </select>
              </div>
              <button class="btn btn-primary btn-block" type="submit">Continue to Secure Payment →</button>
            </form>`
          : `<div class="empty" style="padding:30px 10px;">
              <h3>All fees are paid</h3>
              <p class="muted">There are no outstanding dues on your account right now.</p>
              <a href="#/portal/accounts" class="btn btn-ghost btn-sm">View Payment Receipts</a>
            </div>`
      }
    </div>
  `;

  const invoiceSelect = root.querySelector("#payment-invoice");
  const amountInput = root.querySelector("#payment-amount");
  if (invoiceSelect && amountInput) {
    invoiceSelect.onchange = () => {
      const selected = invoiceSelect.options[invoiceSelect.selectedIndex];
      amountInput.value = selected ? selected.dataset.due : "";
      amountInput.max = selected ? selected.dataset.due : "";
    };
    invoiceSelect.dispatchEvent(new Event("change"));
  }

  const paymentForm = root.querySelector("#student-payment-form");
  if (paymentForm) {
    paymentForm.onsubmit = (event) => {
      event.preventDefault();
      const formData = new FormData(paymentForm);
      const invoice = Store.get("invoices", formData.get("invoiceId"));
      const amount = Number(formData.get("amount"));
      if (!invoice || !amount || amount < 1 || amount > Number(invoice.dueAmount)) {
        UI.toast("Enter a valid amount within the selected outstanding due.");
        return;
      }
      const params = new URLSearchParams({
        invoice: invoice.id,
        amount: String(amount),
        method: String(formData.get("method")),
      });
      location.hash = `#/portal/checkout?${params.toString()}`;
    };
  }
};

Views.portalPayCheckout = function (root, query) {
  const s = myStudent();
  const params = new URLSearchParams(query || "");
  const invoice = s ? Store.get("invoices", params.get("invoice")) : null;
  const amount = Number(params.get("amount"));
  const method = params.get("method") || "Online payment";

  if (!s || !invoice || invoice.studentId !== s.id || !amount || amount < 1 || amount > Number(invoice.dueAmount)) {
    root.innerHTML = `
      <div class="card">
        <div class="empty">
          <h3>Payment request not found</h3>
          <p class="muted">Choose an outstanding fee from the student payment page and try again.</p>
          <a href="#/portal/pay" class="btn btn-primary btn-sm">Return to Pay Online</a>
        </div>
      </div>`;
    return;
  }

  root.innerHTML = `
    <div class="view-header">
      <div>
        <h2>Secure Payment Checkout</h2>
        <p>Review your fee payment before continuing to the selected payment provider.</p>
      </div>
      <a href="#/portal/pay" class="btn btn-ghost">← Change Payment</a>
    </div>
    <div class="card" style="max-width:760px; margin:0 auto;">
      <span class="chip visa">Payment Ready</span>
      <h3 style="margin:12px 0 4px;">${UI.esc(invoice.serviceType)}</h3>
      <p class="muted" style="margin:0 0 22px;">Student: ${UI.esc(s.name)} · Invoice: ${UI.esc(invoice.invoiceNo)}</p>
      <div class="metrics-grid" style="margin-bottom:22px;">
        <div class="metric-card"><div class="metric-label">Amount to pay</div><div class="metric-value">৳ ${amount.toLocaleString()}</div></div>
        <div class="metric-card"><div class="metric-label">Payment method</div><div class="metric-value" style="font-size:1.05rem;">${UI.esc(method)}</div></div>
      </div>
      <div class="empty" style="padding:20px 10px;">
        <h3>Payment provider handoff</h3>
        <p class="muted">The live ${UI.esc(method)} gateway must be connected here before accepting a real payment.</p>
        <a href="#/portal/pay" class="btn btn-primary btn-sm">Return to Payment</a>
      </div>
    </div>`;
};


