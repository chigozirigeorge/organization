import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Register service worker for PWA and notifications
if ('serviceWorker' in navigator) {
	window.addEventListener('load', async () => {
		try {
			await navigator.serviceWorker.register('/sw.js');
			console.log('✅ Service worker registered');
		} catch (err) {
			console.warn('⚠️ Service worker registration failed:', err);
		}
	});
}

createRoot(document.getElementById('root')!).render(<App />);
