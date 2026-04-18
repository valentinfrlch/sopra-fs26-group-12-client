"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering

import { useRouter } from "next/navigation"; // use NextJS router for navigation
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { Form } from "antd";
import { Button, TextField } from "@mui/material";
import React, { useState } from "react";
// Optionally, you can import a CSS module or file for additional styling:
// import styles from "@/styles/page.module.css";

interface FormFieldProps {
  label: string;
  value: string;
}

const Signup: React.FC = () => {
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

  const handleSignup = async (values: FormFieldProps) => {
    try {
      // Call the API service and let it handle JSON serialization and error handling
      const response = await apiService.post<User>("/users", values);
      console.log("Signup response:", response); // Log the entire response for debugging

      // Use the useLocalStorage hook that returned a setter function (setToken in line 41) to store the token if available
      if (response.token) {
        setToken(response.token);
      }

      if (response.id && response.username) {
        localStorage.setItem("userId", String(response.id));
        localStorage.setItem("username", response.username);
      }

      // Navigate to the user overview
      router.push("/cookbook");
    } catch (error) {
      if (error instanceof Error) {
        // try to parse the string as json
        const jsonStart = error.message.indexOf("{");
        const jsonEnd = error.message.lastIndexOf("}") + 1;
        const parsed = JSON.parse(error.message.slice(jsonStart, jsonEnd));

        console.log(parsed.detail); // Log error for debugging
        // Update currentError
        if (parsed.detail === "The username and the name provided are not unique. Therefore, the user could not be created!") {
          setCurrentError("Username is already taken. Please choose a different one.");
        } else {
          setCurrentError(parsed.detail);
        }
      } else {
        setCurrentError("An unknown error occurred during signup.");
      }
    }
  };

  return (
    <div className="signup-container">
      <Form
        form={form}
        name="signup"
        size="large"
        variant="outlined"
        onFinish={handleSignup}
        layout="vertical"
      >
        <Form.Item>
          <h1 style={{ color: "black", textAlign: "center", marginBottom: "20px" }}>Create an Account</h1>
        </Form.Item>
        <Form.Item
          name="name"
          rules={[{ required: true, message: "Please input your name!" }]}
        >
          <TextField label="Name" fullWidth />
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
            Create Account
          </Button>
        </Form.Item>
        <Form.Item >
          <p className="error-message">{currentError}</p>
        </Form.Item>
        <div className="login-link" style={{ color: "black" }}>
          Already have an account? <a style={{ color: "#485F23" }} href="/login">Sign in</a>
        </div>
      </Form>
    </div >
  );
};
export default Signup;