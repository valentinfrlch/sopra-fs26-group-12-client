"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Form, Row, Col, App, Avatar } from "antd";
import {
  TextField,
  Button as MuiButton,
  Chip,
} from "@mui/material";
import { useRouter, useParams } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import Sidebar from "@/components/appLayout";
import { MenuOutlined } from "@ant-design/icons";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import UploadIcon from "@mui/icons-material/Upload";
import { getApiDomain } from "@/utils/domain";

interface RecipeIngredient {
  name: string;
  amount: string;
}

interface EditRecipeFormValues {
  title: string;
  types: string[];
  diet: string[];
  ingredients: RecipeIngredient[];
  preparation: string;
}

interface RecipeResponse {
  id: number;
  title: string;
  preparation: string;
  ingredients?: string[];
  labels: string[];
  imageURL?: string;
  userId?: number;
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

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const mapFlatIngredientsToForm = (ingredients?: string[]): RecipeIngredient[] => {
  if (!ingredients || ingredients.length === 0) {
    return [{ name: "", amount: "" }];
  }

  const mapped: RecipeIngredient[] = [];
  for (let i = 0; i < ingredients.length; i += 2) {
    mapped.push({
      name: ingredients[i] || "",
      amount: ingredients[i + 1] || "",
    });
  }

  return mapped.length > 0 ? mapped : [{ name: "", amount: "" }];
};

const EditRecipePage: React.FC = () => {
  const [form] = Form.useForm();
  const router = useRouter();
  const params = useParams();
  const apiService = useApi();
  const { message } = App.useApp();

  const recipeId = params?.id;

  const selectedTypes = Form.useWatch("types", form) || [];
  const selectedDiet = Form.useWatch("diet", form) || [];
  const preparationValue = Form.useWatch("preparation", form) || "";

  const [username, setUsername] = useState<string>("U");
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  const [loading, setLoading] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [existingImageURL, setExistingImageURL] = useState<string | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isBannerHovered, setIsBannerHovered] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

        const recipe = await apiService.get<RecipeResponse>(`/recipes/${recipeId}`, {
          Authorization: `Bearer ${token}`,
        });

        form.setFieldsValue({
          title: recipe.title,
          preparation: recipe.preparation,
          ingredients: mapFlatIngredientsToForm(recipe.ingredients),
          types: recipe.labels.filter((label) => RECIPE_TYPES.includes(label)),
          diet: recipe.labels.filter((label) => DIET_TYPES.includes(label)),
        });

        if (recipe.imageURL) {
          setExistingImageURL(
            `${getApiDomain()}${recipe.imageURL.startsWith("/") ? "" : "/"}${recipe.imageURL}`
          );
        } else {
          setExistingImageURL(null);
        }
      } catch (error: unknown) {
        console.error("Failed to fetch recipe:", error);
        message.error(
          error instanceof Error ? error.message : "Failed to load recipe."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [recipeId, apiService, form, message]);

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

  const displayImageUrl = useMemo(() => {
    if (imagePreviewUrl) return imagePreviewUrl;
    return existingImageURL;
  }, [imagePreviewUrl, existingImageURL]);

  const handleUpdateRecipe = async (values: EditRecipeFormValues) => {
    try {
      const formattedIngredients = values.ingredients.flatMap((ing) => [
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

      const token = localStorage.getItem("token")?.replace(/"/g, "");
      if (!token) {
        throw new Error("No auth token found.");
      }

      await apiService.put(`/recipes/${recipeId}`, formData, {
        Authorization: `Bearer ${token}`,
      });

      message.success("Recipe updated successfully!");
      router.push(`/recipe/${recipeId}`);
    } catch (error: unknown) {
      const apiError = error as ApiError;
      message.error(
        apiError.response?.data?.message || apiError.message || "Failed to update recipe"
      );
    }
  };

  if (loading) {
    return <div style={{ padding: 24 }}>Loading...</div>;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#fff" }}>
      <Sidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div
          style={{
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 24px",
            borderBottom: "1px solid #2a2d3a",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <MenuOutlined style={{ fontSize: 18, color: "#aaa" }} />
            <span style={{ fontWeight: 600, fontSize: 16, color: "#1a1a1a" }}>
              Edit Recipe
            </span>
          </div>

          <Avatar
            size={40}
            style={{
              background: "#f0f0f0",
              color: "#1a1a1a",
              cursor: "pointer",
              fontWeight: 600,
            }}
            onClick={() => router.push(`/users/${userId}`)}
          >
            {getInitials(username)}
          </Avatar>
        </div>

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
              backgroundImage: displayImageUrl ? `url(${displayImageUrl})` : "none",
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
              {displayImageUrl ? "Change image" : "Add image"}
            </MuiButton>
          </div>

          <Form
            form={form}
            layout="vertical"
            size="large"
            onFinish={handleUpdateRecipe}
          >
            <Row gutter={40}>
              <Col span={10}>
                <Form.Item
                  name="title"
                  rules={[{ required: true, message: "Please enter a recipe name!" }]}
                >
                  <TextField
                    label="Recipe Name"
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

                <Form.Item name="types">
                  <Row>
                    <span style={{ color: "black", fontWeight: 500, marginBottom: 10, marginTop: 8 }}>
                      Recipe Type
                    </span>
                  </Row>

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
                  <Row>
                    <span style={{ color: "black", fontWeight: 500, marginBottom: 10, marginTop: 8 }}>
                      Dietary Type
                    </span>
                  </Row>

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
              </Col>

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
              <MuiButton style={{ color: "#4b6624" }} onClick={() => router.push(`/cookbook`)}>
                Cancel
              </MuiButton>

              <MuiButton
                type="submit"
                variant="contained"
                style={{ background: "#4b6624", borderColor: "#4b6624", color: "white" }}
              >
                Save Changes
              </MuiButton>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default EditRecipePage;