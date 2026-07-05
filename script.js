const API = "https://jsonplaceholder.typicode.com/users";

let users = [];
let editId = null;

// ✅ Pagination
let currentPage = 1;
let rowsPerPage = 10;
let filteredUsers = [];

function showLoader() {
  document.getElementById("loader").style.display = "block";
}

function hideLoader() {
  document.getElementById("loader").style.display = "none";
}

// 🔹 Generate Sequential ID
function getNextId() {
  if (users.length === 0) return 1;
  const maxId = Math.max(...users.map(u => u.id));
  return maxId + 1;
}

// 🔹 Save to localStorage
function saveToLocalStorage() {
  localStorage.setItem("users", JSON.stringify(users));
}

// 🔹 Fetch Users
async function fetchUsers() {
  showLoader(); // ON

  setTimeout(async () => {
    const res = await fetch(API);
    const apiUsers = await res.json();

    const localData = localStorage.getItem("users");
    let localUsers = localData ? JSON.parse(localData) : [];

    users = [
      ...new Map([...apiUsers, ...localUsers].map(u => [u.id, u])).values()
    ];

    displayUsers(users);

    hideLoader(); // OFF
  }, 2000); // 🔥 2 sec delay
}

// 🔹 Pagination Logic
function paginateData(data) {
  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  return data.slice(start, end);
}

// 🔹 Display Users (🔥 FIXED BUTTON ALIGNMENT)
function displayUsers(data = users) {
  const container = document.getElementById("userContainer");
  container.innerHTML = "";

  filteredUsers = data;

  const paginatedUsers = paginateData(data);

  paginatedUsers.forEach(user => {
    const card = document.createElement("div");
    card.classList.add("user-card");

    card.innerHTML = `
      <h3>${user.name}</h3>
      <p><strong>ID:</strong> ${user.id}</p>
      <p><strong>Email:</strong> ${user.email}</p>
      <p><strong>Department:</strong> ${user.department || user.company?.name || "IT"}</p>

      <div class="card-actions">
        <button class="edit-btn" onclick="editUser(${user.id})">Edit</button>
        <button class="delete-btn" onclick="deleteUser(${user.id})">Delete</button>
      </div>
    `;

    container.appendChild(card);
  });

  setupPagination(data);
}

// 🔢 Pagination Buttons
function setupPagination(data) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  const pageCount = Math.ceil(data.length / rowsPerPage);

  for (let i = 1; i <= pageCount; i++) {
    const btn = document.createElement("button");
    btn.innerText = i;

    if (i === currentPage) {
      btn.classList.add("active");
    }

    btn.onclick = () => {
      currentPage = i;
      displayUsers(filteredUsers);
    };

    pagination.appendChild(btn);
  }
}

// 🔽 Rows per page
function changeRows(value) {
  rowsPerPage = Number(value);
  currentPage = 1;
  displayUsers(filteredUsers);
}

// 🔹 Open Form
function openForm() {
  editId = null;

  document.getElementById("name").value = "";
  document.getElementById("email").value = "";
  document.getElementById("department").value = "";

  document.getElementById("formModal").style.display = "block";
}

// 🔹 Close Form
function closeForm() {
  document.getElementById("formModal").style.display = "none";
}

// 🔹 Save User
function saveUser() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const department = document.getElementById("department").value;

  if (!name || !email) {
    alert("Please fill all fields");
    return;
  }

  if (editId) {
    users = users.map(user =>
      user.id === editId
        ? { ...user, name, email, department }
        : user
    );
  } else {
    const newUser = {
      id: getNextId(),
      name,
      email,
      department
    };
    users.push(newUser);
  }

  saveToLocalStorage();
  currentPage = 1;
  displayUsers(users);
  closeForm();
}

// 🔹 Edit User
function editUser(id) {
  const user = users.find(u => u.id === id);

  editId = id;

  document.getElementById("name").value = user.name;
  document.getElementById("email").value = user.email;
  document.getElementById("department").value = user.department || "";

  document.getElementById("formModal").style.display = "block";
}

function deleteUser(id) {
  console.log("Deleting ID:", id);

  if (!confirm("Delete user?")) return;

  users = users.filter(user => user.id != id);

  saveToLocalStorage();

  filteredUsers = users; // important
  currentPage = 1;

  displayUsers(users);
}

// 🔍 Search
document.getElementById("search").addEventListener("input", (e) => {
  const value = e.target.value.toLowerCase();

  const filtered = users.filter(user =>
    user.name.toLowerCase().includes(value) ||
    user.email.toLowerCase().includes(value)
  );

  currentPage = 1;
  displayUsers(filtered);
});

// 🔹 Filter
function openFilter() {
  document.getElementById("filterModal").style.display = "block";
}

function closeFilter() {
  document.getElementById("filterModal").style.display = "none";
}

function applyFilter() {
  const name = document.getElementById("filterName").value.toLowerCase();
  const email = document.getElementById("filterEmail").value.toLowerCase();
  const dept = document.getElementById("filterDept").value.toLowerCase();

  const filtered = users.filter(user => {
    return (
      (!name || user.name.toLowerCase().includes(name)) &&
      (!email || user.email.toLowerCase().includes(email)) &&
      (!dept || (user.department || user.company?.name || "").toLowerCase().includes(dept))
    );
  });

  currentPage = 1;
  displayUsers(filtered);
  closeFilter();
}

// 🔹 Sorting
function handleSort(value) {
  let sorted = [...filteredUsers];

  if (value === "name-asc") {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  }
  if (value === "name-desc") {
    sorted.sort((a, b) => b.name.localeCompare(a.name));
  }
  if (value === "email-asc") {
    sorted.sort((a, b) => a.email.localeCompare(b.email));
  }
  if (value === "email-desc") {
    sorted.sort((a, b) => b.email.localeCompare(a.email));
  }

  currentPage = 1;
  displayUsers(sorted);
}

// 🔹 Reset
function resetData() {
  localStorage.clear();
  location.reload();
}

// 🔹 Init
fetchUsers();