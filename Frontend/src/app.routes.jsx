import { createBrowserRouter } from "react-router";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import Protected from "./features/auth/components/Protected";
import Home from "./features/interview/pages/Home";
import Interview from "./features/interview/pages/Interview";
import AnalyticsDashboard from "./features/dashboard/pages/AnalyticsDashboard";
import VoiceInterviewRoom from "./features/voice/pages/VoiceInterviewRoom";
import LiveResumeBuilder from "./features/resume/pages/LiveResumeBuilder";

export const router = createBrowserRouter([
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/register",
        element: <Register />
    },
    {
        path: "/",
        element: <Protected><Home /></Protected>
    },
    {
        path: "/interview/:interviewId",
        element: <Protected><Interview /></Protected>
    },
    {
        path: "/dashboard",
        element: <Protected><AnalyticsDashboard /></Protected>
    },
    {
        path: "/voice-interview",
        element: <Protected><VoiceInterviewRoom /></Protected>
    },
    {
        path: "/resume-builder",
        element: <Protected><LiveResumeBuilder /></Protected>
    }
])