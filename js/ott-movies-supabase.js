const ottMoviesTableBody = document.getElementById("ott-movies-table-body");
const ottMoviesStatus = document.getElementById("ott-movies-status");
const ottMoviesLoading = document.getElementById("ott-movies-loading");

const SUPABASE_URL = window.SUPABASE_URL;
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY;
const TABLE_NAME = "ott_movies";

function setStatus(message, isError = false) {
  if (!ottMoviesStatus) return;
  ottMoviesStatus.textContent = message;
  ottMoviesStatus.classList.toggle("admin-status--error", isError);
  ottMoviesStatus.hidden = !message;
}

function formatReleaseDate(value) {
  if (!value) return "TBA";

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function createMovieRow(movie) {
  const row = document.createElement("tr");

  const nameCell = document.createElement("td");
  nameCell.textContent = movie.movie_name || "-";

  const dateCell = document.createElement("td");
  dateCell.textContent = formatReleaseDate(movie.digital_release_date);

  const partnerCell = document.createElement("td");
  partnerCell.textContent = movie.streaming_partner || "-";

  const categoryCell = document.createElement("td");
  categoryCell.textContent = movie.category || "-";

  row.appendChild(nameCell);
  row.appendChild(dateCell);
  row.appendChild(partnerCell);
  row.appendChild(categoryCell);

  return row;
}

function renderEmptyState(message) {
  if (!ottMoviesTableBody) return;

  ottMoviesTableBody.innerHTML = "";
  const row = document.createElement("tr");
  const cell = document.createElement("td");
  cell.colSpan = 4;
  cell.textContent = message;
  row.appendChild(cell);
  ottMoviesTableBody.appendChild(row);
}

async function loadOttMovies() {
  if (!ottMoviesTableBody || !ottMoviesLoading) return;

  setStatus("");
  ottMoviesLoading.hidden = false;
  ottMoviesTableBody.innerHTML = "";

  const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data, error } = await supabaseClient
    .from(TABLE_NAME)
    .select("*")
    .order("digital_release_date", { ascending: false })
    .order("created_at", { ascending: false });

  ottMoviesLoading.hidden = true;

  if (error) {
    console.error("Fetch OTT movies error:", error);
    setStatus("Unable to load OTT releases right now. Please refresh and try again.", true);
    renderEmptyState("OTT releases could not be loaded.");
    return;
  }

  if (!data || data.length === 0) {
    renderEmptyState("No OTT releases added yet.");
    return;
  }

  data.forEach((movie) => {
    ottMoviesTableBody.appendChild(createMovieRow(movie));
  });
}

loadOttMovies();
