import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

// Navbar + page + footer. `flex-col` + `flex-1` on <main> keeps the footer at the
// bottom even on short pages. Each page adds its own <Container>, so full-width
// backgrounds (like the Home hero) are possible.
export default function Layout() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Navbar />
      <main className="w-full flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
