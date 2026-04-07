import React from "react";
import {
  Building2,
  MapPin,
  Hotel,
  BadgePercent,
  BellRing,
  SlidersHorizontal,
} from "lucide-react";

const HotelFacts = () => {
  return (
    <section className="w-full px-4 py-12 md:px-10 lg:px-20">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
          Useful facts before you reserve
        </h2>
        <p className="text-gray-600 mt-3 text-sm md:text-base">
          Clear details to help you plan with confidence.
        </p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-16 text-center">
        <div className="flex flex-col items-center gap-3">
          <Building2 className="w-7 h-7 text-blue-600" />
          <span className="text-3xl font-bold text-gray-900">70+</span>
          <p className="text-gray-600 text-sm">
            Accommodation groups available
          </p>
        </div>

        <div className="flex flex-col items-center gap-3">
          <MapPin className="w-7 h-7 text-blue-600" />
          <span className="text-3xl font-bold text-gray-900">6,000+</span>
          <p className="text-gray-600 text-sm">Destinations you can explore</p>
        </div>

        <div className="flex flex-col items-center gap-3">
          <Hotel className="w-7 h-7 text-blue-600" />
          <span className="text-3xl font-bold text-gray-900">3M+</span>
          <p className="text-gray-600 text-sm">Stays listed worldwide</p>
        </div>
      </div>

      {/* Feature Cards */}
      <section className="bg-slate-50 py-16 px-6">
        <div className="max-w-6xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Why travelers choose us</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Simple tools and transparent details to help you book smarter.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-pink-100">
              <BadgePercent className="h-9 w-9 text-pink-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Competitive pricing</h3>
            <p className="text-gray-600 text-sm">
              We compare offers across multiple providers to surface the best
              value.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100">
              <BellRing className="h-9 w-9 text-yellow-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Real-time rates</h3>
            <p className="text-gray-600 text-sm">
              Prices refresh frequently so you always see the most current
              deals.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <SlidersHorizontal className="h-9 w-9 text-green-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Detailed filtering</h3>
            <p className="text-gray-600 text-sm">
              Narrow results by amenities, policies, and preferences that matter
              to you.
            </p>
          </div>
        </div>
      </section>
    </section>
  );
};

export default HotelFacts;
