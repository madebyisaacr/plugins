import "framer-plugin/framer.css"

import { framer } from "framer-plugin"
import React from "react"
import ReactDOM from "react-dom/client"
import { App } from "./App.tsx"

const root = document.getElementById("root")
if (!root) {
    throw new Error("Root element not found")
}

void framer.showUI({
    position: "top right",
    width: 240,
    height: 445,
    resizable: true,
})

ReactDOM.createRoot(root).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)
