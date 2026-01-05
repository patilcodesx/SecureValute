// export const API_BASE = "http://localhost:8080/api";

// export async function apiFetch(path: string, options: any = {}) {
//   const token = localStorage.getItem("securevault_token");

//   const res = await fetch(`http://localhost:8080/api${path}`, {
//     ...options,
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: token ? `Bearer ${token}` : "",
//       ...(options.headers || {})
//     }
//   });

//   if (res.status === 401) {
//     throw new Error("Unauthorized (401)");
//   }

//   return await res.json();
// }


export const API_BASE = "http://localhost:8080/api";

export async function apiFetch(path: string, options: any = {}) {
  const token = localStorage.getItem("securevault_token");

  const res = await fetch(`http://localhost:8080/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      ...(options.headers || {})
    }
  });

  // ---- FIX: Handle login errors safely ---- //
  if (!res.ok) {
    let data = null;
    try {
      data = await res.json(); // backend message read karna important!
    } catch {}

    return {
      success: false,
      status: res.status,
      message: data?.message || "Request failed"
    };
  }

  // ---- SUCCESS ---- //
  return await res.json();
}
