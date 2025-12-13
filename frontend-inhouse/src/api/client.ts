// src/api/client.ts
// Backwards-compatible client that is BOTH:
// - a callable function: `client(path, opts)`
// - an object with helpers: `client.get/post/patch/put/delete`
// - also exported as `api` for modules that import `{ api }`
// This preserves existing login/pin code and other callers.

import { v4 as uuidv4 } from "uuid";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

type ReqOpts = RequestInit & {
  idempotency?: boolean;
  rawResponse?: boolean;
  // allow callers to pass `json` convenience value (object) instead of pre-stringified body
  json?: any;
};

type ClientFn = {
  <T = any>(path: string, opts?: ReqOpts): Promise<T>;
  get<T = any>(path: string, opts?: ReqOpts): Promise<T>;
  post<T = any>(path: string, body?: any, opts?: ReqOpts): Promise<T>;
  patch<T = any>(path: string, body?: any, opts?: ReqOpts): Promise<T>;
  put<T = any>(path: string, body?: any, opts?: ReqOpts): Promise<T>;
  delete<T = any>(path: string, opts?: ReqOpts): Promise<T>;
};

function isStringLike(v: any) {
  return typeof v === "string" || v instanceof String;
}

async function readResponse(res: Response, opts?: ReqOpts) {
  const text = await res.text().catch(() => "");
  const contentType = (res.headers.get("content-type") || "").toLowerCase();

  if (!text) return { parsed: null, text, contentType };

  if (opts?.rawResponse) return { parsed: text, text, contentType };

  if (contentType.includes("application/json")) {
    try {
      const parsed = JSON.parse(text);
      return { parsed, text, contentType };
    } catch {
      return { parsed: text, text, contentType };
    }
  }

  return { parsed: text, text, contentType };
}

const rawRequest = async <T = any>(
  path: string,
  opts: ReqOpts = {}
): Promise<T> => {
  const url = path.startsWith("http") ? path : API_BASE + path;

  // Build headers with sensible defaults
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(opts.headers as Record<string, string> | undefined),
  };

  if (opts.idempotency) {
    headers["Idempotency-Key"] = uuidv4();
  }

  // If caller provided opts.json, prefer it as the body
  let body: BodyInit | undefined = undefined;
  if (opts.json !== undefined) {
    // stringify JSON and ensure content-type
    try {
      body = JSON.stringify(opts.json);
      // set Content-Type if not already present (respect caller header otherwise)
      const hasCT = Object.keys(headers).some(
        (k) => k.toLowerCase() === "content-type"
      );
      if (!hasCT) headers["Content-Type"] = "application/json";
    } catch {
      body = String(opts.json);
      const hasCT = Object.keys(headers).some(
        (k) => k.toLowerCase() === "content-type"
      );
      if (!hasCT) headers["Content-Type"] = "application/json";
    }
  } else if (opts.body !== undefined) {
    // if body is already a string or FormData/Blob, use as-is
    if (
      isStringLike(opts.body) ||
      opts.body instanceof FormData ||
      opts.body instanceof Blob ||
      opts.body instanceof ArrayBuffer
    ) {
      body = opts.body as BodyInit;

      // DEFENSIVE FIX:
      // If caller passed a pre-stringified JSON body (JSON.stringify(...)) and did not set
      // Content-Type, detect it and set Content-Type: application/json so servers accept it.
      if (typeof body === "string") {
        const hasCT = Object.keys(headers).some(
          (k) => k.toLowerCase() === "content-type"
        );
        if (!hasCT) {
          const trimmed = (body as string).trim();
          const looksLikeJson =
            trimmed.startsWith("{") ||
            trimmed.startsWith("[") ||
            trimmed === "null";
          if (looksLikeJson) {
            headers["Content-Type"] = "application/json";
          }
        }
      }
    } else {
      // attempt to stringify non-string body
      try {
        body = JSON.stringify(opts.body);
        const hasCT = Object.keys(headers).some(
          (k) => k.toLowerCase() === "content-type"
        );
        if (!hasCT) headers["Content-Type"] = "application/json";
      } catch {
        body = String(opts.body) as BodyInit;
      }
    }
  }

  const fetchOpts: RequestInit = {
    ...opts,
    headers,
    body,
  };

  const res = await fetch(url, fetchOpts);
  const { parsed, text } = await readResponse(res, opts);

  if (!res.ok) {
    const message =
      (parsed && (parsed.message || parsed.error)) ||
      res.statusText ||
      `Request failed (${res.status})`;
    const err: any = new Error(message);
    err.status = res.status;
    err.payload = parsed ?? text;
    throw err;
  }

  // normalize empty body to {}
  if (parsed === null || typeof parsed === "undefined") return {} as T;

  return parsed as T;
};

// Create callable client function and attach helpers
const client = async function clientFn<T = any>(
  path: string,
  opts: ReqOpts = {}
) {
  return rawRequest<T>(path, opts);
} as unknown as ClientFn;

client.get = async <T = any>(path: string, opts?: ReqOpts) =>
  rawRequest<T>(path, { ...(opts || {}), method: "GET" });

client.post = async <T = any>(path: string, body?: any, opts?: ReqOpts) =>
  rawRequest<T>(path, { ...(opts || {}), method: "POST", body, json: body });

client.patch = async <T = any>(path: string, body?: any, opts?: ReqOpts) =>
  rawRequest<T>(path, { ...(opts || {}), method: "PATCH", body, json: body });

client.put = async <T = any>(path: string, body?: any, opts?: ReqOpts) =>
  rawRequest<T>(path, { ...(opts || {}), method: "PUT", body, json: body });

client.delete = async <T = any>(path: string, opts?: ReqOpts) =>
  rawRequest<T>(path, { ...(opts || {}), method: "DELETE" });

// Backwards compatibility: some modules import { api } (function). Provide alias.
export const api = client;

// Named export for callers that expect a client object
export { client };

// Default export
export default client;
