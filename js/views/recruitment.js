window.Views = window.Views || {};

(function () {
  const STAGES = [
    { value: "applied", label: "Applied / New" },
    { value: "reviewing", label: "Under Review / Screening" },
    { value: "interview", label: "Interview / Shortlisted" },
    { value: "offered", label: "Offer Extended" },
    { value: "hired", label: "Hired / Onboarded" },
    { value: "rejected", label: "Rejected" },
  ];

  const DEPARTMENTS = ["Counseling", "Faculty", "Marketing", "Admissions", "Finance", "Admin"];

  const POSITIONS = [
    "Senior Study-Abroad Counselor",
    "Study-Abroad Advisor",
    "IELTS Master Trainer & Examiner",
    "Junior IELTS Instructor",
    "Digital Marketing & Student Outreach Officer",
    "Admission Executive",
    "Accounts & Finance Officer",
    "Front Desk & Student Support Executive",
  ];

  function renderRatingStars(rating) {
    const num = Math.max(0, Math.min(5, Number(rating) || 0));
    let stars = "";
    for (let i = 1; i <= 5; i++) {
      stars += `<span style="color:${i <= num ? "#F59E0B" : "#CBD5E1"}; font-size:1.1rem; line-height:1;">★</span>`;
    }
    return `<span class="star-rating" title="${num} out of 5 stars" style="display:inline-flex; align-items:center; gap:1px;">${stars}</span>`;
  }

  function getStageBadge(stage) {
    const s = (stage || "applied").toLowerCase();
    const map = {
      applied: { label: "Applied", cls: "applied" },
      reviewing: { label: "Reviewing", cls: "reviewing" },
      interview: { label: "Interview", cls: "interview" },
      offered: { label: "Offer Extended", cls: "offered" },
      hired: { label: "Hired", cls: "hired" },
      rejected: { label: "Rejected", cls: "rejected" },
    };
    const info = map[s] || { label: s, cls: "applied" };
    return `<span class="chip ${info.cls}">${UI.esc(info.label)}</span>`;
  }

  function getReviewStatusBadge(status) {
    const s = (status || "pending").toLowerCase();
    const map = {
      pending: { label: "CV Pending", cls: "pending" },
      reviewed: { label: "CV Reviewed", cls: "reviewing" },
      shortlisted: { label: "Shortlisted", cls: "shortlisted" },
      rejected: { label: "Not Suitable", cls: "rejected" },
    };
    const info = map[s] || { label: s, cls: "pending" };
    return `<span class="chip ${info.cls}">${UI.esc(info.label)}</span>`;
  }

  // --- Modal: View Full CV & Candidate Profile ---
  function openCvModal(cand, container, query) {
    const s = cand.status || cand.stage || "applied";
    const appliedFormatted = cand.appliedAt ? UI.date(cand.appliedAt) : "Recent";
    const interviewText = cand.interviewDate
      ? `${cand.interviewDate} at ${cand.interviewTime || "TBD"} (${cand.interviewLocation || "Office"})`
      : "Not yet scheduled";

    const bodyHtml = `
      <div class="cv-modal-shell" style="display:flex; flex-direction:column; gap:18px;">
        <!-- Header Info Card -->
        <div style="background:var(--card-alt); padding:16px; border-radius:var(--radius); border-left:4px solid var(--primary); display:flex; justify-content:space-between; flex-wrap:wrap; gap:12px;">
          <div>
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
              <span class="code-badge" style="font-weight:700; background:var(--primary-light); color:var(--primary); font-family:var(--font-mono);">${UI.esc(cand.applicantCode || cand.id)}</span>
              <h3 style="margin:0; font-size:1.15rem;">${UI.esc(cand.name)}</h3>
              ${getStageBadge(s)}
            </div>
            <div style="font-weight:600; color:var(--ink-soft); font-size:0.92rem;">${UI.esc(cand.positionTitle)} · <span class="chip ${cand.department.toLowerCase()}">${UI.esc(cand.department)}</span></div>
            <div style="margin-top:6px; font-size:0.85rem; color:var(--ink-muted);">
              <span>📧 <a href="mailto:${UI.esc(cand.email)}">${UI.esc(cand.email)}</a></span> &nbsp;·&nbsp;
              <span>📞 ${UI.esc(cand.phone || "No phone")}</span> &nbsp;·&nbsp;
              <span>📅 Applied: ${appliedFormatted}</span>
            </div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:0.8rem; color:var(--ink-muted); margin-bottom:2px;">Recruiter Rating</div>
            <div>${renderRatingStars(cand.cvRating || 0)}</div>
            <div style="margin-top:6px;">${getReviewStatusBadge(cand.cvReviewStatus)}</div>
          </div>
        </div>

        <!-- CV Document Preview -->
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <h4 style="margin:0; font-size:0.95rem; color:var(--ink-soft); display:flex; align-items:center; gap:6px;">
              <span>📄 Attached CV / Resume Content</span>
              ${cand.cvFileName ? `<span class="code-badge" style="font-size:0.75rem;">${UI.esc(cand.cvFileName)}</span>` : ""}
            </h4>
            <div class="btn-row" style="gap:6px;">
              <button type="button" class="btn btn-sm btn-ghost" id="btn-print-cv" title="Print or save formatted CV">
                🖨️ Print CV
              </button>
            </div>
          </div>

          <div id="cv-print-area" style="background:#ffffff; border:1px solid var(--line); border-radius:var(--radius); padding:20px; max-height:280px; overflow-y:auto; font-family:'JetBrains Mono', monospace; font-size:0.86rem; line-height:1.65; white-space:pre-wrap; color:#1E293B; box-shadow:inset 0 1px 3px rgba(0,0,0,0.03);">
${UI.esc(cand.cvText || "No plain text CV attached. Check applicant file attachment.")}
          </div>
        </div>

        <!-- Experience & Recruiter Notes Overview -->
        <div class="grid-2" style="gap:14px;">
          <div style="background:var(--paper); padding:12px 14px; border-radius:var(--radius-sm); border:1px solid var(--line);">
            <strong style="font-size:0.82rem; color:var(--ink-muted); text-transform:uppercase;">Experience Summary</strong>
            <p style="margin:4px 0 0 0; font-size:0.88rem;">${UI.esc(cand.experience || "No prior experience noted.")}</p>
          </div>
          <div style="background:var(--paper); padding:12px 14px; border-radius:var(--radius-sm); border:1px solid var(--line);">
            <strong style="font-size:0.82rem; color:var(--ink-muted); text-transform:uppercase;">Interview Details</strong>
            <p style="margin:4px 0 0 0; font-size:0.88rem; color:${cand.interviewDate ? "var(--primary)" : "var(--ink-muted)"}; font-weight:${cand.interviewDate ? "600" : "400"};">
              📅 ${UI.esc(interviewText)}
            </p>
            ${cand.interviewNotes ? `<p style="margin:4px 0 0 0; font-size:0.8rem; color:var(--ink-soft);"><small>Notes: ${UI.esc(cand.interviewNotes)}</small></p>` : ""}
          </div>
        </div>

        <!-- Recruiter Review & Stage Changer -->
        <div style="background:var(--card-alt); padding:16px; border-radius:var(--radius); border:1px solid var(--line);">
          <h4 style="margin:0 0 12px 0; font-size:0.92rem; color:var(--ink-soft);">HR Evaluation &amp; Pipeline Stage</h4>
          <form id="cv-evaluation-form">
            <div class="grid-2" style="gap:12px;">
              <div class="field" style="margin:0;">
                <label>Recruitment Pipeline Stage</label>
                <select id="select-stage" name="stage">
                  ${STAGES.map((st) => `<option value="${st.value}" ${st.value === s ? "selected" : ""}>${st.label}</option>`).join("")}
                </select>
              </div>
              <div class="field" style="margin:0;">
                <label>CV Review Decision</label>
                <select id="select-cv-status" name="cvReviewStatus">
                  <option value="pending" ${cand.cvReviewStatus === "pending" ? "selected" : ""}>Pending Review</option>
                  <option value="reviewed" ${cand.cvReviewStatus === "reviewed" ? "selected" : ""}>Reviewed</option>
                  <option value="shortlisted" ${cand.cvReviewStatus === "shortlisted" ? "selected" : ""}>Shortlisted</option>
                  <option value="rejected" ${cand.cvReviewStatus === "rejected" ? "selected" : ""}>Rejected / Not Suitable</option>
                </select>
              </div>
            </div>

            <div class="grid-2" style="gap:12px; margin-top:10px;">
              <div class="field" style="margin:0;">
                <label>Candidate Rating (1 - 5 Stars)</label>
                <select id="select-rating" name="cvRating">
                  <option value="0" ${cand.cvRating === 0 ? "selected" : ""}>Unrated (0)</option>
                  <option value="1" ${cand.cvRating === 1 ? "selected" : ""}>★☆☆☆☆ (1 Star - Poor)</option>
                  <option value="2" ${cand.cvRating === 2 ? "selected" : ""}>★★☆☆☆ (2 Stars - Below Average)</option>
                  <option value="3" ${cand.cvRating === 3 ? "selected" : ""}>★★★☆☆ (3 Stars - Average)</option>
                  <option value="4" ${cand.cvRating === 4 ? "selected" : ""}>★★★★☆ (4 Stars - Strong Fit)</option>
                  <option value="5" ${cand.cvRating === 5 ? "selected" : ""}>★★★★★ (5 Stars - Exceptional)</option>
                </select>
              </div>
              <div class="field" style="margin:0;">
                <label>Recruiter Evaluation Notes</label>
                <input type="text" name="cvReviewNotes" value="${UI.esc(cand.cvReviewNotes || "")}" placeholder="e.g. Strong Russell Group admissions background...">
              </div>
            </div>

            <div class="btn-row" style="margin-top:14px; justify-content:space-between;">
              <button type="button" class="btn btn-primary" id="btn-change-stage">
                Save Review &amp; Update Stage
              </button>
              <div class="btn-row" style="gap:8px;">
                <button type="button" class="btn btn-ghost" id="btn-quick-schedule">📅 Schedule Interview</button>
                <button type="button" class="btn btn-ghost" data-close>Close</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    `;

    UI.modal(`Candidate File: ${cand.name}`, bodyHtml, (modal, done) => {
      modal.querySelector("[data-close]").onclick = done;

      // Print CV functionality
      const printBtn = modal.querySelector("#btn-print-cv");
      if (printBtn) {
        printBtn.onclick = () => {
          const cvText = cand.cvText || "No CV content available";
          const win = window.open("", "_blank");
          win.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>${cand.name} - CV Preview</title>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1E293B; }
                .header { border-bottom: 2px solid #1E3A8A; padding-bottom: 12px; margin-bottom: 20px; }
                h1 { margin: 0; color: #1E3A8A; }
                .meta { color: #64748B; font-size: 0.95rem; margin-top: 6px; }
                pre { background: #F8FAFC; border: 1px solid #E2E8F0; padding: 20px; border-radius: 8px; font-family: monospace; white-space: pre-wrap; font-size: 14px; line-height: 1.6; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>${cand.name}</h1>
                <div class="meta">Position: ${cand.positionTitle} (${cand.department}) | Code: ${cand.applicantCode || cand.id} | Email: ${cand.email} | Phone: ${cand.phone}</div>
              </div>
              <pre>${cvText}</pre>
            </body>
            </html>
          `);
          win.document.close();
          win.focus();
          setTimeout(() => win.print(), 250);
        };
      }

      // Schedule interview shortcut from inside CV modal
      const schedBtn = modal.querySelector("#btn-quick-schedule");
      if (schedBtn) {
        schedBtn.onclick = () => {
          done();
          openInterviewModal(cand, container, query);
        };
      }

      // Change stage & Save evaluation (matches original snippet format!)
      modal.querySelector("#btn-change-stage").onclick = () => {
        const form = modal.querySelector("#cv-evaluation-form");
        const newStage = modal.querySelector("#select-stage").value;
        const newStatus = modal.querySelector("#select-cv-status").value;
        const newRating = Number(modal.querySelector("#select-rating").value) || 0;
        const newNotes = form.cvReviewNotes.value.trim();

        UI.showLoader({ message: "Updating candidate status..." });
        setTimeout(() => {
          Store.update("candidates", cand.id, {
            stage: newStage,
            status: newStage,
            cvReviewStatus: newStatus,
            cvRating: newRating,
            cvReviewNotes: newNotes,
            updatedAt: new Date().toISOString(),
          });
          UI.toast(`Candidate updated & moved to ${newStage.toUpperCase()}`);
          UI.hideLoader(0);
          done();
          Views.recruitment(container, query);
        }, 600);
      };
    });
  }

  // --- Modal: Quick Stage Changer ---
  function openStageModal(cand, container, query) {
    const currStage = cand.status || cand.stage || "applied";
    const bodyHtml = `
      <div style="padding:10px 0;">
        <p>Current applicant: <strong>${UI.esc(cand.name)}</strong> (${UI.esc(cand.positionTitle)})</p>
        <div class="field" style="margin-top:12px;">
          <label>Select New Pipeline Stage</label>
          <select id="select-stage">
            ${STAGES.map((s) => `<option value="${s.value}" ${s.value === currStage ? "selected" : ""}>${s.label}</option>`).join("")}
          </select>
        </div>
        <div class="btn-row" style="margin-top:20px;">
          <button type="button" class="btn btn-primary" id="btn-change-stage">Update Stage</button>
          <button type="button" class="btn btn-ghost" data-close>Cancel</button>
        </div>
      </div>
    `;

    UI.modal(`Update Stage: ${cand.name}`, bodyHtml, (modal, done) => {
      modal.querySelector("[data-close]").onclick = done;
      modal.querySelector("#btn-change-stage").onclick = () => {
        const newStage = modal.querySelector("#select-stage").value;
        UI.showLoader({ message: "Updating candidate status..." });
        setTimeout(() => {
          Store.update("candidates", cand.id, {
            stage: newStage,
            status: newStage,
            updatedAt: new Date().toISOString(),
          });
          UI.toast(`Candidate moved to ${newStage.toUpperCase()}`);
          UI.hideLoader(0);
          done();
          Views.recruitment(container, query);
        }, 600);
      };
    });
  }

  // --- Modal: Schedule Interview ---
  function openInterviewModal(cand, container, query) {
    const bodyHtml = `
      <form id="interview-form" style="padding:6px 0;">
        <p style="margin-top:0; color:var(--ink-soft);">
          Schedule interview panel for <strong>${UI.esc(cand.name)}</strong> (${UI.esc(cand.positionTitle)}).
        </p>
        <div class="grid-2">
          <div class="field">
            <label>Interview Date</label>
            <input type="date" name="interviewDate" value="${UI.esc(cand.interviewDate || "")}" required>
          </div>
          <div class="field">
            <label>Interview Time</label>
            <input type="text" name="interviewTime" value="${UI.esc(cand.interviewTime || "11:00 AM")}" placeholder="e.g. 10:30 AM" required>
          </div>
        </div>
        <div class="field">
          <label>Location / Room</label>
          <input type="text" name="interviewLocation" value="${UI.esc(cand.interviewLocation || "Conference Room A, Education XYZ BD")}" placeholder="e.g. Conference Room A or Studio A (Demo Lecture)">
        </div>
        <div class="field">
          <label>Interview Panel &amp; Assessment Notes</label>
          <textarea name="interviewNotes" rows="3" placeholder="Panel members, interview focus areas, case studies...">${UI.esc(cand.interviewNotes || "")}</textarea>
        </div>
        <div class="btn-row" style="margin-top:16px;">
          <button type="submit" class="btn btn-primary">Save &amp; Confirm Schedule</button>
          <button type="button" class="btn btn-ghost" data-close>Cancel</button>
        </div>
      </form>
    `;

    UI.modal(`Schedule Interview: ${cand.name}`, bodyHtml, (modal, done) => {
      modal.querySelector("[data-close]").onclick = done;
      modal.querySelector("#interview-form").onsubmit = (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const iDate = fd.get("interviewDate");
        const iTime = fd.get("interviewTime").trim();
        const iLoc = fd.get("interviewLocation").trim();
        const iNotes = fd.get("interviewNotes").trim();

        UI.showLoader({ message: "Scheduling candidate interview..." });
        setTimeout(() => {
          Store.update("candidates", cand.id, {
            interviewDate: iDate,
            interviewTime: iTime,
            interviewLocation: iLoc,
            interviewNotes: iNotes,
            stage: "interview",
            status: "interview",
            cvReviewStatus: cand.cvReviewStatus === "pending" ? "shortlisted" : cand.cvReviewStatus,
            updatedAt: new Date().toISOString(),
          });
          UI.toast(`Interview scheduled for ${cand.name}`);
          UI.hideLoader(0);
          done();
          Views.recruitment(container, query);
        }, 500);
      };
    });
  }

  // --- Modal: Add New Candidate & CV ---
  function openAddCandidateModal(container, query) {
    const bodyHtml = `
      <form id="add-cand-form" style="padding:6px 0;">
        <div class="grid-2">
          <div class="field">
            <label>Candidate Full Name</label>
            <input type="text" name="name" placeholder="e.g. Tariqul Islam" required>
          </div>
          <div class="field">
            <label>Email Address</label>
            <input type="email" name="email" placeholder="name@email.com" required>
          </div>
        </div>
        <div class="grid-2">
          <div class="field">
            <label>Phone Number</label>
            <input type="tel" name="phone" placeholder="+880 1700 000000" required>
          </div>
          <div class="field">
            <label>Department</label>
            <select name="department" id="cand-dept-select">
              ${DEPARTMENTS.map((d) => `<option value="${d}">${d}</option>`).join("")}
            </select>
          </div>
        </div>
        <div class="field">
          <label>Position Applying For</label>
          <input type="text" name="positionTitle" list="position-presets" placeholder="e.g. Senior Study-Abroad Counselor" required>
          <datalist id="position-presets">
            ${POSITIONS.map((p) => `<option value="${p}">`).join("")}
          </datalist>
        </div>
        <div class="field">
          <label>Experience Summary</label>
          <input type="text" name="experience" placeholder="e.g. 3+ years university admissions counseling">
        </div>
        <div class="field">
          <label>Upload CV File (.pdf, .doc, .txt - Max 400 KB)</label>
          <input type="file" name="cvFile" accept=".pdf,.doc,.docx,.txt">
        </div>
        <div class="field">
          <label>Or Paste Full CV / Resume Content (Plain Text)</label>
          <textarea name="cvText" rows="5" placeholder="Education, Qualifications, Employment History, Skills..."></textarea>
        </div>
        <div class="grid-2">
          <div class="field">
            <label>Initial Pipeline Stage</label>
            <select name="stage">
              <option value="applied">Applied / Screening</option>
              <option value="reviewing">Under Review</option>
              <option value="interview">Interview / Shortlisted</option>
            </select>
          </div>
          <div class="field">
            <label>Initial Rating</label>
            <select name="cvRating">
              <option value="0">Unrated (0)</option>
              <option value="3">★★★☆☆ (3 Stars)</option>
              <option value="4">★★★★☆ (4 Stars)</option>
              <option value="5">★★★★★ (5 Stars)</option>
            </select>
          </div>
        </div>
        <div class="btn-row" style="margin-top:20px;">
          <button type="submit" class="btn btn-primary">+ Register Job Candidate</button>
          <button type="button" class="btn btn-ghost" data-close>Cancel</button>
        </div>
      </form>
    `;

    UI.modal("Register New Candidate & CV", bodyHtml, (modal, done) => {
      modal.querySelector("[data-close]").onclick = done;
      modal.querySelector("#add-cand-form").onsubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const name = fd.get("name").trim();
        const email = fd.get("email").trim();
        const phone = fd.get("phone").trim();
        const department = fd.get("department");
        const positionTitle = fd.get("positionTitle").trim();
        const experience = fd.get("experience").trim();
        const stage = fd.get("stage") || "applied";
        const cvRating = Number(fd.get("cvRating")) || 0;
        let cvText = fd.get("cvText").trim();

        const file = e.target.cvFile.files[0];
        let cvFileName = file ? file.name : "";

        if (file && !cvText) {
          try {
            if (file.type === "text/plain" || file.name.endsWith(".txt")) {
              const textContent = await file.text();
              cvText = textContent;
            } else {
              cvText = `CV Document: ${file.name} (${(file.size / 1024).toFixed(1)} KB)\nUploaded for ${name} applying for ${positionTitle}.\n\nExperience:\n${experience || "Attached in file"}`;
            }
          } catch (err) {
            console.warn("Could not read uploaded text:", err);
          }
        }

        if (!cvText) {
          cvText = `${name}\nContact: ${phone} | ${email}\nApplying for: ${positionTitle} (${department})\n\nExperience:\n${experience || "Not provided"}`;
        }

        UI.showLoader({ message: "Registering candidate profile..." });
        setTimeout(() => {
          Store.add("candidates", {
            name,
            email,
            phone,
            positionTitle,
            department,
            experience,
            cvText,
            cvFileName,
            cvReviewStatus: stage === "interview" ? "shortlisted" : "pending",
            cvReviewNotes: "",
            cvRating,
            interviewDate: "",
            interviewTime: "",
            interviewLocation: "",
            interviewNotes: "",
            stage,
            status: stage,
            appliedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          UI.toast(`Candidate ${name} successfully registered.`);
          UI.hideLoader(0);
          done();
          Views.recruitment(container, query);
        }, 500);
      };
    });
  }

  // --- Export Candidates to CSV ---
  function exportCandidatesCsv(candidates) {
    const headers = ["Applicant Code", "Name", "Position", "Department", "Email", "Phone", "Experience", "Stage", "CV Status", "Rating", "Interview Date", "Interview Time", "Applied At"];
    const rows = candidates.map((c) => [
      c.applicantCode || c.id,
      `"${(c.name || "").replace(/"/g, '""')}"`,
      `"${(c.positionTitle || "").replace(/"/g, '""')}"`,
      c.department || "",
      c.email || "",
      c.phone || "",
      `"${(c.experience || "").replace(/"/g, '""')}"`,
      c.status || c.stage || "applied",
      c.cvReviewStatus || "pending",
      c.cvRating || 0,
      c.interviewDate || "",
      c.interviewTime || "",
      c.appliedAt ? c.appliedAt.slice(0, 10) : "",
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `job_candidates_education_xyz_bd_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    UI.toast("Exported candidate records to CSV.");
  }

  // --- Main View Function ---
  Views.recruitment = function (root, query) {
    // Permission check: only admin and hr
    if (!Auth.is("admin", "hr")) {
      root.innerHTML = `
        <div class="card">
          <div class="empty">
            <h3>Access Restricted</h3>
            <p class="muted">Only administrators and HR personnel can access the Recruitment &amp; Candidates module.</p>
            <a href="#/dashboard" class="btn btn-primary btn-sm" style="margin-top:12px;">Return to Dashboard</a>
          </div>
        </div>
      `;
      return;
    }

    const allCandidates = Store.list("candidates") || [];

    // Parse query parameters
    const params = new URLSearchParams(query || "");
    const initialDept = params.get("dept") || Views._recDept || "all";
    const initialStage = params.get("stage") || Views._recStage || "all";
    const initialQ = params.get("q") || Views._recQ || "";
    const initialSort = Views._recSort || "newest";
    const openId = params.get("id");

    Views._recDept = initialDept;
    Views._recStage = initialStage;
    Views._recQ = initialQ;
    Views._recSort = initialSort;

    // Filter list
    let list = [...allCandidates];

    // Search query filter
    if (Views._recQ) {
      const qLower = Views._recQ.toLowerCase().trim();
      list = list.filter((c) => {
        const full = `${c.name} ${c.applicantCode || ""} ${c.email} ${c.phone || ""} ${c.positionTitle} ${c.department} ${c.experience || ""} ${c.cvText || ""}`.toLowerCase();
        return full.includes(qLower);
      });
    }

    // Department filter
    if (Views._recDept && Views._recDept !== "all") {
      list = list.filter((c) => (c.department || "").toLowerCase() === Views._recDept.toLowerCase());
    }

    // Stage filter
    if (Views._recStage && Views._recStage !== "all") {
      list = list.filter((c) => {
        const s = (c.status || c.stage || "applied").toLowerCase();
        return s === Views._recStage.toLowerCase();
      });
    }

    // Sorting
    list.sort((a, b) => {
      if (Views._recSort === "rating") {
        return (b.cvRating || 0) - (a.cvRating || 0);
      }
      if (Views._recSort === "oldest") {
        return new Date(a.appliedAt || 0) - new Date(b.appliedAt || 0);
      }
      if (Views._recSort === "name") {
        return (a.name || "").localeCompare(b.name || "");
      }
      // default: newest
      return new Date(b.appliedAt || 0) - new Date(a.appliedAt || 0);
    });

    // KPI metrics
    const totalCount = allCandidates.length;
    const reviewingCount = allCandidates.filter((c) => {
      const s = (c.status || c.stage || "").toLowerCase();
      return s === "applied" || s === "reviewing";
    }).length;
    const interviewCount = allCandidates.filter((c) => {
      const s = (c.status || c.stage || "").toLowerCase();
      return s === "interview" || c.cvReviewStatus === "shortlisted";
    }).length;
    const hiredCount = allCandidates.filter((c) => {
      const s = (c.status || c.stage || "").toLowerCase();
      return s === "offered" || s === "hired";
    }).length;

    // Render View Shell
    root.innerHTML = `
      <section class="recruitment-hero">
        <div class="recruitment-hero-copy">
          <span class="recruitment-eyebrow">Talent operations workspace</span>
          <h2>Job Candidates &amp; CVs</h2>
          <p>Move promising applicants from first review to a confident hiring decision with one focused pipeline.</p>
          <div class="recruitment-hero-meta"><span>● ${totalCount} active records</span><span>↗ ${interviewCount} interview-ready</span><span>✓ ${hiredCount} offers or hires</span></div>
        </div>
        <div class="recruitment-hero-mark" aria-hidden="true"><span>CV</span><strong>+</strong></div>
        <div class="recruitment-hero-actions">
          <button type="button" class="btn btn-light btn-sm" id="btn-add-cand">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            + Register Candidate / CV
          </button>
          <button type="button" class="btn btn-hero-ghost btn-sm" id="btn-export-csv" title="Export current list to CSV">
            📥 Export CSV
          </button>
        </div>
      </section>

      <!-- KPI Metrics Cards -->
      <div class="metrics-grid recruitment-metrics" style="margin-bottom:20px;">
        <div class="metric-card">
          <div class="metric-top">
            <div class="metric-icon" style="background:var(--primary-light); color:var(--primary);">👥</div>
            <span class="badge badge-primary">Total Pool</span>
          </div>
          <div class="metric-value">${totalCount}</div>
          <div class="metric-label">Registered Job Candidates</div>
        </div>

        <div class="metric-card">
          <div class="metric-top">
            <div class="metric-icon" style="background:#E0F2FE; color:#0284C7;">🔍</div>
            <span class="badge badge-info">Screening</span>
          </div>
          <div class="metric-value">${reviewingCount}</div>
          <div class="metric-label">In Initial CV Review</div>
        </div>

        <div class="metric-card">
          <div class="metric-top">
            <div class="metric-icon" style="background:#FEF3C7; color:#D97706;">📅</div>
            <span class="badge badge-warning">Shortlisted</span>
          </div>
          <div class="metric-value">${interviewCount}</div>
          <div class="metric-label">Interview &amp; Demos Scheduled</div>
        </div>

        <div class="metric-card">
          <div class="metric-top">
            <div class="metric-icon" style="background:#DCFCE7; color:#15803D;">🎯</div>
            <span class="badge badge-success">Selected</span>
          </div>
          <div class="metric-value">${hiredCount}</div>
          <div class="metric-label">Offers &amp; Hired Personnel</div>
        </div>
      </div>

      <!-- Search and Filter Controls -->
      <div class="card recruitment-filter-panel" style="margin-bottom:18px;">
        <div style="display:flex; flex-wrap:wrap; gap:12px; justify-content:space-between; align-items:center;">
          <div style="display:flex; flex-wrap:wrap; gap:10px; flex:1; min-width:280px;">
            <input type="text" id="rec-search" class="search" placeholder="Search by name, applicant code, email, role, skills..." value="${UI.esc(Views._recQ)}" style="min-width:240px; flex:1;">
            
            <select id="filter-stage" style="width:auto; padding:6px 12px;">
              <option value="all" ${Views._recStage === "all" ? "selected" : ""}>All Stages (${allCandidates.length})</option>
              ${STAGES.map((st) => `<option value="${st.value}" ${st.value === Views._recStage ? "selected" : ""}>${st.label}</option>`).join("")}
            </select>

            <select id="sort-candidates" style="width:auto; padding:6px 12px;">
              <option value="newest" ${Views._recSort === "newest" ? "selected" : ""}>Sort: Newest Applied</option>
              <option value="oldest" ${Views._recSort === "oldest" ? "selected" : ""}>Sort: Oldest Applied</option>
              <option value="rating" ${Views._recSort === "rating" ? "selected" : ""}>Sort: Highest Rating</option>
              <option value="name" ${Views._recSort === "name" ? "selected" : ""}>Sort: Name (A-Z)</option>
            </select>
          </div>
        </div>

        <!-- Department Pills Filter -->
        <div class="picker-role-pills" id="dept-pills" style="margin-top:14px; margin-bottom:0;">
          <button type="button" class="picker-pill ${Views._recDept === "all" ? "active" : ""}" data-dept="all">
            All Departments (${allCandidates.length})
          </button>
          ${DEPARTMENTS.map((d) => {
            const cnt = allCandidates.filter((c) => (c.department || "").toLowerCase() === d.toLowerCase()).length;
            return `<button type="button" class="picker-pill ${Views._recDept.toLowerCase() === d.toLowerCase() ? "active" : ""}" data-dept="${d}">${d} (${cnt})</button>`;
          }).join("")}
        </div>
      </div>

      <!-- Candidate Roster Table -->
      <div class="card recruitment-roster-card">
        <div class="toolbar" style="margin-bottom:12px;">
          <div>
            <span class="section-kicker">Pipeline roster</span>
            <h3>Candidate Directory <span class="muted">(${list.length} records)</span></h3>
            ${Views._recQ || Views._recDept !== "all" || Views._recStage !== "all" ? `<span class="muted" style="font-size:0.85rem;">Filtered results &nbsp;·&nbsp; <a href="javascript:void(0)" id="btn-clear-filters">Reset Filters</a></span>` : ""}
          </div>
        </div>

        ${
          list.length
            ? `
          <table class="data">
            <thead>
              <tr>
                <th>Applicant Code &amp; Name</th>
                <th>Target Position &amp; Dept</th>
                <th>Experience &amp; Skills</th>
                <th>CV Status &amp; Rating</th>
                <th>Interview Schedule</th>
                <th>Pipeline Stage</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${list
                .map((cand) => {
                  const s = cand.status || cand.stage || "applied";
                  const ratingStars = renderRatingStars(cand.cvRating || 0);
                  const interviewBadge = cand.interviewDate
                    ? `<span style="font-size:0.82rem; font-weight:600; color:var(--primary); background:var(--primary-light); padding:3px 8px; border-radius:4px; display:inline-block; border:1px solid var(--primary-border);">📅 ${UI.esc(cand.interviewDate)}<br><small>${UI.esc(cand.interviewTime || "")}</small></span>`
                    : `<span class="muted" style="font-size:0.8rem;">Not Scheduled</span>`;

                  return `
                    <tr data-id="${cand.id}">
                      <td>
                        <span class="code-badge" style="font-size:0.75rem; font-weight:700; background:var(--primary-light); color:var(--primary); font-family:var(--font-mono);">${UI.esc(cand.applicantCode || cand.id)}</span>
                        <div style="font-weight:700; margin-top:2px;">
                          <a href="javascript:void(0)" class="view-cv-link" data-id="${cand.id}">${UI.esc(cand.name)}</a>
                        </div>
                        <div class="muted" style="font-size:0.8rem;">
                          ${UI.esc(cand.email)}
                          ${cand.phone ? `<br>📞 ${UI.esc(cand.phone)}` : ""}
                        </div>
                      </td>
                      <td>
                        <strong>${UI.esc(cand.positionTitle)}</strong>
                        <br><span class="chip ${cand.department ? cand.department.toLowerCase() : "applied"}">${UI.esc(cand.department || "General")}</span>
                      </td>
                      <td style="max-width:220px;">
                        <div style="font-size:0.85rem;">${UI.esc(cand.experience || "—")}</div>
                        ${cand.cvFileName ? `<small class="muted" style="display:inline-flex; align-items:center; gap:3px; margin-top:3px;">📎 ${UI.esc(cand.cvFileName)}</small>` : ""}
                      </td>
                      <td>
                        <div>${ratingStars}</div>
                        <div style="margin-top:4px;">${getReviewStatusBadge(cand.cvReviewStatus)}</div>
                      </td>
                      <td>
                        ${interviewBadge}
                      </td>
                      <td>
                        ${getStageBadge(s)}
                      </td>
                      <td>
                        <div class="btn-row" style="gap:4px; flex-wrap:nowrap;">
                          <button type="button" class="btn btn-sm btn-primary btn-open-cv" data-id="${cand.id}" title="View full CV &amp; evaluate candidate">
                            📄 CV
                          </button>
                          <button type="button" class="btn btn-sm btn-ghost btn-sched" data-id="${cand.id}" title="Schedule or edit interview date">
                            📅
                          </button>
                          <button type="button" class="btn btn-sm btn-ghost btn-stage" data-id="${cand.id}" title="Change candidate stage">
                            ⚡
                          </button>
                          <button type="button" class="btn btn-sm btn-danger btn-del" data-id="${cand.id}" title="Delete candidate record">
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  `;
                })
                .join("")}
            </tbody>
          </table>
        `
            : `
          <div class="empty" style="padding:40px 20px;">
            <h3>No job candidates found</h3>
            <p class="muted">No candidate records matched your search filters. Try adjusting your query or register a new applicant.</p>
            <button type="button" class="btn btn-primary btn-sm" id="btn-empty-add">+ Register Candidate</button>
          </div>
        `
        }
      </div>
    `;

    // Bind Event Listeners

    // Add candidate buttons
    const btnAdd = root.querySelector("#btn-add-cand");
    if (btnAdd) btnAdd.onclick = () => openAddCandidateModal(root, query);

    const btnEmptyAdd = root.querySelector("#btn-empty-add");
    if (btnEmptyAdd) btnEmptyAdd.onclick = () => openAddCandidateModal(root, query);

    // Export CSV button
    const btnExport = root.querySelector("#btn-export-csv");
    if (btnExport) btnExport.onclick = () => exportCandidatesCsv(list);

    // Live search input
    const searchInput = root.querySelector("#rec-search");
    if (searchInput) {
      let debounceTimer = null;
      searchInput.oninput = (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          Views._recQ = e.target.value;
          Views.recruitment(root, query);
        }, 250);
      };
    }

    // Stage dropdown filter
    const stageSelect = root.querySelector("#filter-stage");
    if (stageSelect) {
      stageSelect.onchange = (e) => {
        Views._recStage = e.target.value;
        Views.recruitment(root, query);
      };
    }

    // Sort dropdown
    const sortSelect = root.querySelector("#sort-candidates");
    if (sortSelect) {
      sortSelect.onchange = (e) => {
        Views._recSort = e.target.value;
        Views.recruitment(root, query);
      };
    }

    // Department pills
    root.querySelectorAll("#dept-pills button").forEach((btn) => {
      btn.onclick = () => {
        Views._recDept = btn.dataset.dept;
        Views.recruitment(root, query);
      };
    });

    // Clear filters link
    const clearBtn = root.querySelector("#btn-clear-filters");
    if (clearBtn) {
      clearBtn.onclick = () => {
        Views._recQ = "";
        Views._recDept = "all";
        Views._recStage = "all";
        Views._recSort = "newest";
        Views.recruitment(root, "");
      };
    }

    // Row Actions: View CV
    root.querySelectorAll(".btn-open-cv, .view-cv-link").forEach((el) => {
      el.onclick = () => {
        const id = el.dataset.id;
        const cand = Store.get("candidates", id);
        if (cand) openCvModal(cand, root, query);
      };
    });

    // Row Actions: Schedule Interview
    root.querySelectorAll(".btn-sched").forEach((btn) => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        const cand = Store.get("candidates", id);
        if (cand) openInterviewModal(cand, root, query);
      };
    });

    // Row Actions: Quick Change Stage
    root.querySelectorAll(".btn-stage").forEach((btn) => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        const cand = Store.get("candidates", id);
        if (cand) openStageModal(cand, root, query);
      };
    });

    // Row Actions: Delete Candidate
    root.querySelectorAll(".btn-del").forEach((btn) => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        const cand = Store.get("candidates", id);
        if (!cand) return;

        UI.confirm({
          title: "Delete Candidate Record",
          message: `Are you sure you want to permanently remove candidate "${cand.name}" (${cand.applicantCode || cand.id})? This action cannot be undone.`,
          confirmText: "Delete Candidate",
          isDanger: true,
          onConfirm: () => {
            Store.remove("candidates", id);
            UI.toast(`Candidate ${cand.name} deleted.`);
            Views.recruitment(root, query);
          },
        });
      };
    });

    // Auto-open specific candidate if query param 'id' was passed
    if (openId) {
      const target = Store.get("candidates", openId);
      if (target) {
        setTimeout(() => openCvModal(target, root, query), 50);
      }
    }
  };
})();