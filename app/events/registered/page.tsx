// "use client";

// import { useEffect, useState } from "react";
// import Sidebar, { UserAvatar, Header } from "@/components/appLayout";

// interface Event {
//   id: number;
//   title: string;
//   startTime: string;
//   endTime: string;
// }

// export default function RegisteredEventsPage() {
//   const [events, setEvents] = useState<Event[]>([]);
//   const [username, setUsername] = useState("U");

//   useEffect(() => {
//     const stored = localStorage.getItem("username") ?? "U";
//     setUsername(stored);

//     // TEMP: mock data
//     setEvents([
//       {
//         id: 3,
//         title: "Sushi Workshop",
//         startTime: "2026-05-01T18:00:00",
//         endTime: "2026-05-01T20:00:00"
//       },
//       {
//         id: 4,
//         title: "Pasta Night",
//         startTime: "2026-06-01T18:00:00",
//         endTime: "2026-06-01T20:00:00"
//       }
//     ]);
//   }, []);

//   const upcomingEvents = events.filter(
//     (e) => new Date(e.startTime) > new Date()
//   );

//   return (
//     <div style={{ display: "flex", minHeight: "100vh", background: "#f5f5f5" }}>
      
//       <Sidebar />

//       <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

//         {/* Header */}
//         <Header 
//           title="Registered Events"
//           rightContent={<UserAvatar size={40} />}
//         />

//         {/* <div style={{
//           background: "#fff",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//           padding: "16px 24px",
//           borderBottom: "1px solid #2a2d3a"
//         }}>
//           <span style={{ fontWeight: 600, fontSize: 20, color: "#1a1a1a" }}>
//             Registered Events
//           </span>
//           <UserAvatar username={username} size={40} />
//         </div> */}

//         {/* Content */}
//         <div style={{ padding: 24 }}>

//           {upcomingEvents.length === 0 ? (
//             <p style={{ color: "#555" }}>No upcoming events</p>
//           ) : (
//             <ul style={{ paddingLeft: 20, color: "#1a1a1a" }}>
//               {upcomingEvents.map((event) => (
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
//                         Starts on: {new Date(event.startTime).toLocaleString()}
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

import React, { useEffect, useState }  from "react";
import Sidebar, { Header, UserAvatar } from "@/components/appLayout";
import EventCard from "@/components/EventCard";
import { useEvents } from "@/hooks/useEvents";

const RegisteredEventsPage: React.FC = () => {
  const events = useEvents();
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("userId");
    if (stored) {
      setUserId(Number(stored));
    }
  }, []);

  // Filter: upcoming + user is participant
  const registeredEvents = events.filter(
    (e: any) =>
      userId !== null &&
      e.state === "UPCOMING" &&
      e.participants?.some((p: any) => p.id === userId)
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f5f5" }}>
      <Sidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Header title="Registered Events" rightContent={<UserAvatar />} />

        {/* Scrollable Content */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 24,
          }}
        >
          {registeredEvents.length === 0 ? (
            <p style={{ color: "#1a1a1a" }}>No upcoming registered events</p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 16,
              }}
            >
              {registeredEvents.map((event: any) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisteredEventsPage;