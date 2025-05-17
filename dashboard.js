// Logout logic
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("loggedUser");
  localStorage.removeItem("progressData");
  window.location.href = "index.html";
});

// Load logged user
const user = JSON.parse(localStorage.getItem("loggedUser"));
if (!user) {
  window.location.href = "index.html";
}

// Fill user info
document.getElementById("userName").textContent = user.username;
document.getElementById("userLevel").textContent = user.level;

// Dummy progress data structure (replace with real tracking)
const progressDataKey = `progress_${user.username}`;
let progressData = JSON.parse(localStorage.getItem(progressDataKey)) || {
  level: user.level,
  wordsLearned: 0,
  totalWords: 2000, // for demo, all levels have 2000 words planned
  streak: 0,
  lastLoginDate: null,
};

// Update progress bar and streak display
function updateProgressUI() {
  const progressPercent = Math.min(
    100,
    (progressData.wordsLearned / progressData.totalWords) * 100
  );
  document.getElementById("progressBar").style.width = progressPercent + "%";
  document.getElementById(
    "progressText"
  ).textContent = `Words learned: ${progressData.wordsLearned} / ${progressData.totalWords}`;
  document.getElementById(
    "streakDisplay"
  ).textContent = `🔥 Current streak: ${progressData.streak} day${
    progressData.streak !== 1 ? "s" : ""
  }`;
}

// Check streak on load
function checkStreak() {
  const today = new Date().toDateString();
  if (progressData.lastLoginDate === today) {
    // Already logged in today, do nothing
    return;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (progressData.lastLoginDate === yesterday.toDateString()) {
    progressData.streak++;
  } else {
    progressData.streak = 1;
  }
  progressData.lastLoginDate = today;
  localStorage.setItem(progressDataKey, JSON.stringify(progressData));
  updateProgressUI();
}

// Tab Navigation logic
const tabs = document.querySelectorAll(".nav-btn");
const mainContent = document.getElementById("mainContent");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    loadTabContent(tab.dataset.tab);
  });
});

// Load content for each tab
function loadTabContent(tab) {
  mainContent.innerHTML = `<p class="text-center text-lg font-semibold mt-12">Loading ${tab} content...</p>`;
  switch (tab) {
    case "words":
      loadWordsTab();
      break;
    case "grammar":
      loadGrammarTab();
      break;
    case "reading":
      loadReadingTab();
      break;
    case "listening":
      loadListeningTab();
      break;
    case "writing":
      loadWritingTab();
      break;
  }
}

// Placeholder load functions
async function loadWordsTab() {
  mainContent.innerHTML = ""; // clear content

  // Load JSON vocabulary file based on user.level (example: A1.json, B2.json)
  try {
    const response = await fetch(`./data/${user.level}.json`);
    if (!response.ok) throw new Error("Failed to load words data");
    const words = await response.json();

    // Pagination controls
    let currentIndex = 0;
    const perPage = 5;

    // Create container elements
    const container = document.createElement("div");

    const wordListDiv = document.createElement("div");
    wordListDiv.className = "space-y-6";

    const navButtons = document.createElement("div");
    navButtons.className = "flex justify-between mt-6";

    // Function to render a page of words
    function renderPage() {
      wordListDiv.innerHTML = "";
      const pageWords = words.slice(currentIndex, currentIndex + perPage);

      pageWords.forEach(({ word, translation, explanation, example }) => {
        const card = document.createElement("div");
        card.className = "bg-black/40 rounded-lg p-4 shadow-lg hover:shadow-xl transition";

        card.innerHTML = `
          <h3 class="text-xl font-bold">${word}</h3>
          <p class="italic text-yellow-400 mb-2">${translation}</p>
          <p>${explanation}</p>
          <p class="mt-2 text-gray-300 italic">Example: ${example}</p>
          <button class="copyBtn mt-3 px-3 py-1 bg-purple-600 rounded hover:bg-purple-700 transition text-sm">Copy Word</button>
        `;

        // Copy button logic
        const copyBtn = card.querySelector(".copyBtn");
        copyBtn.addEventListener("click", () => {
          navigator.clipboard.writeText(word).then(() => {
            copyBtn.textContent = "Copied!";
            setTimeout(() => (copyBtn.textContent = "Copy Word"), 1500);
          });
        });

        wordListDiv.appendChild(card);
      });
    }

    // Navigation buttons
    const prevBtn = document.createElement("button");
    prevBtn.textContent = "← Prev";
    prevBtn.disabled = true;
    prevBtn.className =
      "px-4 py-2 rounded bg-purple-700 hover:bg-purple-800 disabled:bg-gray-600 transition";

    const nextBtn = document.createElement("button");
    nextBtn.textContent = "Next →";
    nextBtn.className =
      "px-4 py-2 rounded bg-purple-700 hover:bg-purple-800 transition";

    navButtons.appendChild(prevBtn);
    navButtons.appendChild(nextBtn);

    container.appendChild(wordListDiv);
    container.appendChild(navButtons);
    mainContent.appendChild(container);

    renderPage();

    prevBtn.addEventListener("click", () => {
      if (currentIndex >= perPage) {
        currentIndex -= perPage;
        renderPage();
        updateButtons();
      }
    });

    nextBtn.addEventListener("click", () => {
      if (currentIndex + perPage < words.length) {
        currentIndex += perPage;
        renderPage();
        updateButtons();
      }
    });

    function updateButtons() {
      prevBtn.disabled = currentIndex === 0;
      nextBtn.disabled = currentIndex + perPage >= words.length;
    }

    updateButtons();

    // Track progress: words viewed count
    progressData.wordsLearned = Math.min(
      progressData.totalWords,
      currentIndex + perPage
    );
    localStorage.setItem(progressDataKey, JSON.stringify(progressData));
    updateProgressUI();
  } catch (e) {
    mainContent.innerHTML = `<p class="text-red-400 text-center mt-12 font-semibold">Error loading words: ${e.message}</p>`;
  }
}


// Initialize app UI
checkStreak();
updateProgressUI();
loadTabContent("words");
