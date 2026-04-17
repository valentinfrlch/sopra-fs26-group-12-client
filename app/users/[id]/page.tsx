"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import { getInitials as computeInitials } from "@/utils/getInitials";
import { Avatar, Box, Button, Card, CircularProgress, Stack, Typography, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { Form, message } from "antd";

const Profile: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id as string | undefined;

  const apiService = useApi();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      try {
        const storedToken =
          typeof window !== "undefined" && localStorage.getItem("token")
            ? JSON.parse(localStorage.getItem("token") || '""')
            : "";
        const headers = { Authorization: `Bearer ${storedToken}` };
        const fetched = await apiService.get<User>(`/users/${userId}`, headers);
        setUser(fetched);
      } catch (err: any) {
        // check for 401 and redirect to previous page
        const status = err?.status ?? err?.response?.status;
        if (status === 401) {
          message.error("Unauthorized access. Redirecting to previous page.");
          router.back();
          return;
        }
        console.error("Failed to fetch user", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [apiService, userId]);

  const initialsFor = (u: User | null) => {
    const nameOrUsername = u?.name || u?.username || "?";
    try {
      return computeInitials(nameOrUsername);
    } catch {
      return (nameOrUsername[0] || "?").toUpperCase();
    }
  };

  const onFinish = async (values: any) => {
    if (!userId) return;
    const { currentPassword, newPassword } = values;
    try {
      const storedToken =
        typeof window !== "undefined" && localStorage.getItem("token")
          ? JSON.parse(localStorage.getItem("token") || '""')
          : "";
      const headers = { Authorization: `Bearer ${storedToken}` };

      await apiService.patch(`/users/${userId}`, { oldPassword: currentPassword, newPassword }, headers);
      message.success("Password changed successfully. Please log in again with your new password.");
      form.resetFields();
      setIsModalOpen(false);
      router.push("/login");
    } catch (err: any) {
      console.error("Password change failed", err);
      const msg = err?.message || "Failed to change password";
      message.error(msg);
    }
  };

  const handleLogout = async () => {
    if (!userId) return;
    try {
      const storedToken =
        typeof window !== "undefined" && localStorage.getItem("token")
          ? JSON.parse(localStorage.getItem("token") || '""')
          : "";
      const headers = { Authorization: `Bearer ${storedToken}` };

      // Call logout endpoint
      await apiService.post(`/users/${userId}/logout`, null, headers);

      // Clear client token and redirect to login
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
      message.success("Logged out successfully.");
      router.push("/login");
    } catch (err: any) {
      console.error("Logout failed", err);
      const msg = err?.message || "Failed to logout";
      message.error(msg);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
      <Card sx={{ width: 520, p: 4, boxShadow: "none", borderRadius: "20px" }}>
        <Stack spacing={2} alignItems="center">
          <Avatar sx={{ width: 96, height: 96, bgcolor: "#4b6624", fontSize: 32 }}>
            {initialsFor(user)}
          </Avatar>

          <h2>{user?.name || user?.username || "Unknown user"}</h2>
          <span style={{ marginTop: 4 }}>@{user?.username || "-"}</span>

          <Box sx={{ width: "100%", mt: 2 }}>
            <Stack direction="row" spacing={2} justifyContent="flex-end" style={{ marginTop: 24 }}>
              <Button
                variant="text"
                onClick={handleLogout}
                sx={{
                  color: "red",
                  borderRadius: "999px",
                }}>
                Logout
              </Button>
              <Button
                variant="outlined"
                onClick={() => setIsModalOpen(true)}
                sx={{
                  borderColor: "#4b6624",
                  color: "#4b6624",
                  borderRadius: "999px",
                }}>
                Change password
              </Button>
              
            </Stack>
          </Box>
        </Stack>
      </Card>
      <Dialog
        open={isModalOpen}
        onClose={() => {
          form.resetFields();
          setIsModalOpen(false);
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Change password</DialogTitle>
        <DialogContent style={{ paddingTop: 6 }}>
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item
              name="currentPassword"
              rules={[{ required: true, message: "Please enter your current password" }]}
            >
              <TextField
                label="Current password"
                fullWidth type="password"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#4b6624",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#4b6624",
                    },
                  },
                }} />
            </Form.Item>

            <Form.Item
              name="newPassword"
              rules={[{ required: true, message: "Please enter a new password" }]}
            >
              <TextField
                label="New password"
                fullWidth type="password"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#4b6624",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#4b6624",
                    },
                  },
                }} />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              dependencies={["newPassword"]}
              rules={[
                { required: true, message: "Please confirm your new password" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("The two passwords do not match"));
                  },
                }),
              ]}
            >
              <TextField
                label="Confirm new password"
                fullWidth type="password"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#4b6624",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#4b6624",
                    },
                  },
                }} />
            </Form.Item>
          </Form>
        </DialogContent>
        <DialogActions style={{ padding: "24px", paddingTop: 0 }}>
          <Button
            onClick={() => {
              form.resetFields();
              setIsModalOpen(false);
            }}
            style={{ color: "#4b6624" }}
          >
            Cancel
          </Button>
          <Button variant="contained" onClick={() => form.submit()} style={{ background: "#4b6624", borderColor: "#4b6624", color: "white" }}>
            Change
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;
