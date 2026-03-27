"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Avatar, Button, Card, Tag, Dropdown, MenuProps } from "antd";
import { PlusOutlined, MenuOutlined, EllipsisOutlined, HomeOutlined, ReadOutlined } from "@ant-design/icons";
import { ConfigProvider } from "antd";

interface Recipe {
  id: number;
  title: string;
  labels: string[];
}

// Temporary fake data -  Once the server implements the recipes API, you'll replace this with: const recipes = await apiService.get("/recipes");
const MOCK_RECIPES: Recipe[] = [
  { id: 1, title: "Bulk Pizza", labels: ["Lunch", "Dinner", "High Protein"]  },
  { id: 2, title: "Cut Pizza", labels: ["Lunch", "Dinner", "Low Carbs"] },
];

const ALL_LABELS = ["Breakfast", "Lunch", "Dinner", "Vegetarian", "Vegan", "High Protein", "Low Carbs"];

const getInitials = (title: string): string => {
  return title
    .split(" ")           // split "Chocolate Icecream" 
    .map((word) => word[0]) // take first letter of each word 
    .join("")              // join 
    .toUpperCase()         // uppercase 
    .slice(0, 2);          // max 2 characters → safety cap
};

/*
RecipeCard. It's a reusable piece of UI — a function that takes one recipe's data and returns the visual card you see on screen. It gets called once per recipe in the grid.
React.FC — stands for React Function Component. It's a TypeScript type that says "this variable is a React component function".
<{ recipe: Recipe }> — the angle brackets are TypeScript generics. This says "this component accepts one prop called recipe, and it must be of type Recipe (our interface)"
 = ({ recipe }) => — this is the actual function. The curly braces { recipe } is destructuring — instead of writing (props) => props.recipe, we unpack it immediately.

This defines the options that appear when you click the ⋯ (3-dot) button on a recipe card.
MenuProps["items"] — TypeScript saying this array must match the shape Ant Design expects for its Dropdown menu items.
key — a unique identifier for each menu option (used internally by Ant Design).
label — the text shown to the user.
danger: true — Ant Design automatically colours this item red, signalling a destructive action.
 */

const RecipeCard: React.FC<{ recipe: Recipe }> = ({ recipe }) => {
  const router = useRouter();
  const menuItems: MenuProps["items"] = [
    { key: "edit", 
      label: "Edit Recipe", 
      onClick: ({ domEvent }) => {
      domEvent.stopPropagation();  // ← stop card navigation
      // TODO: navigate to edit page 
    }
    },
    { key: "delete", 
      label: "Delete Recipe", 
      danger: true,
      onClick: ({ domEvent }) => {
        domEvent.stopPropagation();  // ← stop card navigation
        // TODO: call delete API
        alert("Delete recipe clicked!");  // temporary placeholder },
      }
    }
  ];
  return (
    /*
    hoverable — an Ant Design prop that adds a subtle shadow/lift effect when you hover over the card. No value needed — just writing it means true.
    onClick — runs when the card is clicked. Navigates to the recipe's detail page.
    style — CSS applied to the outer card container.
    bodyStyle — CSS applied to the inner content area of the Card. Ant Design Cards have an outer shell and an inner body — you can style them separately.
    */
    <Card hoverable onClick={() => router.push(`/recipe/${recipe.id}`)}
      style={{ borderRadius: 12, background: "#fff", border: "1px solid #e8e8e8", cursor: "pointer" }}
      styles={{body: {padding: 16} }}>

        {/* 
        display: "flex" — puts children side by side (horizontal row).
        alignItems: "center" — vertically centres all children in the row.
        marginBottom: 8 — 8px gap below this row before the image.
        */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>

        {/*
        Renders a circular 32px avatar showing the author's initial (e.g. "A"). Later this will show an actual profile photo.
        flex: 1 — this div grows to fill all available space between the avatar and the 3-dot button.
        minWidth: 0 — prevents the text from overflowing its container (a flex gotcha).
        {recipe.labels.join(", ")} — converts the array ["Lunch","Dinner"] into the string "Lunch, Dinner".
        */}
        <Avatar size={32} style={{ background: "#e8f5e9", color: "#4a6741", marginRight: 8 }}>{getInitials(recipe.title)}</Avatar>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: "#1a1a1a" }}>{recipe.title}</div>
          <div style={{ fontSize: 12, color: "#888" }}>{recipe.labels.join(", ")}</div>
        </div>

        {/* 
        menu={{ items: menuItems }} — passes the Edit/Delete options we defined earlier to the dropdown.
        trigger={["click"]} — the dropdown opens on click (not hover).
        e.stopPropagation() — this is the clever part. The card has its own onClick (navigate to detail page). The dropdown is INSIDE the card. Without stopPropagation, 
        clicking ⋯ would ALSO trigger the card click → accidentally navigating away.
        stopPropagation stops the click from "bubbling up" to the parent card.
        */}

        <ConfigProvider
        theme={{
            components: {
            Dropdown: {
                colorBgElevated: "#ffffff",      // background of dropdown menu
                colorText: "#1a1a1a",         // text colour
                controlItemBgHover: "#f5f5f5", // hover background
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
        // Image placeholder for now
        No image yet
        {/* <Image src={recipe.imageUrl} alt={recipe.title}
        width={220} height={120} style={{ borderRadius: 8 }} /> */}
      </div>
    </Card>
  );
};




/*useState gives a component memory. It returns two things:
activeLabel — the current value (which filter tag is selected, or null = none)
setActiveLabel — the function to update it
string | null = TypeScript saying the value is either a string OR null
(null) = the starting value (nothing selected by default)*/

/* Filtering recipes with the active label: The ? : is a ternary — a compact if/else: 
If activeLabel is set → filter recipes to only those whose labels include it 
Else → show all recipes*/

/* useRouter gives you a router object. router.push(path) navigates to that page — like clicking a link but triggered by code. */
const CookbookPage: React.FC = () => {
  const router = useRouter();
//   const username = localStorage.getItem("username") ?? "U";
  const [username, setUsername] = useState<string>("U");
  useEffect(() => {
    const stored = localStorage.getItem("username") ?? "U";
    setUsername(stored);
  }, []);
  const [activeLabels, setActiveLabels] = useState<string[]>([]);
  const filteredRecipes = activeLabels.length > 0 ? MOCK_RECIPES.filter((r) => activeLabels.every((active) => r.labels.includes(active))) : MOCK_RECIPES;

  return (
    // This is the root container — it wraps the ENTIRE page.
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f5f5" }}>
      {/* Sidebar #38 */}
      <div style={{ width: 64, background: "#fff", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 24, gap: 24, borderRight: "1px solid #2a2d3a", flexShrink: 0 }}>
        <div onClick={() => router.push("/events/overview")} style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", gap: 4 }}>
          <HomeOutlined style={{ fontSize: 22, color: "#000000" }} />
          <span style={{ fontSize: 10, color: "#797979" }}>Events</span>
        </div>
        <div onClick={() => router.push("/cookbook")} style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", gap: 4 }}>
          <ReadOutlined style={{ fontSize: 22, color: "#000000" }} />
          <span style={{ fontSize: 10, color: "#797979" }}>Library</span>
        </div>
      </div>
      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

        {/* Top bar #39 
        A small flex row containing the ☰ hamburger icon 
        The "Your Library" title side by side with 12px gap between them.
        An Ant Design Avatar — a circle showing the letter "U" as placeholder.
        */}
        <div style={{background: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid #2a2d3a" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <MenuOutlined style={{ fontSize: 18, color: "#aaa" }} />
            <span style={{ fontWeight: 600, fontSize: 16, color: "#1a1a1a" }}>Your Library</span>
          </div>
          <Avatar size={40} style={{ background: "#f0f0f0", color: "#1a1a1a", cursor: "pointer", fontWeight: 600 }} onClick={() => router.push("/user/me")}>{getInitials(username)}</Avatar>
        </div>
        {/* Body 
        display: "grid" — CSS Grid layout. More powerful than flex for 2D layouts.
        gridTemplateColumns: "1fr 1fr" — two equal columns. 1fr = 1 fraction of available space. Two equal fractions = 50/50 split.
        */}
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
            {/* <span style={{ fontSize: 13, color: "#888" }}>
            Your registered events appear here
            </span> */}
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
                {/* <span style={{ fontSize: 13, color: "#888" }}>
                Events you joined appear here
                </span> */}
            </div>
            </Card>
          </div>
          <h2 style={{ color: "#1a1a1a", fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Your Recipes</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {ALL_LABELS.map((label) => (
              <Tag key={label} onClick={() => {
                setActiveLabels((prev) =>
                    prev.includes(label)
                    ? prev.filter((l) => l !== label)  // already selected → remove it
                    : [...prev, label]                  // not selected → add it
                );
                }}
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