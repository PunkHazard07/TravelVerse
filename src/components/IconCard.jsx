import React from 'react';

const IconCard = ({ icon, text }) => {
  return (
    <div className="flex flex-col items-center p-6 border-2 border-black-300 rounded-lg bg-white text-center">
      <div className="mb-4">
        {icon}
      </div>
      <p className="text-gray-700 font-medium">
        {text}
      </p>
    </div>
  );
};

export default IconCard;
