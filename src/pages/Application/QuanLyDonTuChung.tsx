import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import LeaveRequestsTab from './components/LeaveRequestsTab';
import OvertimeRequestsTab from './components/OvertimeRequestsTab';
import './QuanLyDonTuChung.css';

export default function QuanLyDonTuChungPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const tabParam = searchParams.get('tab') || 'leave';
    const [activeTab, setActiveTab] = useState<string>(tabParam);

    useEffect(() => {
        if (tabParam === 'leave' || tabParam === 'overtime') {
            setActiveTab(tabParam);
        }
    }, [tabParam]);

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        setSearchParams({ tab });
    };

    return (
        <div className="logs-page-application">
            {/* TABS HEADER */}
            <div className="unified-tabs-header">
                <button 
                    className={`unified-tab-btn ${activeTab === 'leave' ? 'active' : ''}`}
                    onClick={() => handleTabChange('leave')}
                >
                    Đơn xin nghỉ
                </button>
                <button 
                    className={`unified-tab-btn ${activeTab === 'overtime' ? 'active' : ''}`}
                    onClick={() => handleTabChange('overtime')}
                >
                    Đơn xin tăng ca
                </button>
            </div>

            <div className="unified-tab-content">
                {activeTab === 'leave' ? <LeaveRequestsTab /> : <OvertimeRequestsTab />}
            </div>
        </div>
    );
}
