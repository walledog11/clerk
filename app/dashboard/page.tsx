import { Bot, TrendingUp, Clock, Inbox } from "lucide-react";

export default function DashboardHome() {
  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Good morning, Jane.</h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">Here is what your AI agent has been up to today.</p>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Stat Card 1 */}
        <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
              <Bot className="w-5 h-5 text-yellow-600" />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <TrendingUp className="w-3 h-3" /> +14%
            </span>
          </div>
          <p className="text-sm font-bold text-slate-500 mb-1">Automated Resolutions</p>
          <p className="text-3xl font-extrabold text-slate-900">1,284</p>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-slate-600" />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <TrendingUp className="w-3 h-3" /> 2m faster
            </span>
          </div>
          <p className="text-sm font-bold text-slate-500 mb-1">Avg Resolution Time</p>
          <p className="text-3xl font-extrabold text-slate-900">4m 12s</p>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Inbox className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-sm font-bold text-slate-500 mb-1">Pending Tickets</p>
          <p className="text-3xl font-extrabold text-slate-900">12</p>
        </div>

      </div>

      {/* Main Content Area (Placeholder for recent activity) */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 min-h-[400px]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-extrabold text-slate-900">Recent AI Activity</h2>
          <button className="text-sm font-bold text-yellow-600 hover:text-yellow-700">View all</button>
        </div>
        
        <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed border-slate-100 rounded-xl">
          <Bot className="w-10 h-10 text-slate-300 mb-3" />
          <p className="text-sm font-bold text-slate-500">Your agent is running smoothly.</p>
          <p className="text-xs text-slate-400 mt-1">New incoming tickets will appear here as they are processed.</p>
        </div>
      </div>

    </div>
  );
}