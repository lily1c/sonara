// Umi's default HTTP plugin imports node-fetch. Use the browser-native Fetch API.
export default globalThis.fetch.bind(globalThis);
export const Headers=globalThis.Headers;
export const Request=globalThis.Request;
export const Response=globalThis.Response;
