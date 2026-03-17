import { Bot, TrendingUp, Clock, Inbox, AlertCircle, CheckCircle2, MessageSquare } from "lucide-react";

const userName = 'Balthazar'
export default function DashboardHome() {
  return (
    <div className="space-y-8 pb-10">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Good morning, {userName}.</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Clerk has handled 142 interactions while you were away.</p>
        </div>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded-full">
              <TrendingUp className="w-3 h-3" /> +14%
            </span>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 mb-1">Automated Resolutions</p>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-extrabold text-slate-900">1,284</p>
              <p className="text-sm font-medium text-slate-400 mb-1">this week</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded-full">
              <TrendingUp className="w-3 h-3" /> 2m faster
            </span>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 mb-1">Avg Resolution Time</p>
            <p className="text-3xl font-extrabold text-slate-900">4m 12s</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <Inbox className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 mb-1">Pending Human Review</p>
            <p className="text-3xl font-extrabold text-slate-900">12</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area: Activity Feed */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-extrabold text-slate-900">Live Agent Activity</h2>
            <button className="text-sm font-bold text-slate-500 hover:text-slate-900">View log</button>
          </div>
          
          <div className="space-y-6">
            {/* Activity Item */}
            <div className="flex gap-4">
              <div className="mt-1 w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <MessageSquare className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-900 font-medium">Drafted reply for <span className="font-bold">Sarah Jenkins</span> regarding "Where is my order?"</p>
                <p className="text-xs text-slate-500 mt-1">Instagram • 2 mins ago</p>
              </div>
            </div>
            
            {/* Activity Item */}
            <div className="flex gap-4">
              <div className="mt-1 w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-900 font-medium">Automatically resolved <span className="font-bold">user88492's</span> Restock Question.</p>
                <p className="text-xs text-slate-500 mt-1">TikTok • 15 mins ago</p>
              </div>
            </div>

            {/* Activity Item */}
            <div className="flex gap-4">
              <div className="mt-1 w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-900 font-medium">Categorized 14 new incoming tickets from Shopify.</p>
                <p className="text-xs text-slate-500 mt-1">Shopify • 1 hour ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Urgent Handoffs */}
        <div className="bg-rose-50 rounded-[2rem] border border-rose-100 shadow-sm p-8">
          <div className="flex items-center gap-2 mb-6">
            <AlertCircle className="w-5 h-5 text-rose-600" />
            <h2 className="text-lg font-extrabold text-rose-900">Attention Needed</h2>
          </div>
          <p className="text-sm text-rose-700 font-medium mb-6">
            Clerk flagged these tickets for low confidence or negative sentiment.
          </p>
          
          <div className="space-y-3">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-rose-100 cursor-pointer hover:border-rose-300 transition-colors">
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-bold text-rose-600">Frustrated</span>
                <span className="text-xs text-slate-400">10m ago</span>
              </div>
              <p className="text-sm font-bold text-slate-900">Shipping Delay</p>
              <p className="text-xs text-slate-500 truncate mt-1">I ordered the lip balm 2 weeks ago...</p>
            </div>
            
            <button className="w-full py-3 text-sm font-bold text-rose-700 hover:bg-rose-100 rounded-xl transition-colors">
              Review all 12 tickets
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}