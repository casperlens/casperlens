import { type NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Check if this is an API request that needs to be proxied
  if (pathname.startsWith("/api/")) {
    try {
      // Keep the full /api path since backend expects it
      const queryString = req.nextUrl.search;
      const backendUrl = `${BACKEND_URL}${pathname}${queryString}`;

      console.log(
        `Middleware proxying ${req.method} request to: ${backendUrl}`,
      );

      // Copy headers (excluding problematic ones)
      const headers = new Headers();
      req.headers.forEach((value, key) => {
        if (
          !["host", "connection", "transfer-encoding"].includes(
            key.toLowerCase(),
          )
        ) {
          headers.set(key, value);
        }
      });

      // Get request body for methods that support it
      let body: BodyInit | null = null;
      if (["POST", "PUT", "PATCH"].includes(req.method)) {
        body = await req.text();
      }

      // Make request to backend
      const backendResponse = await fetch(backendUrl, {
        method: req.method,
        headers,
        body,
        credentials: "include",
        redirect: "manual",
      });

      // Copy response headers (excluding some)
      const responseHeaders = new Headers();
      backendResponse.headers.forEach((value, key) => {
        if (!["connection", "transfer-encoding"].includes(key.toLowerCase())) {
          responseHeaders.set(key, value);
        }
      });

      // Handle response body
      let responseBody: BodyInit;
      const contentType = backendResponse.headers.get("content-type");

      if (contentType?.includes("application/json")) {
        const json = await backendResponse.json();
        responseBody = JSON.stringify(json);
        responseHeaders.set("content-type", "application/json");
      } else {
        responseBody = await backendResponse.text();
      }

      // Return the backend response
      return new NextResponse(responseBody, {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        headers: responseHeaders,
      });
    } catch (error) {
      console.error("Middleware proxy error:", error);

      // Return error response
      return NextResponse.json(
        {
          success: false,
          message: "Proxy request failed",
          error: error instanceof Error ? error.message : "Unknown error",
          data: null,
        },
        { status: 500 },
      );
    }
  }

  // For non-API requests, continue with normal flow
  return NextResponse.next();
}

export const config = {
  // Match all API routes
  matcher: "/api/:path*",
};
