let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The only way to do great work is to love what you do.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" }
];

const lastFilter = localStorage.getItem("lastFilter") || "all";

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function displayRandomQuote() {
  const filter = document.getElementById("categoryFilter").value;
  let filteredQuotes = (filter === "all") ? quotes : quotes.filter(q => q.category === filter);
  if (filteredQuotes.length === 0) {
    document.getElementById("quoteDisplay").innerText = "No quotes available for this category.";
    return;
  }
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  document.getElementById("quoteDisplay").innerText = `"${filteredQuotes[randomIndex].text}" — ${filteredQuotes[randomIndex].category}`;
  sessionStorage.setItem("lastViewedQuote", JSON.stringify(filteredQuotes[randomIndex]));
}

function addQuote() {
  const text = document.getElementById("newQuoteText").value;
  const category = document.getElementById("newQuoteCategory").value;
  const newQuote = { text, category };

  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
  displayRandomQuote();

  // Post new quote to server (simulation)
  postQuoteToServer(newQuote);
}

function populateCategories() {
  const select = document.getElementById("categoryFilter");
  const categories = [...new Set(quotes.map(q => q.category))];
  select.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => {
    let option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    if (cat === lastFilter) option.selected = true;
    select.appendChild(option);
  });
}
populateCategories();
filterQuotes();

function filterQuotes() {
  const selected = document.getElementById("categoryFilter").value;
  localStorage.setItem("lastFilter", selected);
  displayRandomQuote();
}

// ---- Import / Export ----
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      alert('Quotes imported successfully!');
    } catch (e) {
      alert('Invalid JSON file!');
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// ---- NEW SYNC LOGIC ----

// Fetch from server (GET)
async function fetchQuotesFromServer() {
  try {
    let response = await fetch("https://jsonplaceholder.typicode.com/posts");
    let serverData = await response.json();
    return serverData.slice(0, 3).map(post => ({
      text: post.title,
      category: "Server"
    }));
  } catch (err) {
    console.error("Error fetching from server:", err);
    return [];
  }
}

// Post to server (POST)
async function postQuoteToServer(quote) {
  try {
    await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quote)
    });
    console.log("Quote posted to server:", quote);
  } catch (err) {
    console.error("Error posting to server:", err);
  }
}

// Sync quotes (server wins conflicts)
async function syncQuotes() {
  const statusDiv = document.getElementById("syncStatus");
  statusDiv.innerText = "Syncing with server...";

  const serverQuotes = await fetchQuotesFromServer();

  if (serverQuotes.length > 0) {
    quotes = [...serverQuotes, ...quotes];
    saveQuotes();
    populateCategories();
    displayRandomQuote();
    statusDiv.innerText = "Sync complete. Server data merged (server wins conflicts).";
  } else {
    statusDiv.innerText = "Sync failed. Using local data.";
  }
}

// Manual + automatic sync
setInterval(syncQuotes, 60000);
