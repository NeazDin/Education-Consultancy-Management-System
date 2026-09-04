window.Views = window.Views || {};

Views.scores = function (root) {
  const batches = visibleBatches();
  if (!batches.length) {
    root.innerHTML = `<div class="empty">No active IELTS batches assigned to evaluate mock scores for.</div>`;
    return;
  }
  const selected = Views._scBatch || batches[0].id;
  const ens = Store.list("enrollments").filter((e) => e.batchId === selected);
  const scores = Store.list("mockScores")
    .filter((s) => s.batchId === selected)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  const band = (s) => ((s.listening + s.reading + s.writing + s.speaking) / 4).toFixed(1);

  root.innerHTML = `
    <div class="card">
      <div class="field">
        <label for="batch">Select IELTS Batch</label>
        <select id="batch">
          ${batches.map((b) => `<option value="${b.id}" ${b.id === selected ? "selected" : ""}>${UI.esc(b.batchName)} (${UI.esc(b.batchCode || "IEL")})</option>`).join("")}
        </select>
      </div>

      <div class="toolbar" style="margin-top:14px; padding-top:14px; border-top:1px solid var(--line);">
        <div>
          <h3>Record New IELTS Mock Test Score</h3>
          <span class="muted" style="font-size:0.85rem;">Input section scores (0.0 to 9.0 in increments of 0.5)</span>
        </div>
        <div id="live-band-preview" style="font-weight:700; color:var(--primary); font-size:1rem; background:var(--primary-light); padding:4px 14px; border-radius:9999px;">
          Overall Band: 6.0
        </div>
      </div>

      <form id="sf">
        <div class="grid-2">
          <div class="field">
            <label for="sc-student">Enrolled Student</label>
            <select id="sc-student" name="studentId" required>
              ${ens.map((e) => {
                const s = Store.student(e.studentId);
                const classId = e.classStudentId ? ` [${e.classStudentId}]` : "";
                return `<option value="${e.studentId}">${UI.esc(s ? s.name : "Student")}${UI.esc(classId)}</option>`;
              }).join("")}
            </select>
          </div>
          <div class="field">
            <label for="sc-date">Test Date</label>
            <input type="date" id="sc-date" name="date" value="${new Date().toISOString().slice(0, 10)}" required>
          </div>
        </div>

        <div class="grid-2" style="grid-template-columns: repeat(4, 1fr); margin-top:8px;">
          <div class="field">
            <label>Listening (L)</label>
            <input type="number" step="0.5" min="0" max="9" name="listening" value="6.5" required class="band-input">
          </div>
          <div class="field">
            <label>Reading (R)</label>
            <input type="number" step="0.5" min="0" max="9" name="reading" value="6.5" required class="band-input">
          </div>
          <div class="field">
            <label>Writing (W)</label>
            <input type="number" step="0.5" min="0" max="9" name="writing" value="6.0" required class="band-input">
          </div>
          <div class="field">
            <label>Speaking (S)</label>
            <input type="number" step="0.5" min="0" max="9" name="speaking" value="6.0" required class="band-input">
          </div>
        </div>

        <div style="margin-top:14px;">
          <button class="btn btn-primary btn-lg" type="submit" ${!ens.length ? "disabled" : ""}>
            Save Official Mock Score
          </button>
        </div>
      </form>
    </div>

    <div class="card">
      <div class="toolbar">
        <h2>Mock Score History (${scores.length})</h2>
      </div>
      ${
        scores.length
          ? `<table class="data">
              <thead>
                <tr>
                  <th>Class Student ID</th>
                  <th>Student Name</th>
                  <th>Test Date</th>
                  <th>L</th>
                  <th>R</th>
                  <th>W</th>
                  <th>S</th>
                  <th>Overall Band</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${scores
                  .map((s) => {
                    const st = Store.student(s.studentId);
                    const classId = Store.getClassStudentId(s.studentId, selected);
                    const ob = band(s);
                    return `<tr>
                      <td><span class="class-id-badge">${UI.esc(classId)}</span></td>
                      <td><a href="#/students/${s.studentId}"><strong>${UI.esc(st ? st.name : "Student")}</strong></a></td>
                      <td>${UI.date(s.date)}</td>
                      <td><strong>${s.listening}</strong></td>
                      <td><strong>${s.reading}</strong></td>
                      <td><strong>${s.writing}</strong></td>
                      <td><strong>${s.speaking}</strong></td>
                      <td><span class="band-badge ${Number(ob) >= 7 ? "band-high" : "band-mid"}">${ob}</span></td>
                      <td>
                        ${(() => {
                          const u = Store.getUserForStudent(s.studentId);
                          return u ? `<a href="#/messages?to=${u.id}" class="btn btn-sm btn-ghost" title="Direct message student regarding score">✉ Chat</a>` : "";
                        })()}
                      </td>
                    </tr>`;
                  })
                  .join("")}
              </tbody>
            </table>`
          : `<div class="empty">No mock test scores logged for this batch yet.</div>`
      }
    </div>
  `;

  root.querySelector("#batch").onchange = (e) => {
    Views._scBatch = e.target.value;
    Views.scores(root);
  };

  // Live band calculation on inputs
  const form = root.querySelector("#sf");
  const livePreview = root.querySelector("#live-band-preview");
  function updateLiveBand() {
    const l = parseFloat(form.listening.value) || 0;
    const r = parseFloat(form.reading.value) || 0;
    const w = parseFloat(form.writing.value) || 0;
    const s = parseFloat(form.speaking.value) || 0;
    const avg = ((l + r + w + s) / 4).toFixed(1);
    livePreview.textContent = `Overall Band: ${avg}`;
  }

  form.querySelectorAll(".band-input").forEach((inp) => {
    inp.oninput = updateLiveBand;
  });

  form.onsubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    Store.add("mockScores", {
      studentId: fd.get("studentId"),
      batchId: selected,
      listening: Number(fd.get("listening")),
      reading: Number(fd.get("reading")),
      writing: Number(fd.get("writing")),
      speaking: Number(fd.get("speaking")),
      date: fd.get("date"),
    });
    UI.toast("Official mock score saved.");
    Views.scores(root);
  };
};

