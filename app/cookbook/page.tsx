"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering
import { useRouter } from "next/navigation";
import styles from "@/styles/page.module.css";
import { Button } from "@mui/material";
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';

export default function Home() {
    const router = useRouter();
    return (
        <div className={styles.page}>
            <main className={styles.main}>

                <h1 className={styles.title} style={{ color: "black" }}>
                    Cookbook page
                </h1>
                <div style={{ marginTop: 16 }}>
                    <Button variant="contained" startIcon={<RestaurantMenuIcon />}>
                        View Recipes
                    </Button>
                </div>
                
            </main>
        </div>
    );
}
