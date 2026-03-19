import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import './Sidebar.css';

export default function MainLayout() {
    return (
        <div className="app-layout">
            <Sidebar />
            <main className="app-main">
                <Header />
                <Outlet /> {/* Nơi các Page sẽ được render */}
            </main>
        </div>
    );
}