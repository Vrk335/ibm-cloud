const form = document.getElementById("student-form");
const idInput = document.getElementById("student-id");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const ageInput = document.getElementById("age");
const submitBtn = document.getElementById("submit-btn");
const cancelBtn = document.getElementById("cancel-btn");
const formTitle = document.getElementById("form-title");
const tableBody = document.querySelector("#students-table tbody");

async function fetchStudents() {
  const res = await fetch("/students");
  const students = await res.json();
  renderStudents(students);
}

function renderStudents(students) {
  tableBody.innerHTML = "";
  students.forEach((s) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${escapeHtml(s.name)}</td>
      <td>${escapeHtml(s.email)}</td>
      <td>${s.age}</td>
      <td>
        <button class="secondary" data-edit="${s._id}">Edit</button>
        <button class="danger" data-delete="${s._id}">Delete</button>
      </td>
    `;

    tableBody.appendChild(row);
  });
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

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = {
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    age: Number(ageInput.value),
  };

  const id = idInput.value;
  const method = id ? "PUT" : "POST";
  const url = id ? `/students/${id}` : "/students";

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json();
    alert(err.message || "Request failed");
    return;
  }

  setFormMode("create");
  await fetchStudents();
});

cancelBtn.addEventListener("click", () => setFormMode("create"));

tableBody.addEventListener("click", async (e) => {
  const editId = e.target.getAttribute("data-edit");
  const deleteId = e.target.getAttribute("data-delete");

  if (editId) {
    const res = await fetch(`/students/${editId}`);
    if (!res.ok) return alert("Failed to load student");
    const student = await res.json();
    setFormMode("edit", student);
    return;
  }

  if (deleteId) {
    const res = await fetch(`/students/${deleteId}`, { method: "DELETE" });
    if (!res.ok) return alert("Failed to delete student");
    await fetchStudents();
  }
});

function escapeHtml(str) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

fetchStudents();