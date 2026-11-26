// The full menu, transcribed from the printed menus in resources/. Prices in whole pesos.
// The cart stores item ids, so keep ids stable once orders exist.
//
// options: one pick per group, the first available choice is the default. Choices whose label starts with "No " are left off the receipt line.
// code: the dashboard's POS product code (Inventory). The live price and "on the menu" come from there
//   (/api/menu); the prices in this file are only the fallback while that loads.
// A choice can carry `code` (it IS a different POS product: each ulam, the Crispy Pata group meal) or
//   `extra` (a paid add-on product on top: AD01 drink, AD02 cheese). Its `price` is again the fallback.
// img: a photo in public/food/<img>.webp (cut from the posters by scripts/crop.mjs).
// short: the category's name on the sticky chip bar.

// PLACEHOLDER HOURS: confirm with the owner. Online orders can be picked up between these times.
export const HOURS = { open: "07:00", close: "20:00", leadMinutes: 20, stepMinutes: 15 };

const pick = (name, ...labels) => ({ name, choices: labels.map((l) => (typeof l === "string" ? { label: l } : l)) });

export const FOOD = [
  {
    id: "new",
    name: "What's New",
    short: "New",
    items: [
      { id: "homestyle-chicken", code: "NW01", name: "Homestyle Chicken", price: 165, img: "chicken",
        desc: "Our signature chicken combo: savory, juicy, and served with rice and sides that complete the plate.",
        options: [pick("Flavor", "Teriyaki", "Soy Garlic", "Honey Glazed")] },
      // leadMinutes: cooked to order, so the earliest pickup time moves out when it's in the cart
      { id: "crispy-pata", code: "NW02", name: "Crispy Pata", price: 665, img: "crispy-pata", leadMinutes: 45,
        desc: "Crispy on the outside, tender on the inside. Takes 35 to 45 minutes to cook. The group meal adds 3 rice, 2 daikon salad and 1 liter orange juice.",
        options: [pick("Serving", "Ala carte", { label: "Group meal, good for 3 to 4", code: "NW03", price: 134 })] },
      { id: "vietnamese-salad", code: "NW04", name: "Vietnamese Salad", price: 249, img: "viet-salad", desc: "Fresh herbs, crisp vegetables, golden tofu and torikatsu." },
      { id: "crispy-lumpia", code: "NW05", name: "Crispy Lumpia", price: 129, img: "lumpia", desc: "Golden fried rolls with savory filling." },
    ],
  },
  {
    id: "classic",
    name: "Classic Comforts",
    short: "Breakfast",
    items: [
      { id: "signature-breakfast", code: "CC01", name: "Wander Signature Breakfast", price: 295, img: "breakfast",
        desc: "Fluffy eggs, toasted bread, crispy bacon, juicy sausage, tomato, beans, fresh fruit & creamy coleslaw.",
        options: [pick("Add a drink", "No drink", { label: "Black coffee", extra: "AD01", price: 50 }, { label: "Juice", extra: "AD01", price: 50 })] },
      { id: "rise-shine", code: "CC02", name: "Rise & Shine Breakfast", price: 295, img: "rise-shine",
        desc: "Golden waffle or pancake, choco syrup, sunny egg, bacon, sausage, fruit & crunchy granola.",
        options: [pick("Base", "Waffle", "Pancake")] },
      { id: "ramen", code: "CC03", name: "Ramen", price: 120, img: "cheese-ramen", desc: "1 pack spicy or mild ramen with egg.",
        options: [pick("Flavor", "Spicy", "Mild"), pick("Cheese slice", "No cheese", { label: "Add cheese slice", extra: "AD02", price: 20 })] },
    ],
  },
  {
    id: "sweet",
    name: "Sweet Morning Treats",
    short: "Sweets",
    items: [
      { id: "waffle-hearts", code: "SW01", name: "Waffle Hearts", price: 165, img: "waffle",
        desc: "5 golden hearts with choco drizzle, a scoop of ice cream or whipped cream, granola & powdered sugar.",
        options: [pick("Topping", "Ice cream", "Whipped cream")] },
      { id: "pancake-haven", code: "SW02", name: "Pancake Haven", price: 165, img: "pancake",
        desc: "Fluffy double stack crowned with cherry, lightly dusted with powdered sugar, with fresh fruits and strawberry jam." },
      { id: "yogurt-parfait", code: "SW03", name: "Yogurt Parfait", price: 145, img: "parfait", desc: "Greek yogurt layered with honey, walnut granola & sweet fresh fruits." },
    ],
  },
  {
    id: "filipino",
    name: "Filipino Comfort Plates",
    short: "Filipino",
    note: "With rice, sunny side up and coleslaw",
    items: [
      { id: "filipino-plate", code: "FP01", name: "Filipino Comfort Plate", price: 195, img: "plate",
        desc: "Corned beef, tocino, spam, hotdog, ham, chorizo or sardines run, with rice, sunny side up and coleslaw.",
        options: [pick("Choose your ulam", ...["Corned Beef", "Tocino", "Spam", "Hotdog", "Ham", "Chorizo", "Sardines Run"].map((label, i) => ({ label, code: `FP0${i + 1}` })))] },
    ],
  },
  {
    id: "combo",
    name: "Combo Meals",
    short: "Combos",
    note: "Comes with coffee or juice",
    items: [
      { id: "bacon-longaniza", code: "CM01", name: "Bacon + Longaniza", price: 245, desc: "3 crispy bacon, 2 juicy longaniza with sunny egg.", options: [pick("Drink", "Coffee", "Juice")] },
      { id: "sausage-ham", code: "CM02", name: "Sausage + Ham", price: 245, desc: "Hungarian sausage, 2 ham with sunny egg.", options: [pick("Drink", "Coffee", "Juice")] },
    ],
  },
  {
    id: "sandwich",
    name: "Sandwich Creations",
    short: "Sandwiches",
    items: [
      { id: "spam-jam", code: "SN01", name: "Spam & Jam", price: 159, desc: "Crispy spam, sweet strawberry jam, and sunny side up." },
      { id: "mango-cream-cheese", code: "SN02", name: "Mango Cream Cheese", price: 159, desc: "Toasted bread, cream cheese, mango slices, honey drizzle, walnut, granola." },
      { id: "tuna-melt", code: "SN03", name: "Tuna Melt", price: 149, desc: "Tuna, mayo, egg, lettuce, cheese." },
      { id: "ham-egg", code: "SN04", name: "Ham & Egg", price: 145, img: "sandwich", desc: "Ham, boiled egg, crisp lettuce." },
      { id: "egg-cheese", code: "SN05", name: "Egg & Cheese", price: 129, desc: "Sliced boiled egg, cheddar cheese, crisp lettuce." },
    ],
  },
  {
    id: "pasta",
    name: "Pasta",
    short: "Pasta",
    note: "Simple ingredients. Big comfort.",
    items: [
      { id: "carbonara", code: "PA01", name: "Creamy Carbonara", price: 229, img: "carbonara", desc: "Classic and creamy pasta with bacon, egg, and parmesan cheese." },
      { id: "pasta-sardines", code: "PA02", name: "Pasta Sardines", price: 185, img: "pasta-sardines", desc: "Flavorful pasta with sardines, garlic, and herbs.", options: [pick("Flavor", "Original", "Spicy")] },
      { id: "bolognese", code: "PA03", name: "Bolognese", price: 259, desc: "Hearty meaty sauce with a rich tomato base, slow cooked to perfection." },
      { id: "asian-beef-pasta", code: "PA04", name: "Asian Beef Pasta", price: 259, desc: "Savory and slightly sweet stir-fry style pasta with tender beef and veggies." },
      { id: "beef-penne", code: "PA05", name: "Beef Penne", price: 259, img: "penne", desc: "Penne pasta tossed in a rich, savory sauce with tender beef and herbs." },
      { id: "sotanghon", code: "PA06", name: "Sotanghon", price: 249, img: "sotanghon", desc: "Filipino-style glass noodles stir-fried with veggies, chicken strips, and savory seasoning." },
    ],
  },
  {
    id: "bowls",
    name: "Comfort Bowls",
    short: "Bowls",
    note: "Warm meals. Real comfort.",
    items: [
      { id: "special-ramen", code: "BW01", name: "Special Ramen", price: 159, img: "ramen", desc: "Savory ramen in a rich, flavorful broth topped with a boiled egg, a slice of spam, and herbs." },
      { id: "pancit-canton", code: "BW02", name: "Special Pancit Canton", price: 135, img: "pancit", desc: "Classic pancit canton with a sunny egg and a spam slice.", options: [pick("Flavor", "Original", "Chilimansi")] },
      { id: "pho", code: "BW03", name: "Vietnamese Pho", price: 315, img: "pho", desc: "Aromatic broth with rice noodles, tender beef, and mushroom balls." },
    ],
  },
  {
    id: "dessert",
    name: "Halo Halo",
    short: "Halo Halo",
    note: "A Filipino favorite. Made even better.",
    items: [
      { id: "halo-halo", code: "HH01", name: "Our Classic Halo Halo", price: 120, img: "halohalo", desc: "Ube ice cream, corn flakes, saba & fruits, gulaman, ube halaya, milk & ice." },
    ],
  },
];

const drinks = (prefix, list) => list.map(([name, price, code]) => ({ id: prefix + "-" + name.toLowerCase().replace(/[^a-z]+/g, "-"), code, name, price }));

export const DRINKS = [
  {
    id: "coffee",
    name: "Coffee Drinks",
    short: "Coffee",
    items: drinks("coffee", [
      ["Espresso", 90, "CF01"], ["Americano", 105, "CF02"], ["Pour Over", 145, "CF03"], ["Latte", 130, "CF04"], ["Cappuccino", 139, "CF05"],
      // Vanilla is ₱195 on the printed menu; confirm, it looks like a typo next to its neighbours
      ["Caramel Macchiato", 159, "CF06"], ["Spanish", 139, "CF07"], ["Hazelnut", 145, "CF08"], ["Vanilla", 195, "CF09"], ["Vietnamese", 159, "CF10"], ["Mocha", 145, "CF11"],
    ]),
  },
  {
    id: "signatures",
    name: "Signature Drinks",
    short: "Signatures",
    items: drinks("sig", [
      ["Sunrise Spice", 165, "SG01"], ["Orange Americano", 155, "SG02"], ["Coconut Americano", 165, "SG03"],
      ["Strawberry Latte", 165, "SG04"], ["Rose Latte", 165, "SG05"], ["Mango Latte", 165, "SG06"],
    ]),
  },
  {
    id: "non-coffee",
    name: "Non-Coffee",
    short: "Non-Coffee",
    items: drinks("nc", [
      ["Fruit Shakes", 115, "NC01"], ["Oreo Smoothie", 115, "NC02"], ["Money Business", 125, "NC03"], ["Strawberry Daydream", 125, "NC04"],
      ["Red Velvet Crush", 125, "NC05"], ["Matcha Latte", 135, "NC06"], ["Strawberry Matcha", 165, "NC07"], ["Golden Milk/Pink Milk", 99, "NC08"],
    ]).map((d) => (d.id === "nc-golden-milk-pink-milk" ? { ...d, options: [pick("Milk", "Golden milk", "Pink milk")] } : d)),
  },
];
