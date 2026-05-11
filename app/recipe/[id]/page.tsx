"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { getApiDomain } from "@/utils/domain";
import Sidebar from "@/components/appLayout";
import { Form, Row, Col, App, Avatar } from "antd";
import { TextField, Button as MuiButton, Chip, List, ListItemButton, ListItem, Paper, LinearProgress, Typography, Box } from "@mui/material";
import Edit from "@mui/icons-material/Edit";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import { Header, UserAvatar } from "@/components/appLayout";
import useWindowSize from "@/hooks/useWndowSize";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

type Recipe = {
  id: number;
  title: string;
  preparation: string;
  ingredients?: string[];
  labels: string[];
  imageURL?: string;
  createdAt?: string;
  userId?: number;
};

const RecipeDetailPage: React.FC = () => {
  const SHEET_START_TOP_VH = 33;
  const SHEET_EXPAND_RANGE_PX = 280;

  const router = useRouter();
  const params = useParams();
  const apiService = useApi();
  const { isMobile } = useWindowSize();
  const { message } = App.useApp();

  const recipeId = params?.id;

  const [form] = Form.useForm();

  const [isBannerHovered, setIsBannerHovered] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const [recipeName, setRecipeName] = useState<string>("");
  const [shouldFetchSuggestions, setShouldFetchSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{ idMeal: string; strMeal: string }>>([]);

  const labels: string[] = [];
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

  const LABEL_ADD_PREFIX = "Add: ";
  const LABEL_ADD_SUFFIX = "";
  const labelFilter = createFilterOptions<string>();

  const parseLabelOption = (entry: string) => {
    if (typeof entry === "string" && entry.startsWith(LABEL_ADD_PREFIX)) {
      return entry.slice(LABEL_ADD_PREFIX.length, entry.length - LABEL_ADD_SUFFIX.length);
    }
    return entry as string;
  };

  const createLabel = async (label: string) => {
    // minimal stub: return the label as created
    return label;
  };

  const handleSuggestionSelect = (idMeal: string) => {
    // stub: set recipeName or load details if desired
    setShowSuggestions(false);
  };

  const handleCreateRecipe = async (values: any) => {
    // stub implementation to avoid runtime errors
    message.info("Create recipe not implemented on this page.");
  };

  const [preparationValue, setPreparationValue] = useState<string>("");

  const [username, setUsername] = useState<string>("U");
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [sheetTopVh, setSheetTopVh] = useState<number>(SHEET_START_TOP_VH);
  const sheetScrollRef = useRef<HTMLDivElement | null>(null);

  const userId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  useEffect(() => {
    const stored = localStorage.getItem("username") ?? "U";
    setUsername(stored);
  }, []);

  useEffect(() => {
    const fetchRecipe = async () => {
      if (!recipeId) return;

      try {
        setLoading(true);

        const token = localStorage.getItem("token")?.replace(/"/g, "");
        if (!token) {
          throw new Error("No auth token found.");
        }

        const recipes = await apiService.get<Recipe[]>("/recipes", {
          Authorization: `Bearer ${token}`,
        });

        const numericRecipeId = Number(recipeId);
        const foundRecipe = recipes.find((r) => r.id === numericRecipeId);

        if (!foundRecipe) {
          throw new Error("Recipe not found.");
        }

        setRecipe(foundRecipe);
      } catch (error: unknown) {
        console.error("Failed to fetch recipe:", error);
        message.error(
          error instanceof Error ? error.message : "Failed to load recipe.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [recipeId, apiService, message]);

  useEffect(() => {
    if (recipe) {
      setRecipeName(recipe.title ?? "");
      setPreparationValue(recipe.preparation ?? "");

      // compute preview URL from recipe image by calling the backend image endpoint
      if (recipe.imageURL) {
        const imageUrl = recipe.imageURL;
        const apiDomain = getApiDomain();
        const endpoint = `${apiDomain}/recipes/${recipe.id}/image`;

        let objectUrl: string | null = null;

        (async () => {
          const token = typeof window !== "undefined" ? localStorage.getItem("token")?.replace(/"/g, "") : null;
          try {
            if (token) {
              const res = await fetch(endpoint, {
                headers: { Authorization: `Bearer ${token}` },
              });

              if (res.ok) {
                const blob = await res.blob();
                objectUrl = URL.createObjectURL(blob);
                setImagePreviewUrl(objectUrl);
                return;
              }
            }

            // fallback: construct URL from recipe.imageURL
            const src = imageUrl.startsWith("http") ? imageUrl : `${apiDomain}${imageUrl}`;
            setImagePreviewUrl(src);
          } catch (e) {
            const src = imageUrl.startsWith("http") ? imageUrl : `${apiDomain}${imageUrl}`;
            setImagePreviewUrl(src);
          }
        })();

        return () => {
          if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
      } else {
        setImagePreviewUrl(null);
      }
    }
  }, [recipe]);

  useEffect(() => {
    if (!recipe) return;

    // populate Ant Form fields (title, labels, ingredients, preparation)
    const formattedIngredients: Array<{ name: string; amount: string }> = [];
    if (recipe.ingredients && recipe.ingredients.length > 0) {
      for (let i = 0; i < recipe.ingredients.length; i += 2) {
        formattedIngredients.push({
          name: recipe.ingredients[i] || "",
          amount: recipe.ingredients[i + 1] || "",
        });
      }
    } else {
      formattedIngredients.push({ name: "", amount: "" });
    }

    const safeLabels = (recipe.labels ?? []).filter((l) => typeof l === "string" && l.trim() !== "");

    form.setFieldsValue({
      title: recipe.title ?? "",
      labels: safeLabels,
      ingredients: formattedIngredients,
      preparation: recipe.preparation ?? "",
    });

    setSelectedLabels(safeLabels);
  }, [recipe, form]);

  const ingredientPairs = useMemo(() => {
    if (!recipe?.ingredients || recipe.ingredients.length === 0) return [];

    const pairs: Array<{ name: string; amount: string }> = [];

    for (let i = 0; i < recipe.ingredients.length; i += 2) {
      pairs.push({
        name: recipe.ingredients[i] || "",
        amount: recipe.ingredients[i + 1] || "",
      });
    }

    return pairs;
  }, [recipe]);

  const handleSheetWheel: React.WheelEventHandler<HTMLDivElement> = (event) => {
    const sheetEl = sheetScrollRef.current;
    if (!sheetEl) return;

    const deltaY = event.deltaY;
    const isExpanded = sheetTopVh <= 0;
    const isAtContentTop = sheetEl.scrollTop <= 0;

    // Expand first on downward scroll before allowing inner content scrolling.
    if (!isExpanded && deltaY > 0) {
      event.preventDefault();
      setSheetTopVh((previousTop) => {
        const deltaVh = (deltaY / SHEET_EXPAND_RANGE_PX) * SHEET_START_TOP_VH;
        return Math.max(0, previousTop - deltaVh);
      });
      return;
    }

    // Collapse first on upward scroll when content is already at the top.
    if ((isExpanded || sheetTopVh < SHEET_START_TOP_VH) && deltaY < 0 && isAtContentTop) {
      event.preventDefault();
      setSheetTopVh((previousTop) => {
        const deltaVh = (Math.abs(deltaY) / SHEET_EXPAND_RANGE_PX) * SHEET_START_TOP_VH;
        return Math.min(SHEET_START_TOP_VH, previousTop + deltaVh);
      });
    }
  };

  const handleAddToShoppingList = async () => {
    const token = localStorage.getItem("token")?.replace(/"/g, "");

    if (!token) {
      message.error("No auth token found.");
      return;
    }

    if (ingredientPairs.length === 0) {
      message.warning("This recipe has no ingredients.");
      return;
    }

    try {
      await Promise.all(
        ingredientPairs
          .filter((ingredient) => ingredient.name.trim())
          .map((ingredient) =>
            apiService.post(
              "/shopping-list/items",
              {
                ingredientName: ingredient.name,
                quantity: ingredient.amount,
              },
              {
                Authorization: token,
              }
            )
          )
      );

      message.success("Ingredients added to shopping list.");
    } catch (error) {
      console.error("Failed to add ingredients to shopping list:", error);
      message.error("Failed to add ingredients to shopping list.");
    }
  };

  if (loading) {
    return <div style={{ padding: 24 }}>Loading...</div>;
  }

  if (!recipe) {
    return <div style={{ padding: 24 }}>Recipe not found.</div>;
  }

  const apiDomain = getApiDomain();

  const imageSrc = recipe.imageURL
    ? recipe.imageURL.startsWith("http")
      ? recipe.imageURL
      : `${apiDomain}${recipe.imageURL}`
    : null;

  const backdropSrc = imagePreviewUrl || imageSrc;
  const displayLabels = (recipe.labels ?? [])
    .map((label) => (typeof label === "string" ? label.trim() : ""))
    .filter((label) => label.length > 0);

  return (
    <div style={{ display: "flex", height: "100vh", background: "#fff", overflow: "hidden" }}>
      <Sidebar />

      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 3,
          }}
        >
          <Header title={recipe.title} rightContent={<UserAvatar />} />
        </div>

        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "#d8ded2",
            backgroundImage: backdropSrc ? `url(${backdropSrc})` : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.35) 100%)",
            pointerEvents: "none",
          }}
        />

        <div
          ref={sheetScrollRef}
          style={{
            position: "absolute",
            top: `${sheetTopVh}vh`,
            left: 0,
            right: 0,
            bottom: 0,
            background: "#fff",
            borderRadius: "30px 30px 0 0",
            overflowY: sheetTopVh <= 0 ? "auto" : "hidden",
            transition: "top 0.08s linear",
            boxShadow: "0 -8px 36px rgba(0, 0, 0, 0.18)",
          }}
          onWheel={handleSheetWheel}
        >
          <div
            style={{
              position: "sticky",
              top: 0,
              zIndex: 1,
              display: "flex",
              justifyContent: "center",
              paddingTop: 15,
              paddingBottom: 8,
              background: "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.82) 70%, rgba(255,255,255,0) 100%)",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                width: 56,
                height: 6,
                borderRadius: 999,
                background: "rgba(75, 102, 36, 0.35)",
              }}
            />
          </div>

          <div style={{ padding: "8px 24px 24px", minHeight: "100%" }}>
            <div>
              <h1 style={{ color: "rgba(75, 102, 36, 1)", marginBottom: 8 }}>{recipe.title}</h1>
              <div>
                {displayLabels.length > 0 && (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                    {displayLabels.map((label, index) => (
                      <Chip
                        key={index}
                        label={label}
                        sx={{
                          backgroundColor: "rgba(75, 102, 36, 1)",
                          color: "#fff",
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <br></br>

            <div style={{ display: "flex", gap: 10, flexDirection: isMobile ? "column" : "row" }}>
              <div style={{ flex: 1, width: isMobile ? "100%" : undefined }}>
                <h2 style={{ color: "rgba(75, 102, 36, 1)", marginBottom: 8 }}>Ingredients</h2>
                {ingredientPairs.length > 0 ? (
                  <List dense>
                    {ingredientPairs.map((ingredient, index) => (
                      <ListItem key={index} disableGutters style={{ marginBottom: 4 }}>
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: "88px 1fr",
                            columnGap: 1,
                            width: "100%",
                            alignItems: "baseline",
                          }}
                        >
                          <Typography variant="body1" color="rgba(75, 102, 36, 1)" sx={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                            {ingredient.amount}
                          </Typography>
                          <Typography variant="body1" color="rgba(75, 102, 36, 1)">
                            <strong>{ingredient.name}</strong>
                          </Typography>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                    <p>No ingredients listed.</p>
                )}
                <MuiButton variant="contained" onClick={handleAddToShoppingList} sx={{ marginTop: 2, backgroundColor: "rgba(75, 102, 36, 1)", "&:hover": { backgroundColor: "rgba(75, 102, 36, 0.85)" }, borderRadius: 20 }}>
                  Add to Shopping List
                </MuiButton>
              </div>

              <div style={{ flex: 2, width: isMobile ? "100%" : undefined, marginTop: isMobile ? 12 : 0 }}>
                <h2 style={{ color: "rgba(75, 102, 36, 1)", marginBottom: 8 }}>Preparation</h2>
                <p style={{ whiteSpace: "pre-line", color: "rgba(75, 102, 36, 1)", marginBottom: isMobile ? "100px" : 0 }}>{recipe.preparation}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <MuiButton
        type="button"
        variant="contained"
        startIcon={<Edit sx={{ fontSize: 20 }} />}
        onClick={() => router.push(`/recipe/${recipe.id}/edit`)}
        style={{
          position: "fixed",
          bottom: isMobile ? 80 : 32,
          right: isMobile ? 16 : 32,
          borderRadius: 24,
          height: 44,
          paddingLeft: 20,
          paddingRight: 20,
          fontWeight: 600,
          background: "white",
          color: "rgba(75, 102, 36, 1)",
          border: "none",
          textTransform: "none",
          display: "flex",
          alignItems: "center",
          gap: 6,
          zIndex: 1400,
        }}>
        Edit
      </MuiButton>
    </div>
  );
};

export default RecipeDetailPage;