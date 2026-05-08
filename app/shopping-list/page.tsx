"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar, {
  Header,
  UserAvatar,
} from "@/components/appLayout";

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

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f5f5f5",
      }}
    >
      <Sidebar />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Header
          title="Shopping List"
          rightContent={<UserAvatar />}
        />

        <div
          style={{
            padding: "24px",
            maxWidth: 800,
            width: "100%",
          }}
        >
          <Card
            sx={{
              padding: 3,
              borderRadius: 4,
              marginBottom: 3,
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
                  setIngredientName(
                    e.target.value
                  )
                }
              />

              <TextField
                fullWidth
                label="Quantity"
                value={quantity}
                onChange={(e) =>
                  setQuantity(
                    e.target.value
                  )
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
                  borderRadius: 3,
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 16,
                  }}
                >
                  {item.ingredientName}
                </div>

                <div
                  style={{
                    color: "#666",
                    marginTop: 4,
                  }}
                >
                  {item.quantity}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingListPage;