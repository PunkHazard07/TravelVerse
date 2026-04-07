import BestDeal from "../components/BestDeal"
import IconCard from "../components/IconCard"
import FlightHero from "../components/FlightHero";
import { Plane, Calendar, AlarmClock } from 'lucide-react';
import BookingSteps from "../components/BookingSteps";

const Flight = () => {
  return (
    <>
    <div className="bg-white border-b border-gray-100 shadow-sm py-3 flex justify-center">
      <BookingSteps currentStep={0} />
    </div>
      <FlightHero />
      <div className="py-12 md:py-16 px-4 md:px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <IconCard
              icon={<Plane size={32} className="text-black" />}
              text="Explore the best flight deals from anywhere, to everywhere, then book with no fees"
            />
            <IconCard
              icon={<Calendar size={32} className="text-black" />}
              text="Flexible dates? Find the cheapest days to fly with our flexible date search"
            />
            <IconCard
              icon={<AlarmClock size={32} className="text-black" />}
              text="Find the cheapest month or even day to fly, and set up Price Alerts to book when the price is right"
            />
          </div>
          <BestDeal />
        </div>
      </div>
    </>
  )
}

export default Flight