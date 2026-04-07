import { useState } from "react";
import { Plane } from "lucide-react";

const SIZES = {
  sm: { wrapper: "w-8 h-8",  img: "w-6 h-6",  icon: "w-4 h-4" },
  md: { wrapper: "w-10 h-10", img: "w-8 h-8",  icon: "w-5 h-5" },
  lg: { wrapper: "w-14 h-14", img: "w-11 h-11", icon: "w-6 h-6" },
};

const AirlineLogo = ({ carrierCode, size = "md", className = "" }) => {
  const [failed, setFailed] = useState(false);
  const s = SIZES[size] ?? SIZES.md;

  const showFallback = !carrierCode || failed;

  return (
    <div
      className={`${s.wrapper} bg-blue-50 rounded-full flex items-center justify-center shrink-0 overflow-hidden ${className}`}
    >
      {showFallback ? (
        <Plane className={`${s.icon} text-blue-600`} />
      ) : (
        <img
          src={`https://images.kiwi.com/airlines/64/${carrierCode.toUpperCase()}.png`}
          alt={`${carrierCode} logo`}
          className={`${s.img} object-contain`}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
};

export default AirlineLogo;