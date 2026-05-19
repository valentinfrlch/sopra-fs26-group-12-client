"use client";

import React from "react";
import { Form } from "antd";
import { Button, TextField } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";

interface AuthFormProps {
  title: string;
  buttonText: string;
  isSubmitting: boolean;
  currentError: string;
  onFinish: (values: any) => void;
  extraFields?: React.ReactNode;
  footerText: React.ReactNode;
}

const AuthForm: React.FC<AuthFormProps> = ({
  title,
  buttonText,
  isSubmitting,
  currentError,
  onFinish,
  extraFields,
  footerText,
}) => {
  const [form] = Form.useForm();

  return (
    <Form
      form={form}
      size="large"
      variant="outlined"
      onFinish={onFinish}
      layout="vertical"
    >
      <Form.Item>
        <h1
          style={{
            color: "black",
            textAlign: "center",
            marginBottom: "20px",
          }}
        >
          {title}
        </h1>
      </Form.Item>

      {extraFields}

      <Form.Item
        name="username"
        rules={[
          {
            required: true,
            message: "Please input your username!",
          },
        ]}
      >
        <TextField label="Username" fullWidth />
      </Form.Item>

      <Form.Item
        name="password"
        rules={[
          {
            required: true,
            message: "Please input your password!",
          },
        ]}
      >
        <TextField
          label="Password"
          type="password"
          fullWidth
        />
      </Form.Item>

      <Form.Item>
        <Button
          variant="contained"
          className="login-button"
          disableElevation
          sx={{ boxShadow: "none" }}
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <CircularProgress
              size={24}
              sx={{ color: "white" }}
            />
          ) : (
            buttonText
          )}
        </Button>
      </Form.Item>

      <Form.Item>
        <p className="error-message">{currentError}</p>
      </Form.Item>

      {footerText}
    </Form>
  );
};

export default AuthForm;