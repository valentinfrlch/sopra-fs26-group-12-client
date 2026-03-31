import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { App as AntdApp, ConfigProvider, theme } from "antd";
// import MuiProvider from "./providers/MuiProvider";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import "@/styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "cookREAL",
  description: "sopra-fs26-template-client",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>

        {/* ✅ loads Google Material Icons */}
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />

        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded"
          rel="stylesheet"
        />

      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AntdRegistry>
          <ConfigProvider
            theme={{
              algorithm: theme.defaultAlgorithm,
              token: {
                // general theme options are set in token, meaning all primary elements (button, menu, ...) will have this color
                colorPrimary: "#22426b", // selected input field boarder will have this color as well
                borderRadius: 8,
                colorText: "#fff",
                fontSize: 16,

                // Alias Token
                colorBgContainer: "#16181D",
              },
              // if a component type needs special styling, setting here will override default options set in token
              components: {
                Button: {
                  colorPrimary: "#75bd9d", // this will color all buttons in #75bd9d, overriding the default primaryColor #22426b set in token line 35
                  algorithm: true, // enable algorithm (redundant with line 33 but here for demo purposes)
                  controlHeight: 38,
                },
                Input: {
                  colorBorder: "gray", // color boarder selected is not overridden but instead is set by primary color in line 35
                  colorTextPlaceholder: "#888888",
                  algorithm: false, // disable algorithm (line 32)
                },
                Form: {
                  labelColor: "#fff",
                  algorithm: theme.defaultAlgorithm, // specify a specifc algorithm instead of true/false
                },
                Card: {},
              },
            }}
          >
            <AntdApp>{children}</AntdApp>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
