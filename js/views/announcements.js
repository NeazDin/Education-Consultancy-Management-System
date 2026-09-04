window.Views = window.Views || {};

Views.announcements = function (root) {
  if (!Auth.is("admin", "hr")) {
    root.innerHTML = `<div class="empty">Access restricted: Only administrators and HR personnel can create and manage official announcements.</div>`;
    return;
  }

  const list = Store.list("announcements") || [];
  const activeCount = list.filter((a) => a.isActive).length;
  const classCancelCount = list.filter((a) => a.category === "class_cancel").length;
  const popupCount = list.filter((a) => a.isActive && a.popOnDashboard !== false).length;

  root.innerHTML = `
    <div class="view-header">
      <div>
        <h2>Broadcast Announcements &amp; Notices</h2>
        <p>Publish emergency alerts, class cancellations with specific dates, and official notices that pop up on all user dashboards.</p>
      </div>
      <div class="btn-row">
        <button class="btn btn-primary" id="btn-create-announcement" type="button">+ Write New Announcement</button>
        <button class="btn btn-ghost" id="btn-preview-latest" type="button" ${list.length ? "" : "disabled"}>👁️ Preview Active Popup</button>
      </div>
    </div>

    <!-- Announcement Metrics -->
    <div class="stats">
      <div class="stat">
        <div class="label">Total Published</div>
        <div class="value">${list.length}</div>
        <div class="meta">Recorded announcements</div>
      </div>
      <div class="stat">
        <div class="label">Active Broadcasts</div>
        <div class="value" style="color:var(--accent);">${activeCount}</div>
        <div class="meta">Currently live across portal</div>
      </div>
      <div class="stat">
        <div class="label">Class Cancellations</div>
        <div class="value" style="color:${classCancelCount ? 'var(--danger)' : 'var(--ink)'};">${classCancelCount}</div>
        <div class="meta">Class schedule notices</div>
      </div>
      <div class="stat">
        <div class="label">Dashboard Popups Live</div>
        <div class="value" style="color:${popupCount ? 'var(--success)' : 'var(--ink-muted)'};">${popupCount}</div>
        <div class="meta">Auto-displays on user login</div>
      </div>
    </div>

    <!-- Announcements Ledger Table -->
    <div class="card">
      <div class="toolbar">
        <div>
          <h2>All Office Announcements</h2>
          <p class="muted" style="margin:0; font-size:0.86rem;">
            Announcements marked as <strong>Popup</strong> appear as an alert dialog immediately when any user visits their dashboard.
          </p>
        </div>
      </div>

      ${
        list.length
          ? `<table class="data">
              <thead>
                <tr>
                  <th>Priority &amp; Type</th>
                  <th>Announcement Title</th>
                  <th>Cancellation / Event Date</th>
                  <th>Audience</th>
                  <th>Popup Status</th>
                  <th>Live Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${list
                  .slice()
                  .reverse()
                  .map((a) => {
                    const isCancel = a.category === "class_cancel";
                    const isUrgent = a.priority === "urgent";
                    const typeLabel = isCancel ? "Class Cancel" : a.category === "holiday" ? "Holiday" : a.category === "exam" ? "Exam Update" : "Notice";
                    const pillClass = isCancel || isUrgent ? "badge-danger" : "badge-warning";
                    const dateFormatted = a.effectiveDate ? UI.date(a.effectiveDate) : "—";
                    return `
                      <tr>
                        <td>
                          <span class="badge ${pillClass}" style="font-size:0.75rem; text-transform:uppercase; font-weight:700;">
                            ${isCancel ? "🚨 " : "📢 "}${typeLabel}
                          </span>
                        </td>
                        <td>
                          <strong style="color:var(--ink);">${UI.esc(a.title)}</strong>
                          ${a.affectedBatch ? `<br><small class="muted">Batch: ${UI.esc(a.affectedBatch)}</small>` : ""}
                        </td>
                        <td>
                          ${a.effectiveDate ? `<strong style="color:${isCancel ? 'var(--danger)' : 'var(--primary)'}; font-family:var(--font-mono); font-size:0.86rem;">${dateFormatted}</strong>` : `<span class="muted">—</span>`}
                        </td>
                        <td>
                          <span class="chip ${a.targetAudience === 'all' ? 'applied' : 'approved'}">
                            ${a.targetAudience === 'all' ? 'All Users' : a.targetAudience === 'students' ? 'Students' : 'Staff Only'}
                          </span>
                        </td>
                        <td>
                          ${a.popOnDashboard !== false ? `<span class="chip approved" style="font-size:0.75rem;">✓ Popup Active</span>` : `<span class="muted" style="font-size:0.78rem;">Banner Only</span>`}
                        </td>
                        <td>
                          <button type="button" class="btn btn-sm ${a.isActive ? 'btn-ghost' : 'btn-ghost'}" data-toggle-status="${a.id}" style="${a.isActive ? 'color:var(--success); border-color:#86EFAC;' : 'color:var(--ink-muted);'}">
                            ${a.isActive ? "● Active" : "○ Inactive"}
                          </button>
                        </td>
                        <td>
                          <div class="btn-row" style="gap:6px;">
                            <button type="button" class="btn btn-sm btn-ghost" data-preview-id="${a.id}" title="Test Popup Preview">👁️</button>
                            <button type="button" class="btn btn-sm btn-ghost" data-edit-id="${a.id}">Edit</button>
                            <button type="button" class="btn btn-sm btn-danger" data-delete-id="${a.id}">Delete</button>
                          </div>
                        </td>
                      </tr>
                    `;
                  })
                  .join("")}
              </tbody>
            </table>`
          : `<div class="empty">No announcements published yet. Click "+ Write New Announcement" above to post a class cancellation or broadcast notice.</div>`
      }
    </div>
  `;

  // Attach Handlers
  const openFormModal = (existing = null) => {
    const isEdit = !!existing;
    const initialCategory = existing ? existing.category : "class_cancel";
    const initialTitle = existing ? existing.title : "Class Cancellation Notice";
    const initialDate = existing ? existing.effectiveDate : "";
    const initialBatch = existing ? existing.affectedBatch || "" : "All IELTS Batches";
    const initialAudience = existing ? existing.targetAudience : "all";
    const initialPriority = existing ? existing.priority : "urgent";
    const initialMessage = existing ? existing.message : "";
    const initialPopup = existing ? existing.popOnDashboard !== false : true;
    const initialActive = existing ? existing.isActive !== false : true;

    const formHtml = `
      <form id="announcement-form">
        <!-- Quick Template Buttons -->
        <div style="margin-bottom:16px;">
          <label style="display:block; font-size:0.8rem; font-weight:700; text-transform:uppercase; color:var(--ink-soft); margin-bottom:6px;">
            1-Click Quick Templates:
          </label>
          <div class="template-picker-row">
            <button type="button" class="template-btn-pill" id="tpl-class-cancel">🚨 Class Cancellation with Date</button>
            <button type="button" class="template-btn-pill" id="tpl-holiday">🏛️ Holiday &amp; Office Closure</button>
            <button type="button" class="template-btn-pill" id="tpl-mock-exam">📝 IELTS Mock Exam Reschedule</button>
            <button type="button" class="template-btn-pill" id="tpl-urgent-alert">⚠️ Emergency Broadcast Alert</button>
          </div>
        </div>

        <div class="grid-2">
          <div class="field">
            <label>Announcement Category / Type</label>
            <select name="category" id="anc-category" required>
              <option value="class_cancel" ${initialCategory === "class_cancel" ? "selected" : ""}>Class Cancellation (with Date)</option>
              <option value="urgent" ${initialCategory === "urgent" ? "selected" : ""}>Urgent Broadcast Notice</option>
              <option value="holiday" ${initialCategory === "holiday" ? "selected" : ""}>Holiday &amp; Center Closure</option>
              <option value="exam" ${initialCategory === "exam" ? "selected" : ""}>Mock Test &amp; Exam Schedule</option>
              <option value="general" ${initialCategory === "general" ? "selected" : ""}>General Announcement</option>
            </select>
          </div>
          <div class="field">
            <label>Priority Alert Level</label>
            <select name="priority" id="anc-priority" required>
              <option value="urgent" ${initialPriority === "urgent" ? "selected" : ""}>🚨 Urgent Alert (Red Glow)</option>
              <option value="normal" ${initialPriority === "normal" ? "selected" : ""}>📢 Important Notice (Blue)</option>
            </select>
          </div>
        </div>

        <div class="field">
          <label>Announcement Headline / Title</label>
          <input type="text" name="title" id="anc-title" value="${UI.esc(initialTitle)}" placeholder="e.g. Class Cancelled: IELTS Regular & Weekend Batches" required>
        </div>

        <div class="grid-2">
          <div class="field">
            <label id="lbl-effective-date">Class Cancellation / Effective Date</label>
            <input type="date" name="effectiveDate" id="anc-date" value="${UI.esc(initialDate)}" required>
          </div>
          <div class="field">
            <label>Affected Batches / Cohorts (Optional)</label>
            <input type="text" name="affectedBatch" id="anc-batch" value="${UI.esc(initialBatch)}" placeholder="e.g. All IELTS Batches or Batch 01 (Evening)">
          </div>
        </div>

        <div class="grid-2">
          <div class="field">
            <label>Target Audience</label>
            <select name="targetAudience" id="anc-audience" required>
              <option value="all" ${initialAudience === "all" ? "selected" : ""}>All Users (Students &amp; All Staff)</option>
              <option value="students" ${initialAudience === "students" ? "selected" : ""}>Students Only</option>
              <option value="staff" ${initialAudience === "staff" ? "selected" : ""}>Office Staff Only</option>
              <option value="admission_officer" ${initialAudience === "admission_officer" ? "selected" : ""}>Admissions Officers Only</option>
              <option value="counselor" ${initialAudience === "counselor" ? "selected" : ""}>Counselors Only</option>
              <option value="instructor" ${initialAudience === "instructor" ? "selected" : ""}>Instructors Only</option>
            </select>
          </div>
          <div class="field" style="display:flex; flex-direction:column; justify-content:center; gap:8px;">
            <label class="check-label" style="font-weight:600;">
              <input type="checkbox" name="popOnDashboard" id="anc-popup" ${initialPopup ? "checked" : ""}>
              Enable Dashboard Popup (Auto-opens on login)
            </label>
            <label class="check-label" style="font-weight:600;">
              <input type="checkbox" name="isActive" id="anc-active" ${initialActive ? "checked" : ""}>
              Active Status (Published live)
            </label>
          </div>
        </div>

        <div class="field">
          <label>Announcement Message &amp; Details</label>
          <textarea name="message" id="anc-message" rows="5" placeholder="Write full details, reason for cancellation, makeup class reschedule, or instructions for students and staff..." required>${UI.esc(initialMessage)}</textarea>
        </div>

        <div class="btn-row" style="margin-top:20px;">
          <button class="btn btn-primary" type="submit">${isEdit ? "Update &amp; Re-Broadcast Announcement" : "Publish Announcement Now →"}</button>
          <button class="btn btn-ghost" type="button" data-close>Cancel</button>
        </div>
      </form>
    `;

    UI.modal(isEdit ? "Edit Broadcast Announcement" : "Write Official Announcement", formHtml, (modal, done) => {
      modal.querySelector("[data-close]").onclick = done;

      // Quick Templates Interactivity
      const tplClassCancel = modal.querySelector("#tpl-class-cancel");
      const tplHoliday = modal.querySelector("#tpl-holiday");
      const tplMockExam = modal.querySelector("#tpl-mock-exam");
      const tplUrgentAlert = modal.querySelector("#tpl-urgent-alert");

      const titleInput = modal.querySelector("#anc-title");
      const categorySelect = modal.querySelector("#anc-category");
      const prioritySelect = modal.querySelector("#anc-priority");
      const dateInput = modal.querySelector("#anc-date");
      const batchInput = modal.querySelector("#anc-batch");
      const msgInput = modal.querySelector("#anc-message");

      if (tplClassCancel) {
        tplClassCancel.onclick = () => {
          categorySelect.value = "class_cancel";
          prioritySelect.value = "urgent";
          titleInput.value = "Notice: Class Cancelled with Rescheduled Date";
          batchInput.value = "All IELTS Batches (Evening & Weekend)";
          
          // Set default next Saturday date
          const nextDate = new Date();
          nextDate.setDate(nextDate.getDate() + ((6 - nextDate.getDay() + 7) % 7 || 7));
          dateInput.value = nextDate.toISOString().split("T")[0];

          msgInput.value = `Please note that all IELTS classes scheduled for ${UI.date(dateInput.value)} are cancelled due to center maintenance and official test facility setup.\n\nAll missed sessions will be compensated with an extended makeup class session. Please check your student portal for updated schedule announcements or contact the helpdesk at 01781-827022.`;
          UI.toast("Applied Class Cancellation template!");
        };
      }

      if (tplHoliday) {
        tplHoliday.onclick = () => {
          categorySelect.value = "holiday";
          prioritySelect.value = "normal";
          titleInput.value = "Office & Classes Closed for Official Holiday";
          batchInput.value = "All Students & Office Staff";
          const todayStr = new Date().toISOString().split("T")[0];
          dateInput.value = todayStr;
          msgInput.value = `Education XYZ BD head office and class studios will remain closed on ${UI.date(todayStr)} in observance of the national holiday.\n\nNormal consultancy counseling sessions and IELTS batch classes will resume on the next working day. Online document review inquiries will continue via portal.`;
          UI.toast("Applied Holiday template!");
        };
      }

      if (tplMockExam) {
        tplMockExam.onclick = () => {
          categorySelect.value = "exam";
          prioritySelect.value = "normal";
          titleInput.value = "Official IELTS Mock Test Schedule & Room Allocation";
          batchInput.value = "All Enrolled IELTS Candidates";
          const nextSun = new Date();
          nextSun.setDate(nextSun.getDate() + ((7 - nextSun.getDay()) % 7 || 7));
          dateInput.value = nextSun.toISOString().split("T")[0];
          msgInput.value = `The upcoming Full Mock Examination is scheduled for ${UI.date(dateInput.value)} at Studio A & B.\n\nReporting Time: 9:30 AM sharp.\nPlease bring your official Student ID card and pencil kit. Speaking test interview slots will be conducted starting 2:00 PM.`;
          UI.toast("Applied Mock Exam template!");
        };
      }

      if (tplUrgentAlert) {
        tplUrgentAlert.onclick = () => {
          categorySelect.value = "urgent";
          prioritySelect.value = "urgent";
          titleInput.value = "Emergency Advisory: Urgent Notice from Managing Director";
          batchInput.value = "All Students & Office Personnel";
          dateInput.value = new Date().toISOString().split("T")[0];
          msgInput.value = `Urgent official notification for all students, faculty, and counselors. Please review the advisory carefully and adhere to all safety and admission guidelines. Contact admin office for immediate assistance.`;
          UI.toast("Applied Urgent Alert template!");
        };
      }

      // Form submission
      modal.querySelector("#announcement-form").onsubmit = (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);

        const rec = {
          title: fd.get("title").trim(),
          category: fd.get("category"),
          priority: fd.get("priority"),
          effectiveDate: fd.get("effectiveDate") || "",
          affectedBatch: fd.get("affectedBatch") ? fd.get("affectedBatch").trim() : "",
          targetAudience: fd.get("targetAudience"),
          popOnDashboard: fd.get("popOnDashboard") === "on",
          isActive: fd.get("isActive") === "on",
          message: fd.get("message").trim(),
          createdBy: Auth.user.id,
          createdAt: isEdit && existing.createdAt ? existing.createdAt : new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        if (isEdit) {
          Store.update("announcements", existing.id, rec);
          UI.toast("Announcement updated successfully!");
        } else {
          Store.add("announcements", rec);
          UI.toast("New announcement published live to dashboards!");
        }

        done();
        Views.announcements(root);
        UI.updateAnnouncementBell();
      };
    });
  };

  // Button: Create Announcement
  const btnCreate = root.querySelector("#btn-create-announcement");
  if (btnCreate) {
    btnCreate.onclick = () => openFormModal();
  }

  // Button: Preview Latest / Active Announcement
  const btnPreview = root.querySelector("#btn-preview-latest");
  if (btnPreview) {
    btnPreview.onclick = () => {
      const activeAnc = list.find((a) => a.isActive) || list[list.length - 1];
      if (activeAnc) {
        UI.showAnnouncementPopup(activeAnc, () => {
          UI.toast("Preview closed.");
        });
      } else {
        UI.toast("No announcements to preview.");
      }
    };
  }

  // Row Action: Toggle Active Status
  root.querySelectorAll("[data-toggle-status]").forEach((btn) => {
    btn.onclick = () => {
      const id = btn.getAttribute("data-toggle-status");
      const a = Store.get("announcements", id);
      if (!a) return;
      const newStatus = !a.isActive;
      Store.update("announcements", id, { isActive: newStatus });
      UI.toast(`Announcement is now ${newStatus ? "Active & Live" : "Deactivated"}.`);
      Views.announcements(root);
      UI.updateAnnouncementBell();
    };
  });

  // Row Action: Preview Specific
  root.querySelectorAll("[data-preview-id]").forEach((btn) => {
    btn.onclick = () => {
      const id = btn.getAttribute("data-preview-id");
      const a = Store.get("announcements", id);
      if (a) {
        UI.showAnnouncementPopup(a, () => {
          UI.toast("Preview closed.");
        });
      }
    };
  });

  // Row Action: Edit
  root.querySelectorAll("[data-edit-id]").forEach((btn) => {
    btn.onclick = () => {
      const id = btn.getAttribute("data-edit-id");
      const a = Store.get("announcements", id);
      if (a) openFormModal(a);
    };
  });

  // Row Action: Delete
  root.querySelectorAll("[data-delete-id]").forEach((btn) => {
    btn.onclick = () => {
      const id = btn.getAttribute("data-delete-id");
      const a = Store.get("announcements", id);
      if (!a) return;
      UI.confirm({
        title: "Delete Announcement",
        message: `Are you sure you want to permanently delete "${a.title}"? This cannot be undone.`,
        confirmText: "Delete Announcement",
        isDanger: true,
        onConfirm: () => {
          Store.remove("announcements", id);
          UI.toast("Announcement deleted.");
          Views.announcements(root);
          UI.updateAnnouncementBell();
        },
      });
    };
  });
};
