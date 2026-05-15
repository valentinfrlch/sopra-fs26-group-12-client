"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering

import { useRouter } from "next/navigation"; // use NextJS router for navigation
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import AuthForm from "@/components/auth/AuthForm";
// import { User } from "@/types/user";
import { Form } from "antd";
// import { Button, TextField } from "@mui/material";
import React, { useState } from "react";
import { UserGetDTO } from "@/types/api";
import { storeUserSession } from "@/utils/auth";
import { useSearchParams } from "next/navigation";
// import CircularProgress from "@mui/material/CircularProgress";
import { parseAuthError } from "@/utils/parseAuthError";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchParams = useSearchParams();
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
    setIsSubmitting(true);

    try {
      const response = await apiService.post<UserGetDTO>("/users/login", values);

      storeUserSession(response);

      const redirect = searchParams.get("redirect") || "/cookbook";
      router.push(redirect);
    } catch (error) {

      setIsSubmitting(false);
      setCurrentError(parseAuthError(error));
      
    }
  };

return (
    <div className="login-container">
      <AuthForm
        title="Login"
        buttonText="Login"
        isSubmitting={isSubmitting}
        currentError={currentError}
        onFinish={handleLogin}
        footerText={
          <div
            className="signup-link"
            style={{ color: "black" }}
          >
            Don&apos;t have an account?{" "}
            <a
              style={{ color: "#485F23" }}
              href="/signup"
            >
              Sign up
            </a>
          </div>
        }
      />
    </div>
  );
};

export default Login;
