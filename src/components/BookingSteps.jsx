import { Check } from "lucide-react";

const steps = ["Search", "Select", "Book", "Confirm"];

const BookingSteps = ({ currentStep = 0, variant = "inline" }) => {
  const isBar = variant === "bar";

  const StepList = () => (
    <div className="flex items-center gap-2 text-sm">
      {steps.map((step, i) => {
        const isCompleted = i < currentStep;
        const isCurrent = i === currentStep;

        return (
          <div key={step} className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 font-medium transition-colors ${
                isCurrent
                  ? "text-blue-600"
                  : isCompleted
                  ? isBar ? "text-blue-400" : "text-gray-400"
                  : isBar ? "text-gray-400" : "text-gray-300"
              }`}
            >
              <div
                className={`flex items-center justify-center rounded-full text-xs font-bold transition-all ${
                  isBar ? "w-7 h-7" : "w-6 h-6"
                } ${
                  isCompleted
                    ? "bg-blue-600 text-white"
                    : isCurrent
                    ? "bg-blue-600 text-white"
                    : isBar
                    ? "bg-gray-200 text-gray-400"
                    : "bg-gray-100 text-gray-300"
                }`}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className={isBar ? "text-sm font-semibold" : ""}>{step}</span>
            </div>

            {i < steps.length - 1 && (
              <div
                className={`h-px transition-colors ${
                  isBar ? "w-12" : "w-8"
                } ${i < currentStep ? "bg-blue-400" : "bg-gray-200"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );

  // Bar variant — full-width white banner, visible on all screen sizes
  if (isBar) {
    return (
      <div className="w-full bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-center">
          <StepList />
        </div>
      </div>
    );
  }

  // Inline variant — used inside existing headers, hidden on mobile
  return (
    <div className="hidden md:flex items-center gap-2 text-sm">
      <StepList />
    </div>
  );
};

export default BookingSteps;
