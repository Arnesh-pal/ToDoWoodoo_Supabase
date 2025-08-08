"use client";
import { useState, useEffect, useCallback } from "react";
import { message } from "antd";
import Sidebar from "../components/Sidebar";
import TaskGrid from "../components/TaskGrid";
import FocusGraph from "../components/FocusGraph";
import StickyNotes from "../components/StickyNotes";
import PomodoroTimer from "../components/PomodoroTimer";
import { FaBars } from "react-icons/fa";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from 'next/navigation';

export default function Dashboard() {
    // --- State Management ---
    const [tasks, setTasks] = useState([]);
    const [notes, setNotes] = useState([]);
    const [focusSessions, setFocusSessions] = useState([]);
    const [filter, setFilter] = useState("all");
    const [activeTab, setActiveTab] = useState("all");
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [loading, setLoading] = useState(true);
    const [taskSummary, setTaskSummary] = useState({
        tasksCompleted: 0,
        focusSessions: 0,
        totalFocusTime: 0,
    });

    const supabase = createClient();
    const router = useRouter();

    // --- Data Fetching ---
    const fetchTasks = useCallback(async () => {
        const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
        if (error) message.error("Failed to load tasks");
        else setTasks(data || []);
    }, [supabase]);

    const fetchNotes = useCallback(async () => {
        const { data, error } = await supabase.from('notes').select('*').order('created_at', { ascending: false });
        if (error) message.error("Failed to load notes");
        else setNotes(data || []);
    }, [supabase]);

    const fetchFocusSessions = useCallback(async () => {
        const { data, error } = await supabase.from('focus_sessions').select('*').order('date', { ascending: false });
        if (error) message.error("Failed to load focus sessions");
        else setFocusSessions(data || []);
    }, [supabase]);

    // --- Effects ---
    // Initial data load on auth change
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        handleResize();
        window.addEventListener("resize", handleResize);

        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (session) {
                    setLoading(true);
                    await Promise.all([fetchTasks(), fetchNotes(), fetchFocusSessions()]);
                    setLoading(false);
                } else {
                    router.push('/Login');
                }
            }
        );
        return () => {
            window.removeEventListener("resize", handleResize);
            authListener.subscription.unsubscribe();
        };
    }, [router, supabase.auth, fetchTasks, fetchNotes, fetchFocusSessions]);

    // Summary Calculation
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];

        const completedToday = tasks.filter(task =>
            task.completed && task.updated_at?.startsWith(today)
        ).length;

        const focusToday = focusSessions.filter(session =>
            session.date?.startsWith(today)
        );

        const totalSeconds = focusToday.reduce((sum, session) => sum + session.duration, 0);

        setTaskSummary({
            tasksCompleted: completedToday,
            focusSessions: focusToday.length,
            totalFocusTime: Math.round(totalSeconds / 60)
        });
    }, [tasks, focusSessions]);

    // --- Task Mutations ---
    const handleAddTask = async (newTaskData) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return message.error("You must be logged in.");

        delete newTaskData.id;
        delete newTaskData.created_at;

        const taskToInsert = { ...newTaskData, user_id: user.id };
        const { data, error } = await supabase.from('tasks').insert(taskToInsert).select().single();

        if (error) message.error(`Failed to add task: ${error.message}`);
        else {
            setTasks((prev) => [data, ...prev]);
            message.success('Task added!');
        }
    };

    const handleUpdateTask = async (updatedTaskData) => {
        delete updatedTaskData.created_at;
        const { id, ...taskToUpdate } = updatedTaskData;
        const { data, error } = await supabase.from('tasks').update(taskToUpdate).eq('id', id).select().single();

        if (error) message.error(`Failed to update task: ${error.message}`);
        else {
            setTasks((prev) => prev.map((task) => (task.id === data.id ? data : task)));
            message.success('Task updated!');
        }
    };

    const handleToggleComplete = async (taskToToggle) => {
        await handleUpdateTask({ id: taskToToggle.id, completed: !taskToToggle.completed, updated_at: new Date().toISOString() });
    };

    const handleDeleteTask = async (taskId) => {
        const { error } = await supabase.from('tasks').delete().eq('id', taskId);
        if (error) message.error(`Failed to delete task: ${error.message}`);
        else {
            setTasks((prev) => prev.filter((task) => task.id !== taskId));
            message.success('Task deleted.');
        }
    };

    // --- Note Mutations ---
    const handleAddNote = async (newNoteData) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return message.error("You must be logged in to add a note.");

        const noteToInsert = { ...newNoteData, user_id: user.id };
        const { data, error } = await supabase.from('notes').insert(noteToInsert).select().single();

        if (error) {
            message.error(`Failed to add note: ${error.message}`);
        } else {
            setNotes((prev) => [data, ...prev]);
        }
    };

    const handleUpdateNote = async (updatedNoteData) => {
        delete updatedNoteData.created_at;
        const { id, ...noteToUpdate } = updatedNoteData;
        const { data, error } = await supabase.from('notes').update(noteToUpdate).eq('id', id).select().single();

        if (error) {
            message.error(`Failed to update note: ${error.message}`);
        } else {
            setNotes((prev) => prev.map((note) => (note.id === data.id ? data : task)));
        }
    };

    const handleDeleteNote = async (noteId) => {
        const { error } = await supabase.from('notes').delete().eq('id', noteId);
        if (error) {
            message.error(`Failed to delete note: ${error.message}`);
        } else {
            setNotes((prev) => prev.filter((note) => note.id !== noteId));
        }
    };

    // --- Focus Session Mutation ---
    const handleSaveFocusSession = async (sessionData) => {
        console.log('DASHBOARD - handleSaveFocusSession was called with:', sessionData); // <-- DEBUGGING LINE ADDED

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return message.error("You must be logged in.");

        const sessionToInsert = { ...sessionData, user_id: user.id };
        const { data, error } = await supabase.from('focus_sessions').insert(sessionToInsert).select().single();

        if (error) {
            message.error(`Failed to save session: ${error.message}`);
        } else {
            setFocusSessions((prev) => [data, ...prev]);
            message.success('Focus session saved!');
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
                    <PomodoroTimer onSaveSession={handleSaveFocusSession} />
                    <StickyNotes
                        notes={notes}
                        onAddNote={handleAddNote}
                        onUpdateNote={handleUpdateNote}
                        onDeleteNote={handleDeleteNote}
                    />
                </div>

                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <FocusGraph sessions={focusSessions} tasks={tasks} />
                    <div className="bg-card border border-border p-6 rounded-lg shadow-sm text-foreground">
                        <h2 className="text-lg font-bold mb-4">📅 Today&apos;s Summary</h2>
                        <ul className="text-md space-y-3">
                            <li className="flex justify-between items-center">
                                <span className="text-muted-foreground">✅ Tasks Completed</span>
                                <span className="font-bold text-green-400 text-lg">{taskSummary.tasksCompleted}</span>
                            </li>
                            <li className="flex justify-between items-center">
                                <span className="text-muted-foreground">⏳ Focus Sessions</span>
                                <span className="font-bold text-yellow-400 text-lg">{taskSummary.focusSessions}</span>
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