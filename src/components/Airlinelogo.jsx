import { useState, useEffect } from "react";
import { Plane } from "lucide-react";

const SIZES = {
  sm: { wrapper: "w-8 h-8",  img: "w-6 h-6",  icon: "w-4 h-4" },
  md: { wrapper: "w-10 h-10", img: "w-8 h-8",  icon: "w-5 h-5" },
  lg: { wrapper: "w-14 h-14", img: "w-11 h-11", icon: "w-6 h-6" },
};

const AirlineLogo = ({ carrierCode, logoSymbolUrl = null, logoLockupUrl = null, size = "md", className = "" }) => {
  const [failedSymbol, setFailedSymbol] = useState(false);
  const [failedLockup, setFailedLockup] = useState(false);
  const [failedKiwi, setFailedKiwi] = useState(false);

  useEffect(() => {
    setFailedSymbol(false);
    setFailedLockup(false);
    setFailedKiwi(false);
  }, [logoSymbolUrl, logoLockupUrl, carrierCode]);

  const s = SIZES[size] ?? SIZES.md;

  let src = null;
  if (logoSymbolUrl && !failedSymbol) {
    src = logoSymbolUrl;
  } else if (logoLockupUrl && !failedLockup) {
    src = logoLockupUrl;
  } else if (carrierCode && !failedKiwi) {
    src = `https://images.kiwi.com/airlines/64/${carrierCode.toUpperCase()}.png`;
  }

  const handleError = () => {
    if (!failedSymbol && logoSymbolUrl && src === logoSymbolUrl)  { setFailedSymbol(true);  return; }
    if (!failedLockup && logoLockupUrl && src === logoLockupUrl)  { setFailedLockup(true);  return; }
    //kiwi failed 
    setFailedKiwi(true);
  };
  const showFallback = !src;

  return (
    <div
      className={`${s.wrapper} bg-blue-50 rounded-full flex items-center justify-center shrink-0 overflow-hidden ${className}`}
    >
      {showFallback ? (
        <Plane className={`${s.icon} text-blue-600`} />
      ) : (
        <img
          src={src}
          alt={`${carrierCode ?? "airline"} logo`}
          className={`${s.img} object-contain`}
          onError={handleError}
        />
      )}
    </div>
  );
};

export default AirlineLogo;