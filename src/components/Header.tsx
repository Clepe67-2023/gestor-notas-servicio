import React from 'react';
import { COMPANY_LOGO, COMPANY_NAME } from '../constants';

const Header: React.FC = () => {
    return (
        <div className="flex justify-between items-center pb-4 border-b-2 border-slate-200">
            <div className="flex items-center space-x-4">
                {COMPANY_LOGO}
                <span className="text-2xl font-bold text-slate-700">{COMPANY_NAME}</span>
            </div>
            <h1 className="text-4xl font-extrabold text-slate-800 tracking-wider">
                NOTA DE SERVICIO
            </h1>
        </div>
    );
};

export default Header;
