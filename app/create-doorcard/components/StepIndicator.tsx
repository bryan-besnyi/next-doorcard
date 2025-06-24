const steps = [
  { number: 1, label: "Campus & Term", path: "/create-doorcard/campus-term" },
  { number: 2, label: "Basic Info", path: "/create-doorcard/basic-info" },
  { number: 3, label: "Time Blocks", path: "/create-doorcard/time-blocks" },
  { number: 4, label: "Preview", path: "/create-doorcard/preview" },
  { number: 5, label: "Print & Export", path: "/create-doorcard/print" },
];

export default function StepIndicator({
  currentStep,
}: {
  currentStep: number;
}) {
  return (
    <div className="mb-8 relative">
      <div className="flex justify-between items-center">
        {steps.map((step, index) => (
          <div key={step.label} className="flex-1 text-center">
            <div className="relative">
              <div
                className={`w-8 h-8 mx-auto rounded-full border-2 flex items-center justify-center
                  ${
                    index <= currentStep
                      ? "border-black bg-black text-white"
                      : "border-gray-300 bg-white text-gray-300"
                  }`}
              >
                {step.number}
              </div>
              <div
                className={`mt-2 text-sm ${
                  index <= currentStep ? "text-black" : "text-gray-300"
                }`}
              >
                {step.label}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`absolute top-4 left-1/2 w-full h-[2px] -z-10
                    ${index < currentStep ? "bg-black" : "bg-gray-300"}`}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
