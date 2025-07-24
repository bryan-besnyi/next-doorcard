import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CampusTermForm from "./_components/CampusTermForm";
import BasicInfoForm from "./_components/BasicInfoForm";
import TimeBlockForm from "./_components/TimeBlockForm";
import UnifiedDoorcard from "@/components/UnifiedDoorcard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { publishDoorcard } from "@/app/doorcard/actions";

interface PageProps {
  params: Promise<{ doorcardId: string }>;
  searchParams: Promise<{ step?: string }>;
}

export default async function EditDoorcardPage({
  params,
  searchParams,
}: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    redirect("/login");
  }

  const { doorcardId } = await params;
  const { step = "0" } = await searchParams;
  const currentStep = parseInt(step);

  // Fetch the doorcard data
  const doorcard = await prisma.doorcard.findFirst({
    where: {
      id: doorcardId,
      userId: user.id, // Security: ensure user owns this doorcard
    },
    include: {
      appointments: {
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      },
    },
  });

  if (!doorcard) {
    notFound();
  }

  // Convert appointments to timeBlocks format for consistency with old system
  const timeBlocks = doorcard.appointments.map((apt) => ({
    id: apt.id,
    day: apt.dayOfWeek,
    startTime: apt.startTime,
    endTime: apt.endTime,
    activity: apt.name,
    location: apt.location || undefined,
    category: apt.category,
  }));

  const doorcardWithTimeBlocks = {
    id: doorcard.id,
    name: doorcard.name,
    doorcardName: doorcard.doorcardName,
    officeNumber: doorcard.officeNumber,
    term: doorcard.term,
    year: doorcard.year,
    college: doorcard.college || "",
    timeBlocks,
  };

  // For UnifiedDoorcard, we need to include appointments
  const doorcardForPreview = {
    ...doorcardWithTimeBlocks,
    appointments: doorcard.appointments.map((apt) => ({
      id: apt.id,
      name: apt.name,
      startTime: apt.startTime,
      endTime: apt.endTime,
      dayOfWeek: apt.dayOfWeek,
      category: apt.category,
      location: apt.location || undefined,
    })),
  };

  // Log raw data for debugging
  console.log("Raw doorcard data:", JSON.stringify(doorcard, null, 2));
  console.log("Data passed to UnifiedDoorcard:", doorcardForPreview);

  // Determine step titles and descriptions
  const getStepInfo = (stepNum: number) => {
    switch (stepNum) {
      case 0:
        return { title: "Campus & Term", desc: "Select your campus and term" };
      case 1:
        return { title: "Basic Info", desc: "Your personal information" };
      case 2:
        return { title: "Schedule", desc: "Add your time blocks" };
      case 3:
        return { title: "Preview", desc: "Review and publish" };
      default:
        return { title: "Unknown", desc: "" };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            {doorcard.name
              ? `Edit ${doorcard.name}'s Doorcard`
              : "Create New Doorcard"}
          </h1>

          {/* Step Indicator */}
          <div className="flex items-center mt-4 space-x-4">
            {[0, 1, 2, 3].map((stepNum) => (
              <div
                key={stepNum}
                className={`flex items-center ${stepNum < 3 ? "flex-1" : ""}`}
              >
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium ${
                    currentStep >= stepNum
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {stepNum}
                </div>
                <div className="ml-3 text-sm">
                  <div className="font-medium text-gray-900">
                    {getStepInfo(stepNum).title}
                  </div>
                  <div className="text-gray-500 text-xs">
                    {getStepInfo(stepNum).desc}
                  </div>
                </div>
                {stepNum < 3 && (
                  <div
                    className={`flex-1 h-1 ml-4 ${
                      currentStep > stepNum ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle>{getStepInfo(currentStep).title}</CardTitle>
          </CardHeader>
          <CardContent>
            {currentStep === 0 && (
              <CampusTermForm doorcard={doorcardWithTimeBlocks} />
            )}
            {currentStep === 1 && (
              <BasicInfoForm doorcard={doorcardWithTimeBlocks} />
            )}
            {currentStep === 2 && (
              <TimeBlockForm doorcard={doorcardWithTimeBlocks} />
            )}
            {currentStep === 3 && (
              <div className="space-y-8">
                {/* Preview */}
                <div className="border rounded-lg overflow-hidden bg-white">
                  <UnifiedDoorcard
                    mode="preview"
                    data={doorcardForPreview}
                    showControls={false}
                  />
                </div>

                {/* Publish Section */}
                <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                    Ready to Publish
                  </h3>
                  <p className="text-green-700 mb-4">
                    Your doorcard is complete and ready to be published. Once
                    published, it will be visible to students and colleagues.
                  </p>
                  <div className="flex gap-4">
                    <Button variant="outline" asChild>
                      <Link href={`/doorcard/${doorcardId}/edit?step=2`}>
                        Back to Schedule
                      </Link>
                    </Button>
                    <form action={publishDoorcard.bind(null, doorcardId)}>
                      <Button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Publish Doorcard
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
