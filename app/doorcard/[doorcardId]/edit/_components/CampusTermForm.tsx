"use client";

import { useState } from "react";
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

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Validating..." : "Continue to Basic Info"}
    </Button>
  );
}

export default function CampusTermForm({ doorcard }: CampusTermFormProps) {
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    try {
      setError(null);
      await validateCampusTerm(doorcard.id, formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const clearError = () => setError(null);

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

        {/* Error Display */}
        {error && (
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
                  <p>{error}</p>
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
              Campus
            </Label>
            <Select
              name="college"
              defaultValue={doorcard.college}
              required
              onValueChange={clearError}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select a campus" />
              </SelectTrigger>
              <SelectContent>
                {COLLEGES.map((college) => (
                  <SelectItem key={college.value} value={college.value}>
                    {college.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="term" className="text-sm font-medium text-gray-900">
              Term
            </Label>
            <Select
              name="term"
              defaultValue={doorcard.term}
              required
              onValueChange={clearError}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select a term" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Fall">Fall</SelectItem>
                <SelectItem value="Spring">Spring</SelectItem>
                <SelectItem value="Summer">Summer</SelectItem>
                <SelectItem value="Winter">Winter</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="year" className="text-sm font-medium text-gray-900">
              Year
            </Label>
            <Select
              name="year"
              defaultValue={doorcard.year}
              required
              onValueChange={clearError}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select a year" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() + i;
                  return (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
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
