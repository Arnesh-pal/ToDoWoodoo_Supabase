"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaTasks, FaListAlt, FaCheckCircle, FaSignOutAlt, FaPen } from "react-icons/fa";
import { Modal, Input, message } from "antd";
import AvatarSelection from "./AvatarSelection";
import { createClient } from "@/lib/supabase/client"; // Import Supabase client

export default function Sidebar({ onFilterChange, activeTab, setActiveTab }) {
  const router = useRouter();
  const supabase = createClient();

  const [userName, setUserName] = useState("Loading...");
  const [userAvatar, setUserAvatar] = useState("/profile.png");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isAvatarModalVisible, setIsAvatarModalVisible] = useState(false);

  useEffect(() => {
    // Fetch the initial user data when the component mounts
    const getUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserName(user.user_metadata?.name || "Enter Your Name");
        setUserAvatar(user.user_metadata?.avatar || "/profile.png");
      }
    };
    getUserData();
  }, [supabase.auth]);

  const navItems = [
    { id: "all", label: "All Tasks", icon: <FaTasks /> },
    { id: "incomplete", label: "Uncompleted", icon: <FaListAlt /> },
    { id: "completed", label: "Completed", icon: <FaCheckCircle /> },
  ];

  const handleAvatarChange = async (newAvatar) => {
    const oldAvatar = userAvatar; // Store old avatar in case of error
    setUserAvatar(newAvatar); // Optimistically update the UI
    setIsAvatarModalVisible(false);

    const { error } = await supabase.auth.updateUser({
      data: { avatar: newAvatar },
    });

    if (error) {
      console.error("❌ Error updating avatar:", error);
      message.error("Failed to update avatar.");
      setUserAvatar(oldAvatar); // Revert on error
    } else {
      message.success("Avatar updated!");
    }
  };

  const handleNameChange = async (newName) => {
    const trimmedName = newName.trim();
    setIsEditingName(false);

    if (!trimmedName) return;

    const oldName = userName; // Store old name
    setUserName(trimmedName); // Optimistically update the UI

    const { error } = await supabase.auth.updateUser({
      data: { name: trimmedName },
    });

    if (error) {
      console.error("❌ Error updating name:", error);
      message.error("Failed to update name.");
      setUserName(oldName); // Revert on error
    } else {
      message.success("Name updated!");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // router.refresh() reloads the page and triggers the middleware
    // which will redirect the user to the Login page.
    router.refresh();
  };

  return (
    <div className="flex h-full flex-col bg-card p-4">
      <div className="flex flex-col items-center text-center">
        <div
          className="relative w-24 h-24 mb-4 group"
          onClick={() => setIsAvatarModalVisible(true)}
        >
          <Image
            src={userAvatar}
            alt="User Profile"
            className="rounded-full cursor-pointer border-2 border-border group-hover:border-primary transition-colors"
            width={96}
            height={96}
            priority
          />
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <FaPen className="text-white" size={20} />
          </div>
        </div>

        {isEditingName ? (
          <Input
            defaultValue={userName}
            onPressEnter={(e) => handleNameChange(e.currentTarget.value)}
            onBlur={(e) => handleNameChange(e.currentTarget.value)}
            className="text-lg font-semibold text-center bg-transparent text-black border-border focus:border-primary focus:ring-0"
            autoFocus
          />
        ) : (
          <h2
            className="text-lg font-semibold cursor-pointer text-foreground hover:text-primary transition-colors"
            onClick={() => setIsEditingName(true)}
          >
            {userName}
          </h2>
        )}
      </div>

      <hr className="my-6 border-border" />

      <nav className="flex flex-col gap-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              onFilterChange(item.id);
              setActiveTab(item.id);
            }}
            className={`flex items-center gap-x-3 p-2 rounded-md text-sm font-medium transition-colors ${activeTab === item.id
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
          >
            {item.icon} <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto">
        <hr className="my-6 border-border" />
        <button
          className="flex w-full items-center gap-x-3 p-2 rounded-md text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
          onClick={handleSignOut}
        >
          <FaSignOutAlt /> <span>Sign Out</span>
        </button>
      </div>

      <Modal
        title="Choose Your Avatar"
        open={isAvatarModalVisible}
        onCancel={() => setIsAvatarModalVisible(false)}
        footer={null}
        destroyOnClose
        classNames={{
          mask: "bg-black/70 backdrop-blur-sm",
          header: "!bg-card !text-foreground !border-b !border-border",
          body: "!bg-card !text-foreground",
          content: "!bg-card !p-0",
        }}
      >
        <div className="p-6">
          <AvatarSelection onAvatarSelect={handleAvatarChange} />
        </div>
      </Modal>
    </div>
  );
}