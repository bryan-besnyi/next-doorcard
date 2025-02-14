"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useDoorcardStore } from "@/store/use-doorcard-store"
import StepIndicator from "../components/StepIndicator"
import type React from "react" // Added import for React

export default function BasicInfoPage() {
  const router = useRouter()
  const { name, doorcardName, officeNumber, term, year, setBasicInfo } = useDoorcardStore()

  console.log("Store values:", { name, doorcardName, officeNumber, term, year }) // Add this line

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push("/create-doorcard/time-blocks")
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-4xl mx-auto">
        <CardContent className="pt-6">
          <h2 className="text-2xl font-bold text-center mb-6">Create Doorcard</h2>
          <StepIndicator currentStep={0} />

          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setBasicInfo({ name: e.target.value, doorcardName, officeNumber, term, year })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="doorcardName">Doorcard Name</Label>
                <Input
                  id="doorcardName"
                  value={doorcardName}
                  onChange={(e) => setBasicInfo({ name, doorcardName: e.target.value, officeNumber, term, year })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="officeNumber">Office #</Label>
                <Input
                  id="officeNumber"
                  value={officeNumber}
                  onChange={(e) => setBasicInfo({ name, doorcardName, officeNumber: e.target.value, term, year })}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit">Next</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

