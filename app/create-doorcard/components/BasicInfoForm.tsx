"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDoorcardStore } from "@/store/use-doorcard-store";
import { cn } from "@/lib/utils";
import type React from "react";
import { useEffect } from "react";
import { COLLEGES } from "@/types/doorcard";

interface BasicInfoFormProps {
  sessionName?: string | null | undefined;
}

const BasicInfoForm: React.FC<BasicInfoFormProps> = ({ sessionName }) => {
  const {
    name,
    doorcardName,
    officeNumber,
    term,
    year,
    college,
    setBasicInfo,
    errors,
  } = useDoorcardStore();

  console.log(
    "BasicInfoForm Render - Received sessionName prop:",
    sessionName,
    "Current store name:",
    name
  );

  useEffect(() => {
    console.log(
      "BasicInfoForm useEffect - Checking conditions. Store name:",
      name,
      "Prop sessionName:",
      sessionName
    );

    if (!name && sessionName) {
      console.log(
        "BasicInfoForm useEffect - Conditions met! Setting name from session:",
        sessionName
      );
      setBasicInfo({ name: sessionName });
    } else if (name && sessionName) {
      console.log(
        "BasicInfoForm useEffect - Store name already exists, not overwriting."
      );
    } else if (!name && !sessionName) {
      console.log(
        "BasicInfoForm useEffect - Store name is empty, but no session name provided yet."
      );
    } else {
      console.log("BasicInfoForm useEffect - Condition not met.");
    }
  }, [name, sessionName, setBasicInfo]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBasicInfo({ [e.target.id]: e.target.value });
  };

  return (
    <div className="space-y-4">
      {/* Selected Campus/Term Display */}
      {college && term && year && (
        <div className="p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Selected Campus & Term
              </p>
              <p className="text-lg font-semibold text-gray-900">
                {COLLEGES.find((c) => c.value === college)?.label} - {term}{" "}
                {year}
              </p>
            </div>
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={handleInputChange}
          required
          className={cn(errors?.basicInfo?.name && "border-red-500")}
        />
        {errors?.basicInfo?.name && (
          <p className="text-red-500 text-sm mt-1">{errors.basicInfo.name}</p>
        )}
      </div>

      <div>
        <Label htmlFor="doorcardName">Doorcard Name</Label>
        <Input
          id="doorcardName"
          value={doorcardName}
          onChange={handleInputChange}
          required
          className={cn(errors?.basicInfo?.doorcardName && "border-red-500")}
        />
        {errors?.basicInfo?.doorcardName && (
          <p className="text-red-500 text-sm mt-1">
            {errors.basicInfo.doorcardName}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="officeNumber">Office #</Label>
        <Input
          id="officeNumber"
          value={officeNumber}
          onChange={handleInputChange}
          required
          className={cn(errors?.basicInfo?.officeNumber && "border-red-500")}
        />
        {errors?.basicInfo?.officeNumber && (
          <p className="text-red-500 text-sm mt-1">
            {errors.basicInfo.officeNumber}
          </p>
        )}
      </div>
    </div>
  );
};

export default BasicInfoForm;
