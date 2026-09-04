const UI = {
  esc(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  },
  date(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  },
  datetime(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  },
  name(userId) {
    const u = Store.user(userId);
    return u ? u.name : "—";
  },
  studentName(id) {
    const s = Store.student(id);
    return s ? s.name : "—";
  },
  chip(text, cls) {
    return `<span class="chip ${cls || text}">${this.esc(text)}</span>`;
  },
  toast(msg) {
    document.querySelectorAll(".toast").forEach((n) => n.remove());
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2400);
  },
  modal(title, bodyHtml, onReady) {
    const back = document.createElement("div");
    back.className = "modal-back";
    back.innerHTML = `<div class="modal"><h2>${this.esc(title)}</h2><div class="modal-body">${bodyHtml}</div></div>`;
    back.addEventListener("click", (e) => {
      if (e.target === back) back.remove();
    });
    document.body.appendChild(back);
    if (onReady) onReady(back.querySelector(".modal"), () => back.remove());
    return back;
  },
  printElement(element, title = "Education XYZ BD Document") {
    if (!element) return;
    const printWindow = window.open("", "_blank", "noopener,noreferrer,width=1000,height=800");
    if (!printWindow) {
      this.toast("Please allow pop-ups to print this document.");
      return;
    }
    const content = element.cloneNode(true);
    content.querySelectorAll("img").forEach((img) => {
      img.src = new URL(img.getAttribute("src"), window.location.href).href;
    });
    const stylesheet = new URL("css/styles.css", window.location.href).href;
    printWindow.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${this.esc(title)}</title><link rel="stylesheet" href="${stylesheet}"><style>body{background:#fff!important;padding:20px!important}.print-document{max-width:1000px;margin:0 auto}.btn,.btn-row{display:none!important}@media print{body{padding:0!important}.print-document{max-width:none}}</style></head><body><main class="print-document">${content.outerHTML}</main></body></html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 350);
  },
  formFields(fields) {
    return fields
      .map((f) => {
        const val = f.value == null ? "" : String(f.value);
        if (f.type === "select") {
          const opts = (f.options || [])
            .map((o) => {
              const v = typeof o === "string" ? o : o.value;
              const l = typeof o === "string" ? o : o.label;
              return `<option value="${this.esc(v)}" ${v === val ? "selected" : ""}>${this.esc(l)}</option>`;
            })
            .join("");
          return `<div class="field"><label>${this.esc(f.label)}</label><select name="${f.name}">${opts}</select></div>`;
        }
        if (f.type === "textarea") {
          return `<div class="field"><label>${this.esc(f.label)}</label><textarea name="${f.name}">${this.esc(val)}</textarea></div>`;
        }
        if (f.type === "password") {
          return `<div class="field"><label>${this.esc(f.label)}</label><div class="password-input-wrapper"><input type="password" name="${f.name}" id="field-${f.name}" value="${this.esc(val)}" ${f.required ? "required" : ""}><button type="button" class="btn-toggle-password" data-target="field-${f.name}" aria-label="Show password" title="Show password"><svg class="eye-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg><svg class="eye-off-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none;"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg></button></div></div>`;
        }
        return `<div class="field"><label>${this.esc(f.label)}</label><input type="${f.type || "text"}" name="${f.name}" value="${this.esc(val)}" ${f.required ? "required" : ""}></div>`;
      })
      .join("");
  },
  readFile(file, maxBytes) {
    return new Promise((resolve, reject) => {
      if (file.size > maxBytes) {
        reject(new Error("File is too large for this demo (max 400 KB)."));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Could not read file."));
      reader.readAsDataURL(file);
    });
  },
  _loaderTimer: null,
  _loaderShownAt: 0,
  showLoader(opts = {}) {
    const text = typeof opts === "string" ? opts : (opts && opts.message) || "Loading...";
    const brand = (opts && opts.brand) || "Education XYZ BD";
    const loader = document.getElementById("global-page-loader");
    if (!loader) return;

    const brandEl = loader.querySelector(".loader-brand-title");
    if (brandEl) brandEl.textContent = brand;

    const textEl = document.getElementById("loader-status-text");
    if (textEl) textEl.textContent = text;

    // Reset entrance animation so logo fade-in re-triggers cleanly
    const logoWrap = loader.querySelector(".loader-logo-wrap");
    if (logoWrap) {
      logoWrap.style.animation = "none";
      void logoWrap.offsetHeight; // force reflow
      logoWrap.style.animation = "";
    }

    if (this._loaderTimer) {
      clearTimeout(this._loaderTimer);
      this._loaderTimer = null;
    }
    loader.classList.remove("hidden");
    this._loaderShownAt = Date.now();
  },
  hideLoader(minWait = 1000) {
    const loader = document.getElementById("global-page-loader");
    if (!loader) return;
    const elapsed = Date.now() - (this._loaderShownAt || 0);
    const remaining = Math.max(0, minWait - elapsed);

    if (this._loaderTimer) clearTimeout(this._loaderTimer);

    this._loaderTimer = setTimeout(() => {
      loader.classList.add("hidden");
      this._loaderTimer = null;
    }, remaining);
  },
  async withLoader(asyncFn, opts = {}) {
    this.showLoader(opts);
    const minWait = opts.minDuration || 1000;
    try {
      return await asyncFn();
    } finally {
      this.hideLoader(minWait);
    }
  },
  confirm({ title = "Confirm Action", message = "Are you sure you want to proceed?", confirmText = "Confirm", cancelText = "Cancel", isDanger = false, userBadge = null, onConfirm, onCancel }) {
    const back = document.createElement("div");
    back.className = "modal-back";
    
    const badgeHtml = userBadge ? `<div class="confirm-user-badge">${userBadge}</div>` : "";
    
    back.innerHTML = `
      <div class="modal confirm-modal" role="dialog" aria-modal="true" style="max-width: 440px;">
        <div class="confirm-modal-box">
          <div class="confirm-icon-wrap" style="${isDanger ? '' : 'background:#EFF6FF; color:#2563EB; border-color:#DBEAFE;'}">
            ${isDanger ? `
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            ` : `
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            `}
          </div>
          <h2 class="confirm-modal-title">${this.esc(title)}</h2>
          <p class="confirm-modal-desc">${this.esc(message)}</p>
          ${badgeHtml}
          <div class="confirm-actions">
            <button type="button" class="btn btn-ghost" id="confirm-modal-cancel">${this.esc(cancelText)}</button>
            <button type="button" class="btn ${isDanger ? 'btn-danger' : 'btn-primary'}" id="confirm-modal-ok">${this.esc(confirmText)}</button>
          </div>
        </div>
      </div>
    `;

    const close = () => {
      document.removeEventListener("keydown", keyHandler);
      back.remove();
    };

    const keyHandler = (e) => {
      if (e.key === "Escape") {
        close();
        if (onCancel) onCancel();
      }
    };
    document.addEventListener("keydown", keyHandler);

    back.addEventListener("click", (e) => {
      if (e.target === back) {
        close();
        if (onCancel) onCancel();
      }
    });

    back.querySelector("#confirm-modal-cancel").onclick = () => {
      close();
      if (onCancel) onCancel();
    };

    back.querySelector("#confirm-modal-ok").onclick = () => {
      close();
      if (onConfirm) onConfirm();
    };

    document.body.appendChild(back);
    setTimeout(() => {
      const cancelBtn = back.querySelector("#confirm-modal-cancel");
      if (cancelBtn) cancelBtn.focus();
    }, 50);

    return back;
  },
  showAnnouncementPopup(announcement, onDismiss) {
    if (document.querySelector(".announcement-modal-back")) return;

    const isUrgent = announcement.priority === "urgent";
    const isCancel = announcement.category === "class_cancel";
    const author = Store.user(announcement.createdBy);
    const authorName = author ? author.name : "MD. Rafiqul Islam (Admin)";
    const dateFormatted = announcement.effectiveDate ? this.date(announcement.effectiveDate) : "";

    const categoryLabels = {
      class_cancel: "Class Cancellation Notice",
      urgent: "Urgent Official Notice",
      holiday: "Holiday & Center Closure",
      exam: "Mock Test & Exam Schedule",
      general: "Important Announcement",
    };
    const categoryTitle = categoryLabels[announcement.category] || "Notice from Administration";

    const badgeIcon = isCancel
      ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`
      : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`;

    const back = document.createElement("div");
    back.className = "modal-back announcement-modal-back";
    back.innerHTML = `
      <div class="modal announcement-modal ${isUrgent || isCancel ? "alert-urgent" : "alert-notice"}" role="dialog" aria-modal="true">
        <div class="announcement-modal-header">
          <div class="announcement-badge-pill ${isUrgent || isCancel ? "pill-danger" : "pill-primary"}">
            <span class="announcement-pulse-dot"></span>
            ${badgeIcon}
            <span>${this.esc(categoryTitle)}</span>
          </div>
          <button type="button" class="announcement-close-x" id="btn-close-anc-x" aria-label="Close">✕</button>
        </div>

        <div class="announcement-modal-body">
          <h2 class="announcement-title">${this.esc(announcement.title)}</h2>

          ${announcement.effectiveDate ? `
            <div class="announcement-date-banner ${isCancel ? "banner-danger" : "banner-primary"}">
              <div class="date-banner-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              </div>
              <div class="date-banner-content">
                <span class="date-banner-lbl">${isCancel ? "CANCELLATION DATE / AFFECTED DATE" : "EVENT / EFFECTIVE DATE"}</span>
                <strong class="date-banner-val">${dateFormatted}</strong>
                ${announcement.affectedBatch ? `<div class="date-banner-sub">Affected Batches: <strong>${this.esc(announcement.affectedBatch)}</strong></div>` : ""}
              </div>
            </div>
          ` : ""}

          <div class="announcement-text-box">
            ${this.esc(announcement.message).replace(/\n/g, "<br>")}
          </div>

          <div class="announcement-meta-footer">
            <div class="meta-author">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              <span>Posted by <strong>${this.esc(authorName)}</strong></span>
            </div>
            <div class="meta-time">
              <span>${this.datetime(announcement.createdAt)}</span>
            </div>
          </div>

          <div class="announcement-actions">
            <button type="button" class="btn btn-primary btn-block btn-lg" id="btn-ack-announcement">
              ✓ I Acknowledge &amp; Understand
            </button>
          </div>
        </div>
      </div>
    `;

    const close = () => {
      back.remove();
      if (onDismiss) onDismiss(announcement.id);
    };

    back.querySelector("#btn-close-anc-x").onclick = close;
    back.querySelector("#btn-ack-announcement").onclick = close;
    back.addEventListener("click", (e) => {
      if (e.target === back) close();
    });

    document.body.appendChild(back);
    setTimeout(() => {
      const ackBtn = back.querySelector("#btn-ack-announcement");
      if (ackBtn) ackBtn.focus();
    }, 80);

    return back;
  },

  checkAnnouncementPopup() {
    if (!Auth.user) return;
    const all = Store.list("announcements") || [];
    const role = Auth.role();
    const userId = Auth.user.id;

    // Filter active announcements targeting this user
    const eligible = all.filter((a) => {
      if (!a.isActive || a.popOnDashboard === false) return false;
      if (a.targetAudience === "all" || !a.targetAudience) return true;
      if (a.targetAudience === "students" && role === "student") return true;
      if (a.targetAudience === "staff" && role !== "student") return true;
      if (a.targetAudience === role) return true;
      return false;
    });

    if (!eligible.length) return;

    // Find the first announcement not yet dismissed in this session
    const unread = eligible.find((a) => {
      return !sessionStorage.getItem("edu-anc-seen-" + a.id + "-" + userId);
    });

    if (unread) {
      setTimeout(() => {
        this.showAnnouncementPopup(unread, (id) => {
          sessionStorage.setItem("edu-anc-seen-" + id + "-" + userId, "true");
          this.updateAnnouncementBell();
        });
      }, 400);
    }
  },

  updateAnnouncementBell() {
    const bellBtn = document.getElementById("topbar-announcement-btn");
    if (!bellBtn || !Auth.user) return;

    const all = Store.list("announcements") || [];
    const role = Auth.role();
    const active = all.filter((a) => {
      if (!a.isActive) return false;
      if (a.targetAudience === "all" || !a.targetAudience) return true;
      if (a.targetAudience === "students" && role === "student") return true;
      if (a.targetAudience === "staff" && role !== "student") return true;
      return a.targetAudience === role;
    });

    const badge = bellBtn.querySelector(".topbar-bell-badge");
    if (badge) {
      if (active.length > 0) {
        badge.textContent = active.length;
        badge.style.display = "flex";
      } else {
        badge.style.display = "none";
      }
    }
  },

  updateMessageBadge() {
    if (!Auth.user) return;
    const count = Store.getUnreadMessageCount(Auth.user.id);

    // Floating message bubble badge
    const msgBtn = document.getElementById("floating-message-bubble");
    if (msgBtn) {
      const badge = msgBtn.querySelector(".floating-msg-badge");
      if (badge) {
        if (count > 0) {
          badge.textContent = count > 99 ? "99+" : count;
          badge.style.display = "flex";
        } else {
          badge.style.display = "none";
        }
      }
    }

  },

  timeAgo(iso) {
    if (!iso) return "—";
    const date = new Date(iso);
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);
    if (diffSec < 45) return "Just now";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 86400 * 2) return "Yesterday";
    if (diffSec < 86400 * 7) return `${Math.floor(diffSec / 86400)}d ago`;
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  },

  getAnnouncementBannerHtml(userRole) {
    const all = Store.list("announcements") || [];
    const active = all.filter((a) => {
      if (!a.isActive) return false;
      if (a.targetAudience === "all" || !a.targetAudience) return true;
      if (a.targetAudience === "students" && userRole === "student") return true;
      if (a.targetAudience === "staff" && userRole !== "student") return true;
      return a.targetAudience === userRole;
    });

    if (!active.length) return "";

    const a = active[active.length - 1];
    const isCancel = a.category === "class_cancel";
    const isUrgent = a.priority === "urgent";
    const bannerClass = isCancel || isUrgent ? "" : "banner-info";
    const dateFormatted = a.effectiveDate ? this.date(a.effectiveDate) : "";

    return `
      <div class="dashboard-announcement-banner ${bannerClass}" data-banner-anc-id="${a.id}">
        <div class="dash-anc-left">
          <div class="dash-anc-icon-box">
            ${isCancel ? `
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
            ` : `
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            `}
          </div>
          <div class="dash-anc-info">
            <h4>
              ${isCancel ? "🚨 CLASS CANCELLATION NOTICE" : "📢 OFFICIAL NOTICE"}: ${this.esc(a.title)}
              ${a.effectiveDate ? `<span class="dash-anc-date-badge">📅 ${dateFormatted}</span>` : ""}
              ${a.affectedBatch ? `<span class="dash-anc-date-badge">🎓 ${this.esc(a.affectedBatch)}</span>` : ""}
            </h4>
            <p>${this.esc(a.message).slice(0, 160)}${a.message.length > 160 ? "..." : ""}</p>
          </div>
        </div>
        <div class="dash-anc-actions">
          <button class="btn btn-sm ${isCancel || isUrgent ? 'btn-danger' : 'btn-primary'}" type="button" data-open-anc-id="${a.id}">
            Read Full Notice →
          </button>
        </div>
      </div>
    `;
  },

  bindAnnouncementBannerClicks(container) {
    if (!container) return;
    container.querySelectorAll("[data-open-anc-id]").forEach((btn) => {
      btn.onclick = () => {
        const id = btn.getAttribute("data-open-anc-id");
        const a = Store.get("announcements", id);
        if (a) {
          this.showAnnouncementPopup(a, () => {
            sessionStorage.setItem("edu-anc-seen-" + a.id + "-" + (Auth.user ? Auth.user.id : "guest"), "true");
            this.updateAnnouncementBell();
          });
        }
      };
    });
  },
};

window.UI = UI;
