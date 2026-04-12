const submissionsList = document.getElementById("submissions-list");
const adminStatus = document.getElementById("admin-status");
const adminLoading = document.getElementById("admin-loading");

const SUPABASE_URL = window.SUPABASE_URL;
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY;
const TABLE_NAME = "contact_submissions";

function formatCreatedAt(value) {
  if (!value) return "Unknown date";
  const date = new Date(value);
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function setStatus(message, isError = false) {
  if (!adminStatus) return;
  adminStatus.textContent = message;
  adminStatus.classList.toggle("admin-status--error", isError);
  adminStatus.hidden = !message;
}

function createSubmissionCard(submission) {
  const card = document.createElement("article");
  card.className = "submission-card";
  if (submission.is_read) {
    card.classList.add("submission-card--read");
  }

  const top = document.createElement("div");
  top.className = "submission-card__top";

  const title = document.createElement("div");
  title.className = "submission-card__title";
  title.textContent = submission.full_name || "Unnamed";

  const status = document.createElement("span");
  status.className = "submission-card__status";
  status.textContent = submission.is_read ? "Read" : "Unread";
  title.appendChild(status);

  const date = document.createElement("time");
  date.className = "submission-card__date";
  date.dateTime = submission.created_at || "";
  date.textContent = formatCreatedAt(submission.created_at);

  top.appendChild(title);
  top.appendChild(date);

  const email = document.createElement("p");
  email.className = "submission-card__meta";
  email.innerHTML = `<strong>Email:</strong> <a href="mailto:${submission.email}">${submission.email || "-"}</a>`;

  const subject = document.createElement("p");
  subject.className = "submission-card__meta";
  subject.innerHTML = `<strong>Subject:</strong> ${submission.subject || "(no subject)"}`;

  const message = document.createElement("p");
  message.className = "submission-card__message";
  message.textContent = submission.message || "(no message)";

  const controls = document.createElement("div");
  controls.className = "submission-card__controls";

  const markReadButton = document.createElement("button");
  markReadButton.type = "button";
  markReadButton.className = "submission-card__button";
  markReadButton.textContent = submission.is_read ? "Already read" : "Mark as read";
  markReadButton.disabled = submission.is_read;

  markReadButton.addEventListener("click", async () => {
    if (submission.is_read) return;
    markReadButton.disabled = true;
    markReadButton.textContent = "Saving…";
    setStatus("");

    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { error } = await supabaseClient
      .from(TABLE_NAME)
      .update({ is_read: true })
      .eq("id", submission.id);

    if (error) {
      console.error("Mark read error:", error);
      setStatus("Unable to update read status. Please try again.", true);
      markReadButton.disabled = false;
      markReadButton.textContent = "Mark as read";
      return;
    }

    submission.is_read = true;
    card.classList.add("submission-card--read");
    status.textContent = "Read";
    markReadButton.textContent = "Already read";
  });

  controls.appendChild(markReadButton);

  card.appendChild(top);
  card.appendChild(email);
  card.appendChild(subject);
  card.appendChild(message);
  card.appendChild(controls);

  return card;
}

async function loadSubmissions() {
  if (!submissionsList || !adminLoading) return;
  setStatus("");
  adminLoading.hidden = false;
  submissionsList.innerHTML = "";

  const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data, error } = await supabaseClient
    .from(TABLE_NAME)
    .select("*")
    .order("created_at", { ascending: false });

  adminLoading.hidden = true;

  if (error) {
    console.error("Fetch submissions error:", error);
    setStatus("Unable to load submissions. Please refresh.", true);
    return;
  }

  if (!data || data.length === 0) {
    submissionsList.innerHTML = "<p class=\"admin-empty\">No submissions found.</p>";
    return;
  }

  data.forEach((submission) => {
    const card = createSubmissionCard(submission);
    submissionsList.appendChild(card);
  });
}

loadSubmissions();
