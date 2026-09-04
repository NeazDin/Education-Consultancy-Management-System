window.Views = window.Views || {};

(function () {
  const LEAD_STATUSES = [
    { value: "new", label: "New Lead" },
    { value: "contacted", label: "Contacted" },
    { value: "qualified", label: "Qualified" },
    { value: "converted", label: "Converted" },
    { value: "lost", label: "Not Proceeding" },
  ];

  const SOURCES = ["Facebook Campaign", "Education Fair", "Website Inquiry", "Walk-in", "Referral", "Campus Seminar", "WhatsApp / Phone"];

  function statusChip(status) {
    const item = LEAD_STATUSES.find((option) => option.value === status) || LEAD_STATUSES[0];
    return `<span class="chip ${status === "converted" ? "approved" : status === "lost" ? "rejected" : status === "qualified" ? "shortlisted" : status === "contacted" ? "reviewing" : "applied"}">${item.label}</span>`;
  }

  function assignedLabel(id) {
    const user = Store.user(id);
    return user ? user.name : "Unassigned";
  }

  Views.leads = function (root) {
    if (!Auth.is("admin", "branch_manager", "marketing", "front_desk", "admission_officer")) {
      root.innerHTML = `<div class="empty">This lead workspace is available to Marketing, Front Desk, Admissions, and management.</div>`;
      return;
    }

    const leads = Store.list("leads") || [];
    const stats = {
      total: leads.length,
      new: leads.filter((lead) => lead.status === "new").length,
      qualified: leads.filter((lead) => lead.status === "qualified").length,
      converted: leads.filter((lead) => lead.status === "converted").length,
    };
    const canGenerate = Auth.is("admin", "branch_manager", "marketing", "front_desk");
    const assignmentOptions = Store.list("users").filter((user) => ["admission_officer", "front_desk"].includes(user.role));

    root.innerHTML = `
      <section class="leads-hero">
        <div><span class="leads-eyebrow">Student acquisition workspace</span><h2>Leads &amp; Enquiries</h2><p>Capture interest from campaigns, fairs, walk-ins, and referrals, then hand every opportunity to the right student-service team.</p></div>
        <div class="leads-hero-mark">LEAD<br><small>TO ENROLLMENT</small></div>
        ${canGenerate ? `<button type="button" class="btn btn-light btn-sm" id="btn-generate-lead">+ Generate New Lead</button>` : ""}
      </section>

      <div class="stats role-stats">
        <div class="stat"><div class="label">Lead Pool</div><div class="value">${stats.total}</div><div class="meta">All captured enquiries</div></div>
        <div class="stat"><div class="label">Needs First Contact</div><div class="value" style="color:var(--accent);">${stats.new}</div><div class="meta">Ready for Front Desk follow-up</div></div>
        <div class="stat"><div class="label">Qualified Prospects</div><div class="value" style="color:var(--warning);">${stats.qualified}</div><div class="meta">Ready for Admissions</div></div>
        <div class="stat"><div class="label">Converted</div><div class="value" style="color:var(--success);">${stats.converted}</div><div class="meta">Moved into the student journey</div></div>
      </div>

      <div class="card leads-toolbar-card">
        <div class="leads-filter-row"><input id="lead-search" class="search" type="search" placeholder="Search name, phone, destination, or source..."><div class="leads-filter-buttons" id="lead-status-filters"><button class="picker-pill active" data-status="all">All (${stats.total})</button>${LEAD_STATUSES.map((item) => `<button class="picker-pill" data-status="${item.value}">${item.label}</button>`).join("")}</div></div>
      </div>

      <div class="card leads-table-card"><div class="toolbar"><div><div class="section-kicker">Shared handoff queue</div><h2>Marketing → Front Desk → Admissions</h2><p class="muted" style="margin:0;">Every new lead can be assigned to a receptionist or admission officer.</p></div>${canGenerate ? `<button class="btn btn-primary btn-sm" id="btn-generate-lead-secondary">Generate Lead</button>` : ""}</div>
        <div class="table-responsive"><table class="data"><thead><tr><th>Lead</th><th>Interest</th><th>Source</th><th>Status</th><th>Owner</th><th>Next action</th></tr></thead><tbody id="leads-table-body"></tbody></table></div>
      </div>
    `;

    function renderRows(statusFilter = "all", query = "") {
      const normalizedQuery = query.toLowerCase().trim();
      const visible = leads.filter((lead) => {
        if (statusFilter !== "all" && lead.status !== statusFilter) return false;
        const text = `${lead.name} ${lead.phone} ${lead.email} ${lead.targetCountry} ${lead.source}`.toLowerCase();
        return !normalizedQuery || text.includes(normalizedQuery);
      });
      const body = root.querySelector("#leads-table-body");
      body.innerHTML = visible.length ? visible.map((lead) => `<tr><td><strong>${UI.esc(lead.name)}</strong><br><small class="muted">${UI.esc(lead.email)} · ${UI.esc(lead.phone)}</small></td><td>${UI.esc(lead.interestType || "Study Abroad")}<br><small class="muted">${UI.esc(lead.targetCountry || "Undecided")}</small></td><td>${UI.esc(lead.source || "Website Inquiry")}</td><td>${statusChip(lead.status)}</td><td>${UI.esc(assignedLabel(lead.assignedTo))}</td><td><button class="btn btn-sm btn-ghost lead-edit-btn" data-id="${UI.esc(lead.id)}">Update</button></td></tr>`).join("") : `<tr><td colspan="6"><div class="empty">No leads match this view.</div></td></tr>`;
      body.querySelectorAll(".lead-edit-btn").forEach((button) => { button.onclick = () => openLeadEditor(Store.get("leads", button.dataset.id)); });
    }

    let activeStatus = "all";
    renderRows();
    root.querySelector("#lead-search").oninput = (event) => renderRows(activeStatus, event.target.value);
    root.querySelectorAll("#lead-status-filters [data-status]").forEach((button) => {
      button.onclick = () => { activeStatus = button.dataset.status; root.querySelectorAll("#lead-status-filters .picker-pill").forEach((pill) => pill.classList.remove("active")); button.classList.add("active"); renderRows(activeStatus, root.querySelector("#lead-search").value); };
    });
    [root.querySelector("#btn-generate-lead"), root.querySelector("#btn-generate-lead-secondary")].forEach((button) => { if (button) button.onclick = () => openLeadEditor(null); });

    const handoffStudentId = new URLSearchParams((location.hash.split("?")[1] || "")).get("handoff");
    if (handoffStudentId) {
      const handoffLead = leads.find((lead) => lead.studentId === handoffStudentId);
      if (handoffLead) setTimeout(() => openLeadEditor(handoffLead), 50);
    }

    function openLeadEditor(lead) {
      const form = `
        <form id="lead-form">
          ${UI.formFields([{ name: "name", label: "Prospective Student Name", value: lead?.name || "", required: true }, { name: "email", label: "Email Address", value: lead?.email || "", required: true }, { name: "phone", label: "Phone / WhatsApp", value: lead?.phone || "", required: true }, { name: "targetCountry", label: "Target Destination", value: lead?.targetCountry || "United Kingdom" }, { name: "interestType", label: "Interest", type: "select", value: lead?.interestType || "study-abroad", options: [{ value: "study-abroad", label: "Study Abroad Counseling" }, { value: "IELTS", label: "IELTS Preparation" }, { value: "both", label: "Study Abroad + IELTS" }] }, { name: "source", label: "Lead Source", type: "select", value: lead?.source || "Facebook Campaign", options: SOURCES }])}
          <div class="field"><label>Assign to Team</label><select name="assignedTo"><option value="">Unassigned</option>${assignmentOptions.map((user) => `<option value="${user.id}" ${lead?.assignedTo === user.id ? "selected" : ""}>${UI.esc(user.name)} · ${user.role === "front_desk" ? "Front Desk" : "Admissions"}</option>`).join("")}</select></div>
          <div class="field"><label>Pipeline Status</label><select name="status">${LEAD_STATUSES.map((item) => `<option value="${item.value}" ${(lead?.status || "new") === item.value ? "selected" : ""}>${item.label}</option>`).join("")}</select></div>
          <div class="field"><label>Follow-up Note</label><textarea name="notes" rows="3" placeholder="What should the next team member know?">${UI.esc(lead?.notes || "")}</textarea></div>
          <div class="btn-row"><button class="btn btn-primary" type="submit">${lead ? "Save Lead Update" : "Create Lead"}</button><button class="btn btn-ghost" type="button" data-close>Cancel</button></div>
        </form>`;
      UI.modal(lead ? "Update Lead Handoff" : "Generate New Student Lead", form, (modal, done) => {
        modal.querySelector("[data-close]").onclick = done;
        modal.querySelector("#lead-form").onsubmit = (event) => { event.preventDefault(); const data = Object.fromEntries(new FormData(event.target).entries()); if (lead) Store.update("leads", lead.id, { ...data, updatedAt: new Date().toISOString() }); else Store.add("leads", { ...data, status: data.status || "new", createdAt: new Date().toISOString(), createdBy: Auth.user.id }); done(); UI.toast(lead ? "Lead updated and shared with the assigned team." : "New lead added to the handoff queue."); Views.leads(root); };
      });
    }
  };
})();
