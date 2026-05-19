"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PageLayout } from "@/components/PageLayout";
import { Checkbox, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import useWindowSize from "@/hooks/useWndowSize";

import IconButton from "@mui/material/IconButton";
import { useApi } from "@/hooks/useApi";

import { TextField } from "@mui/material";

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
  const { isMobile } = useWindowSize();

  const [ingredientName, setIngredientName] =
    useState("");

  const [quantity, setQuantity] =
    useState("");

  const [items, setItems] = useState<
    ShoppingListItem[]
  >([]);
  const [ingredientBlurred, setIngredientBlurred] =
    useState(false);
  const [showNewItem, setShowNewItem] =
    useState(false);
  const isAddingRef = useRef(false);
  const quantityInputRef = useRef<HTMLInputElement | null>(
    null
  );

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
    if (
      !ingredientName.trim() ||
      !quantity.trim() ||
      !token ||
      isAddingRef.current
    )
      return;

    isAddingRef.current = true;

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
      setIngredientBlurred(false);
      setShowNewItem(false);

      fetchShoppingList(token);
    } catch (error) {
      console.error(
        "Failed to create shopping list item:",
        error
      );
    } finally {
      isAddingRef.current = false;
    }
  };

  useEffect(() => {
    if (
      showNewItem &&
      ingredientBlurred &&
      ingredientName.trim() &&
      quantity.trim() &&
      token &&
      !isAddingRef.current
    ) {
      handleAddItem();
    }
  }, [
    showNewItem,
    ingredientBlurred,
    ingredientName,
    quantity,
    token,
  ]);

  useEffect(() => {
    if (showNewItem) {
      quantityInputRef.current?.focus();
    }
  }, [showNewItem]);

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
          <div
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 4,
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
                <Checkbox
                  checked={item.completed}
                  onChange={() =>
                    handleToggleCompleted(item)
                  }
                  sx={{
                    color: "rgba(75, 102, 36, 1)",
                    "&.Mui-checked": {
                      color: "rgba(75, 102, 36, 1)",
                    },
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 4,
                  }}
                >
                  <div
                    style={{
                      color: "#666",
                      textDecoration:
                        item.completed
                          ? "line-through"
                          : "none",
                    }}
                  >
                    {item.quantity}
                  </div>
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
          </div>
        ))}
        {showNewItem && (
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 4,
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
                <div style={{ width: 40 }} />
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 8,
                    flex: 1,
                  }}
                >
                  <TextField
                    label="Quantity"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(e.target.value)
                    }
                    inputRef={quantityInputRef}
                    size="small"
                    sx={{
                      "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                        borderColor: "transparent",
                      },
                      "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "transparent",
                      },
                      "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "transparent",
                      },
                      "& .MuiInputLabel-root": { color: "#757" },
                      "& .MuiInputLabel-root.Mui-focused": { color: "#757" },
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Ingredient"
                    value={ingredientName}
                    onChange={(e) =>
                      setIngredientName(e.target.value)
                    }
                    onBlur={() =>
                      setIngredientBlurred(true)
                    }
                    onFocus={() =>
                      setIngredientBlurred(false)
                    }
                    size="small"
                    sx={{
                      "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                        borderColor: "transparent",
                      },
                      "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "transparent",
                      },
                      "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "transparent",
                      },
                      "& .MuiInputLabel-root": { color: "#757" },
                      "& .MuiInputLabel-root.Mui-focused": { color: "#757" },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Button
        type="button"
        variant="contained"
        startIcon={<AddIcon sx={{ fontSize: 20 }} />}
        onClick={() => setShowNewItem(true)}
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
        Ingredient
      </Button>
    </PageLayout>
  );
};

export default ShoppingListPage;