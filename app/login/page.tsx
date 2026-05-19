"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering

import { useRouter } from "next/navigation"; // use NextJS router for navigation
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
// import { User } from "@/types/user";
import { Form } from "antd";
import { Button, TextField } from "@mui/material";
import React, { useState } from "react";
import { UserGetDTO } from "@/types/api";
import { storeUserSession } from "@/utils/auth";
import { useSearchParams } from "next/navigation";
import CircularProgress from "@mui/material/CircularProgress";
import useWindowSize from "@/hooks/useWndowSize";

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
  const { isMobile } = useWindowSize();
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
    <div
      style={{
        color: "#ededed",
        minHeight: "100vh",
        position: "relative",
        background: "#F6FAF5",
        overflow: "hidden",
        fontFamily: "Roboto, Arial, Helvetica, sans-serif",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "-10%",
          background:
            "radial-gradient(circle at center, #43921F 10%, rgba(67, 146, 31, 0.35) 25%, transparent 70%)",
          filter: "blur(50px)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "50vh",
        minWidth: "40vw",
        backgroundColor: "#F5F5F5",
        // card style
        padding: "40px",
        width: "400px",
        // center the card
        margin: "0 auto",
        // center the card vertically
        marginTop: "20vh",
        borderRadius: "14px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        // if mobile, don't use card, just white background and no shadow
        ...(isMobile && {
          width: "100%",
          minWidth: "100%",
          boxShadow: "none",
          borderRadius: "0",
          marginTop: "0",
          minHeight: "100vh",
        }),
        position: "relative",
        zIndex: 1,
      }}>
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
            <TextField
              label="Username"
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#485F23",
                },
                "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#485F23",
                },
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#485F23",
                },
                "& .MuiInputLabel-root": { color: "#485F23" },
                "& .MuiInputLabel-root.Mui-focused": { color: "#485F23" },
              }}
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <TextField
              label="Password"
              type="password"
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#485F23",
                },
                "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#485F23",
                },
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#485F23",
                },
                "& .MuiInputLabel-root": { color: "#485F23" },
                "& .MuiInputLabel-root.Mui-focused": { color: "#485F23" },
              }}
            />
          </Form.Item>
          <Form.Item>
            <Button
              variant="contained"
              className="login-button"
              disableElevation
              sx={{
                boxShadow: "none",
                backgroundColor: "#485F23",
                borderRadius: "99px",
                color: "white",
                width: "100%",
                height: "50px",
                "&:hover": { backgroundColor: "#485F23" },
              }}
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <CircularProgress size={24} sx={{ color: "white" }} />
              ) : (
                "Login"
              )}
            </Button>
            <Form.Item >
              <p className="error-message">{currentError}</p>
            </Form.Item>
          </Form.Item>
          <div className="signup-link" style={{ color: "black" }}>
            Don&apos;t have an account? <a style={{ color: "#485F23" }} href="/signup">Sign up</a>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Login;
