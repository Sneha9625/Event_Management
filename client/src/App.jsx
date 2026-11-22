import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOtp from './pages/VerifyOtp';
import EventDetails from './pages/EventDetails';
import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent';
import MyEvents from './pages/MyEvents';
import OrganizerDashboard from './pages/OrganizerDashboard';
import Attendees from './pages/Attendees';
import NotFound from './pages/NotFound';

const organizerOnly = (page) => <ProtectedRoute roles={['organizer']}>{page}</ProtectedRoute>;

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Auth pages use their own full-screen layout (no navbar/footer) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />

        {/* Everything else shares the Navbar + Footer layout */}
        <Route element={<Layout />}>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/events/:id" element={<EventDetails />} />

          {/* Any logged-in user */}
          <Route path="/my-events" element={<ProtectedRoute><MyEvents /></ProtectedRoute>} />

          {/* Organizers only */}
          <Route path="/dashboard" element={organizerOnly(<OrganizerDashboard />)} />
          <Route path="/events/create" element={organizerOnly(<CreateEvent />)} />
          <Route path="/events/:id/edit" element={organizerOnly(<EditEvent />)} />
          <Route path="/events/:id/attendees" element={organizerOnly(<Attendees />)} />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}
