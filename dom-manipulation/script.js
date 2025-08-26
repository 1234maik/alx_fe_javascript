let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The only way to do great work is to love what you do.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" }
];

// Load last filter
const lastFilter = localStorage.getItem("lastFilter") || "all";

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Display a random quote
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

// Add a new quote
function addQuote() {
  const text = document.getElementById("newQuoteText").value;
  const category = document.getElementById("newQuoteCategory").value;
  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
  displayRandomQuote();
}

// Populate category dropdown dynamically
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

// Filter quotes by category
function filterQuotes() {
  const selected = document.getElementById("categoryFilter").value;
  localStorage.setItem("lastFilter", selected);
  displayRandomQuote();
}

// Export quotes to JSON
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

// Import quotes from JSON file
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
async function syncWithServer() {
  const statusDiv = document.getElementById("syncStatus");
  statusDiv.innerText = "Syncing with server...";

  try {
    // Simulate fetch from a mock API (replace with real endpoint if needed)
    let response = await fetch("https://jsonplaceholder.typicode.com/posts");
    let serverData = await response.json();

    // Simulated server quotes (just taking first few posts as quotes)
    let serverQuotes = serverData.slice(0, 3).map(post => ({
      text: post.title,
      category: "Server"
    }));

    // Conflict resolution: Server takes precedence
    quotes = [...serverQuotes, ...quotes];
    saveQuotes();
    populateCategories();
    displayRandomQuote();

    statusDiv.innerText = "Sync complete. Server data merged (server wins conflicts).";
  } catch (error) {
    statusDiv.innerText = "Error syncing with server.";
    console.error(error);
  }
}

// Auto-sync every 60 seconds
setInterval(syncWithServer, 60000);
