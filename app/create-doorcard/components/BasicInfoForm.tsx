"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDoorcardStore } from "@/store/use-doorcard-store"
import { cn } from "@/lib/utils"
import type React from "react" // Added import for React

const terms = ["Fall", "Spring", "Summer"]
const currentYear = new Date().getFullYear()
const years = Array.from({ length: 10 }, (_, i) => (currentYear + i).toString())

const BasicInfoForm: React.FC = () => {
  const { name, doorcardName, officeNumber, term, year, setBasicInfo, errors } = useDoorcardStore()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBasicInfo({ [e.target.id]: e.target.value })
  }

  const handleSelectChange = (value: string, field: string) => {
    setBasicInfo({ [field]: value })
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={handleInputChange}
          required
          className={cn(errors?.name && "border-red-500")}
        />
        {errors?.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
      </div>
      <div>
        <Label htmlFor="doorcardName">Doorcard Name</Label>
        <Input
          id="doorcardName"
          value={doorcardName}
          onChange={handleInputChange}
          required
          className={cn(errors?.doorcardName && "border-red-500")}
        />
        {errors?.doorcardName && <p className="text-red-500 text-sm mt-1">{errors.doorcardName}</p>}
      </div>
      <div>
        <Label htmlFor="officeNumber">Office #</Label>
        <Input
          id="officeNumber"
          value={officeNumber}
          onChange={handleInputChange}
          required
          className={cn(errors?.officeNumber && "border-red-500")}
        />
        {errors?.officeNumber && <p className="text-red-500 text-sm mt-1">{errors.officeNumber}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="term">Term</Label>
          <Select value={term} onValueChange={(value) => handleSelectChange(value, "term")}>
            <SelectTrigger id="term">
              <SelectValue placeholder="Select term" />
            </SelectTrigger>
            <SelectContent>
              {terms.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.term && <p className="text-red-500 text-sm mt-1">{errors.term}</p>}
        </div>
        <div>
          <Label htmlFor="year">Year</Label>
          <Select value={year} onValueChange={(value) => handleSelectChange(value, "year")}>
            <SelectTrigger id="year">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.year && <p className="text-red-500 text-sm mt-1">{errors.year}</p>}
        </div>
      </div>
    </div>
  )
}

export default BasicInfoForm

