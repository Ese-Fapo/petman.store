import logo from "./logo.png";
import upload_area from "./upload_area.svg";
import catFood from "./cat-food.webp";
import catFood2 from "./catfood2.webp";
import catToy from "./cat-toy.webp";
import catToy1 from "./cat-toy1.webp";
import catToy3 from "./cat-toy3.webp";
import dogFood from "./dog-food.webp";
import dogFood2 from "./dogfood.webp";
import dogToy from "./dog-toy.webp";
import dogToy1 from "./dog-toy1.webp";
import dogToy2 from "./dog-toy2.webp";
import dogSupplements from "./dogsupplements.webp";
import foodBowl from "./foodbowl.jpg";
import hamsterFood from "./hamstarfood.webp";
import parrotFood from "./parrotfood.webp";
import petFood from "./pets food.webp";
import petFood2 from "./petfood2.webp";
import rabbitFood from "./rabbit-food.webp";
import rabbitFood2 from "./rabbitfood2.webp";
import catHero from "./crepessuzette-cat-2170495_1920.jpg";
import profile_pic3 from "./profile_pic3.jpg";
import {
  ClockFadingIcon,
  HeadsetIcon,
  MapPinIcon,
  ShieldCheckIcon,
  TruckIcon,
} from "lucide-react";

export const assets = {
  upload_area,
  logo,
  hero_model_img: catHero,
  hero_product_img1: dogToy2,
  hero_product_img2: petFood2,
};

export const categories = [
  "Dog Food",
  "Cat Food",
  "Treats",
  "Toys",
  "Bird Care",
  "Small Pets",
  "Bowls",
  "Supplements",
];

export const dummyRatingsData = [
  {
    id: "rat_1",
    rating: 4.8,
    review:
      "Fast delivery to Dublin and the food was fresh, sealed, and exactly what our dog needed.",
    user: { name: "Aoife Byrne", image: profile_pic3 },
    productId: "prod_1",
    createdAt: "Sat Jul 19 2025 14:51:25 GMT+0100 (Irish Standard Time)",
    updatedAt: "Sat Jul 19 2025 14:51:25 GMT+0100 (Irish Standard Time)",
    product: { name: "Premium Dog Food", category: "Dog Food", id: "prod_1" },
  },
  {
    id: "rat_2",
    rating: 5.0,
    review:
      "Lovely quality and fair prices. Our cat took to the new treats straight away.",
    user: { name: "Conor Walsh", image: profile_pic3 },
    productId: "prod_2",
    createdAt: "Sat Jul 19 2025 14:51:25 GMT+0100 (Irish Standard Time)",
    updatedAt: "Sat Jul 19 2025 14:51:25 GMT+0100 (Irish Standard Time)",
    product: {
      name: "Cat Treat Selection",
      category: "Cat Food",
      id: "prod_2",
    },
  },
  {
    id: "rat_3",
    rating: 4.6,
    review:
      "Helpful service, good stock, and the toys have survived a very enthusiastic terrier.",
    user: { name: "Niamh Kelly", image: profile_pic3 },
    productId: "prod_3",
    createdAt: "Sat Jul 19 2025 14:51:25 GMT+0100 (Irish Standard Time)",
    updatedAt: "Sat Jul 19 2025 14:51:25 GMT+0100 (Irish Standard Time)",
    product: { name: "Durable Dog Toy", category: "Toys", id: "prod_3" },
  },
  {
    id: "rat_4",
    rating: 4.9,
    review: "Great range for small pets and quick dispatch across Ireland.",
    user: { name: "Sean OBrien", image: profile_pic3 },
    productId: "prod_4",
    createdAt: "Sat Jul 19 2025 14:51:25 GMT+0100 (Irish Standard Time)",
    updatedAt: "Sat Jul 19 2025 14:51:25 GMT+0100 (Irish Standard Time)",
    product: { name: "Rabbit Food Mix", category: "Small Pets", id: "prod_4" },
  },
];

export const dummyStoreData = {
  id: "store_1",
  userId: "user_1",
  name: "JUSTPETS",
  description:
    "JUSTPETS is an Ireland-based pet shop for everyday food, toys, bowls, treats, and care essentials for dogs, cats, birds, rabbits, hamsters, and the small companions who run the house.",
  username: "justpets",
  address: "24 Pet Lane, Dublin 2, Ireland",
  status: "approved",
  isActive: true,
  logo,
  email: "hello@justpets.ie",
  contact: "+353 1 555 0198",
  createdAt: "2025-09-04T09:04:16.189Z",
  updatedAt: "2025-09-04T09:04:44.273Z",
  user: {
    id: "user_31dOriXqC4TATvc0brIhlYbwwc5",
    name: "JUSTPETS",
    email: "hello@justpets.ie",
    image: logo,
  },
};

export const productDummyData = [
  {
    id: "prod_1",
    name: "Irish Chicken Dog Food",
    description:
      "A complete dry dog food made for everyday feeding, with balanced protein, fibre, and minerals to support active dogs through Irish weather and long park walks.",
    mrp: 42,
    price: 34,
    images: [dogFood, dogFood2, petFood, foodBowl],
    category: "Dog Food",
    storeId: "seller_1",
    inStock: true,
    store: dummyStoreData,
    rating: dummyRatingsData,
    createdAt: "Sat Jul 29 2025 14:51:25 GMT+0100 (Irish Standard Time)",
    updatedAt: "Sat Jul 29 2025 14:51:25 GMT+0100 (Irish Standard Time)",
  },
  {
    id: "prod_2",
    name: "Salmon Cat Food Pouch",
    description:
      "Soft salmon cat food for fussy eaters, portioned for easy serving and made to keep mealtimes simple, clean, and satisfying.",
    mrp: 18,
    price: 13,
    images: [catFood, catFood2],
    storeId: "seller_1",
    inStock: true,
    store: dummyStoreData,
    category: "Cat Food",
    rating: dummyRatingsData,
    createdAt: "Sat Jul 28 2025 14:51:25 GMT+0100 (Irish Standard Time)",
    updatedAt: "Sat Jul 28 2025 14:51:25 GMT+0100 (Irish Standard Time)",
  },
  {
    id: "prod_3",
    name: "Tough Rope Dog Toy",
    description:
      "A durable tug and chew toy for dogs who like playtime with a bit of effort. Great for fetch, garden sessions, and rainy-day energy.",
    mrp: 16,
    price: 10,
    images: [dogToy, dogToy1, dogToy2],
    storeId: "seller_1",
    inStock: true,
    store: dummyStoreData,
    category: "Toys",
    rating: dummyRatingsData,
    createdAt: "Sat Jul 27 2025 14:51:25 GMT+0100 (Irish Standard Time)",
    updatedAt: "Sat Jul 27 2025 14:51:25 GMT+0100 (Irish Standard Time)",
  },
  {
    id: "prod_4",
    name: "Feather Cat Teaser",
    description:
      "A lightweight cat toy designed for pouncing, chasing, and keeping indoor cats moving between naps.",
    mrp: 14,
    price: 8,
    images: [catToy, catToy1, catToy3],
    storeId: "seller_1",
    inStock: true,
    store: dummyStoreData,
    category: "Toys",
    rating: dummyRatingsData,
    createdAt: "Sat Jul 26 2025 14:51:25 GMT+0100 (Irish Standard Time)",
    updatedAt: "Sat Jul 26 2025 14:51:25 GMT+0100 (Irish Standard Time)",
  },
  {
    id: "prod_5",
    name: "Daily Dog Supplements",
    description:
      "Daily supplement support for coat, joints, and general wellbeing, made for dogs who need a little extra care in the bowl.",
    mrp: 29,
    price: 22,
    images: [dogSupplements],
    storeId: "seller_1",
    inStock: true,
    store: dummyStoreData,
    category: "Supplements",
    rating: [...dummyRatingsData, ...dummyRatingsData],
    createdAt: "Sat Jul 25 2025 14:51:25 GMT+0100 (Irish Standard Time)",
    updatedAt: "Sat Jul 25 2025 14:51:25 GMT+0100 (Irish Standard Time)",
  },
  {
    id: "prod_6",
    name: "Ceramic Food Bowl",
    description:
      "A sturdy ceramic bowl for food or water, easy to clean and weighty enough to stay put during enthusiastic dinners.",
    mrp: 24,
    price: 17,
    images: [foodBowl],
    storeId: "seller_1",
    inStock: true,
    store: dummyStoreData,
    category: "Bowls",
    rating: [...dummyRatingsData, ...dummyRatingsData],
    createdAt: "Sat Jul 24 2025 14:51:25 GMT+0100 (Irish Standard Time)",
    updatedAt: "Sat Jul 24 2025 14:51:25 GMT+0100 (Irish Standard Time)",
  },
  {
    id: "prod_7",
    name: "Rabbit Food Mix",
    description:
      "A balanced rabbit food mix with crunchy pieces and fibre-rich ingredients for healthy daily feeding.",
    mrp: 19,
    price: 12,
    images: [rabbitFood, rabbitFood2],
    storeId: "seller_1",
    inStock: true,
    store: dummyStoreData,
    category: "Small Pets",
    rating: [...dummyRatingsData, ...dummyRatingsData],
    createdAt: "Sat Jul 23 2025 14:51:25 GMT+0100 (Irish Standard Time)",
    updatedAt: "Sat Jul 23 2025 14:51:25 GMT+0100 (Irish Standard Time)",
  },
  {
    id: "prod_8",
    name: "Hamster Food Blend",
    description:
      "A small-pet food blend with grains and seeds for hamsters, gerbils, and tiny snack inspectors.",
    mrp: 15,
    price: 9,
    images: [hamsterFood],
    storeId: "seller_1",
    inStock: true,
    store: dummyStoreData,
    category: "Small Pets",
    rating: [...dummyRatingsData, ...dummyRatingsData],
    createdAt: "Sat Jul 22 2025 14:51:25 GMT+0100 (Irish Standard Time)",
    updatedAt: "Sat Jul 22 2025 14:51:25 GMT+0100 (Irish Standard Time)",
  },
  {
    id: "prod_9",
    name: "Parrot Seed Mix",
    description:
      "A bright seed mix for parrots and other companion birds, packed for freshness and easy daily feeding.",
    mrp: 21,
    price: 15,
    images: [parrotFood],
    storeId: "seller_1",
    inStock: true,
    store: dummyStoreData,
    category: "Bird Care",
    rating: [...dummyRatingsData, ...dummyRatingsData],
    createdAt: "Sat Jul 21 2025 14:51:25 GMT+0100 (Irish Standard Time)",
    updatedAt: "Sat Jul 21 2025 14:51:25 GMT+0100 (Irish Standard Time)",
  },
  {
    id: "prod_10",
    name: "Complete Pet Food Bag",
    description:
      "A reliable cupboard staple for multi-pet homes, ideal when you want quality food ready for the week.",
    mrp: 36,
    price: 28,
    images: [petFood2, petFood],
    storeId: "seller_1",
    inStock: true,
    store: dummyStoreData,
    category: "Pet Food",
    rating: [...dummyRatingsData, ...dummyRatingsData],
    createdAt: "Sat Jul 20 2025 14:51:25 GMT+0100 (Irish Standard Time)",
    updatedAt: "Sat Jul 20 2025 14:51:25 GMT+0100 (Irish Standard Time)",
  },
];

export const ourSpecsData = [
  {
    title: "Ireland Delivery",
    description:
      "Fast dispatch to homes across Ireland, with free delivery on qualifying pet-shop orders.",
    icon: TruckIcon,
    accent: "#16A34A",
  },
  {
    title: "7 Day Returns",
    description:
      "Ordered the wrong size, flavour, or toy? Return eligible items within 7 days.",
    icon: ClockFadingIcon,
    accent: "#F97316",
  },
  {
    title: "Pet Care Support",
    description:
      "Friendly help for food, toys, bowls, and everyday care choices.",
    icon: HeadsetIcon,
    accent: "#2563EB",
  },
  {
    title: "Trusted Essentials",
    description:
      "Carefully chosen everyday products for dogs, cats, birds, and small pets.",
    icon: ShieldCheckIcon,
    accent: "#7C3AED",
  },
  {
    title: "Dublin Based",
    description:
      "An Irish pet shop with local contact details and service built around Irish households.",
    icon: MapPinIcon,
    accent: "#059669",
  },
];

export const addressDummyData = {
  id: "addr_1",
  userId: "user_1",
  name: "Aoife Byrne",
  email: "aoife@example.ie",
  street: "10 Camden Street",
  city: "Dublin",
  state: "Leinster",
  zip: "D02",
  country: "Ireland",
  phone: "+353 87 555 0142",
  createdAt: "Sat Jul 19 2025 14:51:25 GMT+0100 (Irish Standard Time)",
};

export const couponDummyData = [
  {
    code: "NEW20",
    description: "20% off your first JUSTPETS order",
    discount: 20,
    forNewUser: true,
    forMember: false,
    isPublic: false,
    expiresAt: "2026-12-31T00:00:00.000Z",
    createdAt: "2025-08-22T08:35:31.183Z",
  },
  {
    code: "TREATS10",
    description: "10% off pet treats",
    discount: 10,
    forNewUser: false,
    forMember: false,
    isPublic: false,
    expiresAt: "2026-12-31T00:00:00.000Z",
    createdAt: "2025-08-22T08:35:50.653Z",
  },
  {
    code: "FOOD20",
    description: "20% off food bundles",
    discount: 20,
    forNewUser: false,
    forMember: false,
    isPublic: false,
    expiresAt: "2026-12-31T00:00:00.000Z",
    createdAt: "2025-08-22T08:42:00.811Z",
  },
];

export const dummyUserData = {
  id: "user_31dQbH27HVtovbs13X2cmqefddM",
  name: "JUSTPETS Customer",
  email: "customer@example.ie",
  image: profile_pic3,
  cart: {},
};

export const orderDummyData = [
  {
    id: "cmemm75h5001jtat89016h1p3",
    total: 47,
    status: "DELIVERED",
    userId: "user_31dQbH27HVtovbs13X2cmqefddM",
    storeId: "store_1",
    addressId: "addr_1",
    isPaid: false,
    paymentMethod: "COD",
    createdAt: "2025-08-22T09:15:03.929Z",
    updatedAt: "2025-08-22T09:15:50.723Z",
    isCouponUsed: true,
    coupon: couponDummyData[0],
    orderItems: [
      {
        orderId: "cmemm75h5001jtat89016h1p3",
        productId: "prod_1",
        quantity: 1,
        price: 34,
        product: productDummyData[0],
      },
      {
        orderId: "cmemm75h5001jtat89016h1p3",
        productId: "prod_4",
        quantity: 1,
        price: 8,
        product: productDummyData[3],
      },
    ],
    address: addressDummyData,
    user: dummyUserData,
  },
  {
    id: "cmemm6jv7001htat8vmm3gxaf",
    total: 74,
    status: "DELIVERED",
    userId: "user_31dQbH27HVtovbs13X2cmqefddM",
    storeId: "store_1",
    addressId: "addr_1",
    isPaid: true,
    paymentMethod: "CARD",
    createdAt: "2025-08-22T09:14:35.923Z",
    updatedAt: "2025-08-22T09:15:52.535Z",
    isCouponUsed: false,
    coupon: couponDummyData[1],
    orderItems: [
      {
        orderId: "cmemm6jv7001htat8vmm3gxaf",
        productId: "prod_2",
        quantity: 2,
        price: 13,
        product: productDummyData[1],
      },
      {
        orderId: "cmemm6jv7001htat8vmm3gxaf",
        productId: "prod_5",
        quantity: 1,
        price: 22,
        product: productDummyData[4],
      },
      {
        orderId: "cmemm6jv7001htat8vmm3gxaf",
        productId: "prod_6",
        quantity: 1,
        price: 17,
        product: productDummyData[5],
      },
    ],
    address: addressDummyData,
    user: dummyUserData,
  },
];

export const storesDummyData = [
  {
    ...dummyStoreData,
    user: dummyUserData,
  },
];

export const dummyAdminDashboardData = {
  orders: 6,
  stores: 1,
  products: 10,
  revenue: "959.10",
  allOrders: [
    { createdAt: "2025-08-20T08:46:58.239Z", total: 145.6 },
    { createdAt: "2025-08-22T08:46:21.818Z", total: 97.2 },
    { createdAt: "2025-08-22T08:45:59.587Z", total: 54.4 },
    { createdAt: "2025-08-23T09:15:03.929Z", total: 214.2 },
    { createdAt: "2025-08-23T09:14:35.923Z", total: 421.6 },
    { createdAt: "2025-08-23T11:44:29.713Z", total: 26.1 },
  ],
};

export const dummyStoreDashboardData = {
  ratings: dummyRatingsData,
  totalOrders: 2,
  totalEarnings: 121,
  totalProducts: 10,
};
