import { Alert } from 'antd';
import 'antd/dist/antd.min.css';
import './error-alert.css';
import React from 'react';

const AlertMessage = () => (
  <div className='alert'>
    <Alert
      message='У вас нет сети! Попробуйте подключиться заново)'
      type='error'
    />
  </div>
);

export default AlertMessage;
