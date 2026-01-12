// JavaScript 兼容性 polyfills
import "./polyfills.js";

// Import React and ReactDOM
import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

// Import tailwind styles
import "./i18n";
import "./css/tailwind.css";
import "./css/app.scss";

// Import App Component
import MyApp from "./components/app";
import { initLIFF } from "./utils/liff";
import Loading from "./components/Loading/Index";

const Root = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const initialize = async () => {
            try {
                await initLIFF();
                setLoading(false);
            } catch (err) {
                console.error("Initialization error:", err);
                setError(err);
                setLoading(false);
            }
        };
        initialize();
    }, []);

    if (loading) return <Loading />;
    if (error) return <div className="p-4 text-center text-red-500">Initialization failed. Please try again later.</div>;

    return <MyApp />;
};

// Mount React App
const root = createRoot(document.getElementById("app"));
root.render(<Root />);
