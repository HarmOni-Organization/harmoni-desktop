import './styles/global.css';
import './styles/theme/media-queries.css';
import 'react-tooltip/dist/react-tooltip.css';
import 'tailwindcss/tailwind.css';

import { createRoot } from 'react-dom/client';

import App from '@core/App';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(<App />);
