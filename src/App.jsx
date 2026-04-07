import { Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar'
import Footer from './components/Footer'
import Flight from './pages/Flight'
import Hotel from './pages/Hotel'
import RegistrationPage from './pages/RegistrationPage'
import LoginPage from './pages/LoginPage'
import HotelSearch from './pages/HotelSearch'
import HotelBooking from './pages/HotelBooking'
import FlightSearch from './pages/FlightSearch'
import FlightBooking from './pages/FlightBooking'
import PaymentCallback from './pages/PaymentCallback'
import BookingConfirmation from './pages/BookingConfirmation';
import MyBookings from './pages/MyBookings';

const App = () => {
  return (
    <>
    <NavBar />
      <Routes>
        <Route path="/" element={<Flight />} />
        <Route path="/flight" element={<Flight />} />
        <Route path="/flight-search" element={<FlightSearch />} />
        <Route path="/hotel" element={<Hotel />} /> 
        <Route path="/hotel-search" element={<HotelSearch />} />
        <Route path="/hotel-booking" element={<HotelBooking />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/flight-booking" element={<FlightBooking />} />
        <Route path="/payment/callback" element={<PaymentCallback />} />
        <Route path="/booking/confirmation" element={<BookingConfirmation />} />
        <Route path="/bookings" element={<MyBookings />} />
      </Routes>
    <Footer />
    </>
  )
}

export default App