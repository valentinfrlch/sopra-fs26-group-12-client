
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Avatar, Button, Card, Tag, Dropdown, MenuProps, ConfigProvider } from "antd";
import { PlusOutlined, MenuOutlined, EllipsisOutlined, HomeOutlined, ReadOutlined } from "@ant-design/icons";
import Sidebar from "@/components/appLayout";

interface Recipe {
  id: number;
  title: string;
  labels: string[];
}

const MOCK_RECIPES: Recipe[] = [
  { id: 1, title: "Bulk Pizza", labels: ["Lunch", "Dinner", "High Protein"]  },
  { id: 2, title: "Cut Pizza", labels: ["Lunch", "Dinner", "Low Carbs"] },
];

const ALL_LABELS = ["Breakfast", "Lunch", "Dinner", "Vegetarian", "Vegan", "High Protein", "Low Carbs"];

const getInitials = (title: string): string => {
  return title
    .split(" ")           
    .map((word) => word[0]) 
    .join("")               
    .toUpperCase()          
    .slice(0, 2);          
};



const RecipeCard: React.FC<{ recipe: Recipe }> = ({ recipe }) => {
  const router = useRouter();
  const menuItems: MenuProps["items"] = [
    { key: "edit", 
      label: "Edit Recipe", 
      onClick: ({ domEvent }) => {
      domEvent.stopPropagation();  
       
    }
    },
    { key: "delete", 
      label: "Delete Recipe", 
      danger: true,
      onClick: ({ domEvent }) => {
        domEvent.stopPropagation();  
        
        alert("Delete recipe clicked!");  
      }
    }
  ];
  return (
    
    <Card hoverable onClick={() => router.push(`/recipe/${recipe.id}`)}
      style={{ borderRadius: 12, background: "#fff", border: "1px solid #e8e8e8", cursor: "pointer" }}
      styles={{body: {padding: 16} }}>

      
      <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>

        
        <Avatar size={32} style={{ background: "#e8f5e9", color: "#4a6741", marginRight: 8 }}>{getInitials(recipe.title)}</Avatar>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: "#1a1a1a" }}>{recipe.title}</div>
          <div style={{ fontSize: 12, color: "#888" }}>{recipe.labels.join(", ")}</div>
        </div>


        <ConfigProvider
        theme={{
            components: {
            Dropdown: {
                colorBgElevated: "#ffffff",      
                colorText: "#1a1a1a",         
                controlItemBgHover: "#f5f5f5", 
            },
            },
        }}
        >
        <Dropdown 
            menu={{ items: menuItems
             }} 
            trigger={["click"]}
            
             >
          <EllipsisOutlined 
          style={{ fontSize: 18, color: "#888", cursor: "pointer" }} 
          onClick={(e) => e.stopPropagation()}
          />
        </Dropdown>
        </ConfigProvider>
      </div>
      <div style={{ height: 240, background: "#f0f0f0", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#555", fontSize: 12 }}>
        No image yet
        {/* <Image src={recipe.imageUrl} alt={recipe.title}
        width={220} height={120} style={{ borderRadius: 8 }} /> */}
      </div>
    </Card>
  );
};





const CookbookPage: React.FC = () => {
  const router = useRouter();

  const [username, setUsername] = useState<string>("U");
  useEffect(() => {
    const stored = localStorage.getItem("username") ?? "U";
    setUsername(stored);
  }, []);
  const [activeLabels, setActiveLabels] = useState<string[]>([]);
  const filteredRecipes = activeLabels.length > 0 ? MOCK_RECIPES.filter((r) => activeLabels.every((active) => r.labels.includes(active))) : MOCK_RECIPES;
  const handleLabelToggle= (label: string) => {
                setActiveLabels((prev) =>
                    prev.includes(label)
                    ? prev.filter((l) => l !== label)  
                    : [...prev, label]                  
                );
                };


  return (
    
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f5f5" }}>

      <Sidebar />

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>


        
        <div style={{background: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid #2a2d3a" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <MenuOutlined style={{ fontSize: 18, color: "#aaa" }} />
            <span style={{ fontWeight: 600, fontSize: 16, color: "#1a1a1a" }}>Your Library</span>
          </div>
          <Avatar size={40} style={{ background: "#f0f0f0", color: "#1a1a1a", cursor: "pointer", fontWeight: 600 }} onClick={() => router.push("/user/me")}>{getInitials(username)}</Avatar>
        </div>


        
        <div style={{ padding: "24px", flex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 }}>


            {/* Registered Event Card */}
            <Card 
                hoverable 
                onClick={() => router.push("/events/overview")} 
                style={{ background: "#fff", border: "1px solid #2a2d3a", borderRadius: 12 }} 
                styles={{body: {padding: 16} }}>
              <div style={{ color: "#504e4e", fontSize: 13, marginBottom: 12 }}>Registered Events ›</div>
              <div style={{
                height: 140,
                background: "#f0f0f0",
                borderRadius: 8,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
            }}>
            <span className="material-icons" style={{ fontSize: 48, color: "#4a6741" }}>
            event_available
            </span>
            </div>
            </Card>


            {/* Participated Events */}
            <Card 
                hoverable 
                onClick={() => router.push("/events/overview")} 
                style={{ background: "#fff", border: "1px solid #2a2d3a", borderRadius: 12 }} 
                styles={{body: {padding: 16} }}>
              <div style={{ color: "#504e4e", fontSize: 13, marginBottom: 12 }}>Participated Events ›</div>
              <div style={{
                height: 140,
                background: "#f0f0f0",
                borderRadius: 8,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
            }}>
                <span className="material-icons" style={{ fontSize: 48, color: "#4a6741" }}>
                emoji_events
                </span>
            </div>
            </Card>
          </div>
          <h2 style={{ color: "#1a1a1a", fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Your Recipes</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {ALL_LABELS.map((label) => (
              <Tag key={label} onClick={() => handleLabelToggle(label)}
                style={{ cursor: "pointer", borderRadius: 20, padding: "2px 12px", fontSize: 13, 
                background: activeLabels.includes(label) ? "#4a6741" : "#e4e1e1", color: activeLabels.includes(label) ? "#1a1a1a" : "#555", border: "none" }}>
                {label}
              </Tag>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: 16 }}>
            {filteredRecipes.map((recipe) => (<RecipeCard key={recipe.id} recipe={recipe} />))}
          </div>
        </div>
      </div>


      {/* Floating + button
      position: "fixed" — the most important property here. Removes the button from the normal page flow and pins it to the screen. It stays visible even when you scroll down — it never moves.
      */}
      <Button type="primary" icon={<PlusOutlined />} onClick={() => router.push("/recipe/create")}
        style={{ position: "fixed", bottom: 32, right: 32, borderRadius: 24, height: 44, paddingLeft: 20, paddingRight: 20, fontWeight: 600, background: "#4a6741", border: "none" }}>
        Recipe
      </Button>
    </div>
  );
};

export default CookbookPage;
