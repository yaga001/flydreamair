# FlyDreamAir Flight Booking System

A comprehensive flight booking system with payment method management, persistent storage for bookings, and search history.

## Features

- User authentication (registration and login)
- Flight search with filters for dates, passengers, and cabin class
- Recent search history tracking (last 5 searches)
- Flight listing with sorting and filtering options
- Interactive seat selection
- Booking confirmation and management
- My Bookings section with virtual ticket view
- "Book Again" feature for rebooking past flights
- Payment method management (add, edit, delete)
- Persistent storage for bookings, payment methods, and search history

## Technical Implementation

- Next.js App Router architecture
- React Server Components and Client Components
- Persistent storage using localStorage (simulating file-based storage)
- Responsive design for all device sizes
- Modern UI with FlyDreamAir branding
- GitHub Actions workflow for automated deployment to Vercel

## Local Setup

1. Clone the repository:
\`\`\`bash
git clone https://github.com/yourusername/flydreamair.git
cd flydreamair
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Data Persistence

The system uses localStorage to simulate file-based storage:

- `bookings.json`: Stores all booking data
- `recentSearches.json`: Stores recent search history
- `paymentMethods.json`: Stores payment method information

In a production environment, these would be replaced with a real database.

## Payment Method Security

For security reasons, the system only stores the last 4 digits of credit card numbers. In a real production environment, payment processing would be handled by a secure payment processor like Stripe or PayPal.

## Project Structure

- `/app`: Next.js App Router pages
- `/components`: Reusable React components
- `/lib`: Utility functions and data models
  - `/lib/storage.ts`: Data persistence layer
  - `/lib/bookings.ts`: Booking management
  - `/lib/search-history.ts`: Search history tracking
  - `/lib/payment-methods.ts`: Payment method management
  - `/lib/types.ts`: TypeScript interfaces
  - `/lib/mock-data.ts`: Mock flight data

## Deployment

The project includes GitHub Actions for automated deployment to Vercel. To deploy:

1. Fork this repository
2. Set up a Vercel project
3. Add the following secrets to your GitHub repository:
   - `VERCEL_TOKEN`
   - `ORG_ID`
   - `PROJECT_ID`
4. Push to the main branch to trigger deployment

## License

MIT
