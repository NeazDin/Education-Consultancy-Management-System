window.Views = window.Views || {};

(function () {
  let activeSearchQuery = "";
  let userPickerRoleFilter = "all";
  let userPickerSearchQuery = "";

  Views.messages = function (root, query) {
    if (!Auth.user) return;

    const currentUserId = Auth.user.id;
    const urlParams = new URLSearchParams(query || "");
    let activePartnerId = urlParams.get("to") || Views._activeMessagePartnerId || null;

    // Get all conversations for current user
    const conversations = Store.getConversations(currentUserId);

    // If no active partner specified, pick the first from existing conversations, or default to first available user
    if (!activePartnerId && conversations.length > 0) {
      activePartnerId = conversations[0].partnerId;
    }

    // If still no active partner, pick any other user in the directory
    if (!activePartnerId) {
      const allUsers = Store.getAllMessageableUsers(currentUserId);
      if (allUsers.length > 0) {
        activePartnerId = allUsers[0].id;
      }
    }

    Views._activeMessagePartnerId = activePartnerId;

    // Filter conversations based on sidebar search
    const filteredConversations = conversations.filter((c) => {
      if (!activeSearchQuery.trim()) return true;
      const q = activeSearchQuery.toLowerCase().trim();
      const partnerName = (c.partner && c.partner.name ? c.partner.name : "").toLowerCase();
      const partnerRole = (c.partner && c.partner.role ? c.partner.role : "").toLowerCase();
      const lastText = (c.lastMessage && c.lastMessage.text ? c.lastMessage.text : "").toLowerCase();
      const studentCode = (c.partnerStudent && c.partnerStudent.studentCode ? c.partnerStudent.studentCode : "").toLowerCase();
      return partnerName.includes(q) || partnerRole.includes(q) || lastText.includes(q) || studentCode.includes(q);
    });

    // Mark current active conversation as read
    if (activePartnerId) {
      Store.markConversationRead(currentUserId, activePartnerId);
      UI.updateMessageBadge();
    }

    // Get active partner info and thread messages
    let activePartner = activePartnerId ? Store.user(activePartnerId) : null;
    let activeStudent = activePartner && activePartner.studentId ? Store.student(activePartner.studentId) : null;

    // Fallback if user object was dynamically student-based
    if (!activePartner && activePartnerId && activePartnerId.startsWith("u-st-")) {
      const sId = activePartnerId.replace(/^u-/, "");
      activeStudent = Store.student(sId);
      if (activeStudent) {
        activePartner = {
          id: activePartnerId,
          name: activeStudent.name,
          email: activeStudent.email,
          role: "student",
          studentId: activeStudent.id,
        };
      }
    }

    const threadMessages = activePartnerId ? Store.getThread(currentUserId, activePartnerId) : [];
    const totalUnread = Store.getUnreadMessageCount(currentUserId);

    root.innerHTML = `
      <div class="inbox-page-wrapper">
        <!-- Top Action Toolbar -->
        <div class="toolbar" style="margin-bottom: 16px;">
          <div>
            <h2 style="font-size:1.3rem; display:flex; align-items:center; gap:8px;">
              <span>💬 Direct Messages &amp; Inbox</span>
              ${totalUnread > 0 ? `<span class="chip-unread-counter">${totalUnread} New</span>` : ""}
            </h2>
            <p class="muted" style="margin-top:2px;">Chat and coordinate with any student, counselor, trainer, or administrator across Education XYZ BD.</p>
          </div>
          <div class="btn-row">
            <button class="btn btn-primary" id="btn-compose-new-msg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px;"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              + New Message to Anybody
            </button>
          </div>
        </div>

        <!-- Main 2-Column Messaging Hub -->
        <div class="inbox-layout">
          <!-- Left Column: Conversations & Contacts List -->
          <aside class="inbox-sidebar">
            <div class="inbox-search-box">
              <div class="search-input-wrap">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input type="text" id="inbox-search-input" placeholder="Search chats or names..." value="${UI.esc(activeSearchQuery)}">
                ${activeSearchQuery ? `<button type="button" class="btn-clear-search" id="btn-clear-chat-search">✕</button>` : ""}
              </div>
            </div>

            <div class="inbox-convos-list">
              ${
                filteredConversations.length > 0
                  ? filteredConversations
                      .map((c) => {
                        const isSelected = c.partnerId === activePartnerId;
                        const partner = c.partner || {};
                        const st = c.partnerStudent;
                        const role = partner.role || "member";
                        const initial = (partner.name || "U").charAt(0).toUpperCase();
                        const timeStr = c.lastMessage ? UI.timeAgo(c.lastMessage.sentAt) : "";
                        const lastSnippet = c.lastMessage ? UI.esc(c.lastMessage.text) : "No messages yet";
                        const isSenderMe = c.lastMessage && c.lastMessage.fromUserId === currentUserId;
                        const subtitle = st ? (st.studentCode || `Student`) : (partner.title || role.toUpperCase());

                        return `
                          <div class="inbox-convo-item ${isSelected ? "active" : ""} ${c.unreadCount > 0 ? "has-unread" : ""}" data-partner-id="${UI.esc(c.partnerId)}">
                            <div class="convo-avatar-wrap">
                              <div class="convo-avatar role-${UI.esc(role)}">${UI.esc(initial)}</div>
                              <span class="convo-status-dot"></span>
                            </div>
                            <div class="convo-details">
                              <div class="convo-top-row">
                                <span class="convo-name">${UI.esc(partner.name || "User")}</span>
                                <span class="convo-time">${timeStr}</span>
                              </div>
                              <div class="convo-meta-row">
                                <span class="convo-role-badge role-${UI.esc(role)}">${UI.esc(subtitle)}</span>
                                ${c.unreadCount > 0 ? `<span class="convo-unread-pill">${c.unreadCount}</span>` : ""}
                              </div>
                              <div class="convo-snippet">
                                ${isSenderMe ? `<span class="snippet-prefix">You: </span>` : ""}
                                <span>${lastSnippet}</span>
                              </div>
                            </div>
                          </div>
                        `;
                      })
                      .join("")
                  : `
                    <div class="inbox-empty-sidebar">
                      <div class="empty-icon">💬</div>
                      <p><strong>${activeSearchQuery ? "No matches found" : "No recent chats"}</strong></p>
                      <p class="muted" style="font-size:0.8rem;">Click "+ New Message to Anybody" above to start chatting with anyone in the system.</p>
                      <button class="btn btn-sm btn-ghost" id="btn-quick-new-msg" style="margin-top:8px;">Browse All Users</button>
                    </div>
                  `
              }
            </div>
          </aside>

          <!-- Right Column: Active Conversation Pane -->
          <main class="inbox-chat-pane">
            ${
              activePartner
                ? renderChatThreadHtml(currentUserId, activePartner, activeStudent, threadMessages)
                : `
                  <div class="inbox-no-selection">
                    <div class="empty-state-card">
                      <div class="empty-icon-large">✉️</div>
                      <h3>Select a Conversation</h3>
                      <p class="muted">Pick a conversation from the left sidebar or start a new message with any student, counselor, instructor, accountant, or administrator.</p>
                      <button class="btn btn-primary" id="btn-pane-new-msg" style="margin-top:12px;">+ Send a New Message</button>
                    </div>
                  </div>
                `
            }
          </main>
        </div>
      </div>
    `;

    // --- Wire Event Handlers ---

    // 1. Sidebar Search input
    const searchInput = root.querySelector("#inbox-search-input");
    if (searchInput) {
      searchInput.oninput = (e) => {
        activeSearchQuery = e.target.value;
        Views.messages(root, `to=${activePartnerId || ""}`);
      };
    }
    const clearSearchBtn = root.querySelector("#btn-clear-chat-search");
    if (clearSearchBtn) {
      clearSearchBtn.onclick = () => {
        activeSearchQuery = "";
        Views.messages(root, `to=${activePartnerId || ""}`);
      };
    }

    // 2. Select conversation from sidebar list
    root.querySelectorAll(".inbox-convo-item").forEach((item) => {
      item.onclick = () => {
        const partnerId = item.getAttribute("data-partner-id");
        if (partnerId) {
          Views._activeMessagePartnerId = partnerId;
          try {
            history.replaceState(null, "", `#/messages?to=${partnerId}`);
          } catch (e) {}
          Views.messages(root, `to=${partnerId}`);
        }
      };
    });

    // 3. Compose New Message button click
    const btnCompose = root.querySelector("#btn-compose-new-msg");
    const btnQuickCompose = root.querySelector("#btn-quick-new-msg");
    const btnPaneCompose = root.querySelector("#btn-pane-new-msg");
    const openComposer = () => openUserPickerModal(currentUserId, (selectedUserId) => {
      Views._activeMessagePartnerId = selectedUserId;
      try {
        history.replaceState(null, "", `#/messages?to=${selectedUserId}`);
      } catch (e) {}
      Views.messages(root, `to=${selectedUserId}`);
    });

    if (btnCompose) btnCompose.onclick = openComposer;
    if (btnQuickCompose) btnQuickCompose.onclick = openComposer;
    if (btnPaneCompose) btnPaneCompose.onclick = openComposer;

    // 4. Send Message Form Submit
    const sendForm = root.querySelector("#inbox-send-form");
    const msgInput = root.querySelector("#inbox-msg-input");
    const messagesStream = root.querySelector("#inbox-messages-stream");

    if (messagesStream) {
      messagesStream.scrollTop = messagesStream.scrollHeight;
    }

    if (sendForm && msgInput && activePartner) {
      // Auto-submit on Enter (without Shift)
      msgInput.onkeydown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          sendForm.requestSubmit();
        }
      };

      sendForm.onsubmit = (e) => {
        e.preventDefault();
        const text = msgInput.value.trim();
        if (!text) return;
        msgInput.value = "";

        // Send message in Store
        Store.sendMessage(currentUserId, activePartner.id, text, activePartner.role || "");

        UI.updateMessageBadge();

        // Refresh view immediately
        Views.messages(root, `to=${activePartner.id}`);

        // Trigger intelligent simulated reply after short delay
        triggerSimulatedReply(activePartner, text, (replyMsg) => {
          UI.updateMessageBadge();
          // If the user is still looking at this thread, refresh view
          if (Views._activeMessagePartnerId === activePartner.id) {
            Views.messages(root, `to=${activePartner.id}`);
          }
          UI.toast(`💬 New message from ${activePartner.name}`);
        });
      };
    }

    // 5. Quick suggestion chips click
    root.querySelectorAll(".quick-chip-btn").forEach((chip) => {
      chip.onclick = () => {
        if (!msgInput) return;
        msgInput.value = chip.getAttribute("data-text") || "";
        msgInput.focus();
      };
    });

    // 6. View Profile button & Header click
    const btnViewProfile = root.querySelector("#btn-view-contact-profile");
    const headerClickable = root.querySelector("#chat-header-user-clickable");
    const handleProfileClick = () => {
      if (activePartner) {
        showUserProfileModal(activePartner, activeStudent);
      }
    };
    if (btnViewProfile) btnViewProfile.onclick = handleProfileClick;
    if (headerClickable) headerClickable.onclick = handleProfileClick;
  };

  // Helper to render the active chat pane HTML
  function renderChatThreadHtml(currentUserId, partner, student, messages) {
    const role = partner.role || "member";
    const initial = (partner.name || "U").charAt(0).toUpperCase();
    const isStudent = role === "student" || !!student;
    const titleOrCode = student ? (student.studentCode || "Student") : (partner.title || (partner.staffId ? `${partner.staffId} · ${role.toUpperCase()}` : role.toUpperCase()));

    // Group messages by calendar date
    const groupedMessages = [];
    let lastDateStr = null;

    messages.forEach((m) => {
      const msgDate = new Date(m.sentAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
      if (msgDate !== lastDateStr) {
        lastDateStr = msgDate;
        groupedMessages.push({ isDivider: true, dateText: msgDate });
      }
      groupedMessages.push({ isDivider: false, ...m });
    });

    // Dynamic quick suggestion chips based on roles
    const quickChips = getQuickChips(Auth.role(), role, partner.name);

    return `
      <!-- Chat Header -->
      <header class="inbox-chat-header">
        <div class="chat-header-user" id="chat-header-user-clickable" style="cursor:pointer;" title="Click to view full profile">
          <div class="convo-avatar role-${UI.esc(role)} large">${UI.esc(initial)}</div>
          <div class="chat-header-info">
            <div class="chat-header-name-row">
              <h3>${UI.esc(partner.name)}</h3>
              <span class="convo-role-badge role-${UI.esc(role)}">${UI.esc(titleOrCode)}</span>
            </div>
            <div class="chat-header-sub">
              <span>✉️ ${UI.esc(partner.email || "No email")}</span>
              ${partner.phone ? `<span>📞 ${UI.esc(partner.phone)}</span>` : ""}
              <span class="status-online"><span class="pulse-dot-sm"></span> Active Online</span>
            </div>
          </div>
        </div>
        <div class="chat-header-actions">
          <button type="button" class="btn btn-sm btn-ghost" id="btn-view-contact-profile" title="View contact details &amp; profile">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            View Profile
          </button>
        </div>
      </header>

      <!-- Messages Stream -->
      <div class="inbox-messages-stream" id="inbox-messages-stream">
        ${
          groupedMessages.length > 0
            ? groupedMessages
                .map((item) => {
                  if (item.isDivider) {
                    return `<div class="chat-date-divider"><span>${UI.esc(item.dateText)}</span></div>`;
                  }
                  const isMine = item.fromUserId === currentUserId;
                  const time = new Date(item.sentAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
                  const senderName = isMine ? "You" : partner.name;

                  return `
                    <div class="chat-msg-row ${isMine ? "outgoing" : "incoming"}">
                      <div class="chat-msg-bubble">
                        <div class="msg-author">${UI.esc(senderName)}</div>
                        <div class="msg-content">${UI.esc(item.text)}</div>
                        <div class="msg-footer">
                          <span class="msg-timestamp">${time}</span>
                          ${isMine ? `<span class="msg-seen-check" title="Delivered &amp; Seen">✓✓</span>` : ""}
                        </div>
                      </div>
                    </div>
                  `;
                })
                .join("")
            : `
              <div class="chat-stream-empty">
                <div class="empty-icon-sm">👋</div>
                <h4>Start the conversation with ${UI.esc(partner.name)}</h4>
                <p class="muted">Send a message below or click one of the quick question suggestions to get started.</p>
              </div>
            `
        }
      </div>

      <!-- Quick Suggestion Chips -->
      ${
        quickChips.length > 0
          ? `
            <div class="quick-chips-bar">
              <span class="quick-chips-label">Quick Suggestions:</span>
              <div class="quick-chips-scroll">
                ${quickChips
                  .map(
                    (chip) =>
                      `<button type="button" class="quick-chip-btn" data-text="${UI.esc(chip)}">${UI.esc(chip)}</button>`
                  )
                  .join("")}
              </div>
            </div>
          `
          : ""
      }

      <!-- Compose Footer -->
      <footer class="inbox-compose-footer">
        <form id="inbox-send-form" class="inbox-compose-form">
          <textarea
            id="inbox-msg-input"
            rows="2"
            placeholder="Type your message to ${UI.esc(partner.name)}... (Press Enter to send, Shift+Enter for new line)"
            required
            autocomplete="off"
          ></textarea>
          <button type="submit" class="btn btn-primary btn-send-msg" id="btn-submit-msg">
            <span>Send</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </form>
      </footer>
    `;
  }

  // Quick suggestion chips based on context
  function getQuickChips(myRole, targetRole, targetName) {
    if (myRole === "student") {
      if (targetRole === "instructor") {
        return [
          "Sir, could you review my Writing Task 2 essay thesis?",
          "When is the next IELTS full mock test scheduled?",
          "Thank you for today's class lecture and notes!",
        ];
      }
      if (targetRole === "counselor") {
        return [
          "Hi! I have uploaded my updated passport and academic transcripts.",
          "Could you check if my Statement of Purpose (SOP) is ready for submission?",
          "When should I expect the university conditional offer letter?",
        ];
      }
      if (targetRole === "admission_officer") {
        return [
          "Could you check if my university conditional offer letter has arrived?",
          "I have submitted the requested academic transcripts and certificates.",
          "What is the deadline to deposit the CAS / tuition acceptance fee?",
        ];
      }
      if (targetRole === "hr") {
        return [
          "Hello HR department, I have an inquiry about student campus ambassador roles.",
          "Could you guide me to the counselor assigned to my target destination?",
        ];
      }
      if (targetRole === "accountant") {
        return [
          "Hello! Could you please verify my recent tuition fee payment receipt?",
          "What is my pending balance for the upcoming semester processing?",
        ];
      }
      return [
        "Hello! I have an inquiry regarding my study-abroad counseling file.",
        "Could you please guide me on the next milestone steps?",
      ];
    } else if (myRole === "admission_officer") {
      if (targetRole === "student") {
        return [
          `Dear ${targetName}, your university conditional offer letter has been received!`,
          `Hello ${targetName}, please submit your official transcripts for CAS processing.`,
          `Dear ${targetName}, the university has verified your application documents successfully.`,
        ];
      }
      return [
        "Admissions update: Partner university has issued 3 new offer letters today.",
        "Please verify the student CAS checklist before final embassy lodgement.",
        "New intake requirements for Russell Group universities are now active.",
      ];
    } else if (myRole === "hr") {
      if (targetRole === "student") {
        return [
          `Hello ${targetName}! Welcome to Education XYZ BD. We are here to support your study abroad journey.`,
          `Hi ${targetName}, please let us know if you need assistance connecting with your counselor.`,
        ];
      }
      return [
        "Reminder: Monthly team performance and attendance logs are due this Friday.",
        "Staff notice: Upcoming British Council training workshop registration is open.",
        "Please check your work email for the updated employee policy guidelines.",
      ];
    } else {
      // Staff / Counselor / Instructor / Admin / Accountant
      if (targetRole === "student") {
        return [
          `Hello ${targetName}! Please check your portal document checklist and upload missing files.`,
          `Hi ${targetName}! Your application profile assessment is progressing smoothly.`,
          `Dear ${targetName}, please remember to attend tomorrow's IELTS lecture on time.`,
          `Great performance on your recent evaluation test! Keep up the momentum.`,
        ];
      }
      return [
        "Hello! Let's sync up regarding student files for next week's intake.",
        "Please review the updated university admissions pipeline report.",
        "Received your notes, will follow up at the office meeting.",
      ];
    }
  }

  // User Picker Modal: "New Message to Anybody"
  function openUserPickerModal(currentUserId, onSelect) {
    const allUsers = Store.getAllMessageableUsers(currentUserId);
    userPickerSearchQuery = "";
    userPickerRoleFilter = "all";

    const modalHtml = `
      <div class="user-picker-wrap">
        <div class="picker-search-bar">
          <input type="text" id="picker-search-input" placeholder="Search everybody: name, email, student ID, staff ID, role..." autocomplete="off">
        </div>

        <div class="picker-role-pills" id="picker-role-tabs">
          <button type="button" class="picker-pill active" data-role="all">All (${allUsers.length})</button>
          <button type="button" class="picker-pill" data-role="student">Students</button>
          <button type="button" class="picker-pill" data-role="counselor">Counselors</button>
          <button type="button" class="picker-pill" data-role="admission_officer">Admissions</button>
          <button type="button" class="picker-pill" data-role="instructor">Instructors</button>
          <button type="button" class="picker-pill" data-role="hr">HR</button>
          <button type="button" class="picker-pill" data-role="accountant">Accounts</button>
          <button type="button" class="picker-pill" data-role="admin">Admins</button>
        </div>

        <div class="picker-users-list" id="picker-users-container">
          <!-- Populated by helper -->
        </div>
      </div>
    `;

    UI.modal("Send New Message · Select Contact", modalHtml, (modal, done) => {
      const container = modal.querySelector("#picker-users-container");
      const searchInp = modal.querySelector("#picker-search-input");
      const tabs = modal.querySelectorAll(".picker-pill");

      function renderList() {
        const q = userPickerSearchQuery.toLowerCase().trim();
        const role = userPickerRoleFilter;

        const filtered = allUsers.filter((u) => {
          if (role !== "all" && u.role !== role) return false;
          if (!q) return true;
          const name = (u.name || "").toLowerCase();
          const email = (u.email || "").toLowerCase();
          const uRole = (u.role || "").toLowerCase();
          const code = (u.code || "").toLowerCase();
          const sub = (u.sub || "").toLowerCase();
          return name.includes(q) || email.includes(q) || uRole.includes(q) || code.includes(q) || sub.includes(q);
        });

        if (!filtered.length) {
          container.innerHTML = `<div class="picker-empty">No users match "${UI.esc(q || role)}". Try a different search term.</div>`;
          return;
        }

        container.innerHTML = filtered
          .map((u) => {
            const initial = (u.name || "U").charAt(0).toUpperCase();
            return `
              <div class="picker-user-card" data-user-id="${UI.esc(u.id)}">
                <div class="convo-avatar role-${UI.esc(u.role)}">${UI.esc(initial)}</div>
                <div class="picker-user-info">
                  <div class="picker-name-row">
                    <strong>${UI.esc(u.name)}</strong>
                    <span class="convo-role-badge role-${UI.esc(u.role)}">${UI.esc(u.role.toUpperCase())}</span>
                  </div>
                  <div class="picker-meta-row">
                    ${u.code ? `<span class="code-badge-sm">${UI.esc(u.code)}</span>` : ""}
                    <span class="picker-sub">${UI.esc(u.sub || u.email)}</span>
                  </div>
                </div>
                <button type="button" class="btn btn-sm btn-primary picker-action-btn">Message →</button>
              </div>
            `;
          })
          .join("");

        container.querySelectorAll(".picker-user-card").forEach((card) => {
          card.onclick = () => {
            const id = card.getAttribute("data-user-id");
            done();
            onSelect(id);
          };
        });
      }

      renderList();

      searchInp.oninput = (e) => {
        userPickerSearchQuery = e.target.value;
        renderList();
      };

      tabs.forEach((tab) => {
        tab.onclick = () => {
          tabs.forEach((t) => t.classList.remove("active"));
          tab.classList.add("active");
          userPickerRoleFilter = tab.getAttribute("data-role") || "all";
          renderList();
        };
      });

      searchInp.focus();
    });
  }

  // Simulated auto-reply for realistic interactive communication
  function triggerSimulatedReply(partner, outgoingText, onReply) {
    // Only auto-reply if sending to a different simulated persona
    if (!partner || partner.id === Auth.user.id) return;

    setTimeout(() => {
      let replyText = "";
      const role = partner.role || "staff";

      if (role === "instructor") {
        replyText = `Hi ${Auth.user.name.split(" ")[0]}! I noted your message: "${outgoingText}". Let's review this in detail during our upcoming batch session. Keep up the high effort!`;
      } else if (role === "counselor") {
        replyText = `Hello ${Auth.user.name.split(" ")[0]}! Thank you for the update. I have marked this in your counseling file and will verify the university checklist today.`;
      } else if (role === "admission_officer") {
        replyText = `Hello ${Auth.user.name.split(" ")[0]}! Admissions Department has received your message. We are coordinating with the partner university admissions team and will update your file shortly.`;
      } else if (role === "hr") {
        replyText = `Hello ${Auth.user.name.split(" ")[0]}! HR Department here. Your inquiry has been noted and our team will provide administrative follow-up promptly.`;
      } else if (role === "accountant") {
        replyText = `Dear ${Auth.user.name}, thank you for reaching out to Accounts. Your query has been logged and the financial ledger will be reconciled accordingly.`;
      } else if (role === "admin") {
        replyText = `Education XYZ BD Office: Received your message. Our management team is addressing your inquiry. Contact our front desk at 01781-827022 if urgent.`;
      } else if (role === "student") {
        replyText = `Thank you so much! I got your message. I'm preparing my materials and will check back with you soon!`;
      } else {
        replyText = `Thank you for your message, ${Auth.user.name}. I will follow up shortly!`;
      }

      const replyMsg = Store.sendMessage(partner.id, Auth.user.id, replyText, role);
      if (onReply) onReply(replyMsg);
    }, 1300);
  }

  // Interactive Contact Profile Modal
  function showUserProfileModal(partner, student) {
    if (!partner) return;
    const role = partner.role || "member";
    const initial = (partner.name || "U").charAt(0).toUpperCase();
    const isStudent = role === "student" || !!student;

    let extraDetailsHtml = "";

    if (isStudent) {
      const st = student || (partner.studentId ? Store.student(partner.studentId) : null);
      const studentId = st ? st.id : (partner.studentId || null);
      const ens = studentId ? Store.list("enrollments").filter((e) => e.studentId === studentId) : [];
      const apps = studentId ? Store.list("applications").filter((a) => a.studentId === studentId) : [];
      const classId = ens.length ? (ens[0].classStudentId || "—") : "Not enrolled yet";

      const canViewStudentDossier = Auth.is("admin", "counselor", "instructor", "accountant", "admission_officer", "hr") && st;

      extraDetailsHtml = `
        <div class="profile-modal-section">
          <h4 style="font-size:0.85rem; color:var(--ink-muted); text-transform:uppercase; margin-bottom:8px;">Academic &amp; Consultancy Details</h4>
          <dl class="dl" style="margin:0;">
            <dt>Official Student ID</dt>
            <dd><span class="student-code-badge">${UI.esc(st ? (st.studentCode || st.id) : (partner.studentId || "Student"))}</span></dd>
            <dt>IELTS Class Student ID</dt>
            <dd><span class="class-id-badge">${UI.esc(classId)}</span></dd>
            <dt>Target Destination</dt>
            <dd><strong>${UI.esc(st ? (st.targetCountry || "Not Specified") : "Study Abroad")}</strong></dd>
            <dt>Consultancy Goal</dt>
            <dd>${UI.chip(st ? (st.interestType || "both") : "both")}</dd>
            ${st && st.createdAt ? `<dt>Registered Date</dt><dd>${UI.date(st.createdAt)}</dd>` : ""}
            ${
              apps.length
                ? `<dt>Active Application</dt>
                   <dd>
                     <strong>${UI.esc(apps[0].targetUniversity || apps[0].targetCountry)}</strong>
                     <br><span class="chip ${apps[0].stage}">${apps[0].stage.toUpperCase()}</span>
                     ${apps[0].visaDeadline ? `<small class="muted"> · Visa Target: ${UI.esc(apps[0].visaDeadline)}</small>` : ""}
                   </dd>`
                : ""
            }
          </dl>
        </div>
        ${
          canViewStudentDossier
            ? `<div class="btn-row" style="margin-top:16px; border-top:1px solid var(--line); padding-top:12px;">
                 <a href="#/students/${st.id}" class="btn btn-primary btn-sm" data-close-action>Open Full Student Dossier &amp; Files →</a>
               </div>`
            : ""
        }
      `;
    } else {
      // Staff / Counselor / Instructor / Admin / Accountant
      extraDetailsHtml = `
        <div class="profile-modal-section">
          <h4 style="font-size:0.85rem; color:var(--ink-muted); text-transform:uppercase; margin-bottom:8px;">Official Position &amp; Office Details</h4>
          <dl class="dl" style="margin:0;">
            <dt>Staff ID</dt>
            <dd><span class="code-badge" style="background:var(--primary-light); color:var(--primary); font-weight:700;">${UI.esc(partner.staffId || "Official Staff")}</span></dd>
            <dt>Designation</dt>
            <dd><strong>${UI.esc(partner.title || role.toUpperCase())}</strong></dd>
            ${partner.credentials ? `<dt>Certifications</dt><dd>${UI.esc(partner.credentials)}</dd>` : ""}
            ${partner.officeHours ? `<dt>Office Hours</dt><dd>${UI.esc(partner.officeHours)}</dd>` : ""}
            ${partner.room ? `<dt>Office / Room</dt><dd>${UI.esc(partner.room)}</dd>` : ""}
            ${partner.bio ? `<dt>About / Bio</dt><dd style="font-size:0.88rem; line-height:1.5;">${UI.esc(partner.bio)}</dd>` : ""}
          </dl>
        </div>
      `;
    }

    const modalHtml = `
      <div class="contact-profile-card">
        <div class="contact-profile-hero">
          <div class="convo-avatar role-${UI.esc(role)} large" style="width:64px; height:64px; font-size:1.6rem;">${UI.esc(initial)}</div>
          <div class="contact-profile-title">
            <h3 style="font-size:1.3rem; margin:0 0 4px;">${UI.esc(partner.name)}</h3>
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="convo-role-badge role-${UI.esc(role)}">${UI.esc(partner.title || role.toUpperCase())}</span>
              <span class="status-online"><span class="pulse-dot-sm"></span> Active Online</span>
            </div>
          </div>
        </div>

        <div class="contact-profile-body" style="margin-top:16px;">
          <div class="contact-reach-box">
            <div>
              <small class="muted" style="display:block; font-size:0.75rem; font-weight:700; text-transform:uppercase;">Email Address</small>
              <a href="mailto:${UI.esc(partner.email)}" style="font-size:0.88rem; word-break:break-all;">${UI.esc(partner.email || "—")}</a>
            </div>
            <div>
              <small class="muted" style="display:block; font-size:0.75rem; font-weight:700; text-transform:uppercase;">Contact Phone</small>
              <span style="font-size:0.88rem;">${UI.esc(partner.phone || "01781-827022")}</span>
            </div>
          </div>

          ${extraDetailsHtml}
        </div>

        <div class="btn-row" style="margin-top:20px; justify-content:flex-end;">
          <button type="button" class="btn btn-ghost btn-sm" data-close>Close</button>
        </div>
      </div>
    `;

    UI.modal(`Profile · ${partner.name}`, modalHtml, (modal, done) => {
      modal.querySelector("[data-close]").onclick = done;
      const closeAction = modal.querySelector("[data-close-action]");
      if (closeAction) {
        closeAction.onclick = () => {
          done();
        };
      }
    });
  }
})();
