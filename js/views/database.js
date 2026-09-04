Views.database = function (root, query) {
  const stats = Store.getStats();
  const collections = stats.collections;
  const details = stats.details;
  const collectionsMeta = {
    users: { label: "Users & Staff", icon: "👥", color: "#1E3A8A" },
    students: { label: "Students", icon: "🎓", color: "#2563EB" },
    applications: { label: "Applications", icon: "📋", color: "#7E22CE" },
    documents: { label: "Documents", icon: "📁", color: "#0284C7" },
    batches: { label: "Batches", icon: "📚", color: "#059669" },
    enrollments: { label: "Enrollments", icon: "📝", color: "#047857" },
    attendance: { label: "Attendance", icon: "✅", color: "#D97706" },
    mockScores: { label: "Mock Scores", icon: "📊", color: "#DC2626" },
    invoices: { label: "Invoices", icon: "💰", color: "#B45309" },
    classContents: { label: "Class Contents", icon: "📖", color: "#6D28D9" },
    languageClubs: { label: "Language Clubs", icon: "🗣️", color: "#065F46" },
    messages: { label: "Messages", icon: "💬", color: "#BE185D" },
    announcements: { label: "Announcements", icon: "📢", color: "#C2410C" },
    jobApplications: { label: "Job Applications", icon: "💼", color: "#3730A3" },
    leads: { label: "Leads & Enquiries", icon: "🎯", color: "#2563EB" },
  };

  let selectedCol = "users";
  if (query) {
    const qParams = new URLSearchParams(query);
    if (qParams.get("col") && collections.includes(qParams.get("col"))) {
      selectedCol = qParams.get("col");
    }
  }

  function storageSizeBytes() {
    return new Blob([JSON.stringify(Store.data || {})]).size;
  }

  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(2) + " MB";
  }

  const totalBytes = storageSizeBytes();

  root.innerHTML = `
    <section class="database-hero">
      <div>
        <span class="database-eyebrow">System operations center</span>
        <h2>Database &amp; Records</h2>
        <p>Inspect, search, back up, and maintain every collection powering Education XYZ BD.</p>
      </div>
      <div class="database-hero-badge"><span>LIVE</span><strong>${collections.length}</strong><small>collections online</small></div>
    </section>

    <div class="db-health-row">
      <div class="db-health-card">
        <div class="db-health-icon" style="background:#EFF6FF;color:#1E3A8A;">💾</div>
        <div>
          <div class="db-health-label">Database Size</div>
          <div class="db-health-value">${formatBytes(totalBytes)}</div>
        </div>
      </div>
      <div class="db-health-card">
        <div class="db-health-icon" style="background:#ECFDF5;color:#059669;">🗄️</div>
        <div>
          <div class="db-health-label">Storage Type</div>
          <div class="db-health-value">Browser LocalStore JSON</div>
        </div>
      </div>
      <div class="db-health-card">
        <div class="db-health-icon" style="background:#F3E8FF;color:#7E22CE;">🔖</div>
        <div>
          <div class="db-health-label">Schema Version</div>
          <div class="db-health-value">v2</div>
        </div>
      </div>
      <div class="db-health-card">
        <div class="db-health-icon" style="background:#FEF3C7;color:#B45309;">📦</div>
        <div>
          <div class="db-health-label">Collections</div>
          <div class="db-health-value">${collections.length}</div>
        </div>
      </div>
      <div class="db-health-card">
        <div class="db-health-icon" style="background:#FCE7F3;color:#BE185D;">📊</div>
        <div>
          <div class="db-health-label">Total Records</div>
          <div class="db-health-value">${stats.totalRecords}</div>
        </div>
      </div>
    </div>

    <div class="card database-overview-card">
      <div class="section-heading-row"><div><span class="section-kicker">At a glance</span><h2>Collection Overview</h2></div><span class="db-status-chip">● Local storage healthy</span></div>
      <div class="db-collections-grid" id="db-collections-grid">
        ${collections.map((col) => {
          const meta = collectionsMeta[col] || { label: col, icon: "📄", color: "#64748B" };
          const count = details[col] || 0;
          return `
            <div class="db-collection-card ${col === selectedCol ? "selected" : ""}" data-col="${col}">
              <div class="db-col-icon">${meta.icon}</div>
              <div class="db-col-count">${count}</div>
              <div class="db-col-label">${UI.esc(meta.label)}</div>
            </div>
          `;
        }).join("")}
      </div>
    </div>

    <div class="card database-inspector-card">
      <div class="toolbar">
        <div><span class="section-kicker">Explore records</span><h2 style="margin-bottom:0;">Collection Inspector</h2></div>
        <div class="db-toolbar-actions">
          <button class="btn btn-ghost btn-sm" id="db-export-btn" title="Export Full Database (JSON)">
            📥 Export Database
          </button>
          <label class="btn btn-ghost btn-sm" id="db-import-btn" title="Import Backup (JSON)">
            📤 Import Backup
            <input type="file" accept=".json" id="db-import-file" style="display:none;">
          </label>
          <button class="btn btn-danger btn-sm" id="db-reset-btn" title="Reset to Fresh Seed">
            🔄 Reset
          </button>
          <button class="btn btn-ghost btn-sm" id="db-export-csv-btn" title="Export Current Collection to CSV">
            📋 Export CSV
          </button>
        </div>
      </div>

      <div class="db-collection-header">
        <div class="db-col-pills" id="db-col-pills">
          ${collections.map((col) => {
            const meta = collectionsMeta[col] || { label: col, icon: "📄" };
            return `<button class="db-pill ${col === selectedCol ? "active" : ""}" data-col="${col}">${meta.icon} ${UI.esc(meta.label)} (${details[col] || 0})</button>`;
          }).join("")}
        </div>
        <div class="db-search-row">
          <input type="text" class="search" id="db-search" placeholder="Search records in collection..." value="">
        </div>
      </div>

      <div class="db-table-wrap" id="db-table-wrap">
        <div class="empty">
          <p>Select a collection above to browse its records.</p>
        </div>
      </div>
    </div>
  `;

  let activeCol = selectedCol;

  function getCollectionDisplayName(col) {
    const meta = collectionsMeta[col] || { label: col };
    return meta.label;
  }

  function renderTable(col, filter) {
    const records = Store.list(col);
    const filtered = filter
      ? records.filter((r) => JSON.stringify(r).toLowerCase().includes(filter.toLowerCase()))
      : records;

    if (!filtered.length) {
      return `<div class="empty"><p>${filter ? "No records match your search in " + getCollectionDisplayName(col) : "No records in " + getCollectionDisplayName(col)}</p></div>`;
    }

    const allKeys = new Set();
    filtered.forEach((r) => Object.keys(r).forEach((k) => allKeys.add(k)));
    const cols = [...allKeys].filter((k) => k !== "id").slice(0, 6);
    const hasMoreCols = allKeys.size - 1 > cols.length;

    let html = `<div class="db-table-scroll"><table class="data db-inspector-table"><thead><tr>`;
    html += `<th>ID</th>`;
    cols.forEach((c) => {
      html += `<th>${UI.esc(c)}</th>`;
    });
    html += `<th>Actions</th>`;
    html += `</tr></thead><tbody>`;

    filtered.forEach((rec) => {
      html += `<tr>`;
      html += `<td><span class="code-badge">${UI.esc(rec.id || "")}</span></td>`;
      cols.forEach((c) => {
        let val = rec[c];
        if (val === undefined || val === null) val = "";
        if (typeof val === "object") val = JSON.stringify(val);
        let display = String(val);
        if (display.length > 50) display = display.substring(0, 50) + "…";
        html += `<td title="${UI.esc(String(val))}">${UI.esc(display)}</td>`;
      });
      html += `<td class="db-row-actions">
        <button class="btn btn-ghost btn-sm db-inspect-btn" data-col="${col}" data-id="${UI.esc(rec.id)}" title="Inspect JSON">🔍</button>
        <button class="btn btn-danger btn-sm db-delete-btn" data-col="${col}" data-id="${UI.esc(rec.id)}" title="Delete Record">🗑️</button>
      </td>`;
      html += `</tr>`;
    });

    html += `</tbody></table></div>`;
    if (hasMoreCols) {
      html += `<div class="db-more-cols-note">Showing 6 of ${allKeys.size - 1} fields. Click 🔍 to inspect full JSON.</div>`;
    }
    html += `<div class="db-record-count">Showing ${filtered.length} of ${records.length} records in ${getCollectionDisplayName(col)}</div>`;
    return html;
  }

  function renderSelectedCollection() {
    const tableWrap = document.getElementById("db-table-wrap");
    const searchInput = document.getElementById("db-search");
    const filter = searchInput ? searchInput.value : "";
    tableWrap.innerHTML = renderTable(activeCol, filter);
  }

  function showJsonModal(col, id) {
    const rec = Store.get(col, id);
    if (!rec) return;
    const json = JSON.stringify(rec, null, 2);
    UI.modal(
      `Inspect Record: ${rec.id}`,
      `<div class="db-json-viewer"><pre><code>${UI.esc(json)}</code></pre></div>`,
      (modal, done) => {
        modal.querySelector("[data-close]") && (modal.querySelector("[data-close]").onclick = done);
        const closeBtn = modal.querySelector(".btn-primary") || modal.querySelector("button");
        if (closeBtn) closeBtn.onclick = done;
      }
    );
  }

  function confirmDelete(col, id) {
    UI.confirm({
      title: "Delete Record",
      message: `Are you sure you want to permanently delete record "${id}" from ${getCollectionDisplayName(col)}? This action cannot be undone.`,
      confirmText: "Delete",
      isDanger: true,
      onConfirm: () => {
        Store.remove(col, id);
        renderSelectedCollection();
        UI.toast(`Record ${id} deleted from ${getCollectionDisplayName(col)}.`);
        refreshOverview();
      },
    });
  }

  function refreshOverview() {
    const freshStats = Store.getStats();
    const grid = document.getElementById("db-collections-grid");
    if (grid) {
      grid.querySelectorAll(".db-collection-card").forEach((card) => {
        const col = card.dataset.col;
        const count = freshStats.details[col] || 0;
        card.querySelector(".db-col-count").textContent = count;
        if (col === activeCol) card.classList.add("selected");
        else card.classList.remove("selected");
      });
    }
    const pills = document.getElementById("db-col-pills");
    if (pills) {
      pills.querySelectorAll(".db-pill").forEach((pill) => {
        const col = pill.dataset.col;
        const meta = collectionsMeta[col] || { label: col, icon: "📄" };
        const count = freshStats.details[col] || 0;
        pill.textContent = `${meta.icon} ${UI.esc(meta.label)} (${count})`;
        pill.classList.toggle("active", col === activeCol);
      });
    }
  }

  root.addEventListener("click", (e) => {
    const colCard = e.target.closest(".db-collection-card");
    if (colCard) {
      activeCol = colCard.dataset.col;
      renderSelectedCollection();
      refreshOverview();
      const searchInput = document.getElementById("db-search");
      if (searchInput) searchInput.value = "";
      return;
    }

    const pill = e.target.closest(".db-pill");
    if (pill) {
      activeCol = pill.dataset.col;
      renderSelectedCollection();
      refreshOverview();
      const searchInput = document.getElementById("db-search");
      if (searchInput) searchInput.value = "";
      return;
    }

    const inspectBtn = e.target.closest(".db-inspect-btn");
    if (inspectBtn) {
      showJsonModal(inspectBtn.dataset.col, inspectBtn.dataset.id);
      return;
    }

    const deleteBtn = e.target.closest(".db-delete-btn");
    if (deleteBtn) {
      confirmDelete(deleteBtn.dataset.col, deleteBtn.dataset.id);
      return;
    }

    if (e.target.id === "db-export-btn" || e.target.closest("#db-export-btn")) {
      Store.exportData();
      UI.toast("Full database backup exported successfully.");
      return;
    }

    if (e.target.id === "db-reset-btn" || e.target.closest("#db-reset-btn")) {
      UI.confirm({
        title: "Reset Database to Fresh Seed",
        message: "This will erase ALL current data (users, students, applications, batches, invoices, messages, etc.) and replace it with the clean, rich demo dataset. Existing browser sessions will be cleared.",
        confirmText: "Reset & Reseed",
        isDanger: true,
        userBadge: "⚠️ This operation is irreversible",
        onConfirm: async () => {
          UI.showLoader({ message: "Resetting database to fresh seed..." });
          await Store.reset();
          setTimeout(() => {
            UI.hideLoader(1000);
            Views.database(root, "");
            UI.toast("Database reset to fresh seed complete.");
          }, 800);
        },
      });
      return;
    }

    if (e.target.id === "db-export-csv-btn" || e.target.closest("#db-export-csv-btn")) {
      exportCollectionCSV(activeCol);
      return;
    }
  });

  const importFileInput = document.getElementById("db-import-file");
  if (importFileInput) {
    importFileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const content = ev.target.result;
        const success = Store.importData(content);
        if (success) {
          UI.toast("Database backup imported successfully. Refreshing...");
          Views.database(root, "");
        } else {
          UI.toast("Import failed: Invalid backup file structure.");
        }
      };
      reader.readAsText(file);
      e.target.value = "";
    });
  }

  const searchInput = document.getElementById("db-search");
  if (searchInput) {
    let debounce;
    searchInput.addEventListener("input", () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        renderSelectedCollection();
      }, 250);
    });
  }

  function exportCollectionCSV(col) {
    const records = Store.list(col);
    if (!records.length) {
      UI.toast("No records to export.");
      return;
    }
    const allKeys = new Set();
    records.forEach((r) => Object.keys(r).forEach((k) => allKeys.add(k)));
    const headers = [...allKeys];
    const rows = records.map((rec) =>
      headers.map((h) => {
        let val = rec[h];
        if (val === undefined || val === null) return "";
        if (typeof val === "object") val = JSON.stringify(val);
        val = String(val).replace(/"/g, '""');
        if (val.includes(",") || val.includes('"') || val.includes("\n")) {
          return `"${val}"`;
        }
        return val;
      })
    );
    let csv = headers.join(",") + "\n";
    rows.forEach((row) => {
      csv += row.join(",") + "\n";
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `education-xyz-${col}-export-${date}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    UI.toast(`Exported ${records.length} records from ${getCollectionDisplayName(col)} to CSV.`);
  }

  renderSelectedCollection();
};
