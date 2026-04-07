import React from "react";

const Explore = () => {
  return (
    <section className="w-full px-6 py-16">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <h2 className="text-3xl md:text-4xl font-bold mb-10">
          Plan better, travel further
        </h2>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Card 1 */}
          <article>
            <div className="group relative w-full h-64 md:h-72 rounded-xl overflow-hidden mb-4">
              <img
                src="/public/h2.jpg"
                alt="Article cover"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Smart ways to save on your next hotel stay
            </h3>
            <p className="text-sm text-gray-500">12 Aug 2024 · Travel Guide</p>
          </article>

          {/* Card 2 */}
          <article>
            <div className="group relative w-full h-64 md:h-72 rounded-xl overflow-hidden mb-4">
              <img
                src="/public/h5.jpg"
                alt="Article cover"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Hotels food lovers are booking again and again
            </h3>
            <p className="text-sm text-gray-500">30 Jun 2024 · Editorial</p>
          </article>

          {/* Card 3 */}
          <article>
            <div className="group relative w-full h-64 md:h-72 rounded-xl overflow-hidden mb-4">
              <img
                src="/public/h1.jpg"
                alt="Article cover"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Minimalist hotel rooms that feel like home
            </h3>
            <p className="text-sm text-gray-500">18 May 2024 · Design</p>
          </article>

          {/* Card 4 */}
          <article>
            <div className="group relative w-full h-64 md:h-72 rounded-xl overflow-hidden mb-4">
              <img
                src="/public/n4.jpg"
                alt="Article cover"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Incredible places to stay near the ocean
            </h3>
            <p className="text-sm text-gray-500">02 Apr 2024 · Inspiration</p>
          </article>
        </div>
      </div>
    </section>
  );
};

export default Explore;
