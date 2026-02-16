import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Hotel, FileText, Plane, Bus, Package } from 'lucide-react';
import HotelsPage from './HotelsPage';
import VisaPage from './VisaPage';
import TicketsPage from './TicketsPage';
import BusPage from './BusPage';
import PackagesPage from './PackagesPage';

const TABS = [
  { id: 'hotels', label: 'Hotels', icon: Hotel },
  { id: 'visa', label: 'Visa', icon: FileText },
  { id: 'tickets', label: 'Tiket', icon: Plane },
  { id: 'bus', label: 'Bus', icon: Bus },
  { id: 'packages', label: 'Packages', icon: Package }
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
    <div className="space-y-6">
      <div className="border-b border-slate-200">
        <nav className="flex gap-1 overflow-x-auto" aria-label="Product tabs">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                tab === id
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      <div className="min-h-[400px]">
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
