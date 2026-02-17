import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Hotel, FileText, Plane, Bus, Package } from 'lucide-react';
import HotelsPage from './HotelsPage';
import VisaPage from './VisaPage';
import TicketsPage from './TicketsPage';
import BusPage from './BusPage';
import PackagesPage from './PackagesPage';

const TABS = [
  { id: 'hotels', label: 'Hotel', icon: Hotel },
  { id: 'visa', label: 'Visa', icon: FileText },
  { id: 'tickets', label: 'Tiket', icon: Plane },
  { id: 'bus', label: 'Bus', icon: Bus },
  { id: 'packages', label: 'Paket', icon: Package }
] as const;

type TabId = typeof TABS[number]['id'];

const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = useMemo(() => {
    const t = searchParams.get('tab') as TabId | null;
    return t && TABS.some((x) => x.id === t) ? t : 'hotels';
  }, [searchParams]);

  const setTab = (id: TabId) => {
    setSearchParams({ tab: id });
  };

  return (
    <div className="flex flex-col min-h-0">
      {/* Sticky tab navigation */}
      <div className="sticky top-0 z-10 -mx-1 px-1 pt-1 pb-3 bg-gradient-to-b from-white via-white to-transparent">
        <nav
          className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent"
          aria-label="Tab produk"
        >
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 border-2 ${
                tab === id
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${tab === id ? 'text-emerald-600' : 'text-slate-500'}`} />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content - consistent padding and min height */}
      <div className="flex-1 min-h-[420px] pt-2">
        {tab === 'hotels' && <HotelsPage />}
        {tab === 'visa' && <VisaPage />}
        {tab === 'tickets' && <TicketsPage />}
        {tab === 'bus' && <BusPage />}
        {tab === 'packages' && <PackagesPage />}
      </div>
    </div>
  );
};

export default ProductsPage;
