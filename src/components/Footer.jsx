import React from "react";

const Footer = () => {
  return (
    <footer className="bg-blue-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Brand / About */}
          <div>
            <h2 className="text-xl font-semibold mb-3">TravelVerse</h2>
            <p className="text-sm text-blue-200 max-w-md">
                Your trusted partner for seamless travel experiences. 
                Book flights, hotels, and more with ease.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-medium mb-3">Contact</h3>
            <ul className="space-y-2 text-sm text-blue-200">
              <li>Email: hello@travelverse.com</li>
              <li>Phone: +1 234 567 890</li>
              <li>Location: Remote / Worldwide</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-blue-800 mt-10 pt-6 text-center text-sm text-blue-300">
          © {new Date().getFullYear()} TravelVerse. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
