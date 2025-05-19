# FlyDreamAir Flight Booking System

A comprehensive flight booking system with payment method management, persistent storage for bookings, and search history.


### Home (Register/Sign In)
![home](https://github.com/user-attachments/assets/b43f84f6-ff03-456d-929a-6e0b907db7eb)
### Dashboard
![dashboard](https://github.com/user-attachments/assets/3ee87d47-7097-45ae-802a-ec47921643e7)
### Seating Choice
![seat](https://github.com/user-attachments/assets/7b978999-7c05-4956-aba2-24fb0b913146)
### Confirmed Ticket
![confirmed-ticket](https://github.com/user-attachments/assets/25e7975e-a587-4ce3-8d9c-c5dfd18f2d80)


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

## License

MIT
