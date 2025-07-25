"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateBasicInfo } from "@/app/doorcard/actions";
import {
  AlertCircle,
  CheckCircle2,
  User,
  Building2,
  UserSquare2,
} from "lucide-react";

interface BasicInfoFormProps {
  doorcard: {
    id: string;
    name: string;
    doorcardName: string;
    officeNumber: string;
    term: string;
    year: string;
    college: string;
  };
}

interface FieldErrors {
  name?: string;
  doorcardName?: string;
  officeNumber?: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Saving..." : "Continue to Schedule"}
    </Button>
  );
}

export default function BasicInfoForm({ doorcard }: BasicInfoFormProps) {
  // Form state
  const [name, setName] = useState(doorcard.name || "");
  const [doorcardName, setDoorcardName] = useState(doorcard.doorcardName || "");
  const [officeNumber, setOfficeNumber] = useState(doorcard.officeNumber || "");

  // Validation state
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // Server action state
  const [state, formAction] = useActionState(
    updateBasicInfo.bind(null, doorcard.id),
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
      case "name":
        if (!value.trim()) return "Full name is required";
        if (value.trim().length < 2)
          return "Full name must be at least 2 characters";
        if (value.trim().length > 100)
          return "Full name must be less than 100 characters";
        return undefined;
      case "doorcardName":
        if (!value.trim()) return "Doorcard name is required";
        if (value.trim().length < 2)
          return "Doorcard name must be at least 2 characters";
        if (value.trim().length > 50)
          return "Doorcard name must be less than 50 characters";
        return undefined;
      case "officeNumber":
        if (!value.trim()) return "Office location is required";
        if (value.trim().length < 2)
          return "Office location must be at least 2 characters";
        if (value.trim().length > 100)
          return "Office location must be less than 100 characters";
        return undefined;
      default:
        return undefined;
    }
  };

  // Validate all fields
  const validateAllFields = (): FieldErrors => {
    return {
      name: validateField("name", name),
      doorcardName: validateField("doorcardName", doorcardName),
      officeNumber: validateField("officeNumber", officeNumber),
    };
  };

  // Real-time validation on field change
  const handleFieldChange = (fieldName: keyof FieldErrors, value: string) => {
    // Update field value
    switch (fieldName) {
      case "name":
        setName(value);
        break;
      case "doorcardName":
        setDoorcardName(value);
        break;
      case "officeNumber":
        setOfficeNumber(value);
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

    // Set the values in FormData to ensure they're sent with trimmed values
    formData.set("name", name.trim());
    formData.set("doorcardName", doorcardName.trim());
    formData.set("officeNumber", officeNumber.trim());

    // Call the server action
    formAction(formData);
  };

  // Check if form is valid
  const isFormValid =
    name.trim() &&
    doorcardName.trim() &&
    officeNumber.trim() &&
    Object.values(fieldErrors).every((error) => !error);
  const hasAnyFieldErrors = Object.values(fieldErrors).some((error) => error);

  return (
    <div className="space-y-8">
      {/* Step Description */}
      <div className="flex items-start gap-3 pb-2">
        <CheckCircle2 className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
        <div>
          <h3 className="font-medium text-gray-900">Enter Your Information</h3>
          <p className="text-sm text-gray-500 mt-1">
            Add your personal details that will appear on your doorcard.
          </p>
        </div>
      </div>

      {/* Selected Campus/Term Display */}
      {doorcard.college && doorcard.term && doorcard.year && (
        <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Building2 className="h-5 w-5 text-blue-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-800">
                {doorcard.college} - {doorcard.term} {doorcard.year}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Overall Error Display (Server errors) */}
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
                Cannot Save Information
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
                  {fieldErrors.name && <li>{fieldErrors.name}</li>}
                  {fieldErrors.doorcardName && (
                    <li>{fieldErrors.doorcardName}</li>
                  )}
                  {fieldErrors.officeNumber && (
                    <li>{fieldErrors.officeNumber}</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <form action={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-sm font-medium text-gray-900">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-gray-400" aria-hidden="true" />
              </div>
              <Input
                id="name"
                name="name"
                value={name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                className={`pl-10 ${
                  fieldErrors.name
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : ""
                }`}
                placeholder="Dr. Jane Smith"
              />
            </div>
            {fieldErrors.name && (
              <p className="text-sm text-red-600">{fieldErrors.name}</p>
            )}
            <p className="text-sm text-gray-500">
              Your full name as you&apos;d like it to appear
            </p>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="doorcardName"
              className="text-sm font-medium text-gray-900"
            >
              Doorcard Name <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserSquare2
                  className="h-4 w-4 text-gray-400"
                  aria-hidden="true"
                />
              </div>
              <Input
                id="doorcardName"
                name="doorcardName"
                value={doorcardName}
                onChange={(e) =>
                  handleFieldChange("doorcardName", e.target.value)
                }
                className={`pl-10 ${
                  fieldErrors.doorcardName
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : ""
                }`}
                placeholder="Prof. Smith"
              />
            </div>
            {fieldErrors.doorcardName && (
              <p className="text-sm text-red-600">{fieldErrors.doorcardName}</p>
            )}
            <p className="text-sm text-gray-500">
              How students should address you
            </p>
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <Label
              htmlFor="officeNumber"
              className="text-sm font-medium text-gray-900"
            >
              Office Location <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building2
                  className="h-4 w-4 text-gray-400"
                  aria-hidden="true"
                />
              </div>
              <Input
                id="officeNumber"
                name="officeNumber"
                value={officeNumber}
                onChange={(e) =>
                  handleFieldChange("officeNumber", e.target.value)
                }
                className={`pl-10 ${
                  fieldErrors.officeNumber
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : ""
                }`}
                placeholder="Building 1, Room 123"
              />
            </div>
            {fieldErrors.officeNumber && (
              <p className="text-sm text-red-600">{fieldErrors.officeNumber}</p>
            )}
            <p className="text-sm text-gray-500">
              Your office location including building and room number
            </p>
          </div>
        </div>

        <div className="pt-6">
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}
