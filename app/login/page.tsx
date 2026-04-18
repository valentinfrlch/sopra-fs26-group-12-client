"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering

import { useRouter } from "next/navigation"; // use NextJS router for navigation
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
// import { User } from "@/types/user";
import { Form } from "antd";
import { Button, TextField } from "@mui/material";
import React, { useState } from "react";
import { UserGetDTO } from "@/types/api";
// Optionally, you can import a CSS module or file for additional styling:
// import styles from "@/styles/page.module.css";

interface FormFieldProps {
  label: string;
  value: string;
}

const Login: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();
  const [currentError, setCurrentError] = useState<string>("");
  // useLocalStorage hook example use
  // The hook returns an object with the value and two functions
  // Simply choose what you need from the hook:
  const {
    // value: token, // is commented out because we do not need the token value
    set: setToken, // we need this method to set the value of the token to the one we receive from the POST request to the backend server API
    // clear: clearToken, // is commented out because we do not need to clear the token when logging in
  } = useLocalStorage<string>("token", ""); // note that the key we are selecting is "token" and the default value we are setting is an empty string
  // if you want to pick a different token, i.e "usertoken", the line above would look as follows: } = useLocalStorage<string>("usertoken", "");

  const handleLogin = async (values: FormFieldProps) => {
    try {
      const response = await apiService.post<UserGetDTO>("/users/login", values);

      if (response.token) {
        setToken(response.token);
      }
      
      if (response.id && response.username) {
      localStorage.setItem("userId", String(response.id));
      localStorage.setItem("username", response.username);
    }

      router.push("/cookbook");
    } catch (error) {
      if (error instanceof Error) {
        // try to parse the string as json
        const jsonStart = error.message.indexOf("{");
        const jsonEnd = error.message.lastIndexOf("}") + 1;
        const parsed = JSON.parse(error.message.slice(jsonStart, jsonEnd));

        console.log(parsed.detail); // Log the entire error for debugging
        // Update currentError
        if (parsed.detail === "The username and the name provided are not unique. Therefore, the user could not be created!") {
          setCurrentError("Username is already taken. Please choose a different one.");
        } else {
          setCurrentError(parsed.detail);
        }
      } else {
        console.error("An unknown error occurred during login.");
      }
    }
  };

  return (
    <div className="login-container">
      <Form
        form={form}
        name="login"
        size="large"
        variant="outlined"
        onFinish={handleLogin}
        layout="vertical"
      >
        <Form.Item>
          <h1 style={{ color: "black", textAlign: "center", marginBottom: "20px" }}>Login</h1>
        </Form.Item>
        <Form.Item
          name="username"
          rules={[{ required: true, message: "Please input your username!" }]}
        >
          <TextField label="Username" fullWidth />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <TextField label="Password" type="password" fullWidth />
        </Form.Item>
        <Form.Item>
          <Button
            variant="contained"
            className="login-button"
            disableElevation
            sx={{ boxShadow: "none" }}
            type="submit"
          >
            Login
          </Button>
          <Form.Item >
            <p className="error-message">{currentError}</p>
          </Form.Item>
        </Form.Item>
        <div className="signup-link" style={{ color: "black" }}>
          Don&apos;t have an account? <a style={{ color: "#485F23" }}  href="/signup">Sign up</a>
        </div>
      </Form>

    </div>
  );
};

export default Login;
