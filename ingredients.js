export const ingredients = {
  flour: {
    alternatives: [
      { name: "All Purpose Flour", conversionRate: 1.0, glutenFree: false },
      { name: "Gluten-Free All-Purpose Flour", conversionRate: 1.0, glutenFree: true },
      { name: "Rice Flour", conversionRate: 1.0, glutenFree: true },
    ]
  },
  milk: {
    alternatives: [
      { name: "Milk", conversionRate: 1.0, dairyFree: false },
      { name: "Almond Milk", conversionRate: 1.0, dairyFree: true },
      { name: "Soy Milk", conversionRate: 1.0, dairyFree: true },
      { name: "Oat Milk", conversionRate: 1.1, dairyFree: true },
      { name: "Coconut Milk", conversionRate: 1.0, dairyFree: true },
    ]
  },
  water: {
    alternatives: [
      { name: "Water", conversionRate: 1.0, glutenFree: true, dairyFree: true }
    ]
  }
};
