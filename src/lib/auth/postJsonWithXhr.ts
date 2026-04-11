/**
 * POST JSON via XMLHttpRequest (not fetch/axios) so credentials are sent as literal UTF-8 bytes
 * and are not merged/replaced by HTTP client interceptors.
 */
export function postJsonWithXhr(
  url: string,
  jsonUtf8: string,
  headers: Record<string, string>,
): Promise<{ status: number; statusText: string; text: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.withCredentials = true;
    xhr.timeout = 120_000;
    for (const [k, v] of Object.entries(headers)) {
      if (v) xhr.setRequestHeader(k, v);
    }
    xhr.onload = () => {
      resolve({
        status: xhr.status,
        statusText: xhr.statusText,
        text: xhr.responseText,
      });
    };
    xhr.onerror = () => {
      reject(new Error("Login request failed (network / transport error)"));
    };
    xhr.onabort = () => {
      reject(new Error("Login request aborted"));
    };
    xhr.ontimeout = () => {
      reject(new Error("Login request timed out"));
    };
    xhr.send(jsonUtf8);
  });
}
