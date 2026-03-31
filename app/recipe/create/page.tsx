"use client";

import React, { useState } from "react";
import { useApi } from "@/hooks/useApi";
import { Input, Button, Tag, Card, Upload, Row, Col, Space, App } from "antd";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

const RECIPE_TYPES = ["Breakfast", "Lunch", "Dinner"];
const DIET_TYPES = ["Vegetarian", "Vegan", "High Protein", "Low Carb"];
type SetStringList = React.Dispatch<React.SetStateAction<string[]>>;

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div style={{ marginBottom: 20 }}>
    <div style={{ marginBottom: 6, fontSize: 25, fontWeight: 600, color: "#000" }}>
      {title}
    </div>
    {children}
  </div>
);

const CreateRecipePage: React.FC = () => {
  const [title, setTitle] = useState("");
  const [preparation, setPreparation] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedDiet, setSelectedDiet] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState([
    { name: "", amount: "" }, // initial state
  ]);

  const router = useRouter();
  const apiService = useApi();
  const { message } = App.useApp();

  const toggle = (value: string, list: string[], setList: SetStringList) => {
    setList(
      list.includes(value)
        ? list.filter((v) => v !== value)
        : [...list, value]
    );
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { name: "", amount: "" }]);
  };

  const removeIngredient = () => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.slice(0, -1));
    }
  };

  const updateIngredient = (
    index: number,
    field: "name" | "amount",
    value: string
  ) => {
    const updated = [...ingredients];
    updated[index][field] = value;
    setIngredients(updated);
  };

  const handleCancel = () => {
    // reset all fields
    setTitle("");
    setPreparation("");
    setSelectedTypes([]);
    setSelectedDiet([]);
    setIngredients([{ name: "", amount: "" }]);

    router.push("/cookbook"); // redirect to cookbook
  };

  const handleCreateRecipe = async () => {
    /* check before creating recipe:
        -title (recipe name)
        -preparation
        -at least one ingredient with amount
        -has no empty ingredient fields
    */

    if (!title.trim()) {
      message.error("Please enter a recipe name");
      return;
    }

    if (!preparation.trim()) {
      message.error("Please enter preparation steps");
      return;
    }

    const hasEmptyIngredient = ingredients.some(
      (ing) => !ing.name.trim() || !ing.amount.trim()
    );

    if (hasEmptyIngredient) {
      message.error("Please fill out all ingredients");
      return;
    }

    // format ingredients to tuples
    const formattedIngredients = ingredients.map((ing) => [
        ing.name,
        ing.amount
    ]);

    // combine labels
    const labels = [...selectedTypes, ...selectedDiet];

    // recipe object
    const recipeData = {
        title,
        preparation,
        ingredients: formattedIngredients,
        labels,
        imageURL: "", // TODO: when implementing image upload logic
    };

    // send to backend
    try {
        // console.log("Sending:", recipeData);

        const rawToken = localStorage.getItem("token");
        const token = rawToken?.replace(/"/g, ""); // remove quotes
        // console.log("TOKEN:", token);

        await apiService.post("/recipes", recipeData, {
          Authorization: `Bearer ${token}`,
        });

        message.success("Recipe created successfully!");

        setTimeout(() => {
            router.push("/cookbook");
        }, 800);

        } catch (error) {
        console.error(error);
        message.error("Failed to create recipe");
    }
  };

  return (
    <App>
        <div style={{ background: "#f5f5f5", minHeight: "100vh", padding: 24 }}>
        <Card
            style={{
            background: "#fff",
            border: "1px solid #2a2d3a",
            borderRadius: 16,
            maxWidth: 1100,
            margin: "0 auto",
            }}
            styles={{ body: { padding: 24 } }}
        >
            <Row gutter={32}>
            {/* left side */}
            <Col span={12}>
                <div>

                <Section title="Recipe Name:">
                    <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter recipe name"
                    style={{
                        height: 44,
                        borderRadius: 5,
                        background: "#fff",
                        border: "1px solid #555",
                    }}
                    />
                </Section>

                <Section title="Select labels:">
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {RECIPE_TYPES.map((type) => (
                        <Tag
                        key={type}
                        onClick={() => toggle(type, selectedTypes, setSelectedTypes)}
                        style={{
                            cursor: "pointer",
                            borderRadius: 20,
                            padding: "4px 14px",
                            fontSize: 13,
                            background: selectedTypes.includes(type)
                            ? "#485F23"
                            : "#e4e1e1",
                            color: selectedTypes.includes(type)
                            ? "#fff"
                            : "#555",
                            border: "none",
                        }}
                        >
                        {type}
                        </Tag>
                    ))}
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                    {DIET_TYPES.map((type) => (
                        <Tag
                        key={type}
                        onClick={() => toggle(type, selectedDiet, setSelectedDiet)}
                        style={{
                            cursor: "pointer",
                            borderRadius: 20,
                            padding: "4px 14px",
                            fontSize: 13,
                            background: selectedDiet.includes(type)
                            ? "#485F23"
                            : "#e4e1e1",
                            color: selectedDiet.includes(type)
                            ? "#fff"
                            : "#555",
                            border: "none",
                        }}
                        >
                        {type}
                        </Tag>
                    ))}
                    </div>
                </Section>
                
                {/* TODO: add functionality to upload a picture */}
                <Section title="Upload a photo:">
                    <Upload>
                    <Button
                        className="recipe-button-secondary"
                        icon={<UploadOutlined />}
                        style={{ borderRadius: 10, height: 40}}
                    >
                        Upload
                    </Button>
                    </Upload>
                </Section>

                <Section title="Add ingredients:">
                    <Space orientation="vertical" style={{ width: "100%" }}>
                    {ingredients.map((ingredient, index) => (
                        <Row key={index} gutter={8}>
                        <Col span={12}>
                            <Input
                            value={ingredient.name}
                            placeholder="Ingredient name"
                            onChange={(e) =>
                                updateIngredient(index, "name", e.target.value)
                            }
                            style={{
                                height: 40,
                                borderRadius: 10,
                                background: "#f0f0f0",
                                border: "none",
                            }}
                            />
                        </Col>
                        <Col span={12}>
                            <Input
                            value={ingredient.amount}
                            placeholder="Amount"
                            onChange={(e) =>
                                updateIngredient(index, "amount", e.target.value)
                            }
                            style={{
                                height: 40,
                                borderRadius: 10,
                                background: "#f0f0f0",
                                border: "none",
                            }}
                            />
                        </Col>
                        </Row>
                    ))}

                    <Row gutter={8}>
                        <Col span={12}>
                            <Button
                            className="recipe-button-secondary"
                            icon={<PlusOutlined />}
                            onClick={addIngredient}
                            style={{ borderRadius: 10, height: 40, width: "100%" }}
                            >
                            add another Ingredient
                            </Button>
                        </Col>

                        <Col span={12}>
                            <Button
                            className="recipe-button-secondary"
                            onClick={removeIngredient}
                            disabled={ingredients.length === 1}
                            style={{ borderRadius: 10, height: 40, width: "100%" }}
                            >
                            delete last Ingredient
                            </Button>
                        </Col>
                    </Row>
                    </Space>
                </Section>
                </div>
            </Col>

            {/* ----- right side ----- */}
            <Col span={12}>
                <Section title="Preparation:">
                <Input.TextArea
                    value={preparation}
                    onChange={(e) => setPreparation(e.target.value)}
                    placeholder="Write preparation steps..."
                    style={{
                    height: "100%",
                    minHeight: 420,
                    borderRadius: 12,
                    background: "#fff",
                    color: "#000",
                    border: "1px solid #555",
                    }}
                />
                </Section>
            </Col>
            </Row>

            <Row justify="end" style={{ marginTop: 24 }}>
            <Space>
                <Button className="recipe-button-secondary" onClick={handleCancel} style={{ borderRadius: 10, height: 40 }}>
                Cancel
                </Button>

                <Button
                type="primary"
                className="recipe-button-primary"
                onClick={handleCreateRecipe}
                style={{ borderRadius: 10, height: 40, fontWeight: 600 }}
                >
                Create Recipe
                </Button>
            </Space>
            </Row>
        </Card>
        </div>
    </App>
  );
};

export default CreateRecipePage;