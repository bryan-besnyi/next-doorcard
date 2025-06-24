"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import CampusTermSelector from "./components/CampusTermSelector";
import BasicInfoForm from "./components/BasicInfoForm";
import TimeBlockForm from "./components/TimeBlockForm";
import PreviewDoorcard from "./components/PreviewDoorcard";
import PrintExportDoorcard from "./components/PrintExportDoorcard";
import { useDoorcardStore } from "@/store/use-doorcard-store";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import { Save } from "lucide-react";
import StepIndicator from "./components/StepIndicator";
import { Spinner } from "@/components/ui/spinner";
import AutoSaveIndicator from "@/components/AutoSaveIndicator";

const steps = [
  { number: 1, label: "Campus & Term" },
  { number: 2, label: "Basic Info" },
  { number: 3, label: "Time Blocks" },
  { number: 4, label: "Preview" },
  { number: 5, label: "Print & Export" },
];

export default function CreateDoorcardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { data: session } = useSession();
  const [pageLoading, setPageLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const {
    name,
    doorcardName,
    officeNumber,
    term,
    year,
    college,
    timeBlocks,
    currentStep,
    setCurrentStep,
    validateCurrentStep,
    reset,
    errors,
    loadDraft,
    loadDoorcard,
    saveEntireState,
    saveAndReturnToDashboard,
    setStepViewed,
    draftId,
    setMode,
    isLoading,
  } = useDoorcardStore();

  useEffect(() => {
    const initializePage = async () => {
      const doorcardId = searchParams.get("id");
      const draftId = searchParams.get("draft");

      if (doorcardId) {
        try {
          setMode("edit", doorcardId);
          await loadDoorcard(doorcardId);

          // Check if a specific step was requested
          const stepParam = searchParams.get("step");
          const requestedStep = stepParam ? parseInt(stepParam, 10) : 1;
          const validStep = Math.max(
            0,
            Math.min(requestedStep, steps.length - 1)
          );
          setCurrentStep(validStep); // Start at requested step or Step 1 for editing

          toast({
            title: "Success",
            description: "Doorcard loaded successfully.",
          });
        } catch (error) {
          console.error("Error loading doorcard:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load doorcard. Please try again.",
          });
          router.push("/dashboard");
        }
      } else if (draftId) {
        try {
          setMode("create");
          await loadDraft(draftId);
          toast({
            title: "Draft Loaded",
            description: "Your draft has been successfully loaded.",
          });
        } catch (error) {
          console.error("Error loading draft:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load draft. Please try again.",
          });
        }
      } else {
        setMode("create");
        reset();
        setCurrentStep(0); // Ensure we start at the first step for new doorcards
      }
      setPageLoading(false);
    };

    initializePage();
  }, [
    searchParams,
    loadDraft,
    loadDoorcard,
    reset,
    setCurrentStep,
    toast,
    router,
    setMode,
  ]);

  useEffect(() => {
    if (!session) {
      router.push("/login");
    }
  }, [session, router]);

  const handleNext = async () => {
    setIsValidating(true);
    try {
      const isValid = await validateCurrentStep();
      if (isValid) {
        try {
          await saveEntireState();
          setCurrentStep(Math.min(currentStep + 1, steps.length - 1));
        } catch (error) {
          console.error("Error saving draft:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to save draft. Please try again.",
          });
        }
      } else {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description:
            errors.general?.[0] ||
            "Please fill in all required fields correctly.",
        });
      }
    } finally {
      setIsValidating(false);
    }
  };

  const handlePrev = () => {
    setCurrentStep(Math.max(currentStep - 1, 0));
  };

  const handleSubmit = async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description:
          errors.general?.[0] ||
          "Please fill in all required fields correctly.",
      });
      return;
    }

    const { setLoading } = useDoorcardStore.getState();
    setLoading("submitting", true);

    try {
      const endpoint = searchParams.get("id")
        ? `/api/doorcards/${searchParams.get("id")}`
        : "/api/doorcards";
      const method = searchParams.get("id") ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          doorcardName,
          officeNumber,
          term,
          year,
          college,
          timeBlocks,
        }),
      });

      if (!response.ok) {
        let errorMessage = `Failed to ${
          searchParams.get("id") ? "update" : "create"
        } doorcard`;

        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          // Response doesn't contain valid JSON, use status text or default message
          errorMessage = response.statusText || errorMessage;
        }

        throw new Error(errorMessage);
      }

      if (draftId) {
        setLoading("deleting", true);
        const deleteResponse = await fetch(
          `/api/doorcards/draft?id=${draftId}`,
          {
            method: "DELETE",
          }
        );

        if (!deleteResponse.ok) {
          console.error("Failed to delete draft, but doorcard was created");
        }
        setLoading("deleting", false);
      }

      toast({
        title: "Success",
        description: `Doorcard ${
          searchParams.get("id") ? "updated" : "created"
        } successfully!`,
      });

      reset();
      router.push("/dashboard");
    } catch (error) {
      console.error("Error creating/updating doorcard:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to save doorcard. Please try again.",
      });
    } finally {
      setLoading("submitting", false);
      setLoading("deleting", false);
    }
  };

  const handleSaveAndReturn = async () => {
    try {
      await saveAndReturnToDashboard();
      toast({
        title: "Draft Saved",
        description: "Your progress has been saved. Redirecting to dashboard.",
      });
      router.replace("/dashboard");
    } catch (error) {
      console.error("Error saving draft:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save draft. Please try again.",
      });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <CampusTermSelector />;
      case 1:
        return <BasicInfoForm sessionName={session?.user?.name} />;
      case 2:
        return <TimeBlockForm />;
      case 3:
        return <PreviewDoorcard />;
      case 4:
        return (
          <PrintExportDoorcard
            data={{ name, doorcardName, officeNumber, timeBlocks }}
          />
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    if (currentStep === 3) {
      setStepViewed("preview");
    } else if (currentStep === 4) {
      setStepViewed("print");
    }
  }, [currentStep, setStepViewed]);

  if (pageLoading || isLoading.loadingDoorcard || isLoading.loadingDraft) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-4xl mx-auto">
        <CardContent className="pt-6">
          <h2 className="text-2xl font-bold text-center mb-6">
            {searchParams.get("id")
              ? "Edit Doorcard"
              : searchParams.get("draft")
              ? "Resume Doorcard"
              : "Create Doorcard"}
          </h2>

          <div className="flex justify-between items-center mb-6">
            <div className="flex-1">
              <StepIndicator currentStep={currentStep} />
            </div>
            <AutoSaveIndicator />
          </div>

          {renderStep()}

          <div className="mt-8 flex justify-between items-center">
            <Button
              onClick={handlePrev}
              variant="outline"
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            <Button
              onClick={handleSaveAndReturn}
              variant="secondary"
              className="flex items-center gap-2"
              disabled={isLoading.savingDraft}
            >
              <Save size={16} />
              {isLoading.savingDraft
                ? "Saving..."
                : "Save and Return to Dashboard"}
            </Button>
            <Button
              onClick={
                currentStep === steps.length - 1 ? handleSubmit : handleNext
              }
              variant="default"
              disabled={
                isLoading.savingDraft || isLoading.submitting || isValidating
              }
            >
              {isLoading.savingDraft || isLoading.submitting || isValidating
                ? "Loading..."
                : currentStep === steps.length - 1
                ? searchParams.get("id")
                  ? "Update Doorcard"
                  : "Create Doorcard"
                : "Next"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
