import { ingredients } from "./ingredients.js"; // Import ingredients from ingredients.js

// Conversion rates for units to base units (grams or milliliters)
const unitConversionRates = {
  metric: {
    grams: 1,
    kilograms: 1000,
    milliliters: 1,
    liters: 1000,
  },
  imperial: {
    teaspoons: 5,
    tablespoons: 15,
    cups: 240,
    ounces: 28.35,
  },
};

// Units available for each measurement system
const units = {
  metric: ["grams", "kilograms", "milliliters", "liters"],
  imperial: ["teaspoons", "tablespoons", "cups", "ounces"],
};

// Recipe array to store the ingredients
let recipe = [];

// Dynamically generate the ingredient list, including main ingredients and their alternatives
const ingredientList = Object.keys(ingredients).reduce((list, key) => {
  // Add the main ingredient
  list.push(key);

  // Add all alternatives for the ingredient
  if (ingredients[key].alternatives) {
    ingredients[key].alternatives.forEach((alt) => list.push(alt.name));
  }

  return list;
}, []);

// Log to confirm the ingredient list
console.log("Ingredient List:", ingredientList);

// Populate the unit dropdown based on the selected measurement system
function populateUnits(system) {
  const unitSelect = document.getElementById("unitSelect");
  unitSelect.innerHTML = "";

  units[system].forEach((unit) => {
    const option = document.createElement("option");
    option.value = unit;
    option.textContent = unit.charAt(0).toUpperCase() + unit.slice(1); // Capitalize
    unitSelect.appendChild(option);
  });
}

// Default to Metric on page load
document.getElementById("metricCheckbox").checked = true;
populateUnits("metric");

// Ingredient search and autofill logic
const ingredientSearch = document.getElementById("ingredientSearch");
const ingredientSuggestions = document.getElementById("ingredientSuggestions");

ingredientSearch.addEventListener("input", () => {
  const query = ingredientSearch.value.toLowerCase();
  ingredientSuggestions.innerHTML = ""; // Clear previous suggestions

  if (query) {
    const matches = ingredientList.filter((ingredient) =>
      ingredient.toLowerCase().includes(query) // Use includes for partial matching
    );

    matches.forEach((match) => {
      const suggestionItem = document.createElement("li");
      suggestionItem.textContent = match;
      suggestionItem.classList.add("suggestion-item"); // Add class for styling
      suggestionItem.addEventListener("mousedown", (event) => {
        event.preventDefault(); // Prevent blur event from clearing suggestions
        ingredientSearch.value = match; // Set the selected value
        ingredientSuggestions.innerHTML = ""; // Clear suggestions
      });
      ingredientSuggestions.appendChild(suggestionItem);
    });
  }
});

ingredientSearch.addEventListener("blur", () => {
  setTimeout(() => {
    ingredientSuggestions.innerHTML = ""; // Delay clearing to allow clicks
  }, 100);
});

// Add ingredient to the recipe
document.getElementById("addIngredient").addEventListener("click", () => {
  const ingredient = ingredientSearch.value.trim();
  const quantity = parseFloat(document.getElementById("quantity").value);
  const metricSelected = document.getElementById("metricCheckbox").checked;
  const imperialSelected = document.getElementById("imperialCheckbox").checked;

  if (!ingredient || isNaN(quantity) || (!metricSelected && !imperialSelected)) {
    alert("Please select an ingredient, enter the quantity, and choose a measurement system!");
    return;
  }

  const system = metricSelected ? "metric" : "imperial";
  const unit = document.getElementById("unitSelect").value;
  const conversionRate = unitConversionRates[system][unit];
  const convertedQuantity = quantity * conversionRate;

  recipe.push({
    ingredient,
    originalQuantity: quantity,
    originalUnit: unit,
    quantity: convertedQuantity,
    unit: system === "metric" ? "grams/milliliters" : "grams (converted)",
  });

  updateIngredientList();
  document.getElementById("recipeForm").reset();
  document.getElementById("metricCheckbox").checked = true; // Reset to Metric by default
  populateUnits("metric");
});

// Update the ingredient list in the UI
function updateIngredientList() {
  const ingredientList = document.getElementById("ingredientList");
  ingredientList.innerHTML = "";
  recipe.forEach((item, index) => {
    ingredientList.innerHTML += `<li>
      ${item.originalQuantity} ${item.originalUnit} of ${item.ingredient} 
      (${item.quantity.toFixed(2)} ${item.unit})
      <button onclick="removeIngredient(${index})">Remove</button>
    </li>`;
  });
}

// Remove an ingredient from the recipe
function removeIngredient(index) {
  recipe.splice(index, 1);
  updateIngredientList();
}

// Modal Elements for Substitute Selection
const substituteModal = document.getElementById("substituteModal");
const substituteList = document.getElementById("substituteList");
const closeModal = document.getElementById("closeModal");

// Open Modal Function
function openSubstituteModal(substitutes, itemIndex) {
  substituteList.innerHTML = ""; // Clear existing substitutes

  substitutes.forEach((substitute) => {
    const li = document.createElement("li");
    li.textContent = substitute.name;
    li.addEventListener("click", () => {
      applySubstitute(substitute, itemIndex); // Apply selected substitute
    });
    substituteList.appendChild(li);
  });

  substituteModal.style.display = "block"; // Show modal
}

// Close Modal Function
closeModal.addEventListener("click", () => {
  substituteModal.style.display = "none"; // Hide modal
});

// Apply Substitute Function
function applySubstitute(substitute, itemIndex) {
  const item = recipe[itemIndex];
  const newQuantity = item.quantity * substitute.conversionRate;

  // Update the item in the recipe
  recipe[itemIndex] = {
    ingredient: substitute.name,
    originalQuantity: item.originalQuantity,
    originalUnit: item.originalUnit,
    quantity: newQuantity,
    unit: item.unit,
  };

  substituteModal.style.display = "none"; // Hide modal
  updateUpdatedRecipeList(recipe); // Refresh updated recipe
}

// Calculate substitutes for selected allergies
document.getElementById("calculate").addEventListener("click", () => {
  const glutenAllergy = document.getElementById("glutenAllergy").checked;
  const dairyAllergy = document.getElementById("dairyAllergy").checked;

  if (recipe.length === 0) {
    alert("Please add ingredients to the recipe before calculating substitutes!");
    return;
  }

  recipe.forEach((item, index) => {
    let substitutes = null;

    if (glutenAllergy && ingredients[item.ingredient]?.alternatives) {
      substitutes = ingredients[item.ingredient].alternatives;
    }

    if (dairyAllergy && ingredients[item.ingredient]?.alternatives) {
      substitutes = ingredients[item.ingredient].alternatives;
    }

    if (substitutes) {
      openSubstituteModal(substitutes, index); // Open modal for substitute selection
    }
  });
});

// Update the UI with the updated recipe
function updateUpdatedRecipeList(updatedRecipe) {
  const updatedRecipeList = document.getElementById("updatedRecipe");
  updatedRecipeList.innerHTML = "";

  updatedRecipe.forEach((item) => {
    updatedRecipeList.innerHTML += `<li>
      ${item.quantity.toFixed(0)} grams of ${item.ingredient}
    </li>`;
  });
}
