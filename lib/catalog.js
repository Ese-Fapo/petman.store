export const departments = [
  ['Furniture', 'Sofa', 'Sofas & Armchairs', 'Tables & Desks', 'Chairs & Stools', 'Shelving & Bookcases', 'Wardrobes', 'Bedroom Furniture', 'Outdoor Furniture'],
  ['Kitchen & Dining', 'CookingPot', 'Cookware', 'Bakeware', 'Kitchen Utensils', 'Dinnerware', 'Cutlery', 'Drinkware', 'Food Storage', 'Kitchen Linens'],
  ['Home Decor', 'Flower2', 'Vases & Planters', 'Wall Art', 'Mirrors', 'Clocks', 'Candles & Fragrance', 'Cushions & Throws', 'Rugs & Mats'],
  ['Bedding & Bath', 'BedDouble', 'Bed Sheets', 'Duvets & Comforters', 'Pillows', 'Mattress Protectors', 'Towels', 'Bathroom Accessories', 'Shower Curtains'],
  ['Appliances', 'Refrigerator', 'Refrigerators & Freezers', 'Washing Machines', 'Dishwashers', 'Ovens & Microwaves', 'Coffee Machines', 'Kettles & Toasters', 'Air Fryers', 'Vacuum Cleaners'],
  ['Cleaning & Laundry', 'SprayCan', 'Cleaning Products', 'Mops & Brushes', 'Laundry Detergent', 'Drying Racks', 'Laundry Baskets', 'Bins & Recycling', 'Paper & Tissue'],
  ['Storage & Organization', 'Boxes', 'Storage Boxes', 'Baskets', 'Closet Organizers', 'Shoe Storage', 'Kitchen Organizers', 'Garage Storage'],
  ['Lighting', 'Lamp', 'Ceiling Lights', 'Table Lamps', 'Floor Lamps', 'Wall Lights', 'Outdoor Lighting', 'Light Bulbs', 'LED Strips'],
  ['Electronics', 'Headphones', 'TVs & Home Cinema', 'Audio & Speakers', 'Headphones', 'Cameras', 'Gaming Consoles', 'Electronic Accessories'],
  ['Computers & Office', 'Laptop', 'Laptops', 'Desktop Computers', 'Monitors', 'Keyboards & Mice', 'Printers & Ink', 'Office Supplies', 'Networking'],
  ['Phones & Accessories', 'Smartphone', 'Smartphones', 'Tablets', 'Phone Cases', 'Chargers & Cables', 'Power Banks', 'Smartwatches'],
  ['Smart Home', 'Wifi', 'Smart Speakers', 'Smart Plugs', 'Smart Lighting', 'Security Cameras', 'Video Doorbells', 'Smart Thermostats'],
  ['Garden & Outdoor', 'Sprout', 'Plants & Seeds', 'Gardening Tools', 'Pots & Raised Beds', 'Watering & Irrigation', 'Barbecues & Grills', 'Outdoor Living', 'Garden Sheds'],
  ['Tools & DIY', 'Drill', 'Power Tools', 'Hand Tools', 'Tool Storage', 'Hardware & Fixings', 'Paint & Decorating', 'Ladders', 'Safety Equipment'],
  ['Home Improvement', 'Hammer', 'Plumbing', 'Electrical Supplies', 'Flooring', 'Doors & Windows', 'Bathroom Fixtures', 'Kitchen Fixtures', 'Building Materials'],
  ['Heating & Cooling', 'Fan', 'Fans', 'Air Conditioners', 'Heaters', 'Air Purifiers', 'Dehumidifiers', 'Humidifiers'],
  ['Grocery & Pantry', 'ShoppingBasket', 'Tea & Coffee', 'Breakfast Foods', 'Pasta & Rice', 'Cooking Oils & Spices', 'Snacks', 'Baking Ingredients', 'Drinks'],
  ['Beauty & Personal Care', 'Sparkles', 'Skincare', 'Haircare', 'Bath & Body', 'Oral Care', 'Grooming Tools', 'Makeup', 'Fragrances'],
  ['Health & Wellness', 'HeartPulse', 'First Aid', 'Vitamins & Supplements', 'Massage & Relaxation', 'Health Monitors', 'Mobility Aids', 'Personal Hygiene'],
  ['Baby & Kids', 'Baby', 'Baby Care', 'Feeding Essentials', 'Nursery', 'Prams & Car Seats', 'Kids Furniture', 'Baby Safety'],
  ['Toys & Games', 'Puzzle', 'Board Games', 'Puzzles', 'Building Sets', 'Educational Toys', 'Arts & Crafts', 'Outdoor Toys', 'Dolls & Action Figures'],
  ['Sports & Fitness', 'Dumbbell', 'Fitness Equipment', 'Yoga & Pilates', 'Cycling', 'Team Sports', 'Camping & Hiking', 'Swimming'],
  ['Fashion & Travel', 'Briefcase', 'Clothing', 'Footwear', 'Bags & Backpacks', 'Luggage', 'Travel Accessories', 'Jewelry & Watches'],
  ['Automotive & Hobbies', 'Car', 'Car Accessories', 'Car Cleaning', 'Car Tools', 'Bicycle Accessories', 'Craft Supplies', 'Musical Instruments', 'Party & Seasonal'],
].map(([name, icon, ...categories]) => ({ name, icon, categories }))

export const categories = departments.flatMap(department => [department.name, ...department.categories])
export const categoryHref = category => `/shop?category=${encodeURIComponent(category)}`
export function matchesCategory(product, category) {
  if (!category) return true
  const department = departments.find(item => item.name === category)
  return (department ? [department.name, ...department.categories] : [category]).some(name => name.toLowerCase() === product.category?.toLowerCase())
}
export function filterProducts(products, { search = '', category = '', sort = 'newest' } = {}) {
  const query = search.trim().toLowerCase()
  return products.filter(product => matchesCategory(product, category) && (!query || [product.name, product.description, product.category, product.store?.name].some(value => value?.toLowerCase().includes(query))))
    .sort((a, b) => sort === 'price-low' ? Number(a.price) - Number(b.price) : sort === 'price-high' ? Number(b.price) - Number(a.price) : new Date(b.createdAt) - new Date(a.createdAt))
}
