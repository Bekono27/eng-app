// Dummy user database for login — add your users here
const usersDB = [
  { username: "Mishka", password: "ENG!1", level: "B1" },
  { username: "userB2", password: "pass456", level: "B2" },
  { username: "userC1", password: "pass789", level: "C1" },
];

// On login submit
document.getElementById("login-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const username = e.target.username.value.trim();
  const password = e.target.password.value.trim();

  const user = usersDB.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    localStorage.setItem("loggedUser", JSON.stringify(user));
    window.location.href = "dashboard.html"; // move to dashboard
  } else {
    const err = document.getElementById("login-error");
    err.textContent = "Invalid username or password.";
    err.classList.remove("hidden");
  }
});
