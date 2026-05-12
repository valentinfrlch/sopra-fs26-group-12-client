"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageLayout } from "@/components/PageLayout";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import IconButton from "@mui/material/IconButton";
import { useApi } from "@/hooks/useApi";

import {
  Button,
  Card,
  TextField,
} from "@mui/material";

interface ShoppingListItem {
  id: string;
  ingredientName: string;
  quantity: string;
  completed: boolean;
}

const ShoppingListPage: React.FC = () => {
  const api = useApi();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  const [ingredientName, setIngredientName] =
    useState("");

  const [quantity, setQuantity] =
    useState("");

  const [items, setItems] = useState<
    ShoppingListItem[]
  >([]);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (!storedToken) {
      router.push("/login");
      return;
    }

    const cleanedToken = storedToken.replace(/"/g, "");

    setToken(cleanedToken);

    fetchShoppingList(cleanedToken);
  }, []);

  const fetchShoppingList = async (authToken: string) => {
    try {
      const data = await api.get<ShoppingListItem[]>(
        "/shopping-list/items",
        {
          Authorization: authToken
        }
      );

      setItems(data);
    } catch (error) {
      console.error(
        "Failed to fetch shopping list:",
        error
      );

      localStorage.clear();
      router.push("/login");
    }
  };

  const handleAddItem = async () => {
    if (!ingredientName.trim() || !token) return;

    try {
      await api.post(
        "/shopping-list/items",
        {
          ingredientName,
          quantity,
        },
        {
          Authorization: token
        }
      );

      setIngredientName("");
      setQuantity("");

      fetchShoppingList(token);
    } catch (error) {
      console.error(
        "Failed to create shopping list item:",
        error
      );
    }
  };

  const handleToggleCompleted = async (
    item: ShoppingListItem
  ) => {
    if (!token) return;

    try {
      await api.put(
        `/shopping-list/items/${item.id}`,
        {
          completed: !item.completed,
        },
        {
          Authorization: token,
        }
      );

      fetchShoppingList(token);
    } catch (error) {
      console.error(
        "Failed to update shopping list item:",
        error
      );
    }
  };

  const handleDeleteItem = async (
    itemId: string
  ) => {
    if (!token) return;

    try {
      await api.delete(
        `/shopping-list/items/${itemId}`,
        {
          Authorization: token,
        }
      );

      fetchShoppingList(token);
    } catch (error) {
      console.error(
        "Failed to delete shopping list item:",
        error
      );
    }
  };

  return (
    <PageLayout title="Shopping List">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {items.map((item) => (
          <Card
            key={item.id}
            sx={{
              padding: 2,
              borderRadius: 4,
              boxShadow: "none",
              opacity: item.completed ? 0.7 : 1,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  flex: 1,
                }}
              >
                <IconButton
                  onClick={() =>
                    handleToggleCompleted(item)
                  }
                >
                  {item.completed ? (
                    <CheckCircleIcon
                      sx={{
                        color:
                          "rgba(75, 102, 36, 1)",
                      }}
                    />
                  ) : (
                    <CheckCircleOutlineIcon />
                  )}
                </IconButton>

                <div>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 16,
                      textDecoration:
                        item.completed
                          ? "line-through"
                          : "none",
                      color: item.completed
                        ? "#777"
                        : "#1a1a1a",
                    }}
                  >
                    {item.ingredientName}
                  </div>

                  <div
                    style={{
                      color: "#666",
                      marginTop: 4,
                      textDecoration:
                        item.completed
                          ? "line-through"
                          : "none",
                    }}
                  >
                    {item.quantity}
                  </div>
                </div>
              </div>

              <IconButton
                onClick={() =>
                  handleDeleteItem(item.id)
                }
              >
                <DeleteOutlineIcon />
              </IconButton>
            </div>
          </Card>
        ))}
      </div>

      <Card
        sx={{
          padding: 3,
          paddingBottom: 1,
          borderRadius: 4,
          marginTop: "auto",
          marginBottom: 0,
          boxShadow: "none",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 16,
            marginBottom: 16,
          }}
        >
          <TextField
            fullWidth
            label="Ingredient"
            value={ingredientName}
            onChange={(e) =>
              setIngredientName(e.target.value)
            }
          />

          <TextField
            fullWidth
            label="Quantity"
            value={quantity}
            onChange={(e) =>
              setQuantity(e.target.value)
            }
          />

          <Button
            variant="contained"
            onClick={handleAddItem}
            sx={{
              backgroundColor:
                "rgba(75, 102, 36, 1)",
              minWidth: 140,
            }}
          >
            Add
          </Button>
        </div>
      </Card>
    </PageLayout>
  );
};

export default ShoppingListPage;