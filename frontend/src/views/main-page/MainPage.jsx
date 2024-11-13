import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar'; 
import './MainPage.css'; 

const MainPage = () => {
    return (
        <div className="main-layout">
            <Navbar />
            <div className="content">
                <Outlet />
            </div>
        </div>
    );
};

export default MainPage;
