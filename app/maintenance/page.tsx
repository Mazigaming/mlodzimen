import Link from 'next/link';

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-12 shadow-2xl shadow-black/50">
          {/* Icon */}
          <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-amber-500/20 to-orange-600/20 rounded-full flex items-center justify-center border border-amber-500/30">
            <span className="text-5xl">🔒</span>
          </div>
          
          {/* Title */}
          <h1 className="text-4xl font-bold text-white mb-4 font-poppins">
            Strona w trakcie prac
          </h1>
          
          {/* Description */}
          <p className="text-slate-400 text-lg mb-8 leading-relaxed">
            Przepraszamy za utrudnienia. Trwają prace nad ulepszeniem platformy. 
            Niedługo wrócimy z nowymi funkcjami!
          </p>
          
          {/* Admin Login Button */}
          <Link 
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-105"
          >
            <span>🔐</span>
            Logowanie dla administratorów
          </Link>
          
          {/* Additional Info */}
          <p className="text-slate-500 text-sm mt-6">
            Tylko administratorzy mają dostęp do platformy w trybie konserwacji.
          </p>
        </div>
        
        {/* Decorative Elements */}
        <div className="mt-8 flex justify-center gap-2">
          <div className="w-2 h-2 bg-amber-500/50 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-amber-500/50 rounded-full animate-pulse delay-100"></div>
          <div className="w-2 h-2 bg-amber-500/50 rounded-full animate-pulse delay-200"></div>
        </div>
      </div>
    </div>
  );
}