"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close"
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Sidebar, { UserAvatar, Header } from "@/components/appLayout";
import EventPreviewCard from "@/components/EventPreviewCard";
import { useApi } from "@/hooks/useApi";
import { getApiDomain } from "@/utils/domain";
import useWindowSize from "@/hooks/useWndowSize";
import { Chip, Card, CardMedia, IconButton, Menu, MenuItem, SpeedDial, SpeedDialAction, SpeedDialIcon } from "@mui/material";
import ShuffleIcon from "@mui/icons-material/Shuffle";

interface Recipe {
  id: number;
  title: string;
  labels: string[];
  imageURL?: string;
  userId?: number;
}

interface RecipeDetail {
  idMeal: string;
  strMeal: string;
  strInstructions?: string;
  strMealThumb?: string;
  [key: string]: string | undefined;
}
interface Event {
  id: number;
  title: string;
  startDatetime: string;
  endDatetime: string;
  state: string;
  participants?: { id: number }[];
  emojis?: string;
}

interface LabelResponse {
  name?: string;
  label?: string;
}


const RecipeCard: React.FC<{ recipe: Recipe; onDelete: (recipeId: number) => void; token: string | null }> = ({ recipe, onDelete, token }) => {
  const router = useRouter();
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

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

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    handleMenuClose();
    console.log("Editing recipe:", recipe);
    router.push(`/recipe/${recipe.id}/edit`);
  };

  const handleDelete = () => {
    handleMenuClose();
    onDelete(recipe.id);
  };

  return (
    <Card
      onClick={() => router.push(`/recipe/${recipe.id}`)}
      sx={{
        borderRadius: 4,
        border: "1px solid #e8e8e8",
        cursor: "pointer",
        boxShadow: 0,
      }}
    >

      {imageSrc ? (
        <CardMedia
          component="img"
          image={imageSrc}
          alt={recipe.title}
          sx={{ height: 200, objectFit: "cover" }}
        />
      ) : (
        <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "#888" }}>
          No image yet
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", padding: 16, gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 16, color: "#1a1a1a" }}>
            {recipe.title}
          </div>
          <div style={{ fontSize: 14, color: "#888" }}>
            {recipe.labels.join(", ")}
          </div>
        </div>
        <IconButton
          onClick={handleMenuOpen}
          size="small"
          sx={{ color: "#888" }}
        >
          <MoreVertIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </div>



      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={handleEdit}>Edit Recipe</MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          Delete Recipe
        </MenuItem>
      </Menu>
    </Card>
  );
};

const CookbookPage: React.FC = () => {


  const api = useApi(); // add inside component
  const router = useRouter();
  const { isMobile } = useWindowSize();
  const [username, setUsername] = useState<string>("U");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [labels, setLabels] = useState<string[]>([]);
  const [activeLabels, setActiveLabels] = useState<string[]>([]);
  const [isFetchingRandomRecipe, setIsFetchingRandomRecipe] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const id = localStorage.getItem("userId");
    if (id) setUserId(Number(id));
  }, []);

  useEffect(() => {
    if (!token) return;

    const fetchEvents = async () => {
      try {
        const data = await api.get<Event[]>("/events", {
          Authorization: `Bearer ${token}`,
        });

        setEvents(data);
      } catch (err) {
        console.error("EVENT FETCH ERROR:", err);
      }
    };

    fetchEvents();
  }, [token]);

  const upcomingEvents = React.useMemo(() => {
    if (userId === null) return [];

    return events.filter(
      (e) =>
        e.state === "UPCOMING" &&
        e.participants?.some((p) => Number(p.id) === userId)
    );
  }, [events, userId]);

  const nextEvents = [...upcomingEvents]
    .sort(
      (a, b) =>
        new Date(a.startDatetime).getTime() -
        new Date(b.startDatetime).getTime()
    )
    .slice(0, 3);

  const participatedEvents = React.useMemo(() => {
    if (userId === null) return [];

    return events.filter(
      (e) =>
        e.state === "FINISHED" &&
        e.participants?.some((p) => Number(p.id) === userId)
    );
  }, [events, userId]);

  const latestEvents = [...participatedEvents]
    .sort(
      (a, b) =>
        new Date(b.startDatetime).getTime() -
        new Date(a.startDatetime).getTime()
    )
    .slice(0, 3);

  useEffect(() => {
    const stored = localStorage.getItem("username") ?? "U";
    setUsername(stored);
  }, []);

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

  useEffect(() => {
    if (!token) return;

    const fetchLabels = async () => {
      try {
        const response = await api.get<Array<string | LabelResponse>>(
          "/labels",
          {
            Authorization: `Bearer ${token}`,
          },
        );

        const normalized = (response || [])
          .map((label) => (typeof label === "string" ? label : label.name || label.label || ""))
          .filter((label) => label.trim().length > 0);

        setLabels(normalized);
      } catch (error: unknown) {
        console.error("Failed to fetch labels:", error);
      }
    };

    fetchLabels();
  }, [token]);

  const handleDeleteRecipe = async (recipeId: number) => {
    try {
      if (!token) {
        alert("No token found.");
        return;
      }

      await api.delete(`/recipes/${recipeId}`, {
        Authorization: `Bearer ${token}`,
      });

      setRecipes((prev) => prev.filter((recipe) => recipe.id !== recipeId));
    } catch (err) {
      console.error("DELETE ERROR:", err);
      alert("Failed to delete recipe.");
    }
  };

  const handleRandomRecipe = async () => {
    try {
      setIsFetchingRandomRecipe(true);

      const res = await fetch("https://www.themealdb.com/api/json/v1/1/random.php");
      const data = await res.json();
      const meal: RecipeDetail | undefined = data?.meals?.[0];

      if (!meal) {
        alert("Could not fetch a random recipe.");
        return;
      }

      sessionStorage.setItem("randomMealRecipe", JSON.stringify(meal));
      router.push("/recipe/create?source=random");
    } catch (error) {
      console.error("RANDOM MEALDB ERROR:", error);
      alert("Failed to fetch random recipe.");
    } finally {
      setIsFetchingRandomRecipe(false);
    }
  };

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

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

        <Header
          title="Your Library"
          rightContent={<UserAvatar />}
        />


        <div style={{ padding: "24px", flex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 }}>


            {/* Registered Event Card */}

            <EventPreviewCard
              title="Registered Events"
              events={nextEvents}
              emptyMessage="No upcoming events yet"
              onHeaderClick={() => router.push("/events/registered")}
              dateType="start"
            />




            {/* Participated Events */}

            <EventPreviewCard
              title="Participated Events"
              events={latestEvents}
              emptyMessage="No participated events yet"
              onHeaderClick={() => router.push("/events/participated")}
              dateType="end"
            />
          </div>

          <h2 style={{ color: "#1a1a1a", fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
            Your Recipes
          </h2>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {labels.map((label) => (
              <Chip
                key={label}
                label={label}
                onClick={() => handleLabelToggle(label)}
                sx={{
                  backgroundColor: activeLabels.includes(label) ? "rgba(75, 102, 36, 1)" : "#e0e0e0",
                  color: activeLabels.includes(label) ? "#fff" : "#1a1a1a",
                  cursor: "pointer",
                  userSelect: "none",
                  fontWeight: activeLabels.includes(label) ? 600 : 400,
                }}
              />
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: 1, marginBottom: 48 }}>
            {/*Filtering recipe cards*/}
            {filteredRecipes.map((recipe) => (<RecipeCard key={recipe.id} recipe={recipe} token={token} onDelete={handleDeleteRecipe} />))}
          </div>
        </div>
      </div>

      <SpeedDial
        ariaLabel="Recipe actions"
        icon={<SpeedDialIcon icon={<AddIcon />} openIcon={<CloseIcon />} />}
        direction="up"
        sx={{
          position: "fixed",
          bottom: isMobile ? 74 : 34,
          right: isMobile ? 16 : 32,
          zIndex: 1400,
          "& .MuiFab-primary": {
            backgroundColor: "#4a6741",
          },
          "& .MuiFab-primary:hover": {
            backgroundColor: "#3f5936",
          },
        }}
      >
        <SpeedDialAction
          key="random-recipe"
          icon={<ShuffleIcon />}
          tooltipTitle={isFetchingRandomRecipe ? "Loading..." : "Random Recipe"}
          tooltipOpen
          onClick={handleRandomRecipe}
          FabProps={{ disabled: isFetchingRandomRecipe }}
        />
        <SpeedDialAction
          key="create-recipe"
          icon={<AddIcon />}
          tooltipTitle="Recipe"
          tooltipOpen
          onClick={() => router.push("/recipe/create")}
        />
      </SpeedDial>
    </div>
  );
};

export default CookbookPage;