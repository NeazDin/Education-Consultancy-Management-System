window.Views = window.Views || {};

function visibleApps() {
  const all = Store.list("applications");
  if (Auth.is("admin", "admission_officer")) return all;
  if (Auth.is("counselor")) return all.filter((a) => a.counselorId === Auth.user.id);
  return [];
}

Views.applications = function (root) {
  const list = visibleApps();
  root.innerHTML = `
    <div class="toolbar">
      <div>
        <p class="muted">Active university admissions and visa processing pipeline.</p>
      </div>
      <div class="btn-row">
        <a href="#/students" class="btn btn-primary btn-sm">+ Open From Student Profile</a>
      </div>
    </div>
    <div class="card">
      ${
        list.length
          ? `<table class="data">
              <thead>
                <tr>
                  <th>Student ID &amp; Name</th>
                  <th>Destination &amp; University</th>
                  <th>Program &amp; Intake</th>
                  <th>Stage</th>
                  <th>Assigned Counselor</th>
                  <th>Visa Target</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${list
                  .map((a) => {
                    const s = Store.student(a.studentId);
                    return `<tr>
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
                      <td>${UI.esc(UI.name(a.counselorId))}</td>
                      <td>${UI.esc(a.visaDeadline) || "—"}</td>
                      <td><a href="#/applications/${a.id}" class="btn btn-sm btn-ghost">Open File</a></td>
                    </tr>`;
                  })
                  .join("")}
              </tbody>
            </table>`
          : `<div class="empty">No study-abroad applications currently assigned.</div>`
      }
    </div>
  `;
};

Views.applicationDetail = function (root, id) {
  const a = Store.get("applications", id);
  if (!a || !visibleApps().some((x) => x.id === id)) {
    root.innerHTML = `<div class="empty">Application file not found.</div>`;
    return;
  }
  const s = Store.student(a.studentId);
  const counselors = Store.list("users").filter((u) => u.role === "counselor" || u.role === "admin");
  const docs = Store.list("documents").filter((d) => d.applicationId === id);
  const idx = STAGES.indexOf(a.stage);
  const canEdit = Auth.is("admin", "counselor", "admission_officer");
  const studentUser = s ? Store.getUserForStudent(s.id) : null;
  const counselorUser = a.counselorId ? Store.user(a.counselorId) : null;

  root.innerHTML = `
    <div class="toolbar">
      <a href="#/applications" class="btn btn-sm btn-ghost">← Back to Applications</a>
      <div class="btn-row">
        ${studentUser ? `<a href="#/messages?to=${studentUser.id}" class="btn btn-sm btn-primary">✉ Message Student</a>` : ""}
        ${counselorUser && counselorUser.id !== Auth.user.id ? `<a href="#/messages?to=${counselorUser.id}" class="btn btn-sm btn-ghost">✉ Message Counselor</a>` : ""}
      </div>
    </div>

    <!-- Application Stepper -->
    <div class="card">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px;">
        <div>
          <h2>${UI.esc(s ? s.name : "Student")} · ${UI.esc(a.targetCountry)}</h2>
          <span class="student-code-badge">${UI.esc(s ? s.studentCode : "")}</span>
        </div>
        <div>
          ${UI.chip(a.stage)}
        </div>
      </div>

      <div class="app-stepper" style="margin-top:24px;">
        <div class="stepper-track-bar">
          <div class="stepper-progress-fill" style="width: ${Math.round((idx / (STAGES.length - 1)) * 100)}%"></div>
        </div>
        ${STAGES.map((st, i) => {
          const stateCls = i < idx ? "done" : i === idx ? "active" : "";
          const icon = i < idx ? "✓" : i + 1;
          return `
            <div class="step-item ${stateCls}">
              <div class="step-circle">${icon}</div>
              <span class="step-label">${st}</span>
            </div>
          `;
        }).join("")}
      </div>

      ${
        canEdit
          ? `<div class="btn-row" style="margin-top:20px; padding-top:16px; border-top:1px solid var(--line);">
              ${idx > 0 ? `<button class="btn btn-ghost btn-sm" data-stage="${STAGES[idx - 1]}">← Revert to ${STAGES[idx - 1]}</button>` : ""}
              ${idx < STAGES.length - 1 ? `<button class="btn btn-primary btn-sm" data-stage="${STAGES[idx + 1]}">Advance to ${STAGES[idx + 1]} →</button>` : ""}
              <button class="btn btn-ghost btn-sm" id="editapp">Edit Application Details</button>
            </div>`
          : ""
      }
    </div>

    <div class="grid-2">
      <!-- File Details -->
      <div class="card">
        <h2>Application File Info</h2>
        <dl class="dl">
          <dt>Destination Country</dt><dd><strong>${UI.esc(a.targetCountry)}</strong></dd>
          <dt>Target University</dt><dd>${UI.esc(a.targetUniversity) || "Pending selection"}</dd>
          <dt>Degree / Program</dt><dd>${UI.esc(a.targetProgram) || "Pending counseling"}</dd>
          <dt>Target Intake</dt><dd>${UI.esc(a.intake) || "Upcoming"}</dd>
          <dt>Assigned Counselor</dt><dd>${UI.esc(UI.name(a.counselorId))}</dd>
          <dt>Visa Target Date</dt><dd>${UI.esc(a.visaDeadline) || "Not scheduled"}</dd>
          <dt>Last File Update</dt><dd>${UI.datetime(a.updatedAt)}</dd>
        </dl>
      </div>

      <!-- Notes & Audit Trail -->
      <div class="card">
        <h2>Counseling Notes &amp; Audit Log</h2>
        <ul class="timeline" style="max-height:260px; overflow-y:auto; margin-bottom:14px;">
          ${(a.notes || [])
            .slice()
            .reverse()
            .map((n) => `<li><div class="when">${UI.datetime(n.at)} · ${UI.esc(UI.name(n.by))} · <em>${UI.esc(n.type)}</em></div>${UI.esc(n.text)}</li>`)
            .join("")}
        </ul>
        ${
          canEdit
            ? `<form id="noteform">
                <div class="field">
                  <label for="nt-txt">Add Progress Note</label>
                  <textarea id="nt-txt" name="text" placeholder="Record interview notes, university response, or visa updates..." required style="min-height:70px;"></textarea>
                </div>
                <button class="btn btn-primary btn-sm" type="submit">Post Note</button>
              </form>`
            : ""
        }
      </div>
    </div>

    <!-- Documents in this Application -->
    <div class="card">
      <div class="toolbar">
        <h2>Application Checklist &amp; Files (${docs.length})</h2>
        <a class="btn btn-sm btn-ghost" href="#/documents?app=${id}">Open Full Verification Desk →</a>
      </div>
      ${
        docs.length
          ? `<table class="data">
              <thead><tr><th>Document Type</th><th>File</th><th>Status</th><th>Updated</th></tr></thead>
              <tbody>
                ${docs
                  .map((d) => {
                    const file = d.fileUrl
                      ? `<a href="${d.fileUrl}" download="${UI.esc(d.fileName)}">📎 ${UI.esc(d.fileName)}</a>`
                      : UI.esc(d.fileName || "No file uploaded");
                    return `<tr><td><strong>${UI.esc(d.docType)}</strong></td><td>${file}</td><td>${UI.chip(d.status)}</td><td>${UI.date(d.updatedAt)}</td></tr>`;
                  })
                  .join("")}
              </tbody>
            </table>`
          : `<div class="empty">No checklist documents uploaded yet for this application.</div>`
      }
    </div>
  `;

  root.querySelectorAll("[data-stage]").forEach((btn) => {
    btn.onclick = () => {
      const stage = btn.getAttribute("data-stage");
      const notes = [
        ...(a.notes || []),
        { at: new Date().toISOString(), by: Auth.user.id, text: "Application advanced to " + stage + ".", type: "stage" },
      ];
      Store.update("applications", id, { stage, notes, updatedAt: new Date().toISOString() });
      UI.toast(`Application stage updated to: ${stage}`);
      Views.applicationDetail(root, id);
    };
  });

  const edit = root.querySelector("#editapp");
  if (edit)
    edit.onclick = () => {
      const html =
        UI.formFields([
          { name: "targetCountry", label: "Target Country", value: a.targetCountry, required: true },
          { name: "targetUniversity", label: "Target University / Institution", value: a.targetUniversity },
          { name: "targetProgram", label: "Degree / Program", value: a.targetProgram },
          { name: "intake", label: "Preferred Intake", value: a.intake },
          { name: "visaDeadline", label: "Visa Lodgment Deadline", type: "date", value: a.visaDeadline },
          {
            name: "counselorId",
            label: "Assigned Advisor / Counselor",
            type: "select",
            value: a.counselorId,
            options: counselors.map((c) => ({ value: c.id, label: `${c.name} (${c.title || c.role})` })),
          },
        ]) + `<div class="btn-row"><button class="btn btn-primary" type="submit">Save Changes</button><button class="btn btn-ghost" type="button" data-close>Cancel</button></div>`;

      UI.modal("Edit Application Details", `<form id="ef">${html}</form>`, (modal, done) => {
        modal.querySelector("[data-close]").onclick = done;
        modal.querySelector("#ef").onsubmit = (e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          Store.update("applications", id, {
            targetCountry: fd.get("targetCountry").trim(),
            targetUniversity: fd.get("targetUniversity").trim(),
            targetProgram: fd.get("targetProgram").trim(),
            intake: fd.get("intake").trim(),
            visaDeadline: fd.get("visaDeadline"),
            counselorId: fd.get("counselorId"),
            updatedAt: new Date().toISOString(),
          });
          UI.toast("Application details saved.");
          done();
          Views.applicationDetail(root, id);
        };
      });
    };

  const nf = root.querySelector("#noteform");
  if (nf)
    nf.onsubmit = (e) => {
      e.preventDefault();
      const text = new FormData(e.target).get("text").trim();
      if (!text) return;
      const notes = [
        ...(a.notes || []),
        { at: new Date().toISOString(), by: Auth.user.id, text, type: "note" },
      ];
      Store.update("applications", id, { notes, updatedAt: new Date().toISOString() });
      UI.toast("Note added.");
      Views.applicationDetail(root, id);
    };
};

