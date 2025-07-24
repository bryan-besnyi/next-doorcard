"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDoorcardStore } from "@/store/use-doorcard-store";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { COLLEGES } from "@/types/doorcard";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { Term } from "@/types/components/forms";

const CampusTermSelector = () => {
  const router = useRouter();
  const {
    term,
    year,
    college,
    setBasicInfo,
    errors,
    mode,
    validateDuplicateDoorcards,
  } = useDoorcardStore();

  const [upcomingTerms, setUpcomingTerms] = useState<Term[]>([]);
  const [loadingTerms, setLoadingTerms] = useState(true);

  const [validationState, setValidationState] = useState<{
    isChecking: boolean;
    result?: {
      isDuplicate: boolean;
      message: string;
      existingDoorcardId?: string;
      isError?: boolean;
    };
  }>({ isChecking: false });

  // Fetch upcoming terms
  useEffect(() => {
    const fetchUpcomingTerms = async () => {
      try {
        setLoadingTerms(true);
        const response = await fetch("/api/terms/upcoming");
        if (response.ok) {
          const terms = await response.json();
          setUpcomingTerms(terms);
        } else {
          console.error("Failed to fetch upcoming terms");
          // Fallback to current year + next year
          const currentYear = new Date().getFullYear();
          const fallbackTerms = [
            {
              id: "fall-current",
              name: "Fall",
              year: currentYear.toString(),
              season: "Fall",
            },
            {
              id: "spring-next",
              name: "Spring",
              year: (currentYear + 1).toString(),
              season: "Spring",
            },
            {
              id: "summer-next",
              name: "Summer",
              year: (currentYear + 1).toString(),
              season: "Summer",
            },
            {
              id: "fall-next",
              name: "Fall",
              year: (currentYear + 1).toString(),
              season: "Fall",
            },
          ];
          setUpcomingTerms(fallbackTerms);
        }
      } catch (error) {
        console.error("Error fetching upcoming terms:", error);
        // Fallback to current year + next year
        const currentYear = new Date().getFullYear();
        const fallbackTerms = [
          {
            id: "fall-current",
            name: "Fall",
            year: currentYear.toString(),
            season: "Fall",
          },
          {
            id: "spring-next",
            name: "Spring",
            year: (currentYear + 1).toString(),
            season: "Spring",
          },
          {
            id: "summer-next",
            name: "Summer",
            year: (currentYear + 1).toString(),
            season: "Summer",
          },
          {
            id: "fall-next",
            name: "Fall",
            year: (currentYear + 1).toString(),
            season: "Fall",
          },
        ];
        setUpcomingTerms(fallbackTerms);
      } finally {
        setLoadingTerms(false);
      }
    };

    fetchUpcomingTerms();
  }, []);

  // Check for duplicates when campus/term/year changes
  useEffect(() => {
    const checkDuplicates = async () => {
      if (college && term && year && mode === "create") {
        setValidationState({ isChecking: true });
        try {
          const result = await validateDuplicateDoorcards();
          setValidationState({
            isChecking: false,
            result: {
              isDuplicate: result.isDuplicate,
              message: result.message,
              existingDoorcardId: result.existingDoorcardId,
            },
          });
        } catch (error) {
          console.error("Error validating duplicate doorcards:", error);
          setValidationState({
            isChecking: false,
            result: {
              isDuplicate: false,
              message:
                "Unable to check for existing doorcards. Please try again or contact support if this continues.",
              isError: true, // Add error flag
            },
          });
        }
      } else {
        setValidationState({ isChecking: false });
      }
    };

    // Add a small delay to avoid too many API calls while user is selecting
    const timeoutId = setTimeout(checkDuplicates, 300);
    return () => clearTimeout(timeoutId);
  }, [college, term, year, mode, validateDuplicateDoorcards]);

  const handleSelectChange = (value: string, field: string) => {
    console.log(`[DEBUG] handleSelectChange: field=${field}, value=${value}`);
    setBasicInfo({ [field]: value });
  };

  const handleEditExisting = () => {
    if (validationState.result?.existingDoorcardId) {
      // Take them to Step 1 (Basic Info) since Campus/Term is already set
      router.push(
        `/create-doorcard?id=${validationState.result.existingDoorcardId}&step=1`
      );
    }
  };

  const isComplete = college && term && year;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle>Select Campus and Term</CardTitle>
        <CardDescription>
          Choose the campus and upcoming term for your new doorcard. We&apos;ll
          check for existing doorcards to avoid duplicates.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Campus Selection */}
        <div>
          <Label htmlFor="college" className="text-base font-medium">
            Campus
          </Label>
          <Select
            value={college}
            onValueChange={(value) => handleSelectChange(value, "college")}
          >
            <SelectTrigger id="college" className="h-12">
              <SelectValue placeholder="Select your campus" />
            </SelectTrigger>
            <SelectContent>
              {COLLEGES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.basicInfo?.college && (
            <p className="text-red-500 text-sm mt-2">
              {errors.basicInfo.college}
            </p>
          )}
        </div>

        {/* Term Selection */}
        <div>
          <Label htmlFor="term" className="text-base font-medium">
            Term
          </Label>
          <Select
            value={term && year ? `${term} ${year}` : ""}
            onValueChange={(value) => {
              const [selectedTerm, selectedYear] = value.split(" ");
              setBasicInfo({ term: selectedTerm, year: selectedYear });
            }}
            disabled={loadingTerms}
          >
            <SelectTrigger id="term" className="h-12">
              <SelectValue
                placeholder={
                  loadingTerms ? "Loading terms..." : "Select upcoming term"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {upcomingTerms.map((t) => (
                <SelectItem key={t.id} value={`${t.season} ${t.year}`}>
                  {t.season} {t.year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.basicInfo?.term && (
            <p className="text-red-500 text-sm mt-2">{errors.basicInfo.term}</p>
          )}
          {errors?.basicInfo?.year && (
            <p className="text-red-500 text-sm mt-2">{errors.basicInfo.year}</p>
          )}
        </div>

        {/* Validation Status */}
        {isComplete && (
          <div className="space-y-3">
            {validationState.isChecking && (
              <div className="p-4 rounded-lg border bg-blue-50 border-blue-200 text-blue-800 flex items-center gap-3">
                <Clock className="h-5 w-5 animate-spin" />
                <p className="font-medium text-sm">
                  Checking for existing doorcards...
                </p>
              </div>
            )}

            {!validationState.isChecking && validationState.result && (
              <>
                {/* Show duplicate warning */}
                {validationState.result.isDuplicate && (
                  <div className="p-4 rounded-lg border bg-blue-50 border-blue-200 text-blue-800">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0 text-blue-600" />
                      <div className="flex-1">
                        <p className="font-medium text-sm mb-2">
                          {validationState.result.message}
                        </p>
                        <p className="text-blue-700 text-sm mb-3">
                          You can edit your existing doorcard to update the
                          details or time blocks.
                        </p>
                        {validationState.result.existingDoorcardId && (
                          <button
                            onClick={handleEditExisting}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
                          >
                            Edit Existing Doorcard
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Show error message */}
                {validationState.result.isError && (
                  <div className="p-4 rounded-lg border bg-red-50 border-red-200 text-red-800">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0 text-red-600" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {validationState.result.message}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Show success message only if no errors/duplicates */}
                {!validationState.result.isDuplicate &&
                  !validationState.result.isError && (
                    <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                        <div>
                          <p className="text-green-800 font-medium text-sm mb-1">
                            Perfect! Ready to create your doorcard
                          </p>
                          <p className="text-green-700 text-sm">
                            <span className="font-semibold">
                              {COLLEGES.find((c) => c.value === college)?.label}{" "}
                              - {term} {year}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CampusTermSelector;
