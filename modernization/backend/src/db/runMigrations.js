import { ensureStore } from './store.js';

ensureStore();
console.log('File-based store initialized (no-op migration in offline mode).');
