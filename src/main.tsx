import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// Register service worker for PWA (production only)
if (import.meta.env && import.meta.env.PROD && 'serviceWorker' in navigator) {
	window.addEventListener('load', () => {
		navigator.serviceWorker
			.register('/service-worker.js')
			.then((registration) => {
				console.log('ServiceWorker registration successful with scope: ', registration.scope);
			})
			.catch((err) => {
				console.warn('ServiceWorker registration failed: ', err);
			});
	});
}
