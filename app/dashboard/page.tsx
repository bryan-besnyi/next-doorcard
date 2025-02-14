"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Printer, Edit, Plus } from "lucide-react"
import ResumeDoorcard from "./components/ResumeDoorcard"
import { useToast } from "@/hooks/use-toast"

interface Doorcard {
  id: string
  name: string
  doorcardName: string
  officeNumber: string
  term: string
  year: string
  timeBlocks: Array<{
    id: string
    day: string
    startTime: string
    endTime: string
    activity: string
  }>
}

interface DraftDoorcard {
  id: string
  name: string
  lastUpdated: string
  completionPercentage: number
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [doorcards, setDoorcards] = useState<Doorcard[]>([])
  const [draftDoorcards, setDraftDoorcards] = useState<DraftDoorcard[]>([])
  const { toast } = useToast()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (status !== "authenticated") return

    const fetchDrafts = async () => {
      try {
        const response = await fetch("/api/doorcards/draft")
        if (!response.ok) {
          throw new Error(`Failed to fetch drafts: ${response.statusText}`)
        }
        const data = await response.json()
        setDraftDoorcards(
          data.map((draft: any) => ({
            id: draft.id,
            name: draft.data.doorcardName || "Untitled Draft",
            lastUpdated: draft.lastUpdated,
            completionPercentage: calculateCompletionPercentage(draft.data),
          })),
        )
      } catch (error) {
        console.error("Error fetching drafts:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load drafts. Please try again.",
        })
      }
    }

    const fetchDoorcards = async () => {
      try {
        const response = await fetch("/api/doorcards")
        if (!response.ok) {
          throw new Error(`Failed to fetch doorcards: ${response.statusText}`)
        }
        const data = await response.json()
        setDoorcards(data)
      } catch (error) {
        console.error("Error fetching doorcards:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load doorcards. Please try again.",
        })
      }
    }

    fetchDrafts()
    fetchDoorcards()
  }, [status, toast])

  const handleDeleteDraft = async (draftId: string) => {
    try {
      const response = await fetch(`/api/doorcards/draft?id=${draftId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete draft")
      }

      setDraftDoorcards(draftDoorcards.filter((draft) => draft.id !== draftId))

      toast({
        title: "Success",
        description: "Draft deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting draft:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete draft. Please try again.",
      })
    }
  }

  const handleDeleteAllDrafts = async () => {
    try {
      const response = await fetch("/api/doorcards/draft?all=true", {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete all drafts")
      }

      setDraftDoorcards([])

      toast({
        title: "Success",
        description: "All drafts deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting all drafts:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete all drafts. Please try again.",
      })
    }
  }

  const handlePrint = (doorcard: Doorcard) => {
    router.push(`/create-doorcard/print?id=${doorcard.id}&print=true`)
  }

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (status === "unauthenticated") {
    return null
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold mb-4">Your Doorcards</h2>

        {doorcards.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {doorcards.map((doorcard) => (
              <Card key={doorcard.id} className="flex flex-col">
                <CardContent className="flex-grow p-6">
                  <h3 className="text-lg font-medium mb-2">{doorcard.doorcardName}</h3>
                  <p className="text-sm text-gray-500 mb-1">{doorcard.name}</p>
                  <p className="text-sm text-gray-500 mb-1">{doorcard.officeNumber}</p>
                  <p className="text-sm text-gray-500">
                    {doorcard.term} {doorcard.year}
                  </p>
                </CardContent>
                <CardFooter className="bg-gray-50 p-4">
                  <div className="flex items-center justify-end space-x-2 w-full">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/create-doorcard?id=${doorcard.id}`}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handlePrint(doorcard)}>
                      <Printer className="h-4 w-4 mr-1" />
                      Print
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">You haven't created any doorcards yet.</p>
        )}

        {draftDoorcards.length > 0 && (
          <>
            <div className="flex justify-between items-center mb-4 mt-8">
              <h2 className="text-xl font-semibold">Resume Work</h2>
              <Button variant="destructive" size="sm" onClick={handleDeleteAllDrafts}>
                Delete All Drafts
              </Button>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {draftDoorcards.map((draft) => (
                <ResumeDoorcard key={draft.id} draft={draft} onDelete={handleDeleteDraft} />
              ))}
            </div>
          </>
        )}

        <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
          <Link href="/create-doorcard">
            <Plus className="h-4 w-4 mr-2" />
            Create New Doorcard
          </Link>
        </Button>
      </div>
    </div>
  )
}

function calculateCompletionPercentage(data: any): number {
  let totalPoints = 0
  let earnedPoints = 0

  const basicInfoFields = {
    name: 8,
    doorcardName: 8,
    officeNumber: 8,
    term: 8,
    year: 8,
  }

  Object.entries(basicInfoFields).forEach(([field, points]) => {
    totalPoints += points
    if (data[field]) earnedPoints += points
  })

  const timeBlockPoints = 40
  totalPoints += timeBlockPoints

  if (data.timeBlocks?.length > 0) {
    const blockCount = Math.min(data.timeBlocks.length, 5)
    earnedPoints += timeBlockPoints * (blockCount / 5)

    const completeBlocks = data.timeBlocks.filter(
      (block: any) => block.day && block.startTime && block.endTime && block.activity,
    ).length

    if (completeBlocks === data.timeBlocks.length && completeBlocks > 0) {
      earnedPoints += 5
    }
  }

  const previewPoints = 20
  totalPoints += previewPoints
  if (data.hasViewedPreview) earnedPoints += previewPoints / 2
  if (data.hasViewedPrint) earnedPoints += previewPoints / 2

  return Math.round((earnedPoints / totalPoints) * 100)
}

