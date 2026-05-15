"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close"
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import { PageLayout } from "@/components/PageLayout";
import EventPreviewCard from "@/components/EventPreviewCard";
import { useApi } from "@/hooks/useApi";
import { getApiDomain } from "@/utils/domain";
import useWindowSize from "@/hooks/useWndowSize";
import { Chip, Card, CardMedia, IconButton, Menu, MenuItem, Popover, SpeedDial, SpeedDialAction, SpeedDialIcon, TextField, Box } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

interface Recipe {
  id: number;
  title: string;
  labels: string[];
  ingredients: string[];
  imageURL?: string;
  userId?: number;
  favorite?: boolean;
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


const RecipeCard: React.FC<{
  recipe: Recipe;
  onDelete: (recipeId: number) => void;
  onToggleFavorite: (recipeId: number, currentlyFavorite: boolean) => void;
  token: string | null;
}> = ({ recipe, onDelete, onToggleFavorite, token }) => {
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
        borderRadius: 5,
        border: "1px solid #e8e8e8",
        cursor: "pointer",
        boxShadow: 0,
        position: "relative",
        overflow: "hidden",
        height: 280,
      }}
    >
      {imageSrc ? (
        <CardMedia
          component="img"
          image={imageSrc}
          alt={recipe.title}
          sx={{ height: "100%", objectFit: "cover" }}
        />
      ) : (
        <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#888", backgroundColor: "#f5f5f5" }}>
          No image yet
        </div>
      )}

      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        background: "linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0))",
        padding: "24px 16px 16px 16px",
        display: "flex",
        alignItems: "flex-end",
        gap: 12,
        height: 120,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 16, color: "#fff" }}>
            {recipe.title}
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 4 }}>
            {recipe.labels.join(", ")}
          </div>
        </div>

        <IconButton
          onClick={(event) => {
            event.stopPropagation();
            onToggleFavorite(recipe.id, recipe.favorite ?? false);
          }}
          size="small"
          sx={{ color: recipe.favorite ? "#fff" : "rgba(255,255,255,0.7)" }}
        >
          {recipe.favorite ? (
            <FavoriteIcon sx={{ fontSize: 22 }} />
          ) : (
            <FavoriteBorderIcon sx={{ fontSize: 22 }} />
          )}
        </IconButton>

        <IconButton
          onClick={handleMenuOpen}
          size="small"
          sx={{ color: "rgba(255,255,255,0.7)" }}
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
  const [activeIngredients, setActiveIngredients] = useState<string[]>([]);
  const [showAllLabels, setShowAllLabels] = useState<boolean>(false);
  const [isFetchingRandomRecipe, setIsFetchingRandomRecipe] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [searchAnchorEl, setSearchAnchorEl] = useState<HTMLElement | null>(null);
  const [searchInput, setSearchInput] = useState<string>("");
  const [appliedSearch, setAppliedSearch] = useState<string>("");
  const searchOpen = Boolean(searchAnchorEl);

  const handleSearchOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSearchInput(appliedSearch);
    setSearchAnchorEl(event.currentTarget);
  };

  const handleSearchClose = () => {
    setSearchAnchorEl(null);
    setSearchInput(appliedSearch);
  };

  const handleSearchSubmit = () => {
    setAppliedSearch(searchInput.trim());
    setSearchAnchorEl(null);
  };

  useEffect(() => {
    if (!searchOpen) return;

    const onScroll = () => handleSearchClose();
    window.addEventListener("scroll", onScroll, true);
    return () => window.removeEventListener("scroll", onScroll, true);
  }, [searchOpen, appliedSearch]);

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
        setRecipes(sortRecipes(data));
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

  const sortRecipes = (recipesToSort: Recipe[]) => {
    return [...recipesToSort].sort((a, b) => {
      if ((a.favorite ?? false) !== (b.favorite ?? false)) {
        return (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0);
      }

      return b.id - a.id;
    });
  };

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

  const handleToggleFavorite = async (
    recipeId: number,
    currentlyFavorite: boolean
  ) => {
    try {
      if (!token) {
        alert("No token found.");
        return;
      }

      if (currentlyFavorite) {
        await api.delete(`/recipes/${recipeId}/favorite`, {
          Authorization: `Bearer ${token}`,
        });
      } else {
        await api.post(
          `/recipes/${recipeId}/favorite`,
          {},
          {
            Authorization: `Bearer ${token}`,
          }
        );
      }

      setRecipes((prev) =>
        sortRecipes(
          prev.map((recipe) =>
            recipe.id === recipeId
              ? { ...recipe, favorite: !currentlyFavorite }
              : recipe
          )
        )
      );
    } catch (err) {
      console.error("FAVORITE ERROR:", err);
      alert("Failed to update favorite.");
    }
  };

  const getIngredientNames = (ingredients: string[] = []) => {
    const names: string[] = [];

    for (let i = 0; i < ingredients.length; i += 2) {
      const ingredientName = ingredients[i]?.trim();
      if (ingredientName) names.push(ingredientName);
    }

    return names;
  };

  const ingredientOptions = React.useMemo(() => {
    const ingredientSet = new Set<string>();

    recipes.forEach((recipe) => {
      getIngredientNames(recipe.ingredients).forEach((ingredient) => {
        ingredientSet.add(ingredient);
      });
    });

    return Array.from(ingredientSet).sort((a, b) => a.localeCompare(b));
  }, [recipes]);

  // Filtering logic
  const filteredRecipes = recipes.filter((recipe) => {
    const matchesLabels =
      activeLabels.length === 0 ||
      activeLabels.every((label) => recipe.labels.includes(label));

    const recipeIngredientNames = getIngredientNames(recipe.ingredients);

    const matchesIngredients =
      activeIngredients.length === 0 ||
      activeIngredients.every((ingredient) =>
        recipeIngredientNames.includes(ingredient)
      );

    const matchesSearch =
      appliedSearch.length === 0 ||
      recipe.title.toLowerCase().includes(appliedSearch.toLowerCase());

    return matchesLabels && matchesIngredients && matchesSearch;
  });

  const handleLabelToggle = (label: string) => {
    setActiveLabels((prev) =>
      prev.includes(label)
        ? prev.filter((l) => l !== label)
        : [...prev, label]
    );
  };

  const displayedLabels = showAllLabels ? labels : labels.slice(0, 5);

  return (
    <>
      <PageLayout title="Your Library">
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

        {recipes.length === 0 ? (
          <div
            style={{
              minHeight: 320,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6b6b6b",
              padding: "32px 16px",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <h2>No recipes yet</h2>
              <p>Create your first recipe to get started.</p>
            </div>
          </div>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                alignItems: "flex-start",
                justifyContent: isMobile ? "flex-start" : "space-between",
                gap: 16,
                marginBottom: 16,
              }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {displayedLabels.map((label) => (
                  <Chip
                    key={label}
                    label={label}
                    onClick={() => handleLabelToggle(label)}
                    sx={{
                      backgroundColor: activeLabels.includes(label)
                        ? "rgba(75, 102, 36, 1)"
                        : "#e0e0e0",
                      color: activeLabels.includes(label) ? "#fff" : "#1a1a1a",
                      cursor: "pointer",
                      userSelect: "none",
                      fontWeight: activeLabels.includes(label) ? 600 : 400,
                    }}
                  />
                ))}

                {labels.length > 5 && !showAllLabels && (
                  <Chip
                    key="more"
                    label={`+${labels.length - 5}`}
                    onClick={() => setShowAllLabels(true)}
                    sx={{
                      backgroundColor: "transparent",
                      color: "#4b6624",
                      cursor: "pointer",
                      border: "1px solid rgba(75,102,36,0.15)",
                      fontWeight: 600,
                    }}
                  />
                )}

                {labels.length > 5 && showAllLabels && (
                  <Chip
                    key="less"
                    label="Show less"
                    onClick={() => setShowAllLabels(false)}
                    sx={{
                      backgroundColor: "transparent",
                      color: "#4b6624",
                      cursor: "pointer",
                      border: "1px solid rgba(75,102,36,0.15)",
                      fontWeight: 600,
                    }}
                  />
                )}
              </div>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 1,
                  width: isMobile ? "100%" : "auto",
                  flexShrink: 0,
                  mt: isMobile ? 1 : 0,
                }}
              >
                <IconButton
                  aria-label="Search recipes"
                  onClick={handleSearchOpen}
                  sx={{
                    border: "1px solid rgba(0,0,0,0.23)",
                    borderRadius: "50%",
                    width: 40,
                    height: 40,
                    color: appliedSearch ? "#fff" : "#4b6624",
                    backgroundColor: appliedSearch ? "#4b6624" : "#fff",
                    "&:hover": {
                      borderColor: "#4b6624",
                      backgroundColor: appliedSearch
                        ? "#3f5936"
                        : "rgba(75,102,36,0.04)"
                    },
                  }}
                >
                  <SearchIcon />
                </IconButton>

                <Popover
                  open={searchOpen}
                  anchorEl={searchAnchorEl}
                  onClose={handleSearchClose}
                  anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                  transformOrigin={{ vertical: "top", horizontal: "left" }}
                  slotProps={{
                    paper: {
                      sx: {
                        mt: 1,
                        p: 1.5,
                        borderRadius: 5,
                        width: 300,
                      },
                    },
                  }}
                >
                  <TextField
                    autoFocus
                    fullWidth
                    size="small"
                    placeholder="Search recipes by name"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        handleSearchSubmit();
                      }
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 4,
                        "&.Mui-focused fieldset": { borderColor: "#4b6624" },
                      },
                    }}
                  />
                </Popover>

              <Box
                sx={{
                  width: isMobile ? "100%" : 360,
                  flexShrink: 0,
                  border: "1px solid rgba(0,0,0,0.23)",
                  borderRadius: 20,
                  backgroundColor: "#fff",
                  position: "relative",
                  "&:hover": { borderColor: "#4b6624" },
                  "&:focus-within": { borderColor: "#4b6624", borderWidth: 2 },
                }}
              >
                <Autocomplete
                  multiple
                  size="small"
                  options={ingredientOptions.filter(
                    (ingredient) => !activeIngredients.includes(ingredient)
                  )}
                  value={activeIngredients}
                  onChange={(_, newValue) => setActiveIngredients(newValue)}
                  sx={{
                    width: "100%",

                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "transparent",
                      borderRadius: 4,
                      minHeight: 40,
                      maxHeight: 92,
                      overflowY: "auto",
                      alignItems: "flex-start",
                      paddingTop: "6px",
                      paddingBottom: "6px",
                      paddingRight: "72px !important",

                      // custom scrollbar
                      "&::-webkit-scrollbar": {
                        width: 4,
                      },
                      "&::-webkit-scrollbar-track": {
                        background: "transparent",
                      },
                      "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "rgba(75, 102, 36, 0.4)",
                        borderRadius: 4,
                      },
                      "&::-webkit-scrollbar-thumb:hover": {
                        backgroundColor: "rgba(75, 102, 36, 0.7)",
                      },

                      "& .MuiOutlinedInput-notchedOutline": {
                        border: "none",
                      },
                    },

                    "& .MuiAutocomplete-endAdornment": {
                      position: "absolute",
                      top: 8,
                      transform: "none",
                      right: 9,
                    },

                    "& .MuiAutocomplete-tag": {
                      margin: "2px",
                    },

                    "& .MuiAutocomplete-input": {
                      minWidth: "140px",
                      paddingTop: "4px",
                    },
                  }}
                  renderTags={(value, getTagProps) => (
                    <>
                      {value.map((option, index) => (
                        <Chip
                          {...getTagProps({ index })}
                          key={option}
                          label={option}
                          size="small"
                          sx={{
                            backgroundColor: "rgba(75, 102, 36, 1)",
                            color: "#fff",
                            margin: "2px",
                            "& .MuiChip-deleteIcon": {
                              color: "rgba(255, 255, 255, 0.7)",
                            },
                          }}
                        />
                      ))}
                    </>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Filter by ingredients"
                    />
                  )}
                />
              </Box>
            </Box>

            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fill, minmax(350px, 1fr))", gap: 16 }}>
              {/*Filtering recipe cards*/}
              {filteredRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  token={token}
                  onDelete={handleDeleteRecipe}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          </>
        )}
      </PageLayout>

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
    </>
  );
};

export default CookbookPage;