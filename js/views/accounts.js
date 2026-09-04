const Views = window.Views || {};

Views.accounts = function (root) {
  const invoices = Store.list("invoices") || [];
  const students = Store.list("students") || [];
  const users = Store.list("users") || [];

  // Financial KPI calculations
  const totalBilled = invoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
  const totalCollected = invoices.reduce((sum, inv) => sum + (Number(inv.paidAmount) || 0), 0);
  const totalDue = invoices.reduce((sum, inv) => sum + (Number(inv.dueAmount) || 0), 0);
  const paidCount = invoices.filter((i) => i.status === "paid").length;
  const pendingCount = invoices.filter((i) => i.status === "partial" || i.status === "overdue").length;

  const canEdit = Auth.is("admin", "accountant");

  root.innerHTML = `
    <div class="view-header">
      <div>
        <h2>Fee Ledger & Accounts Management</h2>
        <p>Track student tuition payments, consultancy charges, official receipts, and outstanding dues.</p>
      </div>
      ${
        canEdit
          ? `<button class="btn btn-primary" id="btn-add-invoice">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px;"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              + Record Payment / Invoice
            </button>`
          : ""
      }
    </div>

    <!-- Accounts KPI Summary Cards -->
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-top">
          <div class="metric-icon" style="background:var(--success-light); color:var(--success);">৳</div>
          <span class="badge badge-success">Collections</span>
        </div>
        <div class="metric-value">৳ ${totalCollected.toLocaleString()}</div>
        <div class="metric-label">Total Realized Revenue (BDT)</div>
      </div>

      <div class="metric-card">
        <div class="metric-top">
          <div class="metric-icon" style="background:#fee2e2; color:#dc2626;">৳</div>
          <span class="badge ${totalDue > 0 ? "badge-danger" : "badge-neutral"}">Outstanding</span>
        </div>
        <div class="metric-value">৳ ${totalDue.toLocaleString()}</div>
        <div class="metric-label">Total Pending / Due Balance</div>
      </div>

      <div class="metric-card">
        <div class="metric-top">
          <div class="metric-icon" style="background:var(--primary-light); color:var(--primary);">📄</div>
          <span class="badge badge-primary">Total Invoices</span>
        </div>
        <div class="metric-value">${invoices.length}</div>
        <div class="metric-label">Issued Vouchers & Receipts</div>
      </div>

      <div class="metric-card">
        <div class="metric-top">
          <div class="metric-icon" style="background:#fef3c7; color:#d97706;">⏳</div>
          <span class="badge badge-warning">Action Needed</span>
        </div>
        <div class="metric-value">${pendingCount} Files</div>
        <div class="metric-label">Partial or Overdue Accounts</div>
      </div>
    </div>

    <!-- Accounts Filter Toolbar -->
    <div class="card" style="margin-bottom:20px;">
      <div class="filter-bar" style="display:flex; flex-wrap:wrap; gap:12px; align-items:center; justify-content:space-between;">
        <div style="display:flex; gap:10px; flex:1; min-width:280px;">
          <input type="text" id="invoice-search" placeholder="Search by student name, Student ID, invoice #, or TrxID..." style="width:100%; padding:9px 14px; border:1px solid var(--line); border-radius:var(--radius-sm);">
        </div>
        <div style="display:flex; gap:10px;">
          <select id="invoice-status-filter" style="padding:9px 12px; border:1px solid var(--line); border-radius:var(--radius-sm);">
            <option value="all">All Payment Statuses</option>
            <option value="paid">Paid (Cleared)</option>
            <option value="partial">Partial Payment</option>
            <option value="overdue">Overdue / Unpaid</option>
          </select>
          <select id="invoice-method-filter" style="padding:9px 12px; border:1px solid var(--line); border-radius:var(--radius-sm);">
            <option value="all">All Payment Methods</option>
            <option value="bKash">bKash</option>
            <option value="Nagad">Nagad</option>
            <option value="Bank">Bank Transfer</option>
            <option value="Cash">Cash Counter</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Invoices Ledger Table -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">Accounts Ledger & Payment Receipts</div>
        <span class="muted" style="font-size:0.84rem;">Showing ${invoices.length} transaction records</span>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Student Details</th>
              <th>Service / Purpose</th>
              <th>Date</th>
              <th>Billed Amount</th>
              <th>Paid Amount</th>
              <th>Due Balance</th>
              <th>Method & TrxID</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="invoices-tbody">
            ${renderInvoicesRows(invoices, students)}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Attach search & filters
  const searchInput = root.querySelector("#invoice-search");
  const statusFilter = root.querySelector("#invoice-status-filter");
  const methodFilter = root.querySelector("#invoice-method-filter");
  const tbody = root.querySelector("#invoices-tbody");

  function applyFilters() {
    const q = (searchInput.value || "").toLowerCase().trim();
    const st = statusFilter.value;
    const m = methodFilter.value;

    const filtered = invoices.filter((inv) => {
      const student = students.find((s) => s.id === inv.studentId);
      const studentName = student ? student.name.toLowerCase() : "";
      const studentCode = student && student.studentCode ? student.studentCode.toLowerCase() : "";
      const invNo = (inv.invoiceNo || "").toLowerCase();
      const trx = (inv.trxId || "").toLowerCase();
      const service = (inv.serviceType || "").toLowerCase();

      const matchQ = !q || studentName.includes(q) || studentCode.includes(q) || invNo.includes(q) || trx.includes(q) || service.includes(q);
      const matchSt = st === "all" || inv.status === st;
      const matchM = m === "all" || (inv.paymentMethod || "").toLowerCase().includes(m.toLowerCase());

      return matchQ && matchSt && matchM;
    });

    tbody.innerHTML = renderInvoicesRows(filtered, students);
    bindRowActions();
  }

  searchInput.addEventListener("input", applyFilters);
  statusFilter.addEventListener("change", applyFilters);
  methodFilter.addEventListener("change", applyFilters);

  function bindRowActions() {
    // Print / View Receipt Modal
    root.querySelectorAll("[data-print-receipt]").forEach((btn) => {
      btn.onclick = () => {
        const invId = btn.getAttribute("data-print-receipt");
        const inv = Store.get("invoices", invId);
        if (inv) showReceiptModal(inv);
      };
    });

    // Update / Record Payment
    root.querySelectorAll("[data-edit-payment]").forEach((btn) => {
      btn.onclick = () => {
        const invId = btn.getAttribute("data-edit-payment");
        const inv = Store.get("invoices", invId);
        if (inv) showEditPaymentModal(inv);
      };
    });

    // Delete Invoice
    root.querySelectorAll("[data-del-invoice]").forEach((btn) => {
      btn.onclick = () => {
        const invId = btn.getAttribute("data-del-invoice");
        if (confirm("Are you sure you want to delete this invoice voucher?")) {
          Store.remove("invoices", invId);
          UI.toast("Invoice removed.");
          Views.accounts(root);
        }
      };
    });
  }

  bindRowActions();

  // Add Invoice Modal
  const btnAdd = root.querySelector("#btn-add-invoice");
  if (btnAdd) {
    btnAdd.onclick = () => showCreateInvoiceModal();
  }

  function showCreateInvoiceModal() {
    const studentOpts = students.map((s) => ({
      value: s.id,
      label: `${s.name} (${s.studentCode || s.id})`,
    }));

    const formHtml = `
      <div class="field">
        <label>Student *</label>
        <select name="studentId" required>
          ${studentOpts.map((o) => `<option value="${o.value}">${UI.esc(o.label)}</option>`).join("")}
        </select>
      </div>
      <div class="field">
        <label>Service / Purpose of Fee *</label>
        <select name="serviceType" required>
          <option value="IELTS Regular Batch Course Fee">IELTS Regular Batch Course Fee (BDT 18,500)</option>
          <option value="IELTS Intensive Executive Batch Fee">IELTS Intensive Executive Batch Fee (BDT 22,000)</option>
          <option value="UK University Application & CAS Processing">UK University Application & CAS Processing (BDT 25,000)</option>
          <option value="Canada Study Permit & Visa Processing Fee">Canada Study Permit & Visa Processing Fee (BDT 35,000)</option>
          <option value="Australia University Counseling & Enrollment">Australia University Counseling & Enrollment (BDT 30,000)</option>
          <option value="USA University Application & I-20 Advisory">USA University Application & I-20 Advisory (BDT 40,000)</option>
          <option value="European/Germany Documentation & Embassy Package">European/Germany Documentation Package (BDT 28,000)</option>
          <option value="Document Translation & Attestation Fee">Document Translation & Attestation Fee (BDT 5,000)</option>
          <option value="Custom Consultancy Charge">Custom Consultancy Charge</option>
        </select>
      </div>
      <div class="grid-2-form">
        <div class="field">
          <label>Total Billed Amount (BDT) *</label>
          <input type="number" name="totalAmount" id="inv-total" value="18500" required min="0">
        </div>
        <div class="field">
          <label>Paid Amount (BDT) *</label>
          <input type="number" name="paidAmount" id="inv-paid" value="18500" required min="0">
        </div>
      </div>
      <div class="grid-2-form">
        <div class="field">
          <label>Payment Method *</label>
          <select name="paymentMethod" required>
            <option value="bKash">bKash Merchant</option>
            <option value="Nagad">Nagad Direct</option>
            <option value="Bank Transfer (EBL)">Bank Transfer (Eastern Bank Ltd)</option>
            <option value="Bank Transfer (City Bank)">Bank Transfer (City Bank)</option>
            <option value="Bank Transfer (BRAC)">Bank Transfer (BRAC Bank)</option>
            <option value="Cash Counter">Cash Counter (Main Office)</option>
            <option value="POS Card Swipe">POS Debit/Credit Card</option>
          </select>
        </div>
        <div class="field">
          <label>Transaction ID / Reference Slip</label>
          <input type="text" name="trxId" placeholder="e.g. BK7829104A or Slip #">
        </div>
      </div>
      <div class="field">
        <label>Payment Date</label>
        <input type="date" name="date" value="${new Date().toISOString().slice(0, 10)}" required>
      </div>
    `;

    UI.modal(
      "Record Payment & Issue Invoice",
      `<form id="form-new-invoice">${formHtml}<div class="btn-row"><button class="btn btn-ghost" type="button" data-close>Cancel</button><button class="btn btn-primary" type="submit">Issue Official Invoice</button></div></form>`,
      (modal, done) => {
        modal.querySelector("[data-close]").onclick = done;
        const form = modal.querySelector("#form-new-invoice");
        form.onsubmit = (e) => {
          e.preventDefault();
          const fd = new FormData(form);
          const total = Number(fd.get("totalAmount")) || 0;
          const paid = Number(fd.get("paidAmount")) || 0;
          const due = Math.max(0, total - paid);

          let status = "paid";
          if (paid === 0) status = "overdue";
          else if (due > 0) status = "partial";

          const inv = Store.add("invoices", {
            invoiceNo: Store.generateInvoiceNo(),
            studentId: fd.get("studentId"),
            serviceType: fd.get("serviceType"),
            totalAmount: total,
            paidAmount: paid,
            dueAmount: due,
            currency: "BDT",
            status,
            paymentMethod: fd.get("paymentMethod"),
            trxId: fd.get("trxId") || "—",
            date: fd.get("date"),
            collectedBy: Auth.user ? Auth.user.id : "u-acc",
            createdAt: new Date().toISOString(),
          });

          UI.toast(`Invoice ${inv.invoiceNo} generated successfully!`);
          done();
          Views.accounts(root);
        };
      }
    );
  }

  function showEditPaymentModal(inv) {
    const student = Store.student(inv.studentId);
    const formHtml = `
      <div style="background:var(--card-alt); padding:12px; border-radius:var(--radius-sm); margin-bottom:14px;">
        <strong>Invoice No:</strong> ${UI.esc(inv.invoiceNo)}<br>
        <strong>Student:</strong> ${UI.esc(student ? student.name : "—")} (${student ? student.studentCode : ""})<br>
        <strong>Service:</strong> ${UI.esc(inv.serviceType)}<br>
        <strong>Total Billed:</strong> ৳ ${Number(inv.totalAmount).toLocaleString()} BDT
      </div>
      <div class="grid-2-form">
        <div class="field">
          <label>Paid Amount (BDT) *</label>
          <input type="number" name="paidAmount" value="${inv.paidAmount}" required min="0" max="${inv.totalAmount}">
        </div>
        <div class="field">
          <label>Payment Method</label>
          <select name="paymentMethod">
            <option value="bKash" ${inv.paymentMethod === "bKash" ? "selected" : ""}>bKash</option>
            <option value="Nagad" ${inv.paymentMethod === "Nagad" ? "selected" : ""}>Nagad</option>
            <option value="Bank Transfer (EBL)" ${inv.paymentMethod?.includes("EBL") ? "selected" : ""}>Bank Transfer (EBL)</option>
            <option value="Bank Transfer (City Bank)" ${inv.paymentMethod?.includes("City") ? "selected" : ""}>Bank Transfer (City)</option>
            <option value="Cash Counter" ${inv.paymentMethod?.includes("Cash") ? "selected" : ""}>Cash Counter</option>
            <option value="POS Card Swipe" ${inv.paymentMethod?.includes("POS") ? "selected" : ""}>POS Card Swipe</option>
          </select>
        </div>
      </div>
      <div class="field">
        <label>Transaction ID / Receipt Reference</label>
        <input type="text" name="trxId" value="${UI.esc(inv.trxId || "")}">
      </div>
    `;

    UI.modal(
      "Update Collection / Due Payment",
      `<form id="form-edit-payment">${formHtml}<div class="btn-row"><button class="btn btn-ghost" type="button" data-close>Cancel</button><button class="btn btn-primary" type="submit">Save Updated Payment</button></div></form>`,
      (modal, done) => {
        modal.querySelector("[data-close]").onclick = done;
        const form = modal.querySelector("#form-edit-payment");
        form.onsubmit = (e) => {
          e.preventDefault();
          const fd = new FormData(form);
          const paid = Number(fd.get("paidAmount")) || 0;
          const due = Math.max(0, inv.totalAmount - paid);
          let status = "paid";
          if (paid === 0) status = "overdue";
          else if (due > 0) status = "partial";

          Store.update("invoices", inv.id, {
            paidAmount: paid,
            dueAmount: due,
            status,
            paymentMethod: fd.get("paymentMethod"),
            trxId: fd.get("trxId") || "—",
            updatedAt: new Date().toISOString(),
          });

          UI.toast(`Invoice ${inv.invoiceNo} updated successfully!`);
          done();
          Views.accounts(root);
        };
      }
    );
  }

  function showReceiptModal(inv) {
    const student = Store.student(inv.studentId);
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
            <strong>${UI.esc(student ? student.name : "N/A")}</strong><br>
            <span>Student ID: <code style="color:var(--primary); font-weight:700;">${UI.esc(student ? student.studentCode || student.id : "—")}</code></span><br>
            <span>Phone: ${UI.esc(student?.phone || "—")}</span>
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
        <button class="btn btn-primary" type="button" id="btn-print-receipt">
          🖨️ Print Official Receipt
        </button>
      </div>
    `;

    UI.modal(`Payment Receipt — ${inv.invoiceNo}`, receiptHtml, (modal, done) => {
      modal.querySelector("[data-close]").onclick = done;
      modal.querySelector("#btn-print-receipt").onclick = () => UI.printElement(modal.querySelector("#printable-receipt"), `Payment Receipt - ${inv.invoiceNo}`);
    });
  }
};

function renderInvoicesRows(invoices, students) {
  if (!invoices.length) {
    return `<tr><td colspan="10" style="text-align:center; padding:30px; color:var(--ink-muted);">No invoice records found matching your filters.</td></tr>`;
  }

  return invoices
    .map((inv) => {
      const student = students.find((s) => s.id === inv.studentId);
      const studentName = student ? student.name : "Unknown Student";
      const studentCode = student && student.studentCode ? student.studentCode : inv.studentId;

      let statusBadge = `<span class="badge badge-success">Paid</span>`;
      if (inv.status === "partial") {
        statusBadge = `<span class="badge badge-warning">Partial</span>`;
      } else if (inv.status === "overdue") {
        statusBadge = `<span class="badge badge-danger">Unpaid</span>`;
      }

      return `
        <tr>
          <td><strong style="font-family:var(--font-mono); color:var(--primary); font-size:0.88rem;">${UI.esc(inv.invoiceNo)}</strong></td>
          <td>
            <strong>${UI.esc(studentName)}</strong><br>
            <span class="code-badge" style="font-size:0.75rem;">${UI.esc(studentCode)}</span>
          </td>
          <td style="max-width:220px; font-size:0.85rem;">${UI.esc(inv.serviceType)}</td>
          <td style="font-size:0.84rem;">${UI.date(inv.date)}</td>
          <td style="font-weight:600;">৳ ${Number(inv.totalAmount).toLocaleString()}</td>
          <td style="font-weight:700; color:var(--success);">৳ ${Number(inv.paidAmount).toLocaleString()}</td>
          <td style="font-weight:700; color:${inv.dueAmount > 0 ? "#dc2626" : "var(--ink-muted);"}">
            ${inv.dueAmount > 0 ? `৳ ${Number(inv.dueAmount).toLocaleString()}` : "৳ 0"}
          </td>
          <td style="font-size:0.82rem;">
            <span>${UI.esc(inv.paymentMethod)}</span><br>
            <span class="muted" style="font-family:var(--font-mono);">${UI.esc(inv.trxId || "—")}</span>
          </td>
          <td>${statusBadge}</td>
          <td>
            <div style="display:flex; gap:6px;">
              <button class="btn btn-sm btn-ghost" data-print-receipt="${inv.id}" title="View Receipt">
                📄 Receipt
              </button>
              ${(() => {
                const u = Store.getUserForStudent(inv.studentId);
                return u ? `<a href="#/messages?to=${u.id}" class="btn btn-sm btn-ghost" title="Message Student regarding fee voucher">✉ Chat</a>` : "";
              })()}
              ${
                inv.dueAmount > 0
                  ? `<button class="btn btn-sm btn-secondary" data-edit-payment="${inv.id}" title="Collect Due">
                      + Due
                    </button>`
                  : ""
              }
              ${
                Auth.is("admin")
                  ? `<button class="btn btn-sm btn-ghost" data-del-invoice="${inv.id}" style="color:#dc2626;" title="Delete">
                      ✕
                    </button>`
                  : ""
              }
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

window.Views = Views;
