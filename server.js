const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const { initDatabase, dbRun, dbGet, dbAll } = require('./database');
const { authenticate, isAdmin, JWT_SECRET } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const seedDatabase = async () => {
  try {

    const userCount = await dbGet('SELECT COUNT(*) as count FROM users');
    if (userCount.count > 0) {
      console.log('Database already has data. Skipping seeding.');
      return;
    }

    console.log('Seeding initial mock data...');

    const adminPassword = await bcrypt.hash('adminpassword', 10);
    const volunteerPassword = await bcrypt.hash('password123', 10);

    const adminId = (await dbRun(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['System Admin', 'admin@vims.org', adminPassword, 'admin']
    )).id;

    const v1Id = (await dbRun(
      'INSERT INTO users (name, email, password, role, skills, interests, availability) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['John Doe', 'john@vims.org', volunteerPassword, 'volunteer', 'Teaching, Public Speaking', 'Education, Youth', 'Weekends']
    )).id;

    const v2Id = (await dbRun(
      'INSERT INTO users (name, email, password, role, skills, interests, availability) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['Jane Smith', 'jane@vims.org', volunteerPassword, 'volunteer', 'First Aid, Gardening', 'Environment, Health', 'Weekdays']
    )).id;

    const v3Id = (await dbRun(
      'INSERT INTO users (name, email, password, role, skills, interests, availability) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['Alex Johnson', 'alex@vims.org', volunteerPassword, 'volunteer', 'Web Development, Design', 'Technology, Community Outreach', 'Flexible']
    )).id;

    const now = new Date();
    const futureDate1 = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; 
    const futureDate2 = new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; 
    const pastDate1 = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; 
    const pastDate2 = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; 

    const e1Id = (await dbRun(
      'INSERT INTO events (title, description, date, location, status) VALUES (?, ?, ?, ?, ?)',
      ['Community Food Drive', 'Sort and distribute food to local families in need.', futureDate1, 'City Harvest Center', 'upcoming']
    )).id;

    const e2Id = (await dbRun(
      'INSERT INTO events (title, description, date, location, status) VALUES (?, ?, ?, ?, ?)',
      ['Beach Cleanup Campaign', 'Join us to clean up debris and protect local marine life.', futureDate2, 'Sunset Beach Park', 'upcoming']
    )).id;

    const e3Id = (await dbRun(
      'INSERT INTO events (title, description, date, location, status) VALUES (?, ?, ?, ?, ?)',
      ['Senior Center Companionship', 'Spend quality time, play games, and share stories with the elderly.', pastDate1, 'Silver Linings Retirement Home', 'completed']
    )).id;

    const e4Id = (await dbRun(
      'INSERT INTO events (title, description, date, location, status) VALUES (?, ?, ?, ?, ?)',
      ['Tech Training for Seniors', 'Teach elderly community members how to use tablets, smartphones, and video calls.', pastDate2, 'Community Library Hub', 'completed']
    )).id;

    await dbRun('INSERT INTO event_registrations (event_id, user_id, registered_at) VALUES (?, ?, ?)', [e1Id, v1Id, new Date().toISOString()]);
    await dbRun('INSERT INTO event_registrations (event_id, user_id, registered_at) VALUES (?, ?, ?)', [e1Id, v2Id, new Date().toISOString()]);
    await dbRun('INSERT INTO event_registrations (event_id, user_id, registered_at) VALUES (?, ?, ?)', [e2Id, v3Id, new Date().toISOString()]);
    await dbRun('INSERT INTO event_registrations (event_id, user_id, registered_at) VALUES (?, ?, ?)', [e3Id, v1Id, new Date().toISOString()]);
    await dbRun('INSERT INTO event_registrations (event_id, user_id, registered_at) VALUES (?, ?, ?)', [e3Id, v2Id, new Date().toISOString()]);
    await dbRun('INSERT INTO event_registrations (event_id, user_id, registered_at) VALUES (?, ?, ?)', [e4Id, v3Id, new Date().toISOString()]);

    await dbRun(
      'INSERT INTO hours_log (user_id, event_id, hours, date, description, status) VALUES (?, ?, ?, ?, ?, ?)',
      [v1Id, e3Id, 4.5, pastDate1, 'Hosted a board game tournament with senior residents.', 'approved']
    );
    await dbRun(
      'INSERT INTO hours_log (user_id, event_id, hours, date, description, status) VALUES (?, ?, ?, ?, ?, ?)',
      [v2Id, e3Id, 3.0, pastDate1, 'Assisted with serving lunch and chatting with seniors.', 'approved']
    );
    await dbRun(
      'INSERT INTO hours_log (user_id, event_id, hours, date, description, status) VALUES (?, ?, ?, ?, ?, ?)',
      [v3Id, e4Id, 5.0, pastDate2, 'Provided 1-on-1 instruction on web browsing and email safety.', 'approved']
    );
    await dbRun(
      'INSERT INTO hours_log (user_id, event_id, hours, date, description, status) VALUES (?, ?, ?, ?, ?, ?)',
      [v1Id, e4Id, 3.5, pastDate2, 'Helped set up projectors and laptops for the digital literacy training.', 'pending']
    );

    console.log('Mock database seeding completed successfully.');
  } catch (err) {
    console.error('Error seeding database:', err);
  }
};

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Please provide name, email, and password.' });
  }

  try {
    const existing = await dbGet('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const assignedRole = role === 'admin' ? 'admin' : 'volunteer'; 

    const result = await dbRun(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, assignedRole]
    );

    const token = jwt.sign(
      { id: result.id, name, email, role: assignedRole },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 
    });

    res.status(201).json({
      message: 'Registration successful',
      user: { id: result.id, name, email, role: assignedRole }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide email and password.' });
  }

  try {
    const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        skills: user.skills,
        interests: user.interests,
        availability: user.availability
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

app.get('/api/auth/me', authenticate, async (req, res) => {
  try {
    const user = await dbGet('SELECT id, name, email, role, skills, interests, availability FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching user profile.' });
  }
});

app.get('/api/volunteers', authenticate, isAdmin, async (req, res) => {
  try {

    const volunteers = await dbAll(`
      SELECT 
        u.id, u.name, u.email, u.skills, u.interests, u.availability,
        COALESCE(SUM(CASE WHEN hl.status = 'approved' THEN hl.hours ELSE 0 END), 0) as total_hours
      FROM users u
      LEFT JOIN hours_log hl ON u.id = hl.user_id
      WHERE u.role = 'volunteer'
      GROUP BY u.id
      ORDER BY total_hours DESC
    `);
    res.json({ volunteers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching volunteers list.' });
  }
});

app.put('/api/volunteers/profile', authenticate, async (req, res) => {
  const { skills, interests, availability } = req.body;

  try {
    await dbRun(
      'UPDATE users SET skills = ?, interests = ?, availability = ? WHERE id = ?',
      [skills, interests, availability, req.user.id]
    );

    const updated = await dbGet('SELECT id, name, email, role, skills, interests, availability FROM users WHERE id = ?', [req.user.id]);
    res.json({ message: 'Profile updated successfully', user: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error updating profile.' });
  }
});

app.get('/api/events', authenticate, async (req, res) => {
  try {
    let events;
    if (req.user.role === 'admin') {

      events = await dbAll(`
        SELECT e.*, COUNT(er.id) as registered_count
        FROM events e
        LEFT JOIN event_registrations er ON e.id = er.event_id
        GROUP BY e.id
        ORDER BY e.date ASC
      `);
    } else {

      events = await dbAll(`
        SELECT e.*, 
               CASE WHEN er.id IS NOT NULL THEN 1 ELSE 0 END as is_registered,
               (SELECT COUNT(*) FROM event_registrations WHERE event_id = e.id) as registered_count
        FROM events e
        LEFT JOIN event_registrations er ON e.id = er.event_id AND er.user_id = ?
        ORDER BY e.date ASC
      `, [req.user.id]);
    }
    res.json({ events });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching events.' });
  }
});

app.post('/api/events', authenticate, isAdmin, async (req, res) => {
  const { title, description, date, location, status } = req.body;

  if (!title || !date || !location) {
    return res.status(400).json({ error: 'Please provide title, date, and location.' });
  }

  try {
    const result = await dbRun(
      'INSERT INTO events (title, description, date, location, status) VALUES (?, ?, ?, ?, ?)',
      [title, description, date, location, status || 'upcoming']
    );
    res.status(201).json({
      message: 'Event created successfully',
      event: { id: result.id, title, description, date, location, status: status || 'upcoming' }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error creating event.' });
  }
});

app.put('/api/events/:id', authenticate, isAdmin, async (req, res) => {
  const { title, description, date, location, status } = req.body;
  const eventId = req.params.id;

  if (!title || !date || !location) {
    return res.status(400).json({ error: 'Please provide title, date, and location.' });
  }

  try {
    const result = await dbRun(
      'UPDATE events SET title = ?, description = ?, date = ?, location = ?, status = ? WHERE id = ?',
      [title, description, date, location, status, eventId]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    res.json({ message: 'Event updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error updating event.' });
  }
});

app.delete('/api/events/:id', authenticate, isAdmin, async (req, res) => {
  const eventId = req.params.id;

  try {
    const result = await dbRun('DELETE FROM events WHERE id = ?', [eventId]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    await dbRun('DELETE FROM event_registrations WHERE event_id = ?', [eventId]);
    await dbRun('DELETE FROM hours_log WHERE event_id = ?', [eventId]);

    res.json({ message: 'Event and related records deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error deleting event.' });
  }
});

app.post('/api/events/:id/register', authenticate, async (req, res) => {
  const eventId = req.params.id;
  const userId = req.user.id;

  try {
    const event = await dbGet('SELECT * FROM events WHERE id = ?', [eventId]);
    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }
    if (event.status === 'completed') {
      return res.status(400).json({ error: 'Cannot register for a completed event.' });
    }

    const existing = await dbGet('SELECT id FROM event_registrations WHERE event_id = ? AND user_id = ?', [eventId, userId]);
    if (existing) {
      return res.status(400).json({ error: 'You are already registered for this event.' });
    }

    await dbRun(
      'INSERT INTO event_registrations (event_id, user_id, registered_at) VALUES (?, ?, ?)',
      [eventId, userId, new Date().toISOString()]
    );

    res.json({ message: 'Successfully registered for the event.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error registering for event.' });
  }
});

app.delete('/api/events/:id/register', authenticate, async (req, res) => {
  const eventId = req.params.id;
  const userId = req.user.id;

  try {
    const result = await dbRun(
      'DELETE FROM event_registrations WHERE event_id = ? AND user_id = ?',
      [eventId, userId]
    );

    if (result.changes === 0) {
      return res.status(400).json({ error: 'You are not registered for this event.' });
    }

    res.json({ message: 'Successfully cancelled event registration.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error cancelling registration.' });
  }
});

app.post('/api/hours/log', authenticate, async (req, res) => {
  const { eventId, hours, date, description } = req.body;

  if (!eventId || !hours || !date) {
    return res.status(400).json({ error: 'Please provide event, hours, and date.' });
  }

  const hoursNum = parseFloat(hours);
  if (isNaN(hoursNum) || hoursNum <= 0) {
    return res.status(400).json({ error: 'Hours must be a valid positive number.' });
  }

  try {

    const event = await dbGet('SELECT id FROM events WHERE id = ?', [eventId]);
    if (!event) {
      return res.status(404).json({ error: 'Selected event does not exist.' });
    }

    await dbRun(
      'INSERT INTO hours_log (user_id, event_id, hours, date, description, status) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, eventId, hoursNum, date, description || '', 'pending']
    );

    res.status(201).json({ message: 'Hours logged successfully. Pending admin approval.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error logging hours.' });
  }
});

app.get('/api/hours', authenticate, async (req, res) => {
  try {
    let logs;
    if (req.user.role === 'admin') {

      logs = await dbAll(`
        SELECT hl.*, u.name as volunteer_name, e.title as event_title
        FROM hours_log hl
        JOIN users u ON hl.user_id = u.id
        JOIN events e ON hl.event_id = e.id
        ORDER BY hl.date DESC
      `);
    } else {

      logs = await dbAll(`
        SELECT hl.*, e.title as event_title
        FROM hours_log hl
        JOIN events e ON hl.event_id = e.id
        WHERE hl.user_id = ?
        ORDER BY hl.date DESC
      `, [req.user.id]);
    }
    res.json({ logs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching hours logs.' });
  }
});

app.put('/api/hours/:id/approve', authenticate, isAdmin, async (req, res) => {
  const logId = req.params.id;
  const { status } = req.body; 

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: "Status must be 'approved' or 'rejected'." });
  }

  try {
    const result = await dbRun(
      'UPDATE hours_log SET status = ? WHERE id = ?',
      [status, logId]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Hours log entry not found.' });
    }

    res.json({ message: `Hours log has been ${status}.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error updating hours status.' });
  }
});

app.get('/api/stats', authenticate, isAdmin, async (req, res) => {
  try {

    const volCount = await dbGet("SELECT COUNT(*) as count FROM users WHERE role = 'volunteer'");

    const eventCount = await dbGet("SELECT COUNT(*) as count FROM events");

    const hoursSum = await dbGet("SELECT SUM(hours) as sum FROM hours_log WHERE status = 'approved'");

    const pendingCount = await dbGet("SELECT COUNT(*) as count FROM hours_log WHERE status = 'pending'");

    const topVolunteers = await dbAll(`
      SELECT u.name, SUM(hl.hours) as hours
      FROM hours_log hl
      JOIN users u ON hl.user_id = u.id
      WHERE hl.status = 'approved'
      GROUP BY u.id
      ORDER BY hours DESC
      LIMIT 5
    `);

    const eventStats = await dbAll(`
      SELECT e.title, e.status, COUNT(er.id) as registrations
      FROM events e
      LEFT JOIN event_registrations er ON e.id = er.event_id
      GROUP BY e.id
      ORDER BY registrations DESC
      LIMIT 6
    `);

    res.json({
      stats: {
        totalVolunteers: volCount.count,
        totalEvents: eventCount.count,
        totalApprovedHours: hoursSum.sum || 0,
        pendingApprovalCount: pendingCount.count,
        topVolunteers,
        eventStats
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching stats.' });
  }
});

app.get('*all', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const startServer = async () => {
  await initDatabase();
  await seedDatabase();
  app.listen(PORT, () => {
    console.log(`Volunteer Info Management System running at http://localhost:${PORT}`);
  });
};

startServer();
