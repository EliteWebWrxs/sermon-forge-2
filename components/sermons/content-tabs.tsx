"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  SermonNotesDisplay,
  DevotionalDisplay,
  DiscussionGuideDisplay,
  SocialMediaDisplay,
  EmptyContentState,
} from "./content-display"
import type { GeneratedContent } from "@/types"

interface ContentTabsProps {
  generatedContent: GeneratedContent[]
}

export function ContentTabs({ generatedContent }: ContentTabsProps) {
  const [activeTab, setActiveTab] = useState("notes")

  // Organize content by type
  const sermonNotes = generatedContent.find(
    (c) => c.content_type === "sermon_notes"
  )
  const devotional = generatedContent.find(
    (c) => c.content_type === "devotional"
  )
  const discussionGuide = generatedContent.find(
    (c) => c.content_type === "discussion_guide"
  )
  const socialMedia = generatedContent.find(
    (c) => c.content_type === "social_media"
  )

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">
        Generated Content
      </h2>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-4 mb-6">
          <TabsTrigger value="notes">Sermon Notes</TabsTrigger>
          <TabsTrigger value="devotional">Devotional</TabsTrigger>
          <TabsTrigger value="discussion">Discussion</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
        </TabsList>

        <TabsContent value="notes">
          {sermonNotes ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-slate-500">
                  Generated on{" "}
                  {format(
                    new Date(sermonNotes.created_at),
                    "MMM d, yyyy 'at' h:mm a"
                  )}
                </p>
                <Button size="sm" variant="secondary">
                  Export PDF
                </Button>
              </div>
              <SermonNotesDisplay content={sermonNotes.content as any} />
            </div>
          ) : (
            <EmptyContentState contentType="Sermon Notes" />
          )}
        </TabsContent>

        <TabsContent value="devotional">
          {devotional ? (
            <div>
              <p className="text-sm text-slate-500 mb-4">
                Generated on{" "}
                {format(
                  new Date(devotional.created_at),
                  "MMM d, yyyy 'at' h:mm a"
                )}
              </p>
              <DevotionalDisplay content={devotional.content as any} />
            </div>
          ) : (
            <EmptyContentState contentType="Devotional" />
          )}
        </TabsContent>

        <TabsContent value="discussion">
          {discussionGuide ? (
            <div>
              <p className="text-sm text-slate-500 mb-4">
                Generated on{" "}
                {format(
                  new Date(discussionGuide.created_at),
                  "MMM d, yyyy 'at' h:mm a"
                )}
              </p>
              <DiscussionGuideDisplay content={discussionGuide.content as any} />
            </div>
          ) : (
            <EmptyContentState contentType="Discussion Guide" />
          )}
        </TabsContent>

        <TabsContent value="social">
          {socialMedia ? (
            <div>
              <p className="text-sm text-slate-500 mb-4">
                Generated on{" "}
                {format(
                  new Date(socialMedia.created_at),
                  "MMM d, yyyy 'at' h:mm a"
                )}
              </p>
              <SocialMediaDisplay content={socialMedia.content as any} />
            </div>
          ) : (
            <EmptyContentState contentType="Social Media Pack" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
