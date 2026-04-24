"use client";

import React, { useState, useEffect } from "react";
import { Form, Row, Col, App, Avatar } from "antd";
import { TextField, Button as MuiButton, Chip, List, ListItemButton, ListItemText, Paper, LinearProgress } from "@mui/material";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import Sidebar, { Header, UserAvatar } from "@/components/appLayout";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import UploadIcon from "@mui/icons-material/Upload";

interface RecipeIngredient {
  name: string;
  amount: string;
}

interface MealSuggestion {
  idMeal: string;
  strMeal: string;
}

interface MealDetail {
  idMeal: string;
  strMeal: string;
  strInstructions?: string;
  strMealThumb?: string;
  [key: string]: string | undefined;
}

interface CreateRecipeFormValues {
  title: string;
  types: string[];
  diet: string[];
  ingredients: RecipeIngredient[];
  preparation: string;
}

interface ApiError {
  response?: {
    data?: {
      message: string;
    };
  };
  message: string;
}

const RECIPE_TYPES = ["Breakfast", "Lunch", "Dinner"];
const DIET_TYPES = ["Vegetarian", "Vegan", "High Protein", "Low Carb"];

const fetchMealImageFile = async (imageUrl: string, mealName: string): Promise<File> => {
  /* Handles downloading the image file from mealDB API */
  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new Error("Failed to fetch image");
  }

  const blob = await response.blob();
  const contentType = blob.type || "image/jpeg";
  const extension = contentType.includes("png") ? "png" : "jpg";

  return new File([blob], `${mealName}.${extension}`, { type: contentType });
};

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const CreateRecipePage: React.FC = () => {
  const [form] = Form.useForm();
  const selectedTypes = Form.useWatch("types", form) || [];
  const selectedDiet = Form.useWatch("diet", form) || [];

  const router = useRouter();
  const apiService = useApi();
  const { message } = App.useApp();

  const [username, setUsername] = useState<string>("U");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isBannerHovered, setIsBannerHovered] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // store input for API suggestions
  const [recipeName, setRecipeName] = useState("");
  const [debouncedRecipeName, setDebouncedRecipeName] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [shouldFetchSuggestions, setShouldFetchSuggestions] = useState(true);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);

  const preparationValue = Form.useWatch("preparation", form) || "";

  // store suggestions from API
  const [suggestions, setSuggestions] = useState<MealSuggestion[]>([]);

  const handleSuggestionSelect = async (mealId: string) => {
    try {
      const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
      const data = await res.json();
      const meal: MealDetail | undefined = data?.meals?.[0];

      if (!meal) {
        message.error("Could not load recipe details");
        return;
      }

      const ingredients: RecipeIngredient[] = [];

      for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`]?.trim();
        const amount = meal[`strMeasure${i}`]?.trim() || "";

        if (ingredient) {
          ingredients.push({ name: ingredient, amount });
        }
      }

      const populatedIngredients = ingredients.length > 0 ? ingredients : [{ name: "", amount: "" }];

      console.log("Meal Thumb: ", meal.strMealThumb);

      if (meal.strMealThumb) {
        try {
          const mealImageFile = await fetchMealImageFile(meal.strMealThumb, meal.strMeal);
          setImageFile(mealImageFile);
          console.log("Fetched image file from API:", mealImageFile);
        } catch {
          setImageFile(null);
          console.warn("Failed to fetch image for the selected recipe, proceeding without it.");
        }
      } else {
        setImageFile(null);
        console.warn("No image available for the selected recipe.");
      }

      setShouldFetchSuggestions(false);
      setRecipeName(meal.strMeal);
      setDebouncedRecipeName("");
      form.setFieldsValue({
        title: meal.strMeal,
        preparation: meal.strInstructions || "",
        ingredients: populatedIngredients,
      });
      setSuggestions([]);
      setShowSuggestions(false);
    } catch {
      message.error("Failed to fetch recipe details");
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("username") ?? "U";
    setUsername(stored);
  }, []);

  useEffect(() => {
    if (!imageFile) {
      setImagePreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(imageFile);
    setImagePreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [imageFile]);

  // debouncing for less API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedRecipeName(recipeName);
    }, 250);

    return () => {
      clearTimeout(handler);
    };
  }, [recipeName]);

  // API call
  useEffect(() => {
    if (!shouldFetchSuggestions) {
      setSuggestions([]);
      setIsFetchingSuggestions(false);
      return;
    }

    if (!debouncedRecipeName || debouncedRecipeName.length < 2) {
      setSuggestions([]); // clear dropdown when input to short
      setShowSuggestions(false);
      setIsFetchingSuggestions(false);
      return;
    }

    const fetchRecipes = async () => {
      setIsFetchingSuggestions(true);
      try {
        const res = await fetch(
          `https://www.themealdb.com/api/json/v1/1/search.php?s=${debouncedRecipeName}`
        );
        const data = await res.json();

        // only store 3 suggestions
        data.meals = data.meals ? data.meals.slice(0, 3) : [];

        setSuggestions(data.meals || []); // store API results
        setShowSuggestions(Boolean(data.meals?.length));
        console.log("API result:", data);
      } catch (error) {
        console.error("API error:", error);
        setSuggestions([]); // clear dropdown
        setShowSuggestions(false);
      } finally {
        setIsFetchingSuggestions(false);
      }
    };

    fetchRecipes();
  }, [debouncedRecipeName]);

  const handleCreateRecipe = async (values: CreateRecipeFormValues) => {
    try {
      const formattedIngredients = values.ingredients.map((ing: RecipeIngredient) => [
        ing.name,
        ing.amount,
      ]);

      const formData = new FormData();

      formData.append("title", values.title);
      formData.append("preparation", values.preparation);
      formData.append("ingredients", JSON.stringify(formattedIngredients));
      formData.append(
        "labels",
        JSON.stringify([...(values.types || []), ...(values.diet || [])])
      );

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const token = typeof window !== "undefined"
        ? localStorage.getItem("token")
        : null;

      await apiService.post("/recipes", formData, {
        Authorization: `Bearer ${token}`,
      });

      message.success("Recipe created successfully!");
      router.push("/cookbook");

    } catch (error: unknown) {
      const apiError = error as ApiError;
      message.error(
        apiError.response?.data?.message || "Failed to create recipe"
      );
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#fff" }}>

      {/* sidebar from cookbook page */}
      <Sidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

        <Header
          title="Create New Recipe"
          rightContent={<UserAvatar />}
        />

        {/* create recipe page content */}
        <div style={{ padding: "24px", flex: 1 }}>
          <div
            onMouseEnter={() => setIsBannerHovered(true)}
            onMouseLeave={() => setIsBannerHovered(false)}
            style={{
              position: "relative",
              marginBottom: 24,
              marginLeft: -24,
              marginRight: -24,
              marginTop: -24,
              height: 250,
              backgroundColor: "#fff",
              backgroundImage: imagePreviewUrl ? `url(${imagePreviewUrl})` : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg"
              style={{ display: "none" }}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const file = e.target.files[0];

                  const isValidType =
                    file.type === "image/png" || file.type === "image/jpeg";

                  if (!isValidType) {
                    message.error("Only .PNG and .JPEG files are allowed");
                    return;
                  }

                  setImageFile(file);
                }
              }}
            />

            <MuiButton
              onClick={() => fileInputRef.current?.click()}
              startIcon={<UploadIcon />}
              variant="contained"
              size="small"
              sx={{
                position: "absolute",
                top: 16,
                right: 16,
                backgroundColor: "rgba(26, 26, 26, 0.82)",
                color: "#fff",
                opacity: isBannerHovered ? 1 : 0,
                pointerEvents: isBannerHovered ? "auto" : "none",
                transition: "opacity 160ms ease",
                boxShadow: "0 8px 20px rgba(0, 0, 0, 0.18)",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "rgba(26, 26, 26, 0.92)",
                },
              }}
            >
              {imageFile ? "Change image" : "Add image"}
            </MuiButton>
          </div>

          <Form
            form={form}
            layout="vertical"
            size="large"
            onFinish={handleCreateRecipe}
            initialValues={{
              ingredients: [{ name: "", amount: "" }],
            }}
          >
            <Row gutter={40}>
              {/* left column */}
              <Col span={10}>
                <Form.Item
                  name="title"
                  rules={[{ required: true, message: "Please enter a recipe name!" }]}
                >
                  <div style={{ position: "relative" }}>
                    <TextField
                      label="Recipe Name"
                      fullWidth
                      value={recipeName}
                      onChange={(e) => {
                        setShouldFetchSuggestions(true);
                        setRecipeName(e.target.value);
                        form.setFieldsValue({ title: e.target.value });
                        setShowSuggestions(true);
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#4b6624",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#4b6624",
                          },
                        },
                      }}
                      InputLabelProps={{ style: { color: "grey" } }}
                    />

                    {isFetchingSuggestions && (
                      <LinearProgress
                        variant="indeterminate"
                        sx={{
                          mt: 1,
                          borderRadius: 999,
                          "& .MuiLinearProgress-bar": {
                            backgroundColor: "#4b6624",
                          },
                        }}
                      />
                    )}

                    {/* Dropdown for suggestions*/}
                    {showSuggestions && suggestions.length > 0 && (
                      <Paper
                        elevation={3}
                        sx={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          right: 0,
                          zIndex: 10,
                          mt: 0.5,
                          maxHeight: 220,
                          overflowY: "auto",
                          border: "1px solid #d9d9d9",
                        }}
                      >
                        <List disablePadding>
                          {suggestions.map((meal, index) => (
                            <ListItemButton
                              key={meal.idMeal}
                              onClick={() => handleSuggestionSelect(meal.idMeal)}
                              sx={{
                                "&:hover": {
                                  backgroundColor: "rgba(75, 102, 36, 0.08)",
                                },
                              }}
                            >
                              <ListItemText
                                primary={meal.strMeal}
                                primaryTypographyProps={{
                                  color: "#1a1a1a",
                                  fontSize: 14,
                                }}
                              />
                            </ListItemButton>
                          ))}
                        </List>
                      </Paper>
                    )}
                  </div>
                </Form.Item>

                <Form.Item name="types">
                  <Row><span style={{ color: "black", fontWeight: 500, marginBottom: 10, marginTop: 8 }}>Recipe Type</span></Row>

                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {RECIPE_TYPES.map((type) => {
                      const isSelected = selectedTypes.includes(type);

                      return (
                        <Chip
                          key={type}
                          label={type}
                          clickable
                          variant={isSelected ? "filled" : "outlined"}
                          onClick={() => {
                            const updated = isSelected
                              ? selectedTypes.filter((t: string) => t !== type)
                              : [...selectedTypes, type];

                            form.setFieldsValue({ types: updated });
                          }}
                          sx={{
                            backgroundColor: isSelected ? "rgba(75, 102, 36, 1)" : "rgba(75, 102, 36, 0.07)",
                            borderColor: "transparent",
                            color: isSelected ? "#fff" : "#4b6624",
                            "&:hover": {
                              backgroundColor: isSelected ? "#3d541d" : "#ebebeb",
                            },
                          }}
                        />
                      );
                    })}
                  </div>
                </Form.Item>

                <Form.Item name="diet">
                  <Row><span style={{ color: "black", fontWeight: 500, marginBottom: 10, marginTop: 8 }}>Dietary Type</span></Row>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {DIET_TYPES.map((type) => {
                      const isSelected = selectedDiet.includes(type);

                      return (
                        <Chip
                          key={type}
                          label={type}
                          clickable
                          variant={isSelected ? "filled" : "outlined"}
                          onClick={() => {
                            const updated = isSelected
                              ? selectedDiet.filter((t: string) => t !== type)
                              : [...selectedDiet, type];

                            form.setFieldsValue({ diet: updated });
                          }}
                          sx={{
                            backgroundColor: isSelected ? "rgba(75, 102, 36, 1)" : "rgba(75, 102, 36, 0.07)",
                            borderColor: "transparent",
                            color: isSelected ? "#fff" : "#4b6624",
                            "&:hover": {
                              backgroundColor: isSelected ? "#3d541d" : "#ebebeb",
                            },
                          }}
                        />
                      );
                    })}
                  </div>
                </Form.Item>

                <Form.Item>
                  <Row><span style={{ color: "black", fontWeight: 500, marginBottom: 12, marginTop: 8 }}>Ingredients</span></Row>
                  <Form.List name="ingredients">
                    {(fields, { add, remove }) => (
                      <>
                        {fields.map(({ key, name, ...restField }) => (
                          <Row key={key} gutter={8} align="middle">
                            <Col span={10}>
                              <Form.Item
                                {...restField}
                                name={[name, "name"]}
                                rules={[{ required: true, message: "Enter ingredient name!" }]}
                              >
                                <TextField
                                  label="Ingredient"
                                  fullWidth
                                  InputLabelProps={{ style: { color: "grey" } }}
                                  sx={{
                                    "& .MuiOutlinedInput-root": {
                                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                        borderColor: "#4b6624",
                                      },
                                      "&:hover .MuiOutlinedInput-notchedOutline": {
                                        borderColor: "#4b6624",
                                      },
                                    },
                                  }}
                                />
                              </Form.Item>
                            </Col>

                            <Col span={10}>
                              <Form.Item
                                {...restField}
                                name={[name, "amount"]}
                                rules={[{ required: true, message: "Enter an amount!" }]}
                              >
                                <TextField
                                  label="Amount"
                                  fullWidth
                                  InputLabelProps={{ style: { color: "grey" } }}
                                  sx={{
                                    "& .MuiOutlinedInput-root": {
                                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                        borderColor: "#4b6624",
                                      },
                                      "&:hover .MuiOutlinedInput-notchedOutline": {
                                        borderColor: "#4b6624",
                                      },
                                    },
                                  }}
                                />
                              </Form.Item>
                            </Col>

                            <Col span={4}>
                              <DeleteOutlineIcon
                                onClick={() => {
                                  if (fields.length === 1) {
                                    // clear fields instead of removing last row
                                    form.setFieldsValue({
                                      ingredients: [{ name: "", amount: "" }],
                                    });
                                  } else {
                                    remove(name);
                                  }
                                }}
                                style={{
                                  cursor: "pointer",
                                  color: "#888",
                                  marginTop: 8,
                                }}
                              />
                            </Col>
                          </Row>
                        ))}

                        <MuiButton
                          onClick={() => add()}
                          variant="text"
                          sx={{
                            marginTop: 1,
                            color: "#4b6624",
                            "&:hover": {
                              backgroundColor: "rgba(75, 102, 36, 0.08)",
                            },
                          }}
                        >
                          + add another Ingredient
                        </MuiButton>
                      </>
                    )}
                  </Form.List>
                </Form.Item>
              </Col>

              {/* right column */}
              <Col span={14}>
                <Form.Item
                  name="preparation"
                  rules={[{ required: true, message: "Enter preparation steps!" }]}
                >
                  <TextField
                    label="Preparation steps"
                    multiline
                    rows={18}
                    fullWidth
                    value={preparationValue}
                    onChange={(e) => form.setFieldsValue({ preparation: e.target.value })}
                    InputLabelProps={{ style: { color: "grey" }, shrink: true }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#4b6624",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#4b6624",
                        },
                      },
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <div
              style={{
                marginTop: 30,
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
              }}
            >
              <MuiButton style={{ color: "#4b6624" }} onClick={() => router.push("/cookbook")}>Cancel</MuiButton>

              <MuiButton type="submit" variant="contained" style={{ background: "#4b6624", borderColor: "#4b6624", color: "white" }}>
                Create Recipe
              </MuiButton>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default CreateRecipePage;