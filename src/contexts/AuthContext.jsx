import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { dbGetCollection, dbAddDoc, dbUpdateDoc, logSystemAction } from "../services/db";
import { sendSystemNotification } from "../services/notifier";
import { firebaseAuth, isFirebaseInitialized } from "../services/firebase";
import { fsGetUserProfile } from "../services/firestoreDb";
import {
  isUsingFirebaseAuth,
  firebaseLogin,
  firebaseSignup,
  firebaseLogout,
  firebaseForgotPassword,
  firebaseChangePassword,
} from "../services/firebaseAuth";
import { mapFirebaseAuthError } from "../services/authErrors";

const AuthContext = createContext();

function buildProfileFromAuthUser(fbUser, profileData = {}) {
  return {
    uid: fbUser.uid,
    email: fbUser.email,
    displayName: profileData.displayName || fbUser.displayName || fbUser.email?.split("@")[0],
    role: profileData.role || "Passenger",
    phone: profileData.phone || "",
    status: profileData.status || "Active",
    photoURL:
      profileData.photoURL ||
      fbUser.photoURL ||
      `https://api.dicebear.com/7.x/adventurer/svg?seed=${fbUser.email}`,
    ...profileData,
  };
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const useFirebase = isUsingFirebaseAuth();

  useEffect(() => {
    if (useFirebase && firebaseAuth) {
      const unsubscribe = onAuthStateChanged(firebaseAuth, async (fbUser) => {
        if (fbUser) {
          try {
            const profile = await fsGetUserProfile(fbUser.uid);
            const user = buildProfileFromAuthUser(fbUser, profile || {});
            setCurrentUser(user);
            localStorage.setItem("aero_current_user", JSON.stringify(user));
          } catch {
            const user = buildProfileFromAuthUser(fbUser, {});
            setCurrentUser(user);
            localStorage.setItem("aero_current_user", JSON.stringify(user));
          }
        } else {
          setCurrentUser(null);
          localStorage.removeItem("aero_current_user");
        }
        setLoading(false);
      });
      return unsubscribe;
    }

    const cachedUser = localStorage.getItem("aero_current_user");
    if (cachedUser) {
      try {
        setCurrentUser(JSON.parse(cachedUser));
      } catch {
        localStorage.removeItem("aero_current_user");
      }
    }
    setLoading(false);
  }, [useFirebase]);

  const login = async (email, password, rememberMe = false) => {
    try {
      if (useFirebase) {
        const updatedUser = await firebaseLogin(email, password);
        setCurrentUser(updatedUser);
        if (rememberMe) {
          localStorage.setItem("aero_current_user", JSON.stringify(updatedUser));
        }
        logSystemAction(updatedUser.uid, updatedUser.email, "User Login", "Authentication", "", "Session Start");
        sendSystemNotification({
          title: "Login Successful",
          message: `Welcome back, ${updatedUser.displayName}! Access granted as ${updatedUser.role}.`,
          type: "success",
          userId: updatedUser.uid,
        });
        return updatedUser;
      }

      const users = dbGetCollection("users");
      const matched = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

      if (!matched) {
        throw new Error("No account found with this email address.");
      }

      if (matched.uid.startsWith("u-") && password !== "admin123") {
        throw new Error("Invalid password. Please use 'admin123' for seeded accounts.");
      }

      const updatedUser = { ...matched, lastLogin: new Date().toISOString() };
      setCurrentUser(updatedUser);

      if (rememberMe) {
        localStorage.setItem("aero_current_user", JSON.stringify(updatedUser));
      }

      logSystemAction(updatedUser.uid, updatedUser.email, "User Login", "Authentication", "", "Session Start");
      sendSystemNotification({
        title: "Login Successful",
        message: `Welcome back, ${updatedUser.displayName}! Access granted as ${updatedUser.role}.`,
        type: "success",
        userId: updatedUser.uid,
      });

      return updatedUser;
    } catch (err) {
      throw new Error(useFirebase ? mapFirebaseAuthError(err) : err.message);
    }
  };

  const signup = async (email, password, displayName, role = "Passenger", extraDetails = {}) => {
    try {
      if (useFirebase) {
        const newUser = await firebaseSignup(email, password, displayName, role, extraDetails);
        setCurrentUser(newUser);
        localStorage.setItem("aero_current_user", JSON.stringify(newUser));
        logSystemAction(newUser.uid, email, "User Signup", "Authentication", "", `New user registered as ${role}`);
        sendSystemNotification({
          title: "Welcome to AeroERP",
          message: `Registration completed! Welcome aboard, ${displayName}.`,
          type: "success",
          userId: newUser.uid,
        });
        return newUser;
      }

      const users = dbGetCollection("users");
      const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());

      if (exists) {
        throw new Error("An account with this email already exists.");
      }

      const uid = `u-${Date.now()}`;
      const newUser = {
        uid,
        email,
        role,
        displayName,
        phone: extraDetails.phone || "",
        cnicPassport: extraDetails.cnicPassport || "",
        status: "Active",
        photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${displayName}`,
        createdAt: new Date().toISOString(),
        ...extraDetails,
      };

      dbAddDoc("users", newUser);
      setCurrentUser(newUser);
      localStorage.setItem("aero_current_user", JSON.stringify(newUser));

      logSystemAction(uid, email, "User Signup", "Authentication", "", `New user registered as ${role}`);
      sendSystemNotification({
        title: "Welcome to AeroERP",
        message: `Registration completed! Welcome aboard, ${displayName}.`,
        type: "success",
        userId: uid,
      });

      return newUser;
    } catch (err) {
      throw new Error(useFirebase ? mapFirebaseAuthError(err) : err.message);
    }
  };

  const logout = async () => {
    if (currentUser) {
      logSystemAction(
        currentUser.uid,
        currentUser.email,
        "User Logout",
        "Authentication",
        "Session Active",
        "Logged Out"
      );
      sendSystemNotification({
        title: "Session Closed",
        message: "You have been logged out of the system.",
        type: "info",
        userId: currentUser.uid,
      });
    }

    if (useFirebase) {
      await firebaseLogout();
    }

    setCurrentUser(null);
    localStorage.removeItem("aero_current_user");
  };

  const forgotPassword = async (email) => {
    try {
      if (useFirebase) {
        await firebaseForgotPassword(email);
        sendSystemNotification({
          title: "Password Reset Sent",
          message: `A password recovery link has been sent to ${email}. Check your inbox (and spam folder).`,
          type: "info",
        });
        return true;
      }

      const users = dbGetCollection("users");
      const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());

      if (!exists) {
        throw new Error("No account registered with this email.");
      }

      sendSystemNotification({
        title: "Password Reset Sent",
        message: `A password recovery link has been dispatched to ${email}. (Demo mode — configure Firebase for real emails.)`,
        type: "info",
      });

      return true;
    } catch (err) {
      throw new Error(useFirebase ? mapFirebaseAuthError(err) : err.message);
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    if (!currentUser) throw new Error("No active user session.");

    try {
      if (useFirebase) {
        await firebaseChangePassword(oldPassword, newPassword, currentUser.email);
      }

      logSystemAction(
        currentUser.uid,
        currentUser.email,
        "Change Password",
        "Authentication",
        "********",
        "********"
      );
      sendSystemNotification({
        title: "Password Changed",
        message: "Your login credentials have been updated successfully.",
        type: "success",
        userId: currentUser.uid,
      });
      return true;
    } catch (err) {
      throw new Error(useFirebase ? mapFirebaseAuthError(err) : err.message);
    }
  };

  const switchRole = (newRole) => {
    if (!currentUser) return;
    const updated = { ...currentUser, role: newRole };
    setCurrentUser(updated);

    if (localStorage.getItem("aero_current_user")) {
      localStorage.setItem("aero_current_user", JSON.stringify(updated));
    }

    if (useFirebase) {
      dbUpdateDoc("users", currentUser.uid, { role: newRole });
    }

    logSystemAction(
      currentUser.uid,
      currentUser.email,
      "Switch Role (Demo Mode)",
      "Authentication",
      currentUser.role,
      newRole
    );
    sendSystemNotification({
      title: "Role Swapped",
      message: `Dashboard context switched to: ${newRole}`,
      type: "info",
      userId: currentUser.uid,
    });
  };

  const updateProfile = (fields) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...fields };
    setCurrentUser(updated);
    dbUpdateDoc("users", currentUser.uid, fields);

    if (localStorage.getItem("aero_current_user")) {
      localStorage.setItem("aero_current_user", JSON.stringify(updated));
    }

    logSystemAction(currentUser.uid, currentUser.email, "Update Profile", "User Profile", currentUser, updated);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        login,
        signup,
        logout,
        forgotPassword,
        changePassword,
        switchRole,
        updateProfile,
        isFirebaseAuth: useFirebase,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
