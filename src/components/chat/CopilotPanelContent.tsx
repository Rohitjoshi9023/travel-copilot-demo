"use client";

import { useEffect, useRef } from "react";
import { useCopilot } from "@yourgpt/copilot-sdk/react";
import { CopilotChat, useCopilotChatContext } from "@yourgpt/copilot-sdk/ui";
import { MapPin, Utensils, Hotel, CalendarPlus, Landmark } from "lucide-react";
import { CopilotToolsProvider } from "./CopilotToolsProvider";
import { toolRenderers } from "./toolRenderers";
import { useChatIntentStore } from "@/stores/chatIntentStore";
import { useTripsStore } from "@/stores/tripsStore";

// Import Copilot SDK base styles
// import "@yourgpt/copilot-sdk/ui/styles.css";

// Component that watches for pending intents and sends messages to AI
function ChatIntentHandler() {
  const { sendMessage } = useCopilot();
  const pendingIntent = useChatIntentStore((s) => s.pendingIntent);
  const clearIntent = useChatIntentStore((s) => s.clearIntent);
  const activeTrip = useTripsStore((s) => s.getActiveTrip());
  const processedIntentRef = useRef<number | null>(null);

  useEffect(() => {
    // Check if we have a pending intent that hasn't been processed yet
    if (pendingIntent && pendingIntent.timestamp !== processedIntentRef.current) {
      processedIntentRef.current = pendingIntent.timestamp;

      const place = pendingIntent.place;
      const tripName = activeTrip?.name || "my trip";
      const tripDays = activeTrip?.daysCount || 1;

      // Construct a helpful message for the AI
      let message = `I'd like to add "${place.name}" to ${tripName}.`;

      if (place.address) {
        message += ` It's located at ${place.address}.`;
      }

      if (tripDays > 1) {
        message += ` I have ${tripDays} days planned. Which day would be best for this visit?`;
      } else {
        message += ` Can you help me decide when to visit?`;
      }

      // Send the message to the AI using useCopilot's sendMessage
      sendMessage(message);

      // Clear the intent after a short delay to allow the message to be sent
      setTimeout(() => {
        clearIntent();
      }, 100);
    }
  }, [pendingIntent, clearIntent, sendMessage, activeTrip]);

  return null;
}

// Quick action chip component
function QuickActionChip({ icon: Icon, label, message, color = "indigo" }: { icon: React.ElementType; label: string; message: string; color?: "indigo" | "orange" | "emerald" | "purple" }) {
  const { send } = useCopilotChatContext();

  const colorClasses = {
    indigo: "bg-indigo-100 text-indigo-600",
    orange: "bg-orange-100 text-orange-600",
    emerald: "bg-emerald-100 text-emerald-600",
    purple: "bg-purple-100 text-purple-600",
  };

  return (
    <button onClick={() => send(message)} className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all text-left group">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-sm text-gray-700 group-hover:text-gray-900">{label}</span>
    </button>
  );
}

// Popular destination card
function DestinationCard({ name, country, emoji, prompt }: { name: string; country: string; emoji: string; prompt?: string }) {
  const { send } = useCopilotChatContext();

  return (
    <button onClick={() => send(prompt || `Show me ${name}`)} className="w-full flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-indigo-200 hover:shadow-sm transition-all text-left">
      <span className="text-2xl">{emoji}</span>
      <div>
        <div className="font-medium text-gray-900 text-sm">{name}</div>
        <div className="text-xs text-gray-500">{country}</div>
      </div>
    </button>
  );
}

// Travel Copilot Home Screen
function TravelHome() {
  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-indigo-50 via-white to-white">
      {/* Hero Section */}
      <div className="flex flex-col items-center pt-8 pb-6 px-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center mb-4 shadow-lg">
          <MapPin className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900">Travel Copilot</h1>
        <p className="text-sm text-gray-500 mt-1">Where would you like to explore?</p>
      </div>

      {/* Input */}
      <div className="px-4 mb-6">
        <CopilotChat.Input placeholder="Search places or ask anything..." />
      </div>

      {/* Quick Actions */}
      <div className="px-4 mb-6">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-2">
          <QuickActionChip icon={Utensils} label="Find restaurants" message="Find restaurants near me" color="orange" />
          <QuickActionChip icon={Hotel} label="Search hotels" message="Search for hotels nearby" color="indigo" />
          <QuickActionChip icon={Landmark} label="Attractions" message="Show me popular attractions" color="purple" />
          <QuickActionChip icon={CalendarPlus} label="Plan a trip" message="Help me plan a new trip" color="emerald" />
        </div>
      </div>

      {/* Popular Destinations */}
      <div className="px-4 flex-1">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Popular Destinations</h3>
        <div className="space-y-2">
          <DestinationCard name="Paris" country="France" emoji="🗼" />
          <DestinationCard name="Dubai" country="UAE" emoji="🏙️" />
          <DestinationCard name="India" country="India" emoji="🇮🇳" prompt="Show me Chandigarh, India" />
          <DestinationCard name="Tokyo" country="Japan" emoji="🗾" />
          <DestinationCard name="New York" country="United States" emoji="🗽" />
        </div>
      </div>
    </div>
  );
}

export function CopilotPanelContent() {
  const { registeredTools, status, toolExecutions } = useCopilot();

  useEffect(() => {
    console.log(
      "[Copilot] Registered tools:",
      registeredTools?.map((t) => t.name),
    );
  }, [registeredTools]);

  useEffect(() => {
    console.log("[Copilot] Status changed:", status);
  }, [status]);

  useEffect(() => {
    console.log("[Copilot] Tool executions:", toolExecutions);
  }, [toolExecutions]);

  return (
    <div className="h-full flex flex-col">
      {/* Register AI tools */}
      <CopilotToolsProvider />

      {/* Intent handler - watches for "Add to Trip" requests from map markers */}
      <ChatIntentHandler />

      {/* CopilotChat with compound components */}
      <CopilotChat.Root
        className="h-full flex-1 min-h-0"
        assistantAvatar={{
          src: "/logo-travel.png",
        }}
        userAvatar={{
          fallback: "👤",
        }}
        showUserAvatar={false}
        attachmentsEnabled={false}
        placeholder="Search places or ask anything..."
        toolRenderers={toolRenderers}
      >
        {/* Home view - shown when no messages */}
        <CopilotChat.HomeView className="h-full">
          <TravelHome />
        </CopilotChat.HomeView>

        {/* Chat view - shown when there are messages */}
        <CopilotChat.ChatView className="" />
      </CopilotChat.Root>
    </div>
  );
}
