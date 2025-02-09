import { ingredients } from "./ingredients.js"; // Import ingredients from ingredients.js

// Conversion rates for units to base units (grams or millilitres)
const unitConversionRates = {
  metric: {
    grams: 1,
    kilograms: 1000,
    millilitres: 1,
    litres: 1000,
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
  metric: ["grams", "kilograms", "millilitres", "litres"],
  imperial: ["teaspoons", "tablespoons", "cups", "ounces"],
};

// Liquid adjustment data based on flour type and recipe category
const liquidAdjustments = {
  "Gluten-Free All-Purpose Flour": { cake: 0.10, biscuits: 0.05, pastries: 0.05 },
  "Rice Flour": { cake: -0.10, biscuits: -0.05, pastries: -0.10 },
  "Gluten Free Self-Raising Flour": { cake: 0.10, biscuits: 0.05, pastries: 0.05 },
  "Gluten Free Bread Flour": { cake: 0.10, biscuits: 0.05, pastries: 0.05 }
};

let recipe = [];
let updatedResults = [];

// Generate the ingredient list dynamically, including only alternatives
const ingredientList = Object.keys(ingredients).reduce((list, key) => {
  if (ingredients[key].alternatives) {
    ingredients[key].alternatives.forEach((alt) => list.push(alt.name));
  }
  return list;
}, []);

// Function to populate unit dropdown
function populateUnits(system) {
  const unitSelect = document.getElementById("unitSelect");
  unitSelect.innerHTML = "";
  
  units[system].forEach((unit) => {
    const option = document.createElement("option");
    option.value = unit;
    option.textContent = unit.charAt(0).toUpperCase() + unit.slice(1);
    unitSelect.appendChild(option);
  });
}

// Function to convert between units
function convertUnit(quantity, fromUnit, toUnit) {
  const conversionTable = unitConversionRates.metric; // Default to metric
  
  if (conversionTable[fromUnit] && conversionTable[toUnit]) {
    return (quantity * conversionTable[fromUnit]) / conversionTable[toUnit];
  }
  return quantity;
}

// Event listener to set the default unit system
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("metricCheckbox").checked = true;
  populateUnits("metric");
  updateIngredientList();
});

// Ingredient search and autofill logic
const ingredientSearch = document.getElementById("ingredientSearch");
const ingredientSuggestions = document.getElementById("ingredientSuggestions");

ingredientSearch.addEventListener("input", () => {
  const query = ingredientSearch.value.toLowerCase();
  ingredientSuggestions.innerHTML = "";

  if (query) {
    const matches = ingredientList.filter((ingredient) =>
      ingredient.toLowerCase().includes(query)
    );

    matches.forEach((match) => {
      const suggestionItem = document.createElement("li");
      suggestionItem.textContent = match;
      suggestionItem.classList.add("suggestion-item");
      suggestionItem.addEventListener("mousedown", (event) => {
        event.preventDefault();
        ingredientSearch.value = match;
        ingredientSuggestions.innerHTML = "";
      });
      ingredientSuggestions.appendChild(suggestionItem);
    });
  }
});

ingredientSearch.addEventListener("blur", () => {
  setTimeout(() => {
    ingredientSuggestions.innerHTML = "";
  }, 100);
});

// Function to add an ingredient to the recipe
function addIngredient() {
  const ingredient = ingredientSearch.value.trim();
  const quantity = parseFloat(document.getElementById("quantity").value);
  const unit = document.getElementById("unitSelect").value;

  if (!ingredient || isNaN(quantity) || quantity <= 0) {
    alert("Please select a valid ingredient and enter a valid quantity!");
    return;
  }

  recipe.push({
    ingredient,
    originalQuantity: quantity,
    originalUnit: unit,
    liquidAdjustment: "No adjustment",
  });

  updateIngredientList();
  document.getElementById("recipeForm").reset();
  populateUnits("metric");
}

// Function to update the ingredient list in the UI
function updateIngredientList() {
  const ingredientList = document.getElementById("ingredientList");
  ingredientList.innerHTML = "";

  recipe.forEach((item, index) => {
    const listItem = document.createElement("li");
    listItem.classList.add("ingredient-item");

    const span = document.createElement("span");
    span.textContent = `${item.originalQuantity.toFixed(2)} ${item.originalUnit} of ${item.ingredient}`;

    const removeButton = document.createElement("button");
    removeButton.classList.add("remove-button");
    removeButton.textContent = "X";
    removeButton.addEventListener("click", () => removeIngredient(index));

    listItem.appendChild(span);
    listItem.appendChild(removeButton);
    ingredientList.appendChild(listItem);
  });
}

// Function to remove an ingredient from the recipe
function removeIngredient(index) {
  recipe.splice(index, 1);
  updateIngredientList();
}

// Function to find the base ingredient key
function findIngredientKey(ingredientName) {
  for (const key of Object.keys(ingredients)) {
    if (key.toLowerCase().trim() === ingredientName.toLowerCase().trim()) {
      return key;
    }
    if (ingredients[key].alternatives.some(alt => alt.name.toLowerCase().trim() === ingredientName.toLowerCase().trim())) {
      return key;
    }
  }
  return null;
}

// Function to show a selection modal for alternatives
function showSubstituteSelection(substitutes, originalIngredient, callback) {
  const modal = document.getElementById("substituteModal");
  const substituteList = document.getElementById("substituteList");
  substituteList.innerHTML = "";

  substitutes.forEach(substitute => {
    const listItem = document.createElement("li");
    listItem.textContent = substitute.name;
    listItem.addEventListener("click", () => {
      callback(substitute);
      modal.style.display = "none";
    });
    substituteList.appendChild(listItem);
  });

  modal.style.display = "block";
}

// -------------------------- calculate function ----------------------------

// Function to calculate ingredient adjustments
// Ensure water is always processed last
function calculate() {
  updatedResults = [];
  const glutenFree = document.getElementById("glutenAllergy")?.checked || false;
  const dairyFree = document.getElementById("dairyAllergy")?.checked || false;
  const recipeType = document.getElementById("recipeTypeSelect").value;

  let totalLiquidAdjustment = 0;
  let waterFound = false;
  let adjustedWaterQuantity = null;
  let waterUnit = "millilitres";
  let pendingSubstitutions = 0;

  console.log("Starting calculation...");

  for (const item of recipe) {
    let ingredientKey = findIngredientKey(item.ingredient);

    if (!ingredientKey || !ingredients[ingredientKey]) {
      updatedResults.push({
        ingredient: item.ingredient,
        quantity: item.originalQuantity,
        unit: item.originalUnit || "(unit missing)",
      });
      continue;
    }

    let finalIngredient = item.ingredient;
    let finalQuantity = item.originalQuantity;
    let finalUnit = item.originalUnit || "grams";

    if (finalIngredient.toLowerCase().includes("water")) {
      console.log("Water detected:", item);
      waterFound = true;
      adjustedWaterQuantity = finalQuantity;
      waterUnit = finalUnit;
      continue;
    }

    const baseIngredient = ingredients[ingredientKey];

    if (glutenFree && baseIngredient.alternatives) {
      const glutenFreeSubstitutes = baseIngredient.alternatives.filter(
        (alt) => alt.glutenFree === true
      );

      if (glutenFreeSubstitutes.length > 0) {
        pendingSubstitutions++; // Track async operations
        showSubstituteSelection(glutenFreeSubstitutes, item.ingredient, (chosenSubstitute) => {
          console.log("Substituting:", item.ingredient, "->", chosenSubstitute.name);
          finalIngredient = chosenSubstitute.name;
          finalUnit = chosenSubstitute.unit || finalUnit;

          if (chosenSubstitute.conversionRate) {
            finalQuantity *= chosenSubstitute.conversionRate;
          }

          if (liquidAdjustments[finalIngredient] && liquidAdjustments[finalIngredient][recipeType] !== undefined) {
            totalLiquidAdjustment += liquidAdjustments[finalIngredient][recipeType];
            console.log("Liquid Adjustment Updated:", totalLiquidAdjustment);
          }

          updatedResults.push({
            ingredient: finalIngredient,
            quantity: finalQuantity,
            unit: finalUnit,
          });

          pendingSubstitutions--; // Decrease pending count
          checkAndProcessWater(); // Ensure water is processed last
        });
        continue;
      }
    }

    // ✅ **DAIRY-FREE SUBSTITUTIONS**
    if (dairyFree && baseIngredient.alternatives) {
      const dairyFreeSubstitutes = baseIngredient.alternatives.filter(
        (alt) => alt.dairyFree === true
      );

      if (dairyFreeSubstitutes.length > 0) {
        pendingSubstitutions++;
        showSubstituteSelection(dairyFreeSubstitutes, item.ingredient, (chosenSubstitute) => {
          console.log("Substituting (Dairy-Free):", item.ingredient, "->", chosenSubstitute.name);
          finalIngredient = chosenSubstitute.name;
          finalUnit = chosenSubstitute.unit || finalUnit;

          // Maintain 1:1 ratio
          finalQuantity = item.originalQuantity;

          updatedResults.push({
            ingredient: finalIngredient,
            quantity: finalQuantity,
            unit: finalUnit,
          });

          pendingSubstitutions--;
          checkAndProcessWater();
        });
        continue;
      }
    }

    updatedResults.push({
      ingredient: finalIngredient,
      quantity: finalQuantity,
      unit: finalUnit,
    });
  }

  function checkAndProcessWater() {
    if (pendingSubstitutions > 0) return; // Ensure async operations finish first

    console.log("Processing water... Water Found:", waterFound);
    console.log("Total Liquid Adjustment:", totalLiquidAdjustment);

    if (waterFound) {
      adjustedWaterQuantity *= (1 + totalLiquidAdjustment);
      adjustedWaterQuantity = Math.max(adjustedWaterQuantity, 1);

      console.log("Adjusted Water Quantity:", adjustedWaterQuantity);
      updatedResults.push({
        ingredient: "Water",
        quantity: adjustedWaterQuantity,
        unit: waterUnit,
      });
    }

    if (!waterFound && totalLiquidAdjustment !== 0) {
      console.log("Adding new water due to liquid adjustment.");
      updatedResults.push({
        ingredient: "Water",
        quantity: (100 * (1 + totalLiquidAdjustment)),
        unit: "millilitres",
      });
    }

    console.log("Final updated results:", updatedResults);
    updateResultsList();
  }

  // Ensure water processing happens even if no substitutions occurred
  setTimeout(checkAndProcessWater, 50);
}


//-----------------------------------------------------------------

function updateResultsList() {
  const resultsList = document.getElementById("updatedRecipe");
  resultsList.innerHTML = updatedResults
    .map((item) => {
      const formattedQuantity = item.quantity ? item.quantity.toFixed(2) : "N/A";
      return `<li>${formattedQuantity} ${item.unit} of ${item.ingredient} - ${item.liquidAdjustment}</li>`;
    })
    .join("");
}


// Event listeners
document.getElementById("addIngredient").addEventListener("click", addIngredient);
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("calculate").addEventListener("click", calculate);
  document.getElementById("closeModal").addEventListener("click", () => {
    document.getElementById("substituteModal").style.display = "none";
  });
});
