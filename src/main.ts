import "./style.css";
import { AppManager } from "./core/app/AppManager";

// Bootstrap application
window.addEventListener("DOMContentLoaded", () => {
    AppManager.initialize().bootstrap();
});
