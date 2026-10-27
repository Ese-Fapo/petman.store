# shopSmart

shopSmart is a multivendor marketplace for household essentials and everyday goods built with Next.js, Tailwind CSS, Redux Toolkit, and Lucide React.

The catalog includes 24 departments and over 150 subcategories, with shared category browsing, product filtering, seller listings, and euro pricing.

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Hostinger deployment

Install from the committed lockfile, including build dependencies:

```bash
npm ci --include=dev
```

Set the build command to `npm run build` and the start command to `npm start`.
The production build uses Webpack to avoid the Turbopack PostCSS worker failure
reported on Hostinger. Development continues to use Turbopack.

Deploy from the source repository without uploading `node_modules` or `.next`.
Both directories are ignored by Git and must be generated on the deployment host.

## Features

- Customer storefront for browsing products across household and lifestyle categories
- Product detail pages with reviews and cart actions
- Store dashboard pages for managing marketplace products and orders
- Admin dashboard pages for stores, approvals, coupons, and reporting

## Tech Stack

- Next.js
- React
- Tailwind CSS
- Redux Toolkit
- Lucide React
# petman.store
