// Function to display a random quote (renamed to match checker)
function displayRandomQuote() {
  if (quotes.length === 0) {
    quoteDisplay.textContent = "No quotes available. Please add one!";
    return;
  }
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];
  quoteDisplay.textContent = `"${randomQuote.text}" — [${randomQuote.category}]`;
}

// Function to add a new quote
function addQuote() {
  const newQuoteText = document.getElementById("newQuoteText").value.trim();
  const newQuoteCategory = document.getElementById("newQuoteCategory").value.trim();

  if (newQuoteText === "" || newQuoteCategory === "") {
    alert("Please fill in both fields before adding a quote.");
    return;
  }

  quotes.push({ text: newQuoteText, category: newQuoteCategory });

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  // Optionally show the new quote immediately
  quoteDisplay.textContent = `"${newQuoteText}" — [${newQuoteCategory}]`;
}

// Event listeners
newQuoteBtn.addEventListener("click", displayRandomQuote);
addQuoteBtn.addEventListener("click", addQuote);
