import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE==="development" ?"http://localhost:5001" : "/"

export const useAuthStore = create((set,get) => ({
  authUser: null,
  isSigningUp: false, // ✅ consistent with frontend
  isLoggingIn: false,
  isUpdatingProfile: false,
   onlineUsers: [],
  isCheckingAuth: true,
  socket: null,

  // Check current auth state (on page load)
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
       get().connectSocket(); 
    } catch (error) {
      console.log("Error in checkAuth", error.message);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  // Signup handler
  signup: async (data) => {
    set({ isSigningUp: true }); // ✅ Corrected
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
       
      toast.success("Account created successfully"); // ✅ Typo fixed
      get().connectSocket(); 
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed"); // ✅ Safe fallback
    } finally {
      set({ isSigningUp: false }); // ✅ Corrected
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      get().connectSocket(); 
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed socket");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    }
  },
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.post("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Profile update failed");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
  connectSocket :()=>{ 
    const {authUser} = get();
    if(!authUser || (get().socket && get().socket.connected)) return;
    const socket = io(BASE_URL,{
      query:{
        userId: authUser._id
      }
    });
    socket.connect();
    set({ socket :socket });
    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },
  disconnectSocket :()=>{
    if(get().socket && get().socket.connected) {
      get().socket.disconnect();
    }
  }
}));
