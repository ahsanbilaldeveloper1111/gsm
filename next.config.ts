import type { NextConfig } from "next";

/**
 * The Laravel API is reached via Route Handlers (`/api/[[...path]]`, `/sanctum/csrf-cookie`)
 * so TLS options (`API_TLS_INSECURE`, `getBillingBackendHttpsAgent`) apply in one place.
 */
const nextConfig: NextConfig = {};

export default nextConfig;
