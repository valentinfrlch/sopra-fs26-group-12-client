"use client";

import React, { useEffect, useState } from "react";
import { Form, Row, Col, App, Spin } from "antd";
import { Button, TextField, IconButton } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useParams, useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import Sidebar, { Header, UserAvatar } from "@/components/appLayout";

interface Ingredient {
    name: string;
}

interface EditEventFormValues {
    title: string;
    ingredients: Ingredient[];
    eventPrompts: (string | null)[];
    startDatetime: unknown;
    endDatetime: unknown;
}

interface CookingEvent {
    id: string;
    title: string;
    emojis: string;
    ingredients: string[];
    startDatetime: string;
    endDatetime: string;
    creator: { id: string | number };
    state: "UPCOMING" | "ONGOING" | "FINISHED";
}

interface SchedulePrompt {
    id: number;
    promptTime: string;
}

interface ScheduleResponse {
    prompts: SchedulePrompt[];
    uploadWindowMinutes: number;
    kicked: boolean;
}

interface ApiError {
    response?: { data?: { message: string } };
    message: string;
    status?: number;
}

const EditEventPage: React.FC = () => {
    const params = useParams();
    const eventId = params?.eventId as string;
    const router = useRouter();
    const apiService = useApi();
    const { message } = App.useApp();
    const [form] = Form.useForm();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const watchedStart = Form.useWatch("startDatetime", form);
    const watchedEnd = Form.useWatch("endDatetime", form);
    const watchedTitle = Form.useWatch("title", form);

    const startDate = watchedStart ? new Date(watchedStart as string) : null;
    const endDate = watchedEnd ? new Date(watchedEnd as string) : null;
    const startInPast = startDate ? startDate.getTime() < Date.now() - 60_000 : false;
    const endNotAfterStart = startDate && endDate ? endDate.getTime() <= startDate.getTime() : false;
    const startError = startInPast ? "Start time cannot be in the past" : null;
    const endError = endNotAfterStart ? "End time must be after start time" : null;
    const isFormValid = !!watchedTitle && !!watchedStart && !!watchedEnd && !startError && !endError;

    useEffect(() => {
        if (!eventId) return;
        const token = localStorage.getItem("token")?.replace(/"/g, "");
        const userId = localStorage.getItem("userId") ?? "";
        const auth = { Authorization: `Bearer ${token}` };

        (async () => {
            try {
                const [event, schedule] = await Promise.all([
                    apiService.get<CookingEvent>(`/events/${eventId}`, auth),
                    apiService.get<ScheduleResponse>(`/events/${eventId}/schedule`, auth),
                ]);

                if (String(event.creator?.id) !== userId) {
                    message.error("Only the event owner can edit this event.");
                    router.replace(`/events/${eventId}`);
                    return;
                }

                // hide the auto-added final prompt at endDatetime (re-added on save)
                const userPrompts = schedule.prompts
                    .map((p) => p.promptTime)
                    .filter((t) => t !== event.endDatetime);

                form.setFieldsValue({
                    title: event.title,
                    ingredients: event.ingredients?.length
                        ? event.ingredients.map((name) => ({ name }))
                        : [{ name: "" }],
                    eventPrompts: userPrompts.length ? userPrompts : [],
                    startDatetime: event.startDatetime,
                    endDatetime: event.endDatetime,
                });
            } catch (error) {
                const apiError = error as ApiError;
                message.error(apiError.message || "Failed to load event");
                router.replace(`/events/${eventId}`);
            } finally {
                setLoading(false);
            }
        })();
    }, [eventId, apiService, form, router, message]);

    const handleSave = async (values: EditEventFormValues) => {
        setSubmitting(true);
        try {
            const token = localStorage.getItem("token")?.replace(/"/g, "");

            const formattedIngredients = (values.ingredients || [])
                .map((ing) => (ing?.name ?? "").trim())
                .filter((n) => n.length > 0);

            const payload = {
                title: values.title,
                ingredients: formattedIngredients,
                eventPrompts: (values.eventPrompts || [])
                    .filter(Boolean)
                    .map((t) => new Date(String(t)).toISOString()),
                startDatetime: values.startDatetime
                    ? new Date(values.startDatetime as string | Date).toISOString()
                    : null,
                endDatetime: values.endDatetime
                    ? new Date(values.endDatetime as string | Date).toISOString()
                    : null,
            };

            await apiService.patch(`/events/${eventId}`, payload, {
                Authorization: `Bearer ${token}`,
            });

            message.success("Event updated");
            router.push(`/events/${eventId}`);
        } catch (error) {
            const apiError = error as ApiError;
            message.error(apiError.message || "Failed to update event");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: "flex", minHeight: "100vh" }}>
                <Sidebar />
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Spin size="large" />
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f5f5f5" }}>
            <Sidebar />
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <Header title="Edit Event" rightContent={<UserAvatar size={40} />} />

                <div style={{ padding: 24, flex: 1 }}>
                    <Form form={form} layout="vertical" size="large" onFinish={handleSave}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <Row>
                                <Col span={24}>
                                    <Form.Item name="title" rules={[{ required: true, message: "Please enter an event title!" }]}>
                                        <div>
                                            <TextField
                                                fullWidth
                                                label="Event Title"
                                                value={watchedTitle ?? ""}
                                                onChange={(e) => form.setFieldsValue({ title: e.target.value })}
                                                InputLabelProps={{ style: { color: "grey", fontWeight: 700 } }}
                                                InputProps={{ style: { fontWeight: 700 } }}
                                            />
                                        </div>
                                    </Form.Item>

                                    <Form.Item>
                                        <Row><span style={{ color: "black", fontWeight: 500, marginBottom: 4, marginTop: 8 }}>Ingredients</span></Row>
                                        <Row><span style={{ fontSize: 12, color: "#888", marginBottom: 10 }}>Update the basic ingredients required for this event.</span></Row>
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
                                        <Row gutter={8} align="middle" style={{ marginTop: 8 }}>
                                            <Col span={12}>
                                                <Form.Item name="startDatetime" rules={[{ required: true, message: "Enter start date and time" }]}>
                                                    <div>
                                                        <DateTimePicker
                                                            value={watchedStart ? new Date(watchedStart as string) : null}
                                                            label="Start"
                                                            disablePast
                                                            minutesStep={1}
                                                            timeSteps={{ hours: 1, minutes: 1 }}
                                                            onChange={(newVal) => form.setFieldsValue({ startDatetime: newVal ? newVal.toISOString() : null })}
                                                            slotProps={{ textField: { fullWidth: true, error: !!startError, helperText: startError ?? undefined } }}
                                                        />
                                                    </div>
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item name="endDatetime" rules={[{ required: true, message: "Enter end date and time" }]}>
                                                    <div>
                                                        <DateTimePicker
                                                            value={watchedEnd ? new Date(watchedEnd as string) : null}
                                                            label="End"
                                                            disablePast
                                                            minutesStep={1}
                                                            timeSteps={{ hours: 1, minutes: 1 }}
                                                            minDateTime={startDate ?? undefined}
                                                            onChange={(newVal) => form.setFieldsValue({ endDatetime: newVal ? newVal.toISOString() : null })}
                                                            slotProps={{ textField: { fullWidth: true, error: !!endError, helperText: endError ?? undefined } }}
                                                        />
                                                    </div>
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </div>

                                    <Form.Item style={{ marginTop: 16 }}>
                                        <Row><span style={{ color: "black", fontWeight: 500, marginBottom: 4, marginTop: 8 }}>Progress Photos</span></Row>
                                        <Row><span style={{ fontSize: 12, color: "#888", marginBottom: 10 }}>Specify when participants should take progress photos.</span></Row>
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
                                                                                    disablePast
                                                                                    minutesStep={1}
                                                                                    timeSteps={{ hours: 1, minutes: 1 }}
                                                                                    minDateTime={startDate ?? undefined}
                                                                                    maxDateTime={endDate ?? undefined}
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
                            <Button style={{ color: "#4b6624" }} onClick={() => router.push(`/events/${eventId}`)}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={!isFormValid || submitting}
                                style={{ background: isFormValid && !submitting ? "#4b6624" : "#a3a3a3", borderColor: "#4b6624", color: "white" }}
                            >
                                {submitting ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </Form>
                </div>
            </div>
        </div>
    );
};

export default EditEventPage;