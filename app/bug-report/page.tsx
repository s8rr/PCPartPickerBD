"use client"

import type React from "react"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { submitBugReport } from "@/app/actions/submit-bug-report"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bug, Send } from "lucide-react"

export default function BugReportPage() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [bugType, setBugType] = useState("")
  const [description, setDescription] = useState("")
  const [stepsToReproduce, setStepsToReproduce] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const result = await submitBugReport({
        name,
        email,
        bugType,
        description,
        stepsToReproduce,
      })

      if (result.success) {
        toast({
          title: "Bug report submitted!",
          description: "Thank you for helping us improve. We'll look into this issue.",
        })
        // Reset form
        setName("")
        setEmail("")
        setBugType("")
        setDescription("")
        setStepsToReproduce("")
      } else {
        throw new Error(result.error || "Failed to submit bug report")
      }
    } catch (error) {
      toast({
        title: "Submission failed",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex-1">
      <div className="container max-w-3xl py-12">
        <Card className="border-2 border-destructive/10">
          <CardHeader className="bg-destructive/5 rounded-t-lg">
            <div className="flex items-center gap-2">
              <Bug className="h-6 w-6 text-destructive" />
              <CardTitle className="text-2xl">Report a Bug</CardTitle>
            </div>
            <CardDescription>
              Found something that's not working correctly? Let us know so we can fix it!
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bugType">Bug Type</Label>
                <Select value={bugType} onValueChange={setBugType} required>
                  <SelectTrigger id="bugType">
                    <SelectValue placeholder="Select bug type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ui">UI/Display Issue</SelectItem>
                    <SelectItem value="functionality">Functionality Not Working</SelectItem>
                    <SelectItem value="performance">Performance Issue</SelectItem>
                    <SelectItem value="data">Incorrect Data</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Bug Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what's happening..."
                  className="min-h-[100px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="steps">Steps to Reproduce</Label>
                <Textarea
                  id="steps"
                  placeholder="1. Go to page X&#10;2. Click on Y&#10;3. Observe the issue..."
                  className="min-h-[100px]"
                  value={stepsToReproduce}
                  onChange={(e) => setStepsToReproduce(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-4">
              <Button type="submit" disabled={isSubmitting} variant="destructive" className="gap-2">
                <Send className="h-4 w-4" />
                {isSubmitting ? "Submitting..." : "Submit Bug Report"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </main>
  )
}
