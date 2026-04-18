// "use client";

// import { useEffect, useState } from "react";
// import Sidebar, { UserAvatar, Header } from "@/components/appLayout";

// interface Event {
//   id: number;
//   title: string;
//   startTime: string;
//   endTime: string;
// }

// export default function ParticipatedEventsPage() {
//   const [events, setEvents] = useState<Event[]>([]);
//   const [username, setUsername] = useState("U");

//   useEffect(() => {
//     const stored = localStorage.getItem("username") ?? "U";
//     setUsername(stored);

//     // TEMP: mock data until backend works
//     setEvents([
//       {
//         id: 1,
//         title: "Pizza Night",
//         startTime: "2025-03-01T18:00:00",
//         endTime: "2025-03-01T20:00:00"
//       },
//       {
//         id: 2,
//         title: "Burger Fest",
//         startTime: "2025-03-10T18:00:00",
//         endTime: "2025-03-10T20:00:00"
//       }
//     ]);
//   }, []);

//   const pastEvents = events.filter(
//     (e) => new Date(e.endTime) < new Date()
//   );

//   return (
//     <div style={{ display: "flex", minHeight: "100vh", background: "#f5f5f5" }}>
      
//       <Sidebar />

//       <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

//         <Header 
//           title="Participated Events"
//           rightContent={<UserAvatar size={40} />}
//         />
//         {/* Header */}
//         {/* <div style={{
//           background: "#fff",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//           padding: "16px 24px",
//           borderBottom: "1px solid #2a2d3a"
//         }}>
//           <span style={{ fontWeight: 600, fontSize: 20, color: "#1a1a1a" }}>
//             Participated Events
//           </span>
//           <UserAvatar username={username} size={40} />
//         </div> */}

//         {/* Content */}
//         <div style={{ padding: 24 }}>

//           {pastEvents.length === 0 ? (
//             <p style={{ color: "#555" }}>No past events</p>
//           ) : (
//             <ul style={{ paddingLeft: 20, color: "#1a1a1a"}}>
//               {pastEvents.map((event) => (
//                 <li
//                     key={event.id}
//                     style={{
//                         marginBottom: 12,
//                         fontSize: 14,
//                         fontWeight: 500,
//                         color: "#333"
//                     }}
//                     >
//                     <div>{event.title}</div>
//                     <div style={{ fontSize: 12, color: "#666" }}>
//                         Ended on: {new Date(event.endTime).toLocaleString()}
//                     </div>
//                 </li>
//               ))}
//             </ul>
//           )}

//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import React from "react";
import Sidebar, { Header, UserAvatar } from "@/components/appLayout";
import EventCard from "@/components/EventCard";
import { useEvents } from "@/hooks/useEvents";

const ParticipatedEventsPage: React.FC = () => {
  const events = useEvents();
  const userId = Number(localStorage.getItem("userId"));

  // Filter: finished + user is participant
  const participatedEvents = events.filter(
    (e: any) =>
      e.state === "FINISHED" &&
      e.participants?.some((p: any) => p.id === userId)
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f5f5" }}>
      <Sidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Header title="Participated Events" rightContent={<UserAvatar />} />

        {/* Scrollable Content */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 24,
            
          }}
        >
          {participatedEvents.length === 0 ? (
            <p style={{ color: "#1a1a1a" }}>No past participated events</p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 16,
              }}
            >
              {participatedEvents.map((event: any) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParticipatedEventsPage;