"use client";
import { useState, useEffect } from "react";
import { message } from "antd";
import Sidebar from "../components/Sidebar";
import TaskGrid from "../components/TaskGrid";
import FocusGraph from "../components/FocusGraph";
import StickyNotes from "../components/StickyNotes";
import PomodoroTimer from "../components/PomodoroTimer";
import { FaBars } from "react-icons/fa";
import { createClient } from "@/lib/supabase/client"; // Import Supabase client
import { useRouter } from 'next/navigation';

export default function Dashboard() {
    const [tasks, setTasks] = useState([]);
    const [filter, setFilter] = useState("all");
    const [activeTab, setActiveTab] = useState("all");
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [loading, setLoading] = useState(true);
    const [taskSummary, setTaskSummary] = useState({
        tasksCompletedToday: 0,
        focusSessionsToday: 0,
        totalFocusTime: 0,
    });

    // Instantiate Supabase client
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        // This effect runs once to set up everything
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        handleResize();
        window.addEventListener("resize", handleResize);

        // Listen for authentication changes (login/logout)
        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (session) {
                    // User is logged in, fetch their data
                    setLoading(true);
                    await fetchTasks();
                    // You can add back fetchFocusData() here if you refactor it for Supabase
                    setLoading(false);
                } else {
                    // User is logged out, redirect to login
                    router.push('/Login');
                }
            }
        );

        // Cleanup function
        return () => {
            window.removeEventListener("resize", handleResize);
            authListener.subscription.unsubscribe();
        };
    }, []);

    // --- Data Fetching and Mutations with Supabase ---

    const fetchTasks = async () => {
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching tasks:", error);
            message.error("Failed to load tasks");
        } else {
            setTasks(data);
        }
    };

    const handleAddTask = async (newTaskData) => {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            message.error("You must be logged in to add a task.");
            return;
        }

        // ** The New Fix **
        // Directly delete the problematic property from the incoming object.
        // This ensures it is not part of the 'insert' request at all.
        delete newTaskData.created_at;
        delete newTaskData.id; // Also good to remove any temporary ID

        // Add the user_id to the cleaned-up object
        const taskToInsert = { ...newTaskData, user_id: user.id };

        const { data, error } = await supabase
            .from('tasks')
            .insert([taskToInsert])
            .select()
            .single();

        if (error) {
            console.error("Error adding task:", error);
            message.error(`Failed to add task: ${error.message}`);
        } else {
            setTasks((prevTasks) => [data, ...prevTasks]);
            message.success('Task added successfully!');
        }
    };
    const handleUpdateTask = async (updatedTaskData) => {
        const { id, ...taskToUpdate } = updatedTaskData;
        const { data, error } = await supabase
            .from('tasks')
            .update(taskToUpdate)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error("Error updating task:", error);
            message.error('Failed to update task');
        } else {
            setTasks((prevTasks) =>
                prevTasks.map((task) => (task.id === data.id ? data : task))
            );
            message.success('Task updated!');
        }
    };

    const handleToggleComplete = async (taskToToggle) => {
        const { id, completed } = taskToToggle;
        await handleUpdateTask({ id, completed: !completed });
    };

    const handleDeleteTask = async (taskId) => {
        const { error } = await supabase.from('tasks').delete().eq('id', taskId);

        if (error) {
            console.error("Error deleting task:", error);
            message.error('Failed to delete task');
        } else {
            setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
            message.success('Task deleted.');
        }
    };

    // --- JSX ---
    return (
        <div className="flex h-screen bg-background">
            <div className="hidden lg:block lg:w-64">
                <Sidebar onFilterChange={setFilter} activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>

            {isMobile && (
                <>
                    <div className="fixed top-0 left-0 right-0 z-30 flex items-center p-4 bg-background/80 backdrop-blur-sm border-b border-border">
                        <button onClick={() => setSidebarVisible(true)} className="text-foreground p-2 focus:outline-none">
                            <FaBars size={24} />
                        </button>
                        <h1 className="ml-4 text-xl font-bold">Task Manager</h1>
                    </div>
                    {sidebarVisible && (
                        <div id="backdrop" className="fixed inset-0 z-40 bg-black/60" onClick={() => setSidebarVisible(false)}>
                            <div className="w-64 h-full bg-card" onClick={(e) => e.stopPropagation()}>
                                <Sidebar onFilterChange={setFilter} activeTab={activeTab} setActiveTab={setActiveTab} isMobile={isMobile} />
                            </div>
                        </div>
                    )}
                </>
            )}

            <main className="flex-1 overflow-y-auto p-4 lg:p-8 pt-20 lg:pt-8">
                <h1 className="text-3xl font-bold mb-6">📝 All Tasks</h1>

                <TaskGrid
                    tasks={tasks}
                    filter={filter}
                    onAddTask={handleAddTask}
                    onUpdateTask={handleUpdateTask}
                    onDeleteTask={handleDeleteTask}
                    onToggleComplete={handleToggleComplete}
                    loading={loading}
                />

                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <PomodoroTimer />
                    <StickyNotes />
                </div>

                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <FocusGraph />
                    <div className="bg-card border border-border p-6 rounded-lg shadow-sm text-foreground">
                        <h2 className="text-lg font-bold mb-4">📅 Today&apos;s Summary</h2>
                        <ul className="text-md space-y-3">
                            <li className="flex justify-between items-center">
                                <span className="text-muted-foreground">✅ Tasks Completed</span>
                                <span className="font-bold text-green-400 text-lg">{taskSummary.tasksCompletedToday}</span>
                            </li>
                            <li className="flex justify-between items-center">
                                <span className="text-muted-foreground">⏳ Focus Sessions</span>
                                <span className="font-bold text-yellow-400 text-lg">{taskSummary.focusSessionsToday}</span>
                            </li>
                            <li className="flex justify-between items-center">
                                <span className="text-muted-foreground">🔥 Total Focus Time</span>
                                <span className="font-bold text-blue-400 text-lg">{taskSummary.totalFocusTime} min</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </main>
        </div>
    );
}