"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import { Badge } from "@/types/badge";
import { BadgeChip, BadgeShowcase } from "@/components/Badge";
import { getInitials as computeInitials } from "@/utils/getInitials";
import { Avatar, Box, Button, Card, CircularProgress, Divider, Stack, TextField, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Form, message } from "antd";

const Profile: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id as string | undefined;

  const apiService = useApi();
  const [user, setUser] = useState<User | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [nameInput, setNameInput] = useState<string>("");
  const [usernameInput, setUsernameInput] = useState<string>("");
  const [form] = Form.useForm();
  const ownProfile = typeof window !== "undefined"
    && userId !== undefined
    && localStorage.getItem("userId") === userId;
  const dominantBadge = badges.find((b) => b.current);

  type PasswordForm = {
    currentPassword: string;
    newPassword: string;
    confirmPassword?: string;
  };

  type ApiError = {
    status?: number;
    response?: { status?: number };
    message?: string;
  };

  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      try {
        const storedToken = localStorage.getItem("token") ?? "";
        const headers = { Authorization: `Bearer ${storedToken}` };
        const fetched = await apiService.get<User>(`/users/${userId}`, headers);
        setUser(fetched);
        setNameInput(fetched?.name ?? "");
        setUsernameInput(fetched?.username ?? "");

        // badges are public so we fetch them for any profile we can view
        try {
          const fetchedBadges = await apiService.get<Badge[]>(`/users/${userId}/badges`, headers);
          setBadges(fetchedBadges ?? []);
        } catch (badgeErr) {
          console.error("Failed to fetch badges", badgeErr);
          setBadges([]);
        }
      } catch (err: unknown) {
        // check for 401 and redirect to previous page
        const e = err as ApiError;
        const status = e?.status ?? e?.response?.status;
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
  }, [apiService, userId, router]);

  const initialsFor = (u: User | null) => {
    const nameOrUsername = u?.name || u?.username || "?";
    try {
      return computeInitials(nameOrUsername);
    } catch {
      return (nameOrUsername[0] || "?").toUpperCase();
    }
  };

  const onFinish = async (values: PasswordForm) => {
    if (!userId) return;
    const { currentPassword, newPassword } = values;
    try {
      const storedToken = localStorage.getItem("token") ?? "";
      const headers = { Authorization: `Bearer ${storedToken}` };

      await apiService.patch(`/users/${userId}`, { oldPassword: currentPassword, newPassword }, headers);
      message.success("Password changed successfully. Please log in again with your new password.");
      form.resetFields();
      setIsModalOpen(false);
      router.push("/login");
    } catch (err: unknown) {
      console.error("Password change failed", err);
      const e = err as ApiError;
      const msg = e?.message ?? "Failed to change password";
      message.error(msg);
    }
  };

  const handleLogout = async () => {
    if (!userId) return;
    try {
      const storedToken = localStorage.getItem("token") ?? "";
      const headers = { Authorization: `Bearer ${storedToken}` };

      // Call logout endpoint
      await apiService.post(`/users/${userId}/logout`, null, headers);

      // Clear client token and redirect to login
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
      message.success("Logged out successfully.");
      router.push("/login");
    } catch (err: unknown) {
      console.error("Logout failed", err);
      const e = err as ApiError;
      const msg = e?.message ?? "Failed to logout";
      message.error(msg);
    }
  };

  const handleSaveProfile = async () => {
    if (!userId) return;
    const payload: Record<string, unknown> = {};
    if (nameInput !== (user?.name ?? "")) payload.name = nameInput;
    if (usernameInput !== (user?.username ?? "")) payload.username = usernameInput;
    if (Object.keys(payload).length === 0) {
      message.info("No changes to save.");
      return;
    }

    try {
      const storedToken = localStorage.getItem("token") ?? "";
      const headers = { Authorization: `Bearer ${storedToken}` };

      const updated = await apiService.patch<User>(`/users/${userId}`, payload, headers);
      setUser(updated);
      setNameInput(updated?.name ?? "");
      setUsernameInput(updated?.username ?? "");
      message.success("Profile updated successfully.");
    } catch (err: unknown) {
      console.error("Profile update failed", err);
      const e = err as ApiError;
      const msg = e?.message ?? "Failed to update profile";
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
        <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 1 }}>
          <IconButton aria-label="back" onClick={() => router.back()} sx={{ color: "#4b6624" }}>
            <ArrowBackIcon />
          </IconButton>
        </Box>
        <Stack spacing={2} sx={{ width: "100%" }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={4}
            alignItems="center"
            sx={{ width: "100%" }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minWidth: 96 }}>
              <Avatar sx={{ width: 96, height: 96, bgcolor: "#4b6624", fontSize: 32 }}>
                {initialsFor(user)}
              </Avatar>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", alignItems: { xs: "center", sm: "flex-start" }, flexGrow: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: "wrap" }}>
                <h2 style={{ margin: 0 }}>{user?.name || "Unknown user"}</h2>
                {dominantBadge && (
                  <BadgeChip
                    emoji={dominantBadge.emoji}
                    name={dominantBadge.displayName}
                    description={ownProfile ? dominantBadge.description : undefined}
                    current
                  />
                )}
              </Stack>
              <span style={{ marginTop: 4 }}>@{user?.username || "-"}</span>
            </Box>

            {ownProfile && (
              <Box sx={{ display: "flex", justifyContent: { xs: "center", sm: "flex-end" } }}>
                <IconButton aria-label="edit" onClick={() => setIsEditModalOpen(true)} sx={{ color: "#4b6624" }}>
                  <EditIcon />
                </IconButton>
              </Box>
            )}
          </Stack>
        </Stack>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ width: "100%" }}>
          <h3 style={{ margin: "0 0 12px 0", color: "#485F23" }}>Badges</h3>
          <BadgeShowcase badges={badges} showDescriptions={ownProfile} />
        </Box>

        {ownProfile && (
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
        )}

        <Dialog
          open={isEditModalOpen}
          onClose={() => {
            setNameInput(user?.name ?? "");
            setUsernameInput(user?.username ?? "");
            setIsEditModalOpen(false);
          }}
          PaperProps={{ sx: { borderRadius: "20px", padding: 1 } }}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Edit profile</DialogTitle>
          <DialogContent style={{ paddingTop: 6 }}>
            <TextField
              label="Name"
              fullWidth
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              sx={{
                mt: 1, "& .MuiOutlinedInput-root": {
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#4b6624" },
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#4b6624" }
                }
              }}
            />

            <TextField
              label="Username"
              fullWidth
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              sx={{
                mt: 2, "& .MuiOutlinedInput-root": {
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#4b6624" },
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#4b6624" }
                }
              }}
            />
          </DialogContent>
          <DialogActions style={{ padding: "24px", paddingTop: 0 }}>
            <Button
              onClick={() => {
                setNameInput(user?.name ?? "");
                setUsernameInput(user?.username ?? "");
                setIsEditModalOpen(false);
              }}
              style={{ color: "#4b6624", borderRadius: "999px" }}
            >
              Cancel
            </Button>
            <Button variant="contained" onClick={async () => { await handleSaveProfile(); setIsEditModalOpen(false); }} style={{ background: "#4b6624", borderColor: "#4b6624", color: "white", borderRadius: "999px", boxShadow: "none" }}>
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Card>
      <Dialog
        open={isModalOpen}
        onClose={() => {
          form.resetFields();
          setIsModalOpen(false);
        }}
        PaperProps={{ sx: { borderRadius: "20px", padding: 1 } }}
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
            style={{ color: "#4b6624", borderRadius: "999px" }}
          >
            Cancel
          </Button>
          <Button variant="contained" onClick={() => form.submit()} style={{ background: "#4b6624", borderColor: "#4b6624", color: "white", borderRadius: "999px", boxShadow: "none" }}>
            Change
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;
