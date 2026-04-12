"use client";

import React from "react";
import { useParams } from "next/navigation";
import Sidebar from "@/components/appLayout";

const CookPage: React.FC = () => {
    const params = useParams();
    const eventId = params?.eventId as string;

    return (
        <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#fff"}}>
            <Sidebar />    
            <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center"}}>
                <p style={{ color: "*999", fontSize: 16}}>Cooking interface for event {eventId}, this is placeholder</p>
            </main>
        </div>
    );
};

export default CookPage;