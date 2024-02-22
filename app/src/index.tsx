import React from 'react';
import ReactDOM from 'react-dom/client';
import Recorder from './Recorder';


const App: React.FC = () => {
  return <Recorder></Recorder>
};

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(<App />);