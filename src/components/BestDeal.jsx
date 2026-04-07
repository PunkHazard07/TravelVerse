import React from "react";
import { Globe, CreditCard, Bell, Plane, Hotel } from "lucide-react";

const BestDeal = () => {
  return (
    <div className="w-full space-y-20">
      {/* SECTION 1 */}
      <section className="bg-slate-50 py-16 px-6 mt-20">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Find great flight deals worldwide
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto mb-14">
            Compare flights from hundreds of airlines in one place. Travel
            smarter, save more, and plan with confidence.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Card 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
                <Globe className="h-9 w-9 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Search everywhere</h3>
              <p className="text-gray-600 text-sm">
                Choose your departure airport and discover destinations across
                the globe, sorted by price.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <CreditCard className="h-9 w-9 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Clear pricing</h3>
              <p className="text-gray-600 text-sm">
                What you see is what you pay — no hidden fees or unexpected
                charges.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-purple-100">
                <Bell className="h-9 w-9 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">
                Price notifications
              </h3>
              <p className="text-gray-600 text-sm">
                Track flight prices and get alerts when fares rise or drop.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-3">Travel with peace of mind</h2>
          <p className="text-gray-600 max-w-3xl mb-12">
            We help make your journey flexible, simple, and stress-free from
            planning to takeoff.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Feature 1 */}
            <div className="flex gap-4">
              <Plane className="text-black mt-1" size={28} />
              <div>
                <h3 className="font-semibold mb-1">Flexible flight options</h3>
                <p className="text-gray-600 text-sm">
                  Find tickets that allow changes or cancellations if your plans
                  shift.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex gap-4">
              <Hotel className="text-black mt-1" size={28} />
              <div>
                <h3 className="font-semibold mb-1">Hotels & car rentals</h3>
                <p className="text-gray-600 text-sm">
                  Book flights, hotels, and car rentals together in one place.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BestDeal;
