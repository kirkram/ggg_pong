import { appClient } from "./index";
import { UserProfile, Game } from "./interface";

export const getUserProfile = async () => {
  const token = localStorage.getItem("ping-pong-jwt");
  if (!token) throw new Error("User not authenticated");
  const payload = JSON.parse(atob(token.split(".")[1]));
  const userId = payload.id;

  try {
    const response = await appClient.get<UserProfile>(`/get-profile/${userId}`);

    if (response.status >= 200 && response.status < 300) {
      return response.data;
    } else {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

// export const updateProfileField = (field: string, value: string) => {
//   const token = localStorage.getItem("ping-pong-jwt");
//   if (!token) throw new Error("User not authenticated");
//   const payload = JSON.parse(atob(token.split(".")[1]));
//   const userId = payload.id;
//   return appClient.patch(`/update-field/${userId}`, { field, value }).then((res) => res.data);
// };
export const updateProfileField = (field: string, value: string) => {
  const token = localStorage.getItem("ping-pong-jwt");
  if (!token) throw new Error("User not authenticated");

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const userId = payload.id;

    if (!userId) throw new Error("User ID not found in token");

    return appClient
      .patch(`/update-field/${userId}`, { field, value })
      .then((res) => res.data);
  } catch (error) {
    console.error("Failed to decode token or send patch request:", error);
    throw error;
  }
};

export const uploadProfilePicture = async (file: File) => {
  const token = localStorage.getItem("ping-pong-jwt");
  if (!token) throw new Error("User not authenticated");
  const payload = JSON.parse(atob(token.split(".")[1]));
  const userId = payload.id;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("id", userId.toString());

  return appClient
    .post(`/upload-profile-pic/${userId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data);
};

export const getGamestatsProfile = () => {
  const token = localStorage.getItem("ping-pong-jwt");
  if (!token) throw new Error("User not authenticated");

  return appClient
    .get<UserProfile[]>("/get-all-profiles", {
      headers: {
        Authorization: `Bearer ${token}`, //TODO
      },
    })
    .then((res) => res.data);
};

export const addGameToTable = async (file: Game) => {
  const token = localStorage.getItem("ping-pong-jwt");
  if (!token) throw new Error("User not authenticated");

  return appClient
    .post<Game>("/post-game", file, {
      headers: {
        Authorization: `Bearer ${token}`, //TODO
      },
    })
    .then((res) => res.data);
};
