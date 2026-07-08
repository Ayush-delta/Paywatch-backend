import { Menu } from "lucide-react";
import paywatchLogo from "../assets/new-logo.svg";

export default function MobileTopBar({ onOpenMenu }) {
    return (
        <header className="md:hidden sticky top-0 z-30 flex items-center gap-3 px-4 py-3 bg-white/80 backdrop-blur-md border-b border-gray-200">
            <button
                onClick={onOpenMenu}
                aria-label="Open menu"
                className="p-2 -ml-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
                <Menu size={22} />
            </button>
            <img src={paywatchLogo} alt="Paywatch" className="w-7 h-7 rounded-lg" />
            <span className="text-base font-bold text-gray-900">Paywatch</span>
        </header>
    );
}
