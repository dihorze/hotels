import React, { useMemo, useState } from 'react';
import { Close, HelpOutline, NotificationsNone } from '@mui/icons-material';
import { useReduxStateSelector } from '../hooks/useReduxStateSelector';
import { Dialog, IconButton } from '@mui/material';
import ReduxActions from '../redux/ReduxActions';

const currencies = ['USD', 'SGD', 'CNY', 'KRW', 'JPY', 'IDR'];

function Header() {
  const currency = useReduxStateSelector((state) => state.currency);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const dialogPaperProps = useMemo(() => ({
    style: { borderRadius: '12px' },
  }), []);

  return (
    <>
      <div className="bg-blue-500 w-full h-22 flex justify-center align-center">
        <div className="w-full max-w-screen-lg px-8 py-4 flex flex-row justify-between align-center">
          <h1 className="text-2xl md:text-3xl leading-loose font-semibold antialiased text-white select-none">Stays.com</h1>
          <div className="h-full flex flex-row align-center">
            <button className="h-full bg-blue-500 hover:bg-blue-400 transition-all text-white text-lg p-3 rounded-lg" onClick={() => setIsModalOpen(true)}>{currency}</button>
            <button className="h-full bg-blue-500 hover:bg-blue-400 transition-all text-white px-4 py-2 rounded-lg ml-3">
              <HelpOutline />
            </button>
            <button className="h-full bg-blue-500 hover:bg-blue-400 transition-all text-white px-4 py-2 rounded-lg ml-3">
              <NotificationsNone />
            </button>
          </div>
        </div>
      </div>
      <Dialog PaperProps={dialogPaperProps} open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="bg-white w-full max-w-96 p-4">
          <div className="flex flex-row justify-between items-center">
            <h1 className="text-lg font-bold antialiased text-black select-none">Select Your Currency</h1>
            <IconButton aria-label="close" onClick={() => setIsModalOpen(false)}>
              <Close />
            </IconButton>
          </div>
          <div className="grid grid-cols-4 gap-4 mt-4 p-4">
            {currencies.map((c) => (
              <button
                key={c}
                className={`transition-all text-meduim p-2 md:p-4 rounded-lg ${c === currency ? 'bg-blue-500 hover:bg-blue-400 text-white' : 'hover:bg-gray-100'}`}
                onClick={() => {
                  ReduxActions.save({ currency: c });
                  setIsModalOpen(false);
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </Dialog>
    </>
  );
}

export default Header;