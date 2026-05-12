"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Form, Row, Col, App } from "antd";
import {
  TextField,
  Button as MuiButton,
  Chip,
} from "@mui/material";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import { useRouter, useParams } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { PageLayout } from "@/components/PageLayout";
import useWindowSize from "@/hooks/useWndowSize";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import UploadIcon from "@mui/icons-material/Upload";
import Save from "@mui/icons-material/Save";
import { getApiDomain } from "@/utils/domain";

interface RecipeIngredient {
  name: string;
  amount: string;
}

interface EditRecipeFormValues {
  title: string;
  labels: string[];
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

const LABEL_ADD_PREFIX = 'Add new label "';
const LABEL_ADD_SUFFIX = '"';

const labelFilter = createFilterOptions<string>();

const parseLabelOption = (value: string): string => {
  if (value.startsWith(LABEL_ADD_PREFIX) && value.endsWith(LABEL_ADD_SUFFIX)) {
    return value.slice(LABEL_ADD_PREFIX.length, -LABEL_ADD_SUFFIX.length);
  }

  return value;
};

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

const normalizeLabels = (values?: Array<string | null | undefined>): string[] => {
  if (!values || values.length === 0) {
    return [];
  }

  return Array.from(
    new Set(
      values
        .map((value) => (typeof value === "string" ? value.trim() : ""))
        .filter((value) => value.length > 0),
    ),
  );
};

const EditRecipePage: React.FC = () => {
  const [form] = Form.useForm();
  const router = useRouter();
  const params = useParams();
  const apiService = useApi();
  const { message } = App.useApp();

  const recipeId = params?.id;

  const selectedLabels = Form.useWatch<string[]>("labels", form) || [];
  const preparationValue = Form.useWatch("preparation", form) || "";

  const [username, setUsername] = useState<string>("U");
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  const [loading, setLoading] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [existingImageURL, setExistingImageURL] = useState<string | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isBannerHovered, setIsBannerHovered] = useState(false);
  const [labels, setLabels] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const SHEET_START_TOP_VH = 33;
  const SHEET_EXPAND_RANGE_PX = 280;
  const { isMobile } = useWindowSize();
  const [sheetTopVh, setSheetTopVh] = useState<number>(SHEET_START_TOP_VH);
  const sheetScrollRef = useRef<HTMLDivElement | null>(null);

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
          labels: normalizeLabels(recipe.labels),
        });

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

  const displayImageUrl = useMemo(() => {
    if (imagePreviewUrl) return imagePreviewUrl;
    return existingImageURL;
  }, [imagePreviewUrl, existingImageURL]);

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
      setLabels((previous) => (previous.includes(normalized) ? previous : [...previous, normalized]));
      return normalized;
    } catch (error: unknown) {
      console.error("Failed to create label:", error);
      message.error(
        error instanceof Error ? error.message : "Failed to create label.",
      );
      return null;
    }
  };

  const handleUpdateRecipe = async (values: EditRecipeFormValues) => {
    try {
      const formattedIngredients = values.ingredients.flatMap((ing) => [
        ing.name,
        ing.amount,
      ]);
      const sanitizedLabels = normalizeLabels(values.labels);

      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("preparation", values.preparation);
      formData.append("ingredients", JSON.stringify(formattedIngredients));
      formData.append("labels", JSON.stringify(sanitizedLabels));

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
    <PageLayout
      title="Edit Recipe"
      contentStyle={{ padding: 0, background: "transparent", overflow: "hidden", position: "relative" }}
    >
      <div
        style={{
          position: "relative",
          height: 320,
          width: "100%",
          backgroundImage: displayImageUrl ? `url(${displayImageUrl})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.38) 60%, rgba(0,0,0,0.54) 100%)",
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

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: `${sheetTopVh}vh`,
          bottom: 0,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          background: "#fff",
          boxShadow: "0 -8px 30px rgba(0,0,0,0.12)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ height: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 40, height: 6, borderRadius: 6, background: "rgba(0,0,0,0.12)" }} />
        </div>

        <div
          ref={sheetScrollRef}
          onWheel={handleSheetWheel}
          style={{
            overflowY: "auto",
            padding: 24,
            flex: 1,
          }}
        >
          <Form
            id="edit-recipe-form"
            form={form}
            layout="vertical"
            size="large"
            onFinish={handleUpdateRecipe}
          >
            <Row gutter={40}>
              <Col span={isMobile ? 24 : 10}>
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
              </Col>

              <Col span={isMobile ? 24 : 14}>
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

            <div style={{ marginTop: 30, display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <MuiButton style={{ color: "#4b6624" }} onClick={() => router.push(`/cookbook`)}>
                Cancel
              </MuiButton>

              <MuiButton type="submit" variant="contained" style={{ background: "#4b6624", borderColor: "#4b6624", color: "white" }}>
                Save Changes
              </MuiButton>
            </div>
          </Form>
        </div>
      </div>
    </PageLayout>
  );
};

export default EditRecipePage;