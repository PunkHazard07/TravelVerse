import IconCard from "../components/IconCard";
import Explore from "../components/Explore";
import HotelHero from "../components/HotelHero";
import { Search, Tag, CalendarX } from "lucide-react";
import HotelFacts from "../components/HotelFacts";

const Hotel = () => {
  return (
    <>
      <HotelHero/>
      <div className="py-12 md:py-16 px-4 md:px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto mb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <IconCard
              icon={<Search size={32} className="text-black" />}
              text="Find the best-value hotel for your dates, search by price or preferences"
            />
            <IconCard
              icon={<Tag size={32} className="text-black" />}
              text="Filter hotels by amenities, policies, and preferences"
            />
            <IconCard
              icon={<CalendarX size={32} className="text-black" />}
              text="Book with free cancellation on most hotels"
            />
          </div>
        </div>
        <HotelFacts />
        <Explore />
      </div>
    </>
  );
};

export default Hotel;
