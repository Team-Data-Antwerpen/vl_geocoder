import React from 'react';
//images
import logo from '../../img/logo.svg';
import	'./Header.css';

const Header = props => 
    (<header className="App-header">
      <div className='App-title-box'>
        <img src={logo} className="App-logo" alt="logo" />
        <span className='App-title'>{props.children}</span>
      </div>
    </header>);
  
export {Header};