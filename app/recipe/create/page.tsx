"use client";

import React, { useEffect, useRef, useState } from "react";
import { Form, Row, Col, App } from "antd";
import { TextField, Button as MuiButton, Chip, List, ListItemButton, ListItemText, Paper, LinearProgress } from "@mui/material";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { PageLayout } from "@/components/PageLayout";
import useWindowSize from "@/hooks/useWndowSize";
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
  labels: string[];
  ingredients: RecipeIngredient[];
  preparation: string;
}

interface LabelResponse {
  name?: string;
  label?: string;
}

interface ApiError {
  response?: {
    data?: {
      message: string;
    };
  };
  message: string;
}

const SHEET_START_TOP_VH = 33;
const SHEET_EXPAND_RANGE_PX = 280;

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

const LABEL_ADD_PREFIX = "Add new label \"";
const LABEL_ADD_SUFFIX = "\"";

const labelFilter = createFilterOptions<string>();

const parseLabelOption = (value: string): string => {
  if (value.startsWith(LABEL_ADD_PREFIX) && value.endsWith(LABEL_ADD_SUFFIX)) {
    return value.slice(LABEL_ADD_PREFIX.length, -LABEL_ADD_SUFFIX.length);
  }
  return value;
};

const CreateRecipePage: React.FC = () => {
  const [form] = Form.useForm();
  const selectedLabels = Form.useWatch<string[]>("labels", form) ?? [];

  const router = useRouter();
  const apiService = useApi();
  const { message } = App.useApp();
  const { isMobile } = useWindowSize();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isBannerHovered, setIsBannerHovered] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [sheetTopVh, setSheetTopVh] = useState<number>(SHEET_START_TOP_VH);
  const sheetScrollRef = useRef<HTMLDivElement | null>(null);

  // store input for API suggestions
  const [recipeName, setRecipeName] = useState("");
  const [debouncedRecipeName, setDebouncedRecipeName] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [shouldFetchSuggestions, setShouldFetchSuggestions] = useState(true);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [labels, setLabels] = useState<string[]>([]);

  const preparationValue = Form.useWatch("preparation", form) || "";

  // store suggestions from API
  const [suggestions, setSuggestions] = useState<MealSuggestion[]>([]);

  const populateMealDetails = async (meal: MealDetail) => {
    const ingredients: RecipeIngredient[] = [];

    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`]?.trim();
      const amount = meal[`strMeasure${i}`]?.trim() || "";

      if (ingredient) {
        ingredients.push({ name: ingredient, amount });
      }
    }

    const populatedIngredients =
      ingredients.length > 0 ? ingredients : [{ name: "", amount: "" }];

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

    if (meal.strMealThumb) {
      try {
        const mealImageFile = await fetchMealImageFile(
          meal.strMealThumb,
          meal.strMeal
        );
        setImageFile(mealImageFile);
      } catch {
        setImageFile(null);
        console.warn("Failed to fetch image for the selected recipe.");
      }
    } else {
      setImageFile(null);
    }
  };

  const handleSuggestionSelect = async (mealId: string) => {
    try {
      const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
      const data = await res.json();
      const meal: MealDetail | undefined = data?.meals?.[0];

      if (!meal) {
        message.error("Could not load recipe details");
        return;
      }

      await populateMealDetails(meal);
    } catch {
      message.error("Failed to fetch recipe details");
    }
  };

  useEffect(() => {
    const loadRandomMeal = async () => {
      const storedRandomMeal = sessionStorage.getItem("randomMealRecipe");

      if (!storedRandomMeal) return;

      try {
        const meal: MealDetail = JSON.parse(storedRandomMeal);

        await populateMealDetails(meal);

        sessionStorage.removeItem("randomMealRecipe");
      } catch {
        message.error("Failed to load random recipe");
        sessionStorage.removeItem("randomMealRecipe");
      }
    };

    loadRandomMeal();
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

  useEffect(() => {
    const fetchLabels = async () => {
      try {
        const token = localStorage.getItem("token")?.replace(/"/g, "");
        if (!token) {
          throw new Error("No auth token found.");
        }

        const response = await apiService.get<Array<string | LabelResponse>>(
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
        message.error(
          error instanceof Error ? error.message : "Failed to load labels.",
        );
      }
    };

    fetchLabels();
  }, [apiService, message]);

  const createLabel = async (labelName: string): Promise<string | null> => {
    const trimmed = labelName.trim();
    if (!trimmed) return null;

    try {
      const token = localStorage.getItem("token")?.replace(/"/g, "");
      if (!token) {
        throw new Error("No auth token found.");
      }

      const formData = new FormData();
      formData.append("name", trimmed);

      const created = await apiService.post<LabelResponse>("/labels", formData, {
        Authorization: `Bearer ${token}`,
      });

      const normalized = created?.name || created?.label || trimmed;
      setLabels((prev) => (prev.includes(normalized) ? prev : [...prev, normalized]));
      return normalized;
    } catch (error: unknown) {
      console.error("Failed to create label:", error);
      message.error(
        error instanceof Error ? error.message : "Failed to create label.",
      );
      return null;
    }
  };

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
        JSON.stringify(values.labels || [])
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

  const handleSheetWheel: React.WheelEventHandler<HTMLDivElement> = (event) => {
    const sheetEl = sheetScrollRef.current;

    if (!sheetEl) return;

    const deltaY = event.deltaY;
    const isExpanded = sheetTopVh <= 0;
    const isAtContentTop = sheetEl.scrollTop <= 0;

    if (!isExpanded && deltaY > 0) {
      event.preventDefault();
      setSheetTopVh((previousTop) => {
        const deltaVh = (deltaY / SHEET_EXPAND_RANGE_PX) * SHEET_START_TOP_VH;
        return Math.max(0, previousTop - deltaVh);
      });
      return;
    }

    if ((isExpanded || sheetTopVh < SHEET_START_TOP_VH) && deltaY < 0 && isAtContentTop) {
      event.preventDefault();
      setSheetTopVh((previousTop) => {
        const deltaVh = (Math.abs(deltaY) / SHEET_EXPAND_RANGE_PX) * SHEET_START_TOP_VH;
        return Math.min(SHEET_START_TOP_VH, previousTop + deltaVh);
      });
    }
  };

  return (
    <PageLayout
      title="Create New Recipe"
      contentStyle={{
        padding: 0,
        background: "transparent",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          minHeight: 0,
          overflow: "hidden",
        }}
        onMouseEnter={() => setIsBannerHovered(true)}
        onMouseLeave={() => setIsBannerHovered(false)}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "#d8ded2",
            backgroundImage: imagePreviewUrl ? `url(${imagePreviewUrl})` : "none",
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

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg"
          style={{ display: "none" }}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              const file = e.target.files[0];

              const isValidType = file.type === "image/png" || file.type === "image/jpeg";

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
            zIndex: 4,
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
            <Form
              form={form}
              layout="vertical"
              size="large"
              onFinish={handleCreateRecipe}
              initialValues={{
                title: "",
                labels: [],
                ingredients: [{ name: "", amount: "" }],
                preparation: "",
              }}
            >
              <div style={{ display: "flex", gap: 10, flexDirection: isMobile ? "column" : "row" }}>
                <div style={{ flex: 1, width: isMobile ? "100%" : undefined }}>
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
                            {suggestions.map((meal) => (
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

                  <Form.Item name="labels">
                    <Row>
                      <span style={{ color: "black", fontWeight: 500, marginBottom: 10, marginTop: 8 }}>
                        Labels
                      </span>
                    </Row>
                    <Autocomplete
                      multiple
                      freeSolo
                      options={labels}
                      filterOptions={(options, params) => {
                        const selectedSet = new Set(selectedLabels.map((label) => label.toLowerCase()));
                        const availableOptions = options.filter(
                          (option) => !selectedSet.has(option.toLowerCase()),
                        );
                        const filtered = labelFilter(availableOptions, params);
                        const inputValue = params.inputValue.trim();
                        const isExisting = availableOptions.some(
                          (option) => option.toLowerCase() === inputValue.toLowerCase(),
                        );

                        if (inputValue !== "" && !isExisting) {
                          filtered.push(`${LABEL_ADD_PREFIX}${inputValue}${LABEL_ADD_SUFFIX}`);
                        }

                        return filtered;
                      }}
                      value={selectedLabels}
                      onChange={async (_, newValue) => {
                        const nextLabels: string[] = [];

                        for (const entry of newValue) {
                          const parsed = parseLabelOption(entry);
                          const isExisting = labels.some(
                            (label) => label.toLowerCase() === parsed.toLowerCase(),
                          );

                          if (isExisting) {
                            nextLabels.push(parsed);
                            continue;
                          }

                          const created = await createLabel(parsed);
                          if (created) nextLabels.push(created);
                        }

                        form.setFieldsValue({ labels: nextLabels });
                      }}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            {...getTagProps({ index })}
                            key={option}
                            label={option}
                            sx={{
                              backgroundColor: "rgba(75, 102, 36, 1)",
                              color: "#fff",
                              "& .MuiChip-deleteIcon": {
                                color: "rgba(255, 255, 255, 0.7)",
                              },
                            }}
                          />
                        ))
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Labels"
                          placeholder="Add labels"
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
                      )}
                    />
                  </Form.Item>

                  <Form.Item>
                    <Row>
                      <span style={{ color: "black", fontWeight: 500, marginBottom: 12, marginTop: 8 }}>
                        Ingredients
                      </span>
                    </Row>
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
                </div>

                <div style={{ flex: 2, width: isMobile ? "100%" : undefined, marginTop: isMobile ? 12 : 0 }}>
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
                </div>
              </div>

              <div
                style={{
                  marginTop: 30,
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 10,
                }}
              >
                <MuiButton style={{ color: "#4b6624" }} onClick={() => router.push("/cookbook")}>
                  Cancel
                </MuiButton>

                <MuiButton
                  type="submit"
                  variant="contained"
                  style={{ background: "#4b6624", borderColor: "#4b6624", color: "white" }}
                >
                  Create Recipe
                </MuiButton>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default CreateRecipePage;