import logo from './shopsmart.svg'
import upload_area from './upload_area.svg'
import profile_pic3 from './profile_pic3.jpg'
import { TruckIcon, StoreIcon, HeadsetIcon, LayersIcon } from 'lucide-react'
export { categories } from '@/lib/catalog'
export const assets = { logo, upload_area }
export const dummyRatingsData = []
export const dummyStoreData = {
 id: 'store_1', userId: 'user_1', name: 'Everyday Home', username: 'everyday-home',
 description: 'Thoughtful essentials for every room in your home.', address: 'Dublin, Ireland',
 status: 'approved', isActive: true, logo, email: 'store@example.com', contact: '',
 user: { id: 'user_1', name: 'Everyday Home', email: 'store@example.com', image: logo }
}
export const productDummyData = [
 { id: 'prod_1', name: 'Stoneware Dinner Set', description: 'Everyday tableware for sharing good food.', price: 34, mrp: 45, category: 'Dinnerware', images: [], store: dummyStoreData, storeId: 'store_1', inStock: true, rating: [] },
 { id: 'prod_2', name: 'Cotton Bath Towels', description: 'Soft cotton towels for your daily routine.', price: 13, mrp: 19, category: 'Towels', images: [], store: dummyStoreData, storeId: 'store_1', inStock: true, rating: [] },
 { id: 'prod_3', name: 'Desk Organizer', description: 'Keep your workspace in order.', price: 12, mrp: 18, category: 'Office Supplies', images: [], store: dummyStoreData, storeId: 'store_1', inStock: true, rating: [] },
 { id: 'prod_4', name: 'Kitchen Utensil Set', description: 'Useful tools for everyday cooking.', price: 8, mrp: 14, category: 'Kitchen Utensils', images: [], store: dummyStoreData, storeId: 'store_1', inStock: true, rating: [] },
 { id: 'prod_5', name: 'Table Lamp', description: 'A warm touch for your favorite corner.', price: 22, mrp: 29, category: 'Table Lamps', images: [], store: dummyStoreData, storeId: 'store_1', inStock: true, rating: [] },
 { id: 'prod_6', name: 'Storage Basket', description: 'A handy home for everyday things.', price: 17, mrp: 24, category: 'Baskets', images: [], store: dummyStoreData, storeId: 'store_1', inStock: true, rating: [] },
]
export const ourSpecsData = [
 {title: 'Independent stores', description: 'Explore products from sellers with their own specialties, styles, and stories.', icon: StoreIcon, accent: '#15724b'},
 {title: 'Every room covered', description: 'From the kitchen to the garden, discover practical finds across 24 departments.', icon: LayersIcon, accent: '#b88131'},
 {title: 'Orders in one place', description: 'Keep track of your marketplace purchases from your account.', icon: TruckIcon, accent: '#437797'},
 {title: 'Meet your seller', description: 'Visit store pages to explore their range and find their contact details.', icon: HeadsetIcon, accent: '#7b6297'},
]
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
    description: "20% off your first shopSmart order",
    discount: 20,
    forNewUser: true,
    forMember: false,
    isPublic: false,
    expiresAt: "2026-12-31T00:00:00.000Z",
    createdAt: "2025-08-22T08:35:31.183Z",
  },
  {
    code: "HOME10",
    description: "10% off home essentials",
    discount: 10,
    forNewUser: false,
    forMember: false,
    isPublic: false,
    expiresAt: "2026-12-31T00:00:00.000Z",
    createdAt: "2025-08-22T08:35:50.653Z",
  },
  {
    code: "KITCHEN20",
    description: "20% off kitchen bundles",
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
  name: "shopSmart Customer",
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
