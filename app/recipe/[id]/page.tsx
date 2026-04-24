"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Row, Col, Avatar, Button, App } from "antd";
import { TextField } from "@mui/material";
import { useRouter, useParams } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { getApiDomain } from "@/utils/domain";
import Sidebar from "@/components/appLayout";
import { MenuOutlined } from "@ant-design/icons";

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

const RecipeDetailPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const apiService = useApi();
  const { message } = App.useApp();

  const recipeId = params?.id;

  const [username, setUsername] = useState<string>("U");
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

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

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f5f5" }}>
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
              Recipe Details
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
          <Row gutter={40}>
            <Col span={10}>
              <TextField
                label="Recipe Name"
                fullWidth
                value={recipe.title}
                disabled
                InputLabelProps={{ style: { color: "grey" } }}
                style={{ marginBottom: 24 }}
              />

              <div style={{ marginBottom: 24 }}>
                <span style={{ fontWeight: 500, color: "black" }}>
                  Recipe Types:
                </span>

                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    marginTop: 8,
                  }}
                >
                  {RECIPE_TYPES.map((type) => {
                    const isSelected = recipe.labels.includes(type);

                    return (
                      <Button
                        key={type}
                        disabled
                        style={{
                          background: isSelected ? "#4b6624" : "#f5f5f5",
                          borderColor: isSelected ? "#4b6624" : "#d9d9d9",
                          color: isSelected ? "white" : "#555",
                          cursor: "default",
                        }}
                      >
                        {type}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <span style={{ fontWeight: 500, color: "black" }}>
                  Dietary Types:
                </span>

                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    marginTop: 8,
                  }}
                >
                  {DIET_TYPES.map((type) => {
                    const isSelected = recipe.labels.includes(type);

                    return (
                      <Button
                        key={type}
                        disabled
                        style={{
                          background: isSelected ? "#4b6624" : "#f5f5f5",
                          borderColor: isSelected ? "#4b6624" : "#d9d9d9",
                          color: isSelected ? "white" : "#555",
                          cursor: "default",
                        }}
                      >
                        {type}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div>
                <span style={{ fontWeight: 500, color: "black" }}>
                  Recipe Ingredients:
                </span>

                <div style={{ marginTop: 10 }}>
                  {ingredientPairs.length > 0 ? (
                    ingredientPairs.map((ingredient, index) => (
                      <Row key={index} gutter={8} style={{ marginBottom: 10 }}>
                        <Col span={12}>
                          <TextField
                            fullWidth
                            value={ingredient.name}
                            disabled
                            label="Ingredient"
                            InputLabelProps={{ style: { color: "grey" } }}
                          />
                        </Col>

                        <Col span={12}>
                          <TextField
                            fullWidth
                            value={ingredient.amount}
                            disabled
                            label="Amount"
                            InputLabelProps={{ style: { color: "grey" } }}
                          />
                        </Col>
                      </Row>
                    ))
                  ) : (
                    <span style={{ color: "#888" }}>No ingredients provided.</span>
                  )}
                </div>
              </div>

              <div style={{ marginTop: 24 }}>
                <TextField
                  label="Preparation steps"
                  multiline
                  rows={10}
                  fullWidth
                  value={recipe.preparation}
                  disabled
                  InputLabelProps={{ style: { color: "grey" } }}
                  InputProps={{
                    style: {
                      backgroundColor: "#f5f5f5",
                    },
                  }}
                />
              </div>
            </Col>

            <Col span={14}>
              <div>
                {imageSrc ? (
                  <Image
                    src={imageSrc}
                    alt="recipe"
                    width={500}
                    height={500}
                    unoptimized
                    style={{
                      width: "100%",
                      height: "auto",
                      borderRadius: 8,
                      marginTop: 10,
                    }}
                  />
                ) : (
                  <div style={{ marginTop: 10, color: "#888" }}>
                    No image provided.
                  </div>
                )}
              </div>
            </Col>
          </Row>

          <div
            style={{
              marginTop: 30,
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Button onClick={() => router.push("/cookbook")}>Back</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetailPage;