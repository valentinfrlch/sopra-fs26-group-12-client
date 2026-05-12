import React from "react";
import Sidebar, { Header, UserAvatar } from "@/components/appLayout";
import useWindowSize from "@/hooks/useWndowSize";


interface PageLayoutProps {
    title: string;
    children: React.ReactNode;
    rightContent?: React.ReactNode;
    contentStyle?: React.CSSProperties;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
    title,
    children,
    rightContent = <UserAvatar />,
    contentStyle,
}) => {
    const { isMobile } = useWindowSize();
    return (
        <div
            style={{
                display: "flex",
                minHeight: "100vh",
                background: "#F9FBFC",
                borderRadius: 4,
            }}
        >
            <Sidebar />

            <div
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <Header title={title} rightContent={rightContent} />

                <div
                    style={{
                        padding: "24px",
                        borderRadius: "10px",
                        width: "100%",
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        background: "white",
                        paddingBottom: isMobile ? "100px" : 16,
                        ...contentStyle,
                    }}
                >
                    {children}
                </div>
            </div>
        </div>
    );
};
