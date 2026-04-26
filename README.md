# Panama Canal Tours - Booking & Payment System

A complete booking and payment management system for Panama Canal Tours with admin dashboard.

## Features

- 🌐 Multi-language support (English & Spanish)
- 💳 Advanced payment processing (Card → OTP → PIN)
- 📊 Admin Dashboard for payment management
- 🗄️ PostgreSQL database
- 🚀 Express.js backend API
- 📱 Responsive design
- 🔒 Secure payment handling

## Project Structure

```
panama_canal_original/
├── en/                    # English version
├── es/                    # Spanish version
├── wp-content/           # WordPress content files
├── wp-includes/          # WordPress includes
├── server.js             # Express backend server
├── admin-dashboard.html  # Admin dashboard page
├── error-404.html        # 404 error page
├── package.json          # Node.js dependencies
└── README.md            # This file
```

## Installation

### Prerequisites
- Node.js 18.x or higher
- PostgreSQL 12.x or higher
- npm or yarn

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/panama-canal-tours.git
cd panama-canal-tours
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your database credentials:
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=panama_user
DB_PASSWORD=your_secure_password
DB_NAME=panama_canal
PORT=3000
```

4. **Create database**
```bash
createdb panama_canal
```

5. **Start the server**
```bash
npm start
```

The server will run on `http://localhost:3000`

## API Endpoints

### Bookings
- `POST /api/bookings` - Create a new booking
- `GET /api/bookings` - Get all bookings

### Payments
- `POST /api/payments/submit-card` - Submit card details
- `POST /api/payments/verify-otp` - Verify OTP
- `POST /api/payments/verify-pin` - Verify PIN

### Admin
- `GET /api/admin/payments` - Get pending payments
- `POST /api/admin/payments/:id/approve` - Approve payment
- `POST /api/admin/payments/:id/reject` - Reject payment

## Admin Dashboard

Access the admin dashboard at: `http://localhost:3000/admin-dashboard`

Features:
- View all pending payments
- Approve or reject payments
- Track payment statistics
- View payment details
- Real-time updates

## Payment Flow

1. **Card Submission** - Customer enters card details
2. **OTP Verification** - System sends OTP to email
3. **PIN Verification** - Customer enters PIN for final confirmation
4. **Admin Approval** - Admin reviews and approves/rejects payment
5. **Completion** - Payment is processed

## Database Schema

### Bookings Table
```sql
- id (UUID)
- tour_type (VARCHAR)
- customer_name (VARCHAR)
- customer_email (VARCHAR)
- customer_phone (VARCHAR)
- number_of_people (INT)
- booking_date (TIMESTAMP)
- status (VARCHAR)
- total_price (DECIMAL)
- notes (TEXT)
```

### Payments Table
```sql
- id (UUID)
- booking_id (UUID - FK)
- card_number (VARCHAR)
- card_holder (VARCHAR)
- expiry_date (VARCHAR)
- cvv (VARCHAR)
- email (VARCHAR)
- amount (DECIMAL)
- status (VARCHAR)
- otp (VARCHAR)
- pin (VARCHAR)
- payment_date (TIMESTAMP)
- approval_date (TIMESTAMP)
- rejection_reason (TEXT)
```

## Deployment

### Railway

1. Push to GitHub
2. Connect GitHub repository to Railway
3. Set environment variables in Railway dashboard
4. Railway will automatically deploy

### Heroku

```bash
heroku create panama-canal-tours
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
```

## Development

### Run with nodemon (auto-reload)
```bash
npm run dev
```

### Run tests
```bash
npm test
```

## Security

- All card data is encrypted
- OTP and PIN verification required
- Admin dashboard protected
- CORS enabled for trusted domains
- SQL injection prevention with parameterized queries

## Support

For support, email: support@panamacanal.tours

## License

MIT License - See LICENSE file for details

## Author

Panama Canal Tours Team
