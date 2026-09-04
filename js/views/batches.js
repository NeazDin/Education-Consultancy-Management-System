window.Views = window.Views || {};

function visibleBatches() {
  const all = Store.list("batches");
  if (Auth.is("admin", "counselor", "admission_officer", "hr")) return all;
  if (Auth.is("instructor")) return all.filter((b) => b.instructorId === Auth.user.id);
  return [];
}

Views.batches = function (root) {
  const list = visibleBatches();
  const canCreate = Auth.is("admin");
  root.innerHTML = `
    <div class="toolbar">
      <div>
        <p class="muted">Official IELTS preparation batches, class schedules, and student enrollment roster.</p>
      </div>
      ${canCreate ? `<button class="btn btn-primary" id="add">+ Create New Batch</button>` : ""}
    </div>
    <div class="card">
      ${
        list.length
          ? `<table class="data"><thead><tr><th>Batch &amp; Code</th><th>Instructor</th><th>Schedule</th><th>Room / Mode</th><th>Session Dates</th><th>Enrolled</th></tr></thead><tbody>${list
              .map((b) => {
                const ens = Store.list("enrollments").filter((e) => e.batchId === b.id);
                return `<tr><td><a href="#/batches/${b.id}"><strong>${UI.esc(b.batchName)}</strong></a><br><span class="class-id-badge">${UI.esc(b.batchCode || "IEL")}</span></td><td>${UI.esc(UI.name(b.instructorId))}</td><td>${UI.esc(b.schedule)}</td><td>${UI.esc(b.room || "Main Campus")}</td><td>${UI.esc(b.startDate)} – ${UI.esc(b.endDate)}</td><td><span class="chip approved">${ens.length} / ${b.maxCapacity || 25} students</span></td></tr>`;
              })
              .join("")}</tbody></table>`
          : `<div class="empty">No batches assigned to your account.</div>`
      }
    </div>
  `;
  const add = root.querySelector("#add");
  if (add)
    add.onclick = () => {
      const instructors = Store.list("users").filter((u) => u.role === "instructor");
      const html =
        UI.formFields([
          { name: "batchName", label: "Batch Name", placeholder: "e.g. IELTS Morning Fast-Track", required: true },
          { name: "batchCode", label: "Batch Code (for Student IDs)", placeholder: "e.g. IEL-MORN", required: true },
          { name: "schedule", label: "Class Schedule", placeholder: "e.g. Sun, Tue, Thu · 10:00 AM – 12:00 PM", required: true },
          { name: "room", label: "Classroom / Mode", placeholder: "e.g. Studio B (Dhaka) or Online Live", required: true },
          { name: "startDate", label: "Start Date", type: "date", required: true },
          { name: "endDate", label: "End Date", type: "date", required: true },
          { name: "maxCapacity", label: "Maximum Capacity", type: "number", value: "25", required: true },
          {
            name: "instructorId",
            label: "Lead IELTS Instructor",
            type: "select",
            options: instructors.map((i) => ({ value: i.id, label: i.name })),
          },
        ]) + `<div class="btn-row"><button class="btn btn-primary" type="submit">Create Batch</button><button class="btn btn-ghost" type="button" data-close>Cancel</button></div>`;
      UI.modal("Create New IELTS Batch", `<form id="bf">${html}</form>`, (modal, done) => {
        modal.querySelector("[data-close]").onclick = done;
        modal.querySelector("#bf").onsubmit = (e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          Store.add("batches", {
            batchName: fd.get("batchName").trim(),
            batchCode: fd.get("batchCode").trim().toUpperCase(),
            schedule: fd.get("schedule").trim(),
            room: fd.get("room").trim(),
            startDate: fd.get("startDate"),
            endDate: fd.get("endDate"),
            maxCapacity: Number(fd.get("maxCapacity")) || 25,
            instructorId: fd.get("instructorId"),
          });
          UI.toast("IELTS batch created successfully.");
          done();
          Views.batches(root);
        };
      });
    };
};

Views.batchDetail = function (root, id) {
  const b = Store.get("batches", id);
  if (!b || !visibleBatches().some((x) => x.id === id)) {
    root.innerHTML = `<div class="empty">Batch record not found.</div>`;
    return;
  }
  const ens = Store.list("enrollments").filter((e) => e.batchId === id);
  const ieltsStudents = Store.list("students").filter((s) => s.interestType === "IELTS" || s.interestType === "both");
  const canEnroll = Auth.is("admin", "instructor", "counselor", "admission_officer");

  root.innerHTML = `
    <div class="toolbar">
      <a href="#/batches" class="btn btn-sm btn-ghost">← Back to Batches</a>
      <div class="btn-row">
        <a href="#/attendance" class="btn btn-sm btn-ghost">Take Attendance</a>
        <a href="#/scores" class="btn btn-sm btn-ghost">Record Mock Scores</a>
        ${canEnroll ? `<button class="btn btn-sm btn-primary" id="enroll">+ Enroll Student in Class</button>` : ""}
      </div>
    </div>

    <div class="card">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px;">
        <div>
          <h2>${UI.esc(b.batchName)}</h2>
          <span class="class-id-badge">${UI.esc(b.batchCode || "IEL")}</span>
        </div>
        <div class="chip approved">${ens.length} Students Enrolled</div>
      </div>
      <dl class="dl" style="margin-top:16px;">
        <dt>Instructor</dt><dd><strong>${UI.esc(UI.name(b.instructorId))}</strong></dd>
        <dt>Schedule</dt><dd>${UI.esc(b.schedule)}</dd>
        <dt>Room / Mode</dt><dd>${UI.esc(b.room || "Main Campus")}</dd>
        <dt>Session Dates</dt><dd>${UI.esc(b.startDate)} – ${UI.esc(b.endDate)}</dd>
      </dl>
    </div>

    <div class="card">
      <div class="toolbar">
        <h2>Enrolled Class Roster (${ens.length})</h2>
      </div>
      ${
        ens.length
          ? `<table class="data"><thead><tr><th>Class Student ID</th><th>Student Name</th><th>Contact Info</th><th>Enrolled Date</th><th>Attendance Rate</th><th>Actions</th></tr></thead><tbody>${ens
              .map((e) => {
                const s = Store.student(e.studentId);
                const attRows = Store.list("attendance").filter((a) => a.batchId === id && a.studentId === e.studentId);
                const present = attRows.filter((a) => a.present).length;
                const attPct = attRows.length ? Math.round((present / attRows.length) * 100) : 0;
                return `<tr>
                  <td><span class="class-id-badge">${UI.esc(e.classStudentId || "—")}</span></td>
                  <td><a href="#/students/${e.studentId}"><strong>${UI.esc(s ? s.name : "Student")}</strong></a><br><span class="student-code-badge">${UI.esc(s ? s.studentCode : "")}</span></td>
                  <td>${UI.esc(s ? s.email : "")}<br><small class="muted">${UI.esc(s ? s.phone : "")}</small></td>
                  <td>${UI.date(e.enrolledAt)}</td>
                  <td><span class="chip ${attPct >= 75 ? "completed" : "inquiry"}">${attPct}% (${present}/${attRows.length})</span></td>
                  <td>
                    <div class="btn-row" style="gap:4px;">
                      ${Auth.is("admin") ? `<button class="btn btn-sm btn-danger" data-remove-en="${e.id}">Remove</button>` : `<a href="#/students/${e.studentId}" class="btn btn-sm btn-ghost">View</a>`}
                      ${(() => {
                        const u = Store.getUserForStudent(e.studentId);
                        return u ? `<a href="#/messages?to=${u.id}" class="btn btn-sm btn-ghost" title="Direct message student">✉ Chat</a>` : "";
                      })()}
                    </div>
                  </td>
                </tr>`;
              })
              .join("")}</tbody></table>`
          : `<div class="empty">No students are currently enrolled in this class batch.</div>`
      }
    </div>
  `;

  // Remove enrollment
  root.querySelectorAll("[data-remove-en]").forEach((btn) => {
    btn.onclick = () => {
      const enId = btn.getAttribute("data-remove-en");
      if (!confirm("Are you sure you want to remove this student from the batch?")) return;
      Store.remove("enrollments", enId);
      UI.toast("Student removed from batch.");
      Views.batchDetail(root, id);
    };
  });

  // Enroll student with Class Student ID
  const enroll = root.querySelector("#enroll");
  if (enroll)
    enroll.onclick = () => {
      const suggestedClassId = Store.generateClassStudentId(id);
      const availableStudents = ieltsStudents.filter(
        (s) => !ens.some((e) => e.studentId === s.id)
      );
      if (!availableStudents.length) {
        UI.toast("All registered IELTS students are already enrolled in this batch.");
        return;
      }

      const html =
        UI.formFields([
          {
            name: "studentId",
            label: "Select Student to Enroll",
            type: "select",
            options: availableStudents.map((s) => ({
              value: s.id,
              label: `${s.name} (${s.studentCode || s.id})`,
            })),
          },
          {
            name: "classStudentId",
            label: "Assigned Class Student ID",
            value: suggestedClassId,
            required: true,
            placeholder: "e.g. XYZ-IEL-001",
          },
        ]) + `<div class="btn-row"><button class="btn btn-primary" type="submit">Complete Enrollment</button><button class="btn btn-ghost" type="button" data-close>Cancel</button></div>`;

      UI.modal(`Enroll Student in ${b.batchName}`, `<form id="ef">${html}</form>`, (modal, done) => {
        modal.querySelector("[data-close]").onclick = done;
        modal.querySelector("#ef").onsubmit = (e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          const studentId = fd.get("studentId");
          const classStudentId = fd.get("classStudentId").trim();

          Store.add("enrollments", {
            studentId,
            batchId: id,
            classStudentId,
            enrolledAt: new Date().toISOString(),
            status: "active",
          });
          UI.toast(`Enrolled with Class Student ID: ${classStudentId}`);
          done();
          Views.batchDetail(root, id);
        };
      });
    };
};

