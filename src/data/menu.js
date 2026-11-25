// The full menu, transcribed from the printed menus in resources/. Prices in whole pesos.
// The cart stores item ids, so keep ids stable once orders exist.
//
// options: one pick per group, the first choice is the default. A choice's `price` is added on top,
// e.g. "Add cheese +20". Choices whose label starts with "No " are left off the receipt line.
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
      { id: "homestyle-chicken", name: "Homestyle Chicken", price: 165, img: "chicken",
        desc: "Our signature chicken combo: savory, juicy, and served with rice and sides that complete the plate.",
        options: [pick("Flavor", "Teriyaki", "Soy Garlic", "Honey Glazed")] },
      // leadMinutes: cooked to order, so the earliest pickup time moves out when it's in the cart
      { id: "crispy-pata", name: "Crispy Pata", price: 665, img: "crispy-pata", leadMinutes: 45,
        desc: "Crispy on the outside, tender on the inside. Takes 35 to 45 minutes to cook. The group meal adds 3 rice, 2 daikon salad and 1 liter orange juice.",
        options: [pick("Serving", "Ala carte", { label: "Group meal, good for 3 to 4", price: 134 })] },
      { id: "vietnamese-salad", name: "Vietnamese Salad", price: 249, img: "viet-salad", desc: "Fresh herbs, crisp vegetables, golden tofu and torikatsu." },
      { id: "crispy-lumpia", name: "Crispy Lumpia", price: 129, img: "lumpia", desc: "Golden fried rolls with savory filling." },
    ],
  },
  {
    id: "classic",
    name: "Classic Comforts",
    short: "Breakfast",
    items: [
      { id: "signature-breakfast", name: "Wander Signature Breakfast", price: 295, img: "breakfast",
        desc: "Fluffy eggs, toasted bread, crispy bacon, juicy sausage, tomato, beans, fresh fruit & creamy coleslaw.",
        options: [pick("Add a drink", "No drink", { label: "Black coffee", price: 50 }, { label: "Juice", price: 50 })] },
      { id: "rise-shine", name: "Rise & Shine Breakfast", price: 295, img: "rise-shine",
        desc: "Golden waffle or pancake, choco syrup, sunny egg, bacon, sausage, fruit & crunchy granola.",
        options: [pick("Base", "Waffle", "Pancake")] },
      { id: "ramen", name: "Ramen", price: 120, img: "cheese-ramen", desc: "1 pack spicy or mild ramen with egg.",
        options: [pick("Flavor", "Spicy", "Mild"), pick("Cheese slice", "No cheese", { label: "Add cheese slice", price: 20 })] },
    ],
  },
  {
    id: "sweet",
    name: "Sweet Morning Treats",
    short: "Sweets",
    items: [
      { id: "waffle-hearts", name: "Waffle Hearts", price: 165, img: "waffle",
        desc: "5 golden hearts with choco drizzle, a scoop of ice cream or whipped cream, granola & powdered sugar.",
        options: [pick("Topping", "Ice cream", "Whipped cream")] },
      { id: "pancake-haven", name: "Pancake Haven", price: 165, img: "pancake",
        desc: "Fluffy double stack crowned with cherry, lightly dusted with powdered sugar, with fresh fruits and strawberry jam." },
      { id: "yogurt-parfait", name: "Yogurt Parfait", price: 145, img: "parfait", desc: "Greek yogurt layered with honey, walnut granola & sweet fresh fruits." },
    ],
  },
  {
    id: "filipino",
    name: "Filipino Comfort Plates",
    short: "Filipino",
    note: "With rice, sunny side up and coleslaw",
    items: [
      { id: "filipino-plate", name: "Filipino Comfort Plate", price: 195, img: "plate",
        desc: "Corned beef, tocino, spam, hotdog, ham, chorizo or sardines run, with rice, sunny side up and coleslaw.",
        options: [pick("Choose your ulam", "Corned Beef", "Tocino", "Spam", "Hotdog", "Ham", "Chorizo", "Sardines Run")] },
    ],
  },
  {
    id: "combo",
    name: "Combo Meals",
    short: "Combos",
    note: "Comes with coffee or juice",
    items: [
      { id: "bacon-longaniza", name: "Bacon + Longaniza", price: 245, desc: "3 crispy bacon, 2 juicy longaniza with sunny egg.", options: [pick("Drink", "Coffee", "Juice")] },
      { id: "sausage-ham", name: "Sausage + Ham", price: 245, desc: "Hungarian sausage, 2 ham with sunny egg.", options: [pick("Drink", "Coffee", "Juice")] },
    ],
  },
  {
    id: "sandwich",
    name: "Sandwich Creations",
    short: "Sandwiches",
    items: [
      { id: "spam-jam", name: "Spam & Jam", price: 159, desc: "Crispy spam, sweet strawberry jam, and sunny side up." },
      { id: "mango-cream-cheese", name: "Mango Cream Cheese", price: 159, desc: "Toasted bread, cream cheese, mango slices, honey drizzle, walnut, granola." },
      { id: "tuna-melt", name: "Tuna Melt", price: 149, desc: "Tuna, mayo, egg, lettuce, cheese." },
      { id: "ham-egg", name: "Ham & Egg", price: 145, img: "sandwich", desc: "Ham, boiled egg, crisp lettuce." },
      { id: "egg-cheese", name: "Egg & Cheese", price: 129, desc: "Sliced boiled egg, cheddar cheese, crisp lettuce." },
    ],
  },
  {
    id: "pasta",
    name: "Pasta",
    short: "Pasta",
    note: "Simple ingredients. Big comfort.",
    items: [
      { id: "carbonara", name: "Creamy Carbonara", price: 229, img: "carbonara", desc: "Classic and creamy pasta with bacon, egg, and parmesan cheese." },
      { id: "pasta-sardines", name: "Pasta Sardines", price: 185, img: "pasta-sardines", desc: "Flavorful pasta with sardines, garlic, and herbs.", options: [pick("Flavor", "Original", "Spicy")] },
      { id: "bolognese", name: "Bolognese", price: 259, desc: "Hearty meaty sauce with a rich tomato base, slow cooked to perfection." },
      { id: "asian-beef-pasta", name: "Asian Beef Pasta", price: 259, desc: "Savory and slightly sweet stir-fry style pasta with tender beef and veggies." },
      { id: "beef-penne", name: "Beef Penne", price: 259, img: "penne", desc: "Penne pasta tossed in a rich, savory sauce with tender beef and herbs." },
      { id: "sotanghon", name: "Sotanghon", price: 249, img: "sotanghon", desc: "Filipino-style glass noodles stir-fried with veggies, chicken strips, and savory seasoning." },
    ],
  },
  {
    id: "bowls",
    name: "Comfort Bowls",
    short: "Bowls",
    note: "Warm meals. Real comfort.",
    items: [
      { id: "special-ramen", name: "Special Ramen", price: 159, img: "ramen", desc: "Savory ramen in a rich, flavorful broth topped with a boiled egg, a slice of spam, and herbs." },
      { id: "pancit-canton", name: "Special Pancit Canton", price: 135, img: "pancit", desc: "Classic pancit canton with a sunny egg and a spam slice.", options: [pick("Flavor", "Original", "Chilimansi")] },
      { id: "pho", name: "Vietnamese Pho", price: 315, img: "pho", desc: "Aromatic broth with rice noodles, tender beef, and mushroom balls." },
    ],
  },
  {
    id: "dessert",
    name: "Halo Halo",
    short: "Halo Halo",
    note: "A Filipino favorite. Made even better.",
    items: [
      { id: "halo-halo", name: "Our Classic Halo Halo", price: 120, img: "halohalo", desc: "Ube ice cream, corn flakes, saba & fruits, gulaman, ube halaya, milk & ice." },
    ],
  },
];

const drinks = (prefix, list) => list.map(([name, price]) => ({ id: prefix + "-" + name.toLowerCase().replace(/[^a-z]+/g, "-"), name, price }));

export const DRINKS = [
  {
    id: "coffee",
    name: "Coffee Drinks",
    short: "Coffee",
    items: drinks("coffee", [
      ["Espresso", 90], ["Americano", 105], ["Pour Over", 145], ["Latte", 130], ["Cappuccino", 139],
      // Vanilla is ₱195 on the printed menu; confirm, it looks like a typo next to its neighbours
      ["Caramel Macchiato", 159], ["Spanish", 139], ["Hazelnut", 145], ["Vanilla", 195], ["Vietnamese", 159], ["Mocha", 145],
    ]),
  },
  {
    id: "signatures",
    name: "Signature Drinks",
    short: "Signatures",
    items: drinks("sig", [
      ["Sunrise Spice", 165], ["Orange Americano", 155], ["Coconut Americano", 165],
      ["Strawberry Latte", 165], ["Rose Latte", 165], ["Mango Latte", 165],
    ]),
  },
  {
    id: "non-coffee",
    name: "Non-Coffee",
    short: "Non-Coffee",
    items: drinks("nc", [
      ["Fruit Shakes", 115], ["Oreo Smoothie", 115], ["Money Business", 125], ["Strawberry Daydream", 125],
      ["Red Velvet Crush", 125], ["Matcha Latte", 135], ["Strawberry Matcha", 165], ["Golden Milk/Pink Milk", 99],
    ]).map((d) => (d.id === "nc-golden-milk-pink-milk" ? { ...d, options: [pick("Milk", "Golden milk", "Pink milk")] } : d)),
  },
];
