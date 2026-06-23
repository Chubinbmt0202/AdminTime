import { Outlet } from 'react-router-dom';
import ThanhBen from './ThanhBen';
import ThanhTieuDe from './ThanhTieuDe';
import './ThanhBen.css';

export default function BoCucChinh() {
    return (
        <div className="app-layout">
            <ThanhBen />
            <main className="app-main">
                <ThanhTieuDe />
                <Outlet /> {/* Nơi các Page sẽ được render */}
            </main>
        </div>
    );
}