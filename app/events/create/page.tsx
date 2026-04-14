"use client";

import React, { useState } from "react";
import { Form, Row, Col, App, Avatar } from "antd";
import { Button, TextField, IconButton } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import EmojiPicker from 'emoji-picker-react';
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import Sidebar from "@/components/appLayout";
import { MenuOutlined } from "@ant-design/icons";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

interface Ingredient {
    name: string;
}

interface CreateEventFormValues {
    title: string;
    ingredients: Ingredient[];
    emojis: string[];
    eventPrompts: (string | unknown)[];
    startDatetime: unknown;
    endDatetime: unknown;
}

interface ApiError {
    response?: {
        data?: {
            message: string;
        };
    };
    message: string;
}

interface EmojiClickData {
    emoji?: string;
    unified?: string;
}

/* Unused
const getInitials = (name: string): string => {
    return name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
};
*/

const CreateEventPage: React.FC = () => {
    const [form] = Form.useForm();
    const router = useRouter();
    const apiService = useApi();
    const { message } = App.useApp();

    /* Unused
    useEffect(() => {
        const stored = localStorage.getItem("username") ?? "U";
        // no state needed for initials here
        }, []);
    */
    const handleCreateEvent = async (values: CreateEventFormValues) => {
        try {
            const token = localStorage.getItem("token")?.replace(/"/g, "");

            const formattedIngredients = (values.ingredients || [])
                .map((ing: Ingredient) => (ing?.name ?? "").trim())
                .filter((n: string) => n.length > 0);

            const emojisArray = (values.emojis || []).slice(0, 3).map((e: string) => e || "😀");
            while (emojisArray.length < 3) {
                emojisArray.push("😀");
            }
            const emojisString = emojisArray.slice(0, 3).join("");

            const payload = {
                title: values.title,
                emojis: emojisString,
                ingredients: formattedIngredients,
                eventPrompts: (values.eventPrompts || [])
                    .filter(Boolean)
                    .map((t: string | unknown) => new Date(String(t)).toISOString()),
                startDatetime: values.startDatetime ? new Date(values.startDatetime as string | Date).toISOString() : null,
                endDatetime: values.endDatetime ? new Date(values.endDatetime as string | Date).toISOString() : null,
            };

            await apiService.post("/events", payload, {
                Authorization: `Bearer ${token}`,
            });

            message.success("Event created successfully!");
            router.push("/events/overview");
        } catch (error: unknown) {
            const apiError = error as ApiError;
            message.error(apiError.response?.data?.message || "Failed to create event");
        }
    };

    const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : "";

    const [openPicker, setOpenPicker] = useState<number | null>(null);

    const watchedEmojis = Form.useWatch("emojis", form) || ["🥖", "🥑", "🌶️"];
    const watchedStart = Form.useWatch("startDatetime", form);
    const watchedEnd = Form.useWatch("endDatetime", form);

    const EmojiPickerButton: React.FC<{ index: number }> = ({ index }) => {
        const current = (watchedEmojis && watchedEmojis[index]) || "🥖";

        return (
            <div
                onClick={() => setOpenPicker(index)}
                style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    background: "#ffffff",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                    fontSize: 24,
                }}
                aria-label={`emoji-picker-${index}`}
                title="Open emoji picker"
            >
                {current}
            </div>
        );
    };

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f5f5f5" }}>
            <Sidebar />

            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
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
                        <span style={{ fontWeight: 600, fontSize: 16, color: "#1a1a1a" }}>Create Event</span>
                    </div>

                    <Avatar
                        size={40}
                        style={{ background: "#f0f0f0", color: "#1a1a1a", cursor: "pointer", fontWeight: 600 }}
                        onClick={() => router.push(`/users/${userId}`)}
                    >
                        {/* simple placeholder for initials */}
                        U
                    </Avatar>
                </div>

                <div style={{ padding: "24px", flex: 1 }}>
                    <Form
                        form={form}
                        layout="vertical"
                        size="large"
                        onFinish={handleCreateEvent}
                        initialValues={{ title: "", ingredients: [{ name: "" }], eventPrompts: [null], emojis: ["🥖", "🥑", "🌶️"], startDatetime: null, endDatetime: null }}
                    >
                        {/* Register emojis field so Form tracks it and useWatch works */}
                        <Form.Item name="emojis" style={{ display: "none" }}>
                            <input />
                        </Form.Item>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <Row>
                                <Col span={24}>
                                    <div style={{ marginTop: 16, marginBottom: 48 }}>
                                        <Row>
                                            <Col span={24}>
                                                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 8 }}>
                                                    <div style={{ fontWeight: 500, color: "black" }}>Pick three emojis</div>
                                                    <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                                                        <EmojiPickerButton index={0} />
                                                        <EmojiPickerButton index={1} />
                                                        <EmojiPickerButton index={2} />
                                                    </div>
                                                    <div style={{ fontSize: 12, color: "#888", marginTop: 6 }}>Emojis will be used to create grid as event background.</div>
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>
                                    <Form.Item name="title" rules={[{ required: true, message: "Please enter an event title!" }]}>
                                        <div>
                                            <TextField fullWidth label="Event Title" InputLabelProps={{ style: { color: "grey", fontWeight: 700 } }} InputProps={{ style: { fontWeight: 700 } }} />
                                            <span style={{ fontSize: 12, color: "#888", marginBottom: 12 }}>Give your event a title that reflects the challenge.</span>
                                        </div>
                                    </Form.Item>

                                    <Form.Item>
                                        <Row><span style={{ color: "black", fontWeight: 500, marginBottom: 4, marginTop: 8 }}>Ingredients</span></Row>
                                        <Row><span style={{ fontSize: 12, color: "#888", marginBottom: 10 }}>Add basic ingredients required for this event.</span></Row>
                                        <Form.List name="ingredients">
                                            {(fields, { add, remove }) => (
                                                <>
                                                    {fields.map(({ key, name, ...restField }) => (
                                                        <Row key={key} gutter={8} align="middle">
                                                            <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
                                                                <div style={{ flex: 1 }}>
                                                                    <Form.Item {...restField} name={[name, "name"]} rules={[{ required: true, message: "Enter ingredient name!" }]}>
                                                                        <TextField label="Ingredient" fullWidth InputLabelProps={{ style: { color: "grey" } }} />
                                                                    </Form.Item>
                                                                </div>

                                                                <IconButton
                                                                    size="medium"
                                                                    onClick={() => {
                                                                        if (fields.length === 1) {
                                                                            form.setFieldsValue({ ingredients: [{ name: "" }] });
                                                                        } else {
                                                                            remove(name);
                                                                        }
                                                                    }}
                                                                    aria-label="remove ingredient"
                                                                    title="Remove ingredient"
                                                                    style={{ color: "#888", padding: 8, position: "relative", transform: "translateY(-35%)" }}
                                                                >
                                                                    <DeleteOutlineIcon fontSize="medium" />
                                                                </IconButton>
                                                            </div>
                                                        </Row>
                                                    ))}

                                                    <Button style={{ color: "#4b6624" }} onClick={() => add({ name: "" })}>
                                                        + add another ingredient
                                                    </Button>
                                                </>
                                            )}
                                        </Form.List>
                                    </Form.Item>

                                    <div style={{ marginTop: 8 }}>
                                        <Row><span style={{ color: "black", fontWeight: 500, marginBottom: 4, marginTop: 8 }}>Start & End</span></Row>
                                        <Row><span style={{ fontSize: 12, color: "#888", marginBottom: 10 }}>Set when the event starts and ends.</span></Row>
                                        <Row gutter={8} align="middle" style={{ marginTop: 8 }}>
                                            <Col span={12}>
                                                <Form.Item name="startDatetime" rules={[{ required: true, message: "Enter start date and time" }]}>
                                                    <div>
                                                        <DateTimePicker
                                                            value={watchedStart ? new Date(watchedStart) : null}
                                                            label="Start"
                                                            onChange={(newVal) => form.setFieldsValue({ startDatetime: newVal ? newVal.toISOString() : null })}
                                                            slotProps={{ textField: { fullWidth: true } }}
                                                        />
                                                    </div>
                                                </Form.Item>
                                            </Col>

                                            <Col span={12}>
                                                <Form.Item name="endDatetime" rules={[{ required: true, message: "Enter end date and time" }]}>
                                                    <div>
                                                        <DateTimePicker
                                                            value={watchedEnd ? new Date(watchedEnd) : null}
                                                            label="End"
                                                            onChange={(newVal) => form.setFieldsValue({ endDatetime: newVal ? newVal.toISOString() : null })}
                                                            slotProps={{ textField: { fullWidth: true } }}
                                                        />
                                                    </div>
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </div>

                                    <Form.Item>
                                        <Row><span style={{ color: "black", fontWeight: 500, marginBottom: 4, marginTop: 8 }}>Progress Photos</span></Row>
                                        <Row><span style={{ fontSize: 12, color: "#888", marginBottom: 10 }}>Specify when you want participants to take progress photos.</span></Row>
                                        <Form.List name="eventPrompts">
                                            {(fields, { add, remove }) => (
                                                <>
                                                    {fields.map(({ key, name, ...restField }) => {
                                                        const currentValue = form.getFieldValue("eventPrompts")?.[name];
                                                        return (
                                                            <Row key={key} gutter={8} align="middle">
                                                                <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
                                                                    <div style={{ flex: 1 }}>
                                                                        <Form.Item
                                                                            {...restField}
                                                                            name={[name]}
                                                                            rules={[{ required: true, message: "Enter a date/time" }]}
                                                                        >
                                                                            <div>
                                                                                <DateTimePicker
                                                                                    label={`Photo Time ${name + 1}`}
                                                                                    value={currentValue ? new Date(currentValue) : null}
                                                                                    onChange={(newVal) => {
                                                                                        const arr = form.getFieldValue("eventPrompts") || [];
                                                                                        arr[name] = newVal ? newVal.toISOString() : null;
                                                                                        form.setFieldsValue({ eventPrompts: arr });
                                                                                    }}
                                                                                    slotProps={{ textField: { fullWidth: true } }}
                                                                                />
                                                                            </div>
                                                                        </Form.Item>
                                                                    </div>

                                                                    <IconButton
                                                                        size="medium"
                                                                        onClick={() => remove(name)}
                                                                        aria-label={`remove photo time ${name + 1}`}
                                                                        title="Remove photo time"
                                                                        style={{ color: "#888", padding: 8, position: "relative", transform: "translateY(-35%)" }}
                                                                    >
                                                                        <DeleteOutlineIcon fontSize="medium" />
                                                                    </IconButton>
                                                                </div>
                                                            </Row>
                                                        );
                                                    })}

                                                    <Button style={{ color: "#4b6624" }} onClick={() => add(null)}>
                                                        + add another time
                                                    </Button>
                                                </>
                                            )}
                                        </Form.List>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </LocalizationProvider>

                        <div style={{ marginTop: 30, display: "flex", justifyContent: "flex-end", gap: 10 }}>
                            <Button style={{ color: "#4b6624" }} onClick={() => router.push("/events/overview")}>Cancel</Button>

                            <Button type="submit" variant="contained" style={{ background: "#4b6624", borderColor: "#4b6624", color: "white" }}>
                                Create Event
                            </Button>
                        </div>
                    </Form>
                </div>
            </div>
            {/* Emoji picker modal */}
            {openPicker !== null && (
                <div
                    onClick={() => setOpenPicker(null)}
                    style={{ position: "fixed", left: 0, top: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.32)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200 }}
                >
                    <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", padding: 8, borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}>
                        <EmojiPicker
                            onEmojiClick={(data: EmojiClickData) => {
                                const emoji = data?.emoji || data?.unified || "";
                                const arr = [...(watchedEmojis || [])];
                                arr[openPicker as number] = emoji;
                                form.setFieldsValue({ emojis: arr });
                                setOpenPicker(null);
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateEventPage;
