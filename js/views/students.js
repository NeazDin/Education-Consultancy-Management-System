window.Views = window.Views || {};

function visibleStudents() {
  const all = Store.list("students");
  if (Auth.is("admin", "instructor", "admission_officer", "hr", "accountant")) return all;
  if (Auth.is("counselor")) {
    const ids = new Set(
      Store.list("applications")
        .filter((a) => a.counselorId === Auth.user.id)
        .map((a) => a.studentId)
    );
    return all.filter((s) => ids.has(s.id) || s.createdBy === Auth.user.id);
  }
  return [];
}

function studentForm(existing, close, onSave) {
  const html =
    UI.formFields([
      { name: "name", label: "Full Name", value: existing && existing.name, placeholder: "e.g. Ayesha Karim", required: true },
      { name: "email", label: "Email Address", type: "email", value: existing && existing.email, placeholder: "student@email.com", required: true },
      { name: "phone", label: "Phone Number (Bangladesh)", value: existing && existing.phone, placeholder: "+880 1700 000000" },
      {
        name: "interestType",
        label: "Interest / Goal",
        type: "select",
        value: (existing && existing.interestType) || "both",
        options: INTEREST.map((i) => ({ value: i, label: i })),
      },
      { name: "targetCountry", label: "Target Destination Country", value: (existing && existing.targetCountry) || "United Kingdom", placeholder: "e.g. United Kingdom, Canada, Australia" },
    ]) + `<div class="btn-row"><button class="btn btn-primary" type="submit">Save Student Record</button><button class="btn btn-ghost" type="button" data-close>Cancel</button></div>`;

  UI.modal(existing ? "Edit Student Profile" : "Register New Student", `<form id="sf">${html}</form>`, (modal, done) => {
    modal.querySelector("[data-close]").onclick = done;
    modal.querySelector("#sf").onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      onSave({
        name: fd.get("name").trim(),
        email: fd.get("email").trim(),
        phone: fd.get("phone").trim(),
        interestType: fd.get("interestType"),
        targetCountry: fd.get("targetCountry").trim(),
      });
      done();
    };
  });
}

Views.students = function (root) {
  const q = (Views._studentQ || "").toLowerCase();
  let list = visibleStudents();
  if (q) {
    list = list.filter((s) =>
      (s.name + s.email + (s.phone || "") + (s.studentCode || "") + (s.targetCountry || "")).toLowerCase().includes(q)
    );
  }
  const canEdit = Auth.is("admin", "counselor", "admission_officer");

  root.innerHTML = `
    <div class="toolbar">
      <div>
        <p class="muted">All registered prospective and active students for Education XYZ BD.</p>
      </div>
      <div class="btn-row">
        <input class="search" id="q" placeholder="Search by Student ID, Name, Email, Phone..." value="${UI.esc(Views._studentQ || "")}">
        ${canEdit ? `<button class="btn btn-primary" id="add">+ Register New Student</button>` : ""}
      </div>
    </div>
    <div class="card">
      ${
        list.length
          ? `<table class="data">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Full Name</th>
                  <th>Contact Info</th>
                  <th>Target Destination</th>
                  <th>Interest</th>
                  <th>Registered</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${list
                  .map(
                    (s) =>
                      `<tr>
                        <td><span class="student-code-badge">${UI.esc(s.studentCode || s.id)}</span></td>
                        <td><a href="#/students/${s.id}"><strong>${UI.esc(s.name)}</strong></a></td>
                        <td>${UI.esc(s.email)}<br><small class="muted">${UI.esc(s.phone || "—")}</small></td>
                        <td>${UI.esc(s.targetCountry || "Not Specified")}</td>
                        <td>${UI.chip(s.interestType)}</td>
                        <td>${UI.date(s.createdAt)}</td>
                        <td>
                           <div class="btn-row" style="gap:4px;">
                             <a href="#/students/${s.id}" class="btn btn-sm btn-ghost">View</a>
                             ${(() => {
                               const u = Store.getUserForStudent(s.id);
                               return u ? `<a href="#/messages?to=${u.id}" class="btn btn-sm btn-ghost" title="Direct message student">✉ Chat</a>` : "";
                             })()}
                           </div>
                         </td>
                      </tr>`
                  )
                  .join("")}
              </tbody>
            </table>`
          : `<div class="empty">No students match your search criteria.</div>`
      }
    </div>
  `;

  root.querySelector("#q").oninput = (e) => {
    Views._studentQ = e.target.value;
    Views.students(root);
  };

  const add = root.querySelector("#add");
  if (add)
    add.onclick = () =>
      studentForm(null, null, (data) => {
        const studentCode = Store.generateStudentCode();
        const newStudent = Store.add("students", {
          studentCode,
          ...data,
          createdAt: new Date().toISOString(),
          createdBy: Auth.user.id,
        });
        UI.toast(`Student registered with ID: ${studentCode}`);
        Views.students(root);
      });
};

Views.studentDetail = function (root, id) {
  const s = Store.student(id);
  if (!s || !visibleStudents().some((x) => x.id === id)) {
    root.innerHTML = `<div class="empty">Student record not found.</div>`;
    return;
  }
  const apps = Store.list("applications").filter((a) => a.studentId === id);
  const ens = Store.list("enrollments").filter((e) => e.studentId === id);
  const canEdit = Auth.is("admin", "counselor", "admission_officer");
  const counselors = Store.list("users").filter((u) => u.role === "counselor" || u.role === "admin");
  const studentUser = Store.getUserForStudent(s.id);

  root.innerHTML = `
    <div class="toolbar">
      <a href="#/students" class="btn btn-sm btn-ghost">← Back to Students</a>
      <div class="btn-row">
        ${studentUser ? `<a href="#/messages?to=${studentUser.id}" class="btn btn-sm btn-primary">✉ Inbox / Message Student</a>` : ""}
        ${canEdit ? `<button class="btn btn-ghost btn-sm" id="edit">Edit Profile</button>` : ""}
      </div>
    </div>

    <div class="grid-2">
      <!-- Profile Details Card -->
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
          <div>
            <h2>${UI.esc(s.name)}</h2>
            <span class="student-code-badge" style="font-size:0.88rem;">${UI.esc(s.studentCode || s.id)}</span>
          </div>
          <div>${UI.chip(s.interestType)}</div>
        </div>

        <dl class="dl" style="margin-top:16px;">
          <dt>Email Address</dt><dd>${UI.esc(s.email)}</dd>
          <dt>Contact Phone</dt><dd>${UI.esc(s.phone || "—")}</dd>
          <dt>Target Country</dt><dd><strong>${UI.esc(s.targetCountry || "United Kingdom")}</strong></dd>
          <dt>Registration Date</dt><dd>${UI.date(s.createdAt)}</dd>
        </dl>
      </div>

      <!-- Enrolled Batches with Class Student IDs -->
      <div class="card">
        <div class="toolbar">
          <h2>IELTS Classes &amp; Class Student IDs</h2>
          ${Auth.is("admin", "instructor", "counselor", "admission_officer") ? `<button class="btn btn-sm btn-primary" id="enroll">+ Enroll in Class</button>` : ""}
        </div>
        ${
          ens.length
            ? `<table class="data">
                <thead><tr><th>Batch</th><th>Class Student ID</th><th>Enrolled</th></tr></thead>
                <tbody>
                  ${ens
                    .map((e) => {
                      const b = Store.get("batches", e.batchId);
                      return `<tr>
                        <td><a href="#/batches/${e.batchId}"><strong>${UI.esc(b ? b.batchName : e.batchId)}</strong></a></td>
                        <td><span class="class-id-badge">${UI.esc(e.classStudentId || "—")}</span></td>
                        <td>${UI.date(e.enrolledAt)}</td>
                      </tr>`;
                    })
                    .join("")}
                </tbody>
              </table>`
            : `<div class="empty">Student is not currently enrolled in any IELTS class batch.</div>`
        }
      </div>
    </div>

    <!-- Applications Card -->
    <div class="card">
      <div class="toolbar">
        <h2>Study-Abroad Applications (${apps.length})</h2>
        ${canEdit ? `<button class="btn btn-sm btn-primary" id="newapp">+ Open New Application</button>` : ""}
      </div>
      ${
        apps.length
          ? `<table class="data">
              <thead><tr><th>Target University / Country</th><th>Current Stage</th><th>Assigned Counselor</th><th>Visa Target</th><th>Updated</th></tr></thead>
              <tbody>
                ${apps
                  .map(
                    (a) =>
                      `<tr>
                        <td><a href="#/applications/${a.id}"><strong>${UI.esc(a.targetCountry)}</strong>${a.targetUniversity ? " · " + UI.esc(a.targetUniversity) : ""}</a></td>
                        <td>${UI.chip(a.stage)}</td>
                        <td>${UI.esc(UI.name(a.counselorId))}</td>
                        <td>${UI.esc(a.visaDeadline) || "—"}</td>
                        <td>${UI.date(a.updatedAt)}</td>
                      </tr>`
                  )
                  .join("")}
              </tbody>
            </table>`
          : `<div class="empty">No study-abroad application on file yet for this student.</div>`
      }
    </div>
  `;

  const edit = root.querySelector("#edit");
  if (edit)
    edit.onclick = () =>
      studentForm(s, null, (data) => {
        Store.update("students", s.id, data);
        UI.toast("Student profile updated.");
        Views.studentDetail(root, id);
      });

  const newapp = root.querySelector("#newapp");
  if (newapp)
    newapp.onclick = () => {
      const html =
        UI.formFields([
          { name: "targetCountry", label: "Target Country", required: true, value: s.targetCountry || "United Kingdom" },
          { name: "targetUniversity", label: "Target University / Institution" },
          { name: "targetProgram", label: "Intended Degree / Program" },
          { name: "intake", label: "Preferred Intake", placeholder: "e.g. Sept 2026 or Jan 2027" },
          {
            name: "counselorId",
            label: "Assigned Advisor / Counselor",
            type: "select",
            value: Auth.is("counselor") ? Auth.user.id : counselors[0] && counselors[0].id,
            options: counselors.map((c) => ({ value: c.id, label: `${c.name} (${c.title || c.role})` })),
          },
        ]) + `<div class="btn-row"><button class="btn btn-primary" type="submit">Create Application</button><button class="btn btn-ghost" type="button" data-close>Cancel</button></div>`;

      UI.modal("New Study-Abroad Application", `<form id="af">${html}</form>`, (modal, done) => {
        modal.querySelector("[data-close]").onclick = done;
        modal.querySelector("#af").onsubmit = (e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          const rec = Store.add("applications", {
            studentId: s.id,
            counselorId: fd.get("counselorId"),
            targetCountry: fd.get("targetCountry").trim(),
            targetUniversity: fd.get("targetUniversity").trim(),
            targetProgram: fd.get("targetProgram").trim(),
            intake: fd.get("intake").trim(),
            stage: "inquiry",
            visaDeadline: "",
            notes: [{ at: new Date().toISOString(), by: Auth.user.id, text: "Application opened by counselor.", type: "stage" }],
            updatedAt: new Date().toISOString(),
          });
          done();
          location.hash = "#/applications/" + rec.id;
        };
      });
    };

  const enroll = root.querySelector("#enroll");
  if (enroll)
    enroll.onclick = () => {
      const batches = Store.list("batches");
      if (!batches.length) {
        UI.toast("Please create an IELTS batch first.");
        return;
      }
      const initialBatch = batches[0];
      const suggestedClassId = Store.generateClassStudentId(initialBatch.id);

      const html =
        UI.formFields([
          {
            name: "batchId",
            label: "Select IELTS Batch",
            type: "select",
            options: batches.map((b) => ({ value: b.id, label: `${b.batchName} (${b.batchCode || "IEL"})` })),
          },
          {
            name: "classStudentId",
            label: "Class Student ID",
            value: suggestedClassId,
            required: true,
            placeholder: "e.g. XYZ-IEL-001",
          },
        ]) + `<div class="btn-row"><button class="btn btn-primary" type="submit">Complete Enrollment</button><button class="btn btn-ghost" type="button" data-close>Cancel</button></div>`;

      UI.modal("Enroll in IELTS Class", `<form id="ef">${html}</form>`, (modal, done) => {
        modal.querySelector("[data-close]").onclick = done;
        modal.querySelector("#ef").onsubmit = (e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          const batchId = fd.get("batchId");
          const classStudentId = fd.get("classStudentId").trim();

          if (Store.list("enrollments").some((x) => x.studentId === s.id && x.batchId === batchId)) {
            UI.toast("Student is already enrolled in this batch.");
            done();
            return;
          }

          Store.add("enrollments", {
            studentId: s.id,
            batchId,
            classStudentId,
            enrolledAt: new Date().toISOString(),
            status: "active",
          });
          UI.toast(`Enrolled with Class Student ID: ${classStudentId}`);
          done();
          Views.studentDetail(root, id);
        };
      });
    };
};

