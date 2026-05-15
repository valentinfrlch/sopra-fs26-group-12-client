"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering

import { useRouter } from "next/navigation"; // use NextJS router for navigation
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { Form } from "antd";
import { TextField } from "@mui/material";
import React, { useState } from "react";
import { storeUserSession } from "@/utils/auth";
// import CircularProgress from "@mui/material/CircularProgress";
import { parseAuthError } from "@/utils/parseAuthError";
import AuthForm from "@/components/auth/AuthForm";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    setIsSubmitting(true);

    try {
      // Call the API service and let it handle JSON serialization and error handling
      const response = await apiService.post<User>("/users", values);
      console.log("Signup response:", response); // Log the entire response for debugging

      // Use the useLocalStorage hook that returned a setter function (setToken in line 41) to store the token if available
      storeUserSession(response);

      // Navigate to the user overview
      router.push("/cookbook");
    } catch (error) {
      setIsSubmitting(false);
      setCurrentError(parseAuthError(error));
      
    }
  };

  return (
    <div className="signup-container">
      <AuthForm
        title="Create an Account"
        buttonText="Create Account"
        isSubmitting={isSubmitting}
        currentError={currentError}
        onFinish={handleSignup}
        extraFields={
          <Form.Item
            name="name"
            rules={[
              {
                required: true,
                message: "Please input your name!",
              },
            ]}
          >
            <TextField label="Name" fullWidth />
          </Form.Item>
        }
        footerText={
          <div
            className="login-link"
            style={{ color: "black" }}
          >
            Already have an account?{" "}
            <a
              style={{ color: "#485F23" }}
              href="/login"
            >
              Sign in
            </a>
          </div>
        }
      />
    </div>
  );
};
export default Signup;