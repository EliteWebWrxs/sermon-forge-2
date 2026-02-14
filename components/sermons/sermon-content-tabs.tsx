"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SermonNotesDisplayAI, DevotionalDisplayAI, DiscussionGuideDisplayAI, SocialMediaDisplayAI } from "./content-display-ai"
import { EmptyContentState } from "./content-display"
import { ExportSermonNotesDropdown } from "./export-sermon-notes-dropdown"
import { ExportDiscussionGuideDropdown } from "./export-discussion-guide-dropdown"
import type { GeneratedContent } from "@/types"

interface SermonContentTabsProps {
  sermonId: string
  sermonTitle: string
  generatedContent: GeneratedContent[]
  hasTranscript: boolean
}

export function SermonContentTabs({ sermonId, sermonTitle, generatedContent, hasTranscript }: SermonContentTabsProps) {
  const [activeTab, setActiveTab] = useState("notes")

  // Organize content by type
  const sermonNotes = generatedContent.find((c) => c.content_type === "sermon_notes")
  const devotional = generatedContent.find((c) => c.content_type === "devotional")
  const discussionGuide = generatedContent.find((c) => c.content_type === "discussion_guide")
  const socialMedia = generatedContent.find((c) => c.content_type === "social_media")

  // Keyboard shortcuts: Tab to cycle through tabs
  useEffect(() => {
    function handleKeyPress(e: KeyboardEvent) {
      // Only handle if not in an input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      // Cmd/Ctrl + 1-4 to switch tabs
      if ((e.metaKey || e.ctrlKey) && e.key >= "1" && e.key <= "4") {
        e.preventDefault()
        const tabs = ["notes", "devotional", "discussion", "social"]
        setActiveTab(tabs[parseInt(e.key) - 1])
      }
    }

    document.addEventListener("keydown", handleKeyPress)
    return () => document.removeEventListener("keydown", handleKeyPress)
  }, [])

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Generated Content</h2>
        <div className="text-xs text-slate-500">
          Tip: Use Cmd+1-4 to switch tabs
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-4 mb-6">
          <TabsTrigger value="notes" className="relative">
            Sermon Notes
            {sermonNotes && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full" />
            )}
          </TabsTrigger>
          <TabsTrigger value="devotional" className="relative">
            Devotional
            {devotional && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full" />
            )}
          </TabsTrigger>
          <TabsTrigger value="discussion" className="relative">
            Discussion
            {discussionGuide && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full" />
            )}
          </TabsTrigger>
          <TabsTrigger value="social" className="relative">
            Social Media
            {socialMedia && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full" />
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notes" className="mt-0">
          {sermonNotes ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-slate-500">
                  Generated on{" "}
                  {new Date(sermonNotes.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
                <ExportSermonNotesDropdown sermonId={sermonId} sermonTitle={sermonTitle} />
              </div>
              <SermonNotesDisplayAI content={sermonNotes.content as any} />
            </div>
          ) : (
            <EmptyContentState contentType="Sermon Notes" />
          )}
        </TabsContent>

        <TabsContent value="devotional" className="mt-0">
          {devotional ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-slate-500">
                  Generated on{" "}
                  {new Date(devotional.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <DevotionalDisplayAI content={devotional.content as any} />
            </div>
          ) : (
            <EmptyContentState contentType="Devotional" />
          )}
        </TabsContent>

        <TabsContent value="discussion" className="mt-0">
          {discussionGuide ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-slate-500">
                  Generated on{" "}
                  {new Date(discussionGuide.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
                <ExportDiscussionGuideDropdown sermonId={sermonId} sermonTitle={sermonTitle} />
              </div>
              <DiscussionGuideDisplayAI content={discussionGuide.content as any} />
            </div>
          ) : (
            <EmptyContentState contentType="Discussion Guide" />
          )}
        </TabsContent>

        <TabsContent value="social" className="mt-0">
          {socialMedia ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-slate-500">
                  Generated on{" "}
                  {new Date(socialMedia.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <SocialMediaDisplayAI content={socialMedia.content as any} />
            </div>
          ) : (
            <EmptyContentState contentType="Social Media Pack" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
