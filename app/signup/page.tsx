"use client";

import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col, App, Avatar } from "antd";
import { TextField } from "@mui/material";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import Sidebar from "@/components/appLayout";
import { MenuOutlined } from "@ant-design/icons";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import UploadIcon from "@mui/icons-material/Upload";

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

const CreateRecipePage: React.FC = () => {
  const [form] = Form.useForm();
  const selectedTypes = Form.useWatch("types", form) || [];
  const selectedDiet = Form.useWatch("diet", form) || [];

  const router = useRouter();
  const apiService = useApi();
  const { message } = App.useApp();

  const [username, setUsername] = useState<string>("U");
  const userId = localStorage.getItem("userId");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("username") ?? "U";
    setUsername(stored);
  }, []);

  const handleCreateRecipe = async (values: any) => {
    try {
      const formattedIngredients = values.ingredients.map((ing: any) => [
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

      await apiService.post("/recipes", formData, {
        Authorization: `Bearer ${token}`,
      });

      message.success("Recipe created successfully!");
      router.push("/cookbook");

    } catch (error: any) {
      message.error(
        error.response?.data?.message || "Failed to create recipe"
      );
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f5f5" }}>
      
      {/* sidebar from cookbook page */}
      <Sidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

        {/* header from cookbook page */}
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
              Create Recipe
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

        {/* create recipe page content */}
        <div style={{ padding: "24px", flex: 1 }}>
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
                  <TextField
                    label="Recipe Name"
                    fullWidth
                    InputLabelProps={{ style: { color: "grey" } }}
                  />
                </Form.Item>

                <Form.Item
                  label={<span style={{ color: "black", fontWeight: 500 }}>Select Recipe Type:</span>}
                  name="types"
                >
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {RECIPE_TYPES.map((type) => {
                      const isSelected = selectedTypes.includes(type);

                      return (
                        <Button
                          key={type}
                          onClick={() => {
                            const updated = isSelected
                              ? selectedTypes.filter((t: string) => t !== type)
                              : [...selectedTypes, type];

                            form.setFieldsValue({ types: updated });
                          }}
                          style={{
                            background: isSelected ? "#4b6624" : "#f5f5f5",
                            borderColor: isSelected ? "#4b6624" : "#d9d9d9",
                            color: isSelected ? "white" : "#555",
                          }}
                        >
                          {type}
                        </Button>
                      );
                    })}
                  </div>
                </Form.Item>

                <Form.Item
                  label={<span style={{ color: "black", fontWeight: 500 }}>Select Dietary Type:</span>}
                  name="diet"
                >
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {DIET_TYPES.map((type) => {
                      const isSelected = selectedDiet.includes(type);

                      return (
                        <Button
                          key={type}
                          onClick={() => {
                            const updated = isSelected
                              ? selectedDiet.filter((t: string) => t !== type)
                              : [...selectedDiet, type];

                            form.setFieldsValue({ diet: updated });
                          }}
                          style={{
                            background: isSelected ? "#4b6624" : "#f5f5f5",
                            borderColor: isSelected ? "#4b6624" : "#d9d9d9",
                            color: isSelected ? "white" : "#555",
                          }}
                        >
                          {type}
                        </Button>
                      );
                    })}
                  </div>
                </Form.Item>
                
                <Form.Item
                  label={<span style={{ color: "black", fontWeight: 500 }}>Recipe Ingredients:</span>}
                >
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

                        <Button onClick={() => add()} style={{ marginTop: 8 }}>
                          + add another Ingredient
                        </Button>
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
                    InputLabelProps={{ style: { color: "grey" } }}
                    InputProps={{
                        style: {
                        backgroundColor: "#f5f5f5",
                        },
                    }}
                    />
                </Form.Item>
                <Form.Item label={<span style={{ color: "black", fontWeight: 500 }}>Upload Picture:</span>}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setImageFile(e.target.files[0]);
                      }
                    }}
                  />

                  <Button
                    icon={<UploadIcon />}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!!imageFile}
                    style={{
                      background: !!imageFile ? "#e0e0e0" : "#f5f5f5",
                      borderColor: "#d9d9d9",
                      color: !!imageFile ? "#aaa" : "#555",
                      cursor: !!imageFile ? "not-allowed" : "pointer",
                    }}
                  >
                    Upload Image
                  </Button>

                  {imageFile && (
                    <div style={{ marginTop: 8, color: "#888" }}>
                      Selected: {imageFile.name}
                    </div>
                  )}
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
              <Button onClick={() => router.push("/cookbook")}>
                Cancel
              </Button>

              <Button
                type="primary"
                htmlType="submit"
                style={{
                  background: "#4b6624",
                  borderColor: "#4b6624",
                  color: "white",
                }}
              >
                Create Recipe
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default CreateRecipePage;