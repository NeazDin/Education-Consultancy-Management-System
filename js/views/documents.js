window.Views = window.Views || {};

function visibleDocs() {
  const all = Store.list("documents");
  if (Auth.is("admin", "admission_officer")) return all;
  if (Auth.is("counselor")) {
    const apps = new Set(Store.list("applications").filter((a) => a.counselorId === Auth.user.id).map((a) => a.id));
    return all.filter((d) => apps.has(d.applicationId));
  }
  return [];
}

function uploadModal(prefApp, onDone) {
  const apps = Auth.is("admin", "admission_officer")
    ? Store.list("applications")
    : Store.list("applications").filter((a) => a.counselorId === Auth.user.id);
  const html =
    UI.formFields([
      {
        name: "applicationId",
        label: "Associated Application",
        type: "select",
        value: prefApp || (apps[0] && apps[0].id),
        options: apps.map((a) => {
          const s = Store.student(a.studentId);
          return {
            value: a.id,
            label: `${s ? s.name : "Student"} (${s ? s.studentCode : ""}) · ${a.targetCountry}`,
          };
        }),
      },
      { name: "docType", label: "Document Type", type: "select", options: DOC_TYPES },
    ]) +
    `<div class="field"><label>Select File (Max 400 KB)</label><input type="file" name="file"></div>
     <div class="btn-row"><button class="btn btn-primary" type="submit">Add Document to File</button><button class="btn btn-ghost" type="button" data-close>Cancel</button></div>`;
  UI.modal("Upload & Attach Document", `<form id="df">${html}</form>`, (modal, done) => {
    modal.querySelector("[data-close]").onclick = done;
    modal.querySelector("#df").onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const applicationId = fd.get("applicationId");
      const app = Store.get("applications", applicationId);
      const file = e.target.file.files[0];
      let fileUrl = "";
      let fileName = file ? file.name : "";
      try {
        if (file) fileUrl = await UI.readFile(file, 400 * 1024);
      } catch (err) {
        UI.toast(err.message);
        return;
      }
      Store.add("documents", {
        studentId: app.studentId,
        applicationId,
        docType: fd.get("docType"),
        fileName,
        fileUrl,
        status: "pending",
        reviewedBy: "",
        updatedAt: new Date().toISOString(),
      });
      UI.toast("Document added to student checklist.");
      done();
      onDone();
    };
  });
}

Views.documents = function (root, query) {
  const params = new URLSearchParams(query || "");
  const appFilter = params.get("app");
  let list = visibleDocs();
  if (appFilter) list = list.filter((d) => d.applicationId === appFilter);
  const canEdit = Auth.is("admin", "counselor", "admission_officer");

  const pendingCount = list.filter((d) => d.status === "pending").length;

  root.innerHTML = `
    <div class="toolbar">
      <div>
        <p class="muted">${appFilter ? "Showing checklist for selected application." : "Inspect, verify, approve or request revisions on student visa documents."}</p>
      </div>
      <div class="btn-row">
        ${appFilter ? `<a href="#/documents" class="btn btn-sm btn-ghost">Show All Documents</a>` : ""}
        ${canEdit ? `<button class="btn btn-primary btn-sm" id="add">+ Add Document</button>` : ""}
      </div>
    </div>
    <div class="card">
      <div class="toolbar">
        <h2>Document Verification Queue (${pendingCount} Pending)</h2>
      </div>
      ${
        list.length
          ? `<table class="data">
              <thead>
                <tr>
                  <th>Student &amp; Application</th>
                  <th>Document Type</th>
                  <th>Attached File</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${list
                  .map((d) => {
                    const s = Store.student(d.studentId);
                    const app = Store.get("applications", d.applicationId);
                    const file = d.fileUrl
                      ? `<a href="${d.fileUrl}" download="${UI.esc(d.fileName)}">📎 ${UI.esc(d.fileName)}</a>`
                      : UI.esc(d.fileName || "—");
                    const actions = [];
                    if (canEdit && d.status === "pending") {
                      actions.push(`<button class="btn btn-sm btn-primary" data-ok="${d.id}">Approve</button>`);
                      actions.push(`<button class="btn btn-sm btn-danger" data-no="${d.id}">Reject</button>`);
                    }
                    if (canEdit && d.status === "rejected") {
                      actions.push(`<button class="btn btn-sm btn-ghost" data-re="${d.id}">Replace File</button>`);
                    }
                    return `<tr>
                      <td>
                        <a href="#/applications/${d.applicationId}"><strong>${UI.esc(s ? s.name : "Student")}</strong></a>
                        <br><span class="student-code-badge">${UI.esc(s ? s.studentCode : "")}</span> · <small class="muted">${UI.esc(app ? app.targetCountry : "")}</small>
                      </td>
                      <td><strong>${UI.esc(d.docType)}</strong></td>
                      <td>${file}</td>
                      <td>${UI.chip(d.status)}</td>
                      <td>${d.remarks ? `<span style="color:var(--danger);font-size:0.8rem;">${UI.esc(d.remarks)}</span>` : "—"}</td>
                      <td class="row-actions">${actions.join(" ")}</td>
                    </tr>`;
                  })
                  .join("")}
              </tbody>
            </table>`
          : `<div class="empty">No documents found matching this view.</div>`
      }
    </div>
  `;

  const add = root.querySelector("#add");
  if (add) add.onclick = () => uploadModal(appFilter, () => Views.documents(root, query));

  // Approve document
  root.querySelectorAll("[data-ok]").forEach((b) => {
    b.onclick = () => {
      Store.update("documents", b.getAttribute("data-ok"), {
        status: "approved",
        reviewedBy: Auth.user.id,
        remarks: "",
        updatedAt: new Date().toISOString(),
      });
      UI.toast("Document approved and verified.");
      Views.documents(root, query);
    };
  });

  // Reject document with reason
  root.querySelectorAll("[data-no]").forEach((b) => {
    b.onclick = () => {
      const docId = b.getAttribute("data-no");
      const html = `<div class="field"><label>Reason for Rejection / Correction Instructions</label><textarea name="remarks" placeholder="e.g. Document image is blurry. Please upload clear scan of passport." required style="min-height:80px;"></textarea></div><div class="btn-row"><button class="btn btn-danger" type="submit">Confirm Rejection</button><button class="btn btn-ghost" type="button" data-close>Cancel</button></div>`;
      UI.modal("Reject Document", `<form id="rj-form">${html}</form>`, (modal, done) => {
        modal.querySelector("[data-close]").onclick = done;
        modal.querySelector("#rj-form").onsubmit = (e) => {
          e.preventDefault();
          const remarks = new FormData(e.target).get("remarks").trim();
          Store.update("documents", docId, {
            status: "rejected",
            reviewedBy: Auth.user.id,
            remarks,
            updatedAt: new Date().toISOString(),
          });
          UI.toast("Document rejected. Student can see instructions and re-upload.");
          done();
          Views.documents(root, query);
        };
      });
    };
  });

  // Re-upload replacement
  root.querySelectorAll("[data-re]").forEach((b) => {
    b.onclick = () => {
      const id = b.getAttribute("data-re");
      const html = `<div class="field"><label>Replacement File (Max 400 KB)</label><input type="file" name="file" required></div><div class="btn-row"><button class="btn btn-primary" type="submit">Upload Replacement</button><button class="btn btn-ghost" type="button" data-close>Cancel</button></div>`;
      UI.modal("Upload Replacement Document", `<form id="rf">${html}</form>`, (modal, done) => {
        modal.querySelector("[data-close]").onclick = done;
        modal.querySelector("#rf").onsubmit = async (e) => {
          e.preventDefault();
          const file = e.target.file.files[0];
          try {
            const fileUrl = await UI.readFile(file, 400 * 1024);
            Store.update("documents", id, {
              fileName: file.name,
              fileUrl,
              status: "pending",
              reviewedBy: "",
              remarks: "",
              updatedAt: new Date().toISOString(),
            });
            UI.toast("Re-uploaded. Document is back in pending review queue.");
            done();
            Views.documents(root, query);
          } catch (err) {
            UI.toast(err.message);
          }
        };
      });
    };
  });
};

