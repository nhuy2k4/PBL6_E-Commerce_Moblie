# Home Screen Components

This directory contains all the components related to the Home screen of the mobile app.

## Components

### PromoBanner.tsx

- Carousel banner displaying promotional images
- Auto-scrolls every 3 seconds
- Pagination dots indicator
- Responsive design for mobile

### FlashSaleSection.tsx

- Displays flash sale products with countdown timer
- Horizontal scrollable product list
- Real-time countdown (Days, Hours, Minutes, Seconds)
- "View All Products" button

### BestSellerSection.tsx

- Shows best-selling products of the month
- Horizontal scrollable product list
- Featured indicator and title
- Direct navigation to all products

### NewArrivalSection.tsx

- Displays newly arrived products
- Horizontal scrollable product list
- Featured label
- "Explore All New Arrivals" button

### ProductExplorer.tsx

- Grid layout (2 columns) for product browsing
- Shows various product categories
- "View All Products" button
- Optimized for mobile viewing

### CategoryList.tsx

- Horizontal scrollable category list
- Icon-based category representation
- Quick navigation to category pages
- Clean and modern design

### ServiceFeatures.tsx

- Displays key service features:
  - Free and Fast Delivery
  - 24/7 Customer Service
  - Money Back Guarantee
- Icon-based presentation
- Vertical layout for mobile

## Usage

All components are imported and used in the main Home screen (`app/(tabs)/index.tsx`):

```tsx
import PromoBanner from "@/components/home/PromoBanner";
import FlashSaleSection from "@/components/home/FlashSaleSection";
import BestSellerSection from "@/components/home/BestSellerSection";
import NewArrivalSection from "@/components/home/NewArrivalSection";
import ProductExplorer from "@/components/home/ProductExplorer";
import ServiceFeatures from "@/components/home/ServiceFeatures";
import CategoryList from "@/components/home/CategoryList";
```

## Design Principles

- **Mobile-First**: All components are designed specifically for mobile screens
- **Performance**: Optimized rendering with FlatList for large lists
- **Responsive**: Adapts to different screen sizes
- **Touch-Friendly**: Large touch targets and smooth scrolling
- **Accessible**: Proper contrast and readable text sizes
- **Dark Mode**: Supports both light and dark color schemes

## Mock Data

Mock data is defined in `constants/mockData.ts` containing:

- `flashSaleProducts`
- `bestSellerProducts`
- `newArrivalProducts`
- `explorerProducts`

Replace with API calls in production.
