// Fills the database with demo data.  Run with:  npm run seed
// WARNING: this deletes ALL existing users, events and registrations first.
require('dotenv').config();
const mongoose = require('mongoose');

const User = require('./models/User');
const Event = require('./models/Event');
const Registration = require('./models/Registration');

// Dates relative to "now" so the seeded events are always upcoming
const daysFromNow = (days, hour = 10) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d;
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    await Promise.all([User.deleteMany(), Event.deleteMany(), Registration.deleteMany()]);
    console.log('Old data cleared');

    // User.create (not insertMany) so the pre-save hook hashes each password
    const [organizer, alice, bob] = await User.create([
      { name: 'Olivia Organizer', email: 'organizer@eventhub.com', password: '123456', role: 'organizer', isVerified: true },
      { name: 'Alice Attendee', email: 'alice@eventhub.com', password: '123456', role: 'attendee', isVerified: true },
      { name: 'Bob Attendee', email: 'bob@eventhub.com', password: '123456', role: 'attendee', isVerified: true },
    ]);
    console.log('Users created');

    // Coordinates are included so seeding doesn't depend on the geocoding API
    const events = await Event.create([
      {
        title: 'React & Node.js Meetup',
        description: 'An evening of talks on modern full-stack JavaScript: React Server Components, Express best practices and deploying MERN apps. Snacks included!',
        category: 'Tech',
        date: daysFromNow(7, 18),
        venue: 'Koramangala, Bengaluru',
        location: { lat: 12.9352, lng: 77.6245 },
        capacity: 50,
        organizer: organizer._id,
      },
      {
        title: 'Sunset Acoustic Night',
        description: 'Relax with live acoustic performances by local indie artists by the sea. Bring your friends and enjoy great music under the open sky.',
        category: 'Music',
        date: daysFromNow(10, 19),
        venue: 'Juhu Beach, Mumbai',
        location: { lat: 19.0988, lng: 72.8267 },
        capacity: 200,
        organizer: organizer._id,
      },
      {
        title: 'Community 5K Fun Run',
        description: 'A friendly 5 km run for all fitness levels. Free t-shirt and refreshments for every registered runner. Walkers are welcome too!',
        category: 'Sports',
        date: daysFromNow(14, 6),
        venue: 'Cubbon Park, Bengaluru',
        location: { lat: 12.9763, lng: 77.5929 },
        capacity: 150,
        organizer: organizer._id,
      },
      {
        title: 'UI/UX Design Workshop',
        description: 'Hands-on workshop covering wireframing, prototyping in Figma and usability testing. Bring a laptop. Limited seats to keep it interactive.',
        category: 'Workshop',
        date: daysFromNow(21, 11),
        venue: 'Connaught Place, New Delhi',
        location: { lat: 28.6315, lng: 77.2167 },
        capacity: 3, // deliberately small so you can test the "Event full" state
        organizer: organizer._id,
      },
      {
        title: 'Startup Networking Brunch',
        description: 'Meet founders, developers and investors over brunch. Short pitches, open networking and plenty of coffee to fuel new ideas.',
        category: 'Other',
        date: daysFromNow(30, 10),
        venue: 'Hitech City, Hyderabad',
        location: { lat: 17.4435, lng: 78.3772 },
        capacity: 80,
        organizer: organizer._id,
      },
    ]);
    console.log('Events created');

    await Registration.create([
      { user: alice._id, event: events[0]._id },
      { user: alice._id, event: events[3]._id },
      { user: bob._id, event: events[0]._id },
      { user: bob._id, event: events[3]._id },
    ]);
    console.log('Registrations created');

    console.log('\n✅ Seed complete! Log in with (password for all: 123456):');
    console.log('   Organizer: organizer@eventhub.com');
    console.log('   Attendee:  alice@eventhub.com');
    console.log('   Attendee:  bob@eventhub.com\n');
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seed();
