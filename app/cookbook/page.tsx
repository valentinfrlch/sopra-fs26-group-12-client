
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, Tag, Dropdown, MenuProps, ConfigProvider } from "antd";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Sidebar, { UserAvatar, Header } from "@/components/appLayout";

import { useApi } from "@/hooks/useApi";
import { getApiDomain } from "@/utils/domain";
import useWindowSize from "@/hooks/useWndowSize";
import { Button } from "@mui/material";


interface Recipe {
  id: number;
  title: string;
  labels: string[];
  imageURL?: string;
  userId?: number;
}



const ALL_LABELS = ["Breakfast", "Lunch", "Dinner", "Vegetarian", "Vegan", "High Protein", "Low Carbs"];



const RecipeCard: React.FC<{ recipe: Recipe; token: string | null }> = ({ recipe, token }) => {
  const router = useRouter();
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!recipe.imageURL || !token) {
      setImageSrc(null);
      return;
    }

    const imagePath = recipe.imageURL;

    let objectUrl: string | null = null;

    const fetchImage = async () => {
      const response = await fetch(
        `${getApiDomain()}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );
      // if response fails, set null
      if (!response.ok) {
        setImageSrc(null);
        return;
      }

      const imageBlob = await response.blob();
      objectUrl = URL.createObjectURL(imageBlob);
      setImageSrc(objectUrl);
    }
    fetchImage();
  }, [recipe.imageURL, token]);

  const menuItems: MenuProps["items"] = [
    {
      key: "edit",
      label: "Edit Recipe",
      onClick: ({ domEvent }) => {
        domEvent.stopPropagation();

      }
    },
    {
      key: "delete",
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
      styles={{ body: { padding: 16 } }}>


      <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>


        {/* <UserAvatar username={recipe.title} size= {40} /> */}
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
            menu={{
              items: menuItems
            }}
            trigger={["click"]}

          >
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              style={{
                color: "#888",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                background: "none",
                border: "none",
                padding: 0,
              }}

            >
              <MoreVertIcon sx={{ fontSize: 20, color: "#888" }} />
            </button>
          </Dropdown>
        </ConfigProvider>
      </div>
      <div style={{ height: 240, background: "#f0f0f0", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#555", fontSize: 12 }}>

        {imageSrc ? (
          <img
            src={imageSrc}
            alt={recipe.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }}
          />
        ) : (
          "No image yet"
        )}
      </div>
    </Card>
  );
};





const CookbookPage: React.FC = () => {


  const api = useApi(); // add inside component
  const router = useRouter();
  const { isMobile } = useWindowSize();
  const [username, setUsername] = useState<string>("U");
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("username") ?? "U";
    setUsername(stored);
  }, []);




  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("token");
    if (stored) setToken(stored.replace(/"/g, ""));
  }, []);


  useEffect(() => {
    if (!token) return;

    const fetchRecipes = async () => {
      try {
        const data = await api.get<Recipe[]>("/recipes", {
          Authorization: `Bearer ${token}`,
        });

        console.log("RECIPES:", data);
        setRecipes(data);
      } catch (err) {
        console.error("FETCH ERROR:", err);
      }
    };

    fetchRecipes();
  }, [token]);



  const [activeLabels, setActiveLabels] = useState<string[]>([]);
  // const filteredRecipes = activeLabels.length > 0 ? MOCK_RECIPES.filter((r) => activeLabels.every((active) => r.labels.includes(active))) : MOCK_RECIPES;
  // Filtering logic
  const filteredRecipes =
    activeLabels.length > 0
      ? recipes.filter((r) =>
        activeLabels.every((label) => r.labels.includes(label))
      )
      : recipes;
  const handleLabelToggle = (label: string) => {
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

        <Header
          title="Your Library"
          rightContent={<UserAvatar />}
        />


        <div style={{ padding: "24px", flex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 }}>


            {/* Registered Event Card */}
            <Card
              hoverable
              onClick={() => router.push("/events/registered")}
              style={{ background: "#fff", border: "none", borderRadius: 12 }}
              styles={{ body: { padding: 16 } }}>
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
                <EventAvailableIcon sx={{ fontSize: 48, color: "#4a6741" }} />
              </div>
            </Card>


            {/* Participated Events */}
            <Card
              hoverable
              onClick={() => router.push("/events/participated")}
              style={{ background: "#fff", border: "none", borderRadius: 12 }}
              styles={{ body: { padding: 16 } }}>
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
                <EmojiEventsIcon sx={{ fontSize: 48, color: "#4a6741" }} />
              </div>
            </Card>
          </div>
          <h2 style={{ color: "#1a1a1a", fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Your Recipes</h2>
          {/*Filtering/Selection: Font Change*/}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {ALL_LABELS.map((label) => (
              <Tag key={label} onClick={() => handleLabelToggle(label)}
                style={{
                  cursor: "pointer", borderRadius: 20, padding: "2px 12px", fontSize: 13,
                  background: activeLabels.includes(label) ? "#4a6741" : "#e4e1e1", color: activeLabels.includes(label) ? "#1a1a1a" : "#555", border: "none"
                }}>
                {label}
              </Tag>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: 16 }}>
            {/*Filtering recipe cards*/}
            {filteredRecipes.map((recipe) => (<RecipeCard key={recipe.id} recipe={recipe} token={token} />))}
          </div>
        </div>
      </div>


      {/* 
      Floating button
      */}
      <Button
        type="button"
        variant="contained"
        startIcon={<AddIcon sx={{ fontSize: 20 }} />}
        onClick={() => router.push("/recipe/create")}
        style={{
          position: "fixed",
          bottom: isMobile ? 80 : 32,
          right: isMobile ? 16 : 32,
          borderRadius: 24,
          height: 44,
          paddingLeft: 20,
          paddingRight: 20,
          fontWeight: 600,
          background: "#4a6741",
          border: "none",
          textTransform: "none",
          display: "flex",
          alignItems: "center",
          gap: 6,
          zIndex: 1400,
        }}>
        Recipe
      </Button>
    </div>
  );
};

export default CookbookPage;
