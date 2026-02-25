const form = document.getElementById("student-form");
const idInput = document.getElementById("student-id");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const ageInput = document.getElementById("age");
const submitBtn = document.getElementById("submit-btn");
const cancelBtn = document.getElementById("cancel-btn");
const formTitle = document.getElementById("form-title");
const tableBody = document.querySelector("#students-table tbody");
const statusEl = document.getElementById("status");
const searchInput = document.getElementById("search");
const sortSelect = document.getElementById("sort");
const statsEl = document.getElementById("stats");
const refreshBtn = document.getElementById("refresh-btn");
const clearSearchBtn = document.getElementById("clear-search-btn");

const state = {
  students: [],
  filter: "",
  sort: "newest",
  loading: false,
};

function setStatus(type, message) {
  statusEl.className = `status ${type}`.trim();
  statusEl.textContent = message;
}

function setLoading(isLoading) {
  state.loading = isLoading;
  submitBtn.disabled = isLoading;
  refreshBtn.disabled = isLoading;
  setStatus(isLoading ? "loading" : "ready", isLoading ? "Loading..." : "Ready");
}

async function fetchStudents() {
  try {
    setLoading(true);
    const res = await fetch("/students");
    if (!res.ok) throw new Error("Failed to load students");
    const students = await res.json();
    state.students = Array.isArray(students) ? students : [];
    render();
  } catch (err) {
    setStatus("error", err.message || "Network error");
  } finally {
    setLoading(false);
  }
}

function render() {
  const filtered = applyFilter(state.students, state.filter);
  const sorted = applySort(filtered, state.sort);
  renderStudents(sorted);
  renderStats(filtered.length, state.students.length);
}

function applyFilter(students, filterText) {
  const q = filterText.trim().toLowerCase();
  if (!q) return students.slice();
  return students.filter((s) => {
    const name = String(s.name || "").toLowerCase();
    const email = String(s.email || "").toLowerCase();
    return name.includes(q) || email.includes(q);
  });
}

function applySort(students, sortKey) {
  const list = students.slice();
  switch (sortKey) {
    case "oldest":
      return list.sort((a, b) => toTime(a.createdAt) - toTime(b.createdAt));
    case "name_asc":
      return list.sort((a, b) => sortText(a.name, b.name));
    case "name_desc":
      return list.sort((a, b) => sortText(b.name, a.name));
    case "age_asc":
      return list.sort((a, b) => (a.age || 0) - (b.age || 0));
    case "age_desc":
      return list.sort((a, b) => (b.age || 0) - (a.age || 0));
    default:
      return list.sort((a, b) => toTime(b.createdAt) - toTime(a.createdAt));
  }
}

function renderStudents(students) {
  tableBody.innerHTML = "";

  if (!students.length) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="4" class="empty">No students found</td>`;
    tableBody.appendChild(row);
    return;
  }

  students.forEach((s) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${escapeHtml(s.name)}</td>
      <td>${escapeHtml(s.email)}</td>
      <td>${s.age ?? ""}</td>
      <td>
        <button class="secondary" data-edit="${s._id}">Edit</button>
        <button class="danger" data-delete="${s._id}">Delete</button>
      </td>
    `;

    tableBody.appendChild(row);
  });
}

function renderStats(showing, total) {
  statsEl.textContent = `Showing ${showing} of ${total}`;
}

function setFormMode(mode, student) {
  if (mode === "edit") {
    formTitle.textContent = "Edit Student";
    submitBtn.textContent = "Update";
    idInput.value = student._id;
    nameInput.value = student.name;
    emailInput.value = student.email;
    ageInput.value = student.age;
  } else {
    formTitle.textContent = "Create Student";
    submitBtn.textContent = "Create";
    idInput.value = "";
    form.reset();
  }
}

function buildPayload() {
  const payload = {
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    age: Number(ageInput.value),
  };

  if (!payload.name || !payload.email || !Number.isFinite(payload.age)) {
    throw new Error("Please provide name, email, and age");
  }

  if (payload.age < 1 || payload.age > 150) {
    throw new Error("Age must be between 1 and 150");
  }

  return payload;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  let payload;

  try {
    payload = buildPayload();
  } catch (err) {
    setStatus("error", err.message || "Invalid input");
    return;
  }

  const id = idInput.value;
  const method = id ? "PUT" : "POST";
  const url = id ? `/students/${id}` : "/students";

  try {
    setLoading(true);
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Request failed");
    }

    setFormMode("create");
    await fetchStudents();
  } catch (err) {
    setStatus("error", err.message || "Request failed");
  } finally {
    setLoading(false);
  }
});

cancelBtn.addEventListener("click", () => setFormMode("create"));

searchInput.addEventListener("input", () => {
  state.filter = searchInput.value;
  render();
});

sortSelect.addEventListener("change", () => {
  state.sort = sortSelect.value;
  render();
});

refreshBtn.addEventListener("click", () => fetchStudents());

clearSearchBtn.addEventListener("click", () => {
  searchInput.value = "";
  state.filter = "";
  render();
});

tableBody.addEventListener("click", async (e) => {
  const editId = e.target.getAttribute("data-edit");
  const deleteId = e.target.getAttribute("data-delete");

  if (editId) {
    try {
      setLoading(true);
      const res = await fetch(`/students/${editId}`);
      if (!res.ok) throw new Error("Failed to load student");
      const student = await res.json();
      setFormMode("edit", student);
    } catch (err) {
      setStatus("error", err.message || "Failed to load student");
    } finally {
      setLoading(false);
    }
    return;
  }

  if (deleteId) {
    const confirmDelete = confirm("Delete this student?");
    if (!confirmDelete) return;

    try {
      setLoading(true);
      const res = await fetch(`/students/${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete student");
      await fetchStudents();
    } catch (err) {
      setStatus("error", err.message || "Failed to delete student");
    } finally {
      setLoading(false);
    }
  }
});

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function toTime(value) {
  const t = new Date(value || 0).getTime();
  return Number.isFinite(t) ? t : 0;
}

function sortText(a, b) {
  return String(a || "").localeCompare(String(b || ""));
}

fetchStudents();