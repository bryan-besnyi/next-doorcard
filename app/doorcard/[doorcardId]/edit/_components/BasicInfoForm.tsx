"use client";

import { useState } from "react";
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

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Saving..." : "Continue to Schedule"}
    </Button>
  );
}

export default function BasicInfoForm({ doorcard }: BasicInfoFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    try {
      setError(null);
      setIsSuccess(false);

      // First set success state (will show briefly before redirect)
      setIsSuccess(true);

      // Then submit the form (which will redirect on success)
      await updateBasicInfo(doorcard.id, formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsSuccess(false);
    }
  };

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

      {/* Success Message */}
      {isSuccess && (
        <div className="rounded-lg bg-green-50 border border-green-100 px-4 py-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle2
                className="h-5 w-5 text-green-400"
                aria-hidden="true"
              />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Information Saved
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Redirecting to schedule setup...</p>
              </div>
            </div>
          </div>
        </div>
      )}

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
                Cannot Save Information
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <form action={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-sm font-medium text-gray-900">
              Full Name
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-gray-400" aria-hidden="true" />
              </div>
              <Input
                id="name"
                name="name"
                defaultValue={doorcard.name}
                required
                className="pl-10"
                placeholder="Dr. Jane Smith"
              />
            </div>
            <p className="text-sm text-gray-500">
              Your full name as you'd like it to appear
            </p>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="doorcardName"
              className="text-sm font-medium text-gray-900"
            >
              Doorcard Name
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
                defaultValue={doorcard.doorcardName}
                required
                className="pl-10"
                placeholder="Prof. Smith"
              />
            </div>
            <p className="text-sm text-gray-500">
              How students should address you
            </p>
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <Label
              htmlFor="officeNumber"
              className="text-sm font-medium text-gray-900"
            >
              Office Location
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
                defaultValue={doorcard.officeNumber}
                required
                className="pl-10"
                placeholder="Building 1, Room 123"
              />
            </div>
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
