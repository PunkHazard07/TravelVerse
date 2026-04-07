import React from "react";

const Title = ({ title, subtitle }) => {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-1">{title}</h2>
      <p className="text-base text-gray-600">{subtitle}</p>
    </div>
  );
};

export default Title;
