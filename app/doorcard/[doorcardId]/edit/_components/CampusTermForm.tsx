"use client";

import { useActionState, useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { validateCampusTerm } from "@/app/doorcard/actions";
import { COLLEGES } from "@/types/doorcard";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface CampusTermFormProps {
  doorcard: {
    id: string;
    term: string;
    year: string;
    college: string;
  };
}

interface FieldErrors {
  college?: string;
  term?: string;
  year?: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Validating..." : "Continue to Basic Info"}
    </Button>
  );
}

export default function CampusTermForm({ doorcard }: CampusTermFormProps) {
  // Form state
  const [college, setCollege] = useState(
    doorcard.college && doorcard.college !== "null" ? doorcard.college : ""
  );
  const [term, setTerm] = useState(doorcard.term || "");
  const [year, setYear] = useState(doorcard.year || "");

  // Validation state
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // Server action state
  const [state, formAction] = useActionState(
    validateCampusTerm.bind(null, doorcard.id),
    {
      success: true,
    }
  );

  // Client-side validation function
  const validateField = (
    fieldName: keyof FieldErrors,
    value: string
  ): string | undefined => {
    switch (fieldName) {
      case "college":
        if (!value) return "Campus is required";
        if (!["SKYLINE", "CSM", "CANADA"].includes(value))
          return "Please select a valid campus";
        return undefined;
      case "term":
        if (!value) return "Term is required";
        if (!["Fall", "Spring", "Summer", "Winter"].includes(value))
          return "Please select a valid term";
        return undefined;
      case "year":
        if (!value) return "Year is required";
        const currentYear = new Date().getFullYear();
        const yearNum = parseInt(value);
        if (
          isNaN(yearNum) ||
          yearNum < currentYear ||
          yearNum > currentYear + 5
        ) {
          return "Please select a valid year";
        }
        return undefined;
      default:
        return undefined;
    }
  };

  // Validate all fields
  const validateAllFields = (): FieldErrors => {
    return {
      college: validateField("college", college),
      term: validateField("term", term),
      year: validateField("year", year),
    };
  };

  // Real-time validation on field change
  const handleFieldChange = (fieldName: keyof FieldErrors, value: string) => {
    // Update field value
    switch (fieldName) {
      case "college":
        setCollege(value);
        break;
      case "term":
        setTerm(value);
        break;
      case "year":
        setYear(value);
        break;
    }

    // Clear field error if now valid, or show error if attempted submit
    if (hasAttemptedSubmit || fieldErrors[fieldName]) {
      const error = validateField(fieldName, value);
      setFieldErrors((prev) => ({
        ...prev,
        [fieldName]: error,
      }));
    }
  };

  // Form submission with comprehensive validation
  const handleSubmit = (formData: FormData) => {
    setHasAttemptedSubmit(true);

    // Run client-side validation
    const errors = validateAllFields();
    const hasErrors = Object.values(errors).some((error) => error);

    if (hasErrors) {
      setFieldErrors(errors);
      return;
    }

    // Clear field errors
    setFieldErrors({});

    // Set the values in FormData to ensure they're sent
    formData.set("college", college);
    formData.set("term", term);
    formData.set("year", year);

    // Call the server action
    formAction(formData);
  };

  // Check if form is valid
  const isFormValid =
    college &&
    term &&
    year &&
    Object.values(fieldErrors).every((error) => !error);
  const hasAnyFieldErrors = Object.values(fieldErrors).some((error) => error);

  return (
    <div className="space-y-8">
      {/* Main Form */}
      <form action={handleSubmit} className="space-y-8">
        {/* Step Description */}
        <div className="flex items-start gap-3 pb-2">
          <CheckCircle2 className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-gray-900">
              Select Your Campus and Term
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Choose where and when this doorcard will be active. You can create
              one doorcard per campus per term.
            </p>
          </div>
        </div>

        {/* Overall Error Display (Server errors or form-level validation) */}
        {state && !state.success && state.message && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle
                  className="h-5 w-5 text-red-400"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Cannot Create Doorcard
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{state.message}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Client-side validation summary */}
        {hasAttemptedSubmit && hasAnyFieldErrors && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle
                  className="h-5 w-5 text-red-400"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Please correct the following errors:
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <ul className="list-disc list-inside space-y-1">
                    {fieldErrors.college && <li>{fieldErrors.college}</li>}
                    {fieldErrors.term && <li>{fieldErrors.term}</li>}
                    {fieldErrors.year && <li>{fieldErrors.year}</li>}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Label
              htmlFor="college"
              className="text-sm font-medium text-gray-900"
            >
              Campus <span className="text-red-500">*</span>
            </Label>
            <Select
              name="college"
              value={college}
              onValueChange={(value) => handleFieldChange("college", value)}
              required
            >
              <SelectTrigger
                className={`mt-1.5 ${
                  fieldErrors.college
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : ""
                }`}
              >
                <SelectValue placeholder="Select a campus" />
              </SelectTrigger>
              <SelectContent>
                {COLLEGES.map((collegeOption) => (
                  <SelectItem
                    key={collegeOption.value}
                    value={collegeOption.value}
                  >
                    {collegeOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.college && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.college}</p>
            )}
          </div>

          <div>
            <Label htmlFor="term" className="text-sm font-medium text-gray-900">
              Term <span className="text-red-500">*</span>
            </Label>
            <Select
              name="term"
              value={term}
              onValueChange={(value) => handleFieldChange("term", value)}
              required
            >
              <SelectTrigger
                className={`mt-1.5 ${
                  fieldErrors.term
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : ""
                }`}
              >
                <SelectValue placeholder="Select a term" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Fall">Fall</SelectItem>
                <SelectItem value="Spring">Spring</SelectItem>
                <SelectItem value="Summer">Summer</SelectItem>
                <SelectItem value="Winter">Winter</SelectItem>
              </SelectContent>
            </Select>
            {fieldErrors.term && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.term}</p>
            )}
          </div>

          <div>
            <Label htmlFor="year" className="text-sm font-medium text-gray-900">
              Year <span className="text-red-500">*</span>
            </Label>
            <Select
              name="year"
              value={year}
              onValueChange={(value) => handleFieldChange("year", value)}
              required
            >
              <SelectTrigger
                className={`mt-1.5 ${
                  fieldErrors.year
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : ""
                }`}
              >
                <SelectValue placeholder="Select a year" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 5 }, (_, i) => {
                  const yearValue = new Date().getFullYear() + i;
                  return (
                    <SelectItem key={yearValue} value={yearValue.toString()}>
                      {yearValue}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {fieldErrors.year && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.year}</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <SubmitButton />
        </div>
      </form>

      {/* Help Text */}
      <div className="rounded-lg bg-gray-50 border border-gray-200">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-sm font-medium text-gray-900">
            About Campus & Term Selection
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>
              To prevent confusion for students, you can only have one active
              doorcard per campus per term. If you need to make changes to an
              existing doorcard, you'll be directed to edit that one instead.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
