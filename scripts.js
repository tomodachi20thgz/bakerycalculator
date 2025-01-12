// Conversion rates for units to base units (grams or milliliters)
const unitConversionRates = {
    metric: {
      grams: 1,
      kilograms: 1000,
      milliliters: 1,
      liters: 1000,
    },
    imperial: {
      teaspoons: 5, // Assumes 1 teaspoon = 5 grams for dry ingredients
      tablespoons: 15, // Assumes 1 tablespoon = 15 grams for dry ingredients
      cups: 240, // Assumes 1 cup = 240 grams for dry ingredients
      ounces: 28.35, // 1 ounce = 28.35 grams
    },
  };
  
  // Units available for each measurement system
  const units = {
    metric: ["grams", "kilograms", "milliliters", "liters"],
    imperial: ["teaspoons", "tablespoons", "cups", "ounces"],
  };
  
  // Recipe array to store the ingredients
  let recipe = [];
  
  // Handle measurement system selection
  document.getElementById("metricCheckbox").addEventListener("change", function () {
    if (this.checked) {
      document.getElementById("imperialCheckbox").checked = false; // Uncheck Imperial
      populateUnits("metric");
    }
  });
  
  document.getElementById("imperialCheckbox").addEventListener("change", function () {
    if (this.checked) {
      document.getElementById("metricCheckbox").checked = false; // Uncheck Metric
      populateUnits("imperial");
    }
  });
  
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
  
  // Add ingredient to the recipe
  document.getElementById("addIngredient").addEventListener("click", () => {
    const ingredient = document.getElementById("ingredientSelect").value;
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
  