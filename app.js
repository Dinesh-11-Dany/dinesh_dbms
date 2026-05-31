const form = document.getElementById("laptopForm");
const inventoryBody = document.getElementById("inventoryBody");
const clearButton = document.getElementById("clearButton");

let inventory = [];

const statusMessage = document.getElementById("statusMessage");

async function loadInventory() {
  try {
    const response = await fetch("/api/laptops");
    if (!response.ok) throw new Error("Failed to fetch inventory");
    inventory = await response.json();
  } catch (error) {
    console.error(error);
    inventory = [];
    showMessage("Unable to load inventory. Check the server.", "error");
  }
}

function showMessage(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`;
  if (message) {
    setTimeout(() => {
      statusMessage.textContent = "";
      statusMessage.className = "status-message";
    }, 3000);
  }
}

function renderInventory() {
  inventoryBody.innerHTML = inventory
    .map((item, index) => `
      <tr>
        <td>${item.laptop_brand}</td>
        <td>${item.series}</td>
        <td>${item.price}</td>
        <td><button type="button" data-index="${index}">Delete</button></td>
      </tr>`)
    .join("");

  const deleteButtons = inventoryBody.querySelectorAll("button[data-index]");
  deleteButtons.forEach(button => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.index);
      inventory.splice(index, 1);
      renderInventory();
    });
  });
}

async function addLaptop(event) {
  event.preventDefault();
  const laptop_brand = form.laptop_brand.value.trim();
  const series = form.series.value.trim();
  const price = Number(form.price.value);

  if (!laptop_brand || !series || Number.isNaN(price)) {
    alert("Please enter valid laptop details.");
    return;
  }

  try {
    const response = await fetch("/api/laptops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ laptop_brand, series, price }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error?.error || "Failed to save laptop");
    }

    const savedLaptop = await response.json();
    inventory.push(savedLaptop);
    renderInventory();
    form.reset();
    form.laptop_brand.focus();
    showMessage("Laptop saved successfully.", "success");
  } catch (error) {
    console.error(error);
    showMessage("Unable to save laptop to MongoDB. Check the server and MongoDB connection.", "error");
  }
}

async function clearAll() {
  if (!confirm("Delete all saved laptop records from MongoDB?")) return;

  try {
    const response = await fetch("/api/laptops", {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Failed to clear inventory");

    inventory = [];
    renderInventory();
    showMessage("All laptop records deleted.", "success");
  } catch (error) {
    console.error(error);
    showMessage("Unable to clear inventory. Check the server and MongoDB connection.", "error");
  }
}

form.addEventListener("submit", addLaptop);
clearButton.addEventListener("click", clearAll);

loadInventory().then(renderInventory);
