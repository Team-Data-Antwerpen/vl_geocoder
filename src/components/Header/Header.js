import React from 'react';
import logo from '../../img/logo.svg';
import	'./Header.css';

const Header = props => 
    (
    <header className="o-header">
      <a href="#" className="o-header__logo">
            <img src={logo} alt="Stad Antwerpen" />
      </a>
      <h2 className='App-title'>{props.children}</h2>
      {/* <div className="o-header__content-wrapper">
        <div className="o-header__menu-items">
            <button href="#" className="a-button a-button--text a-button--neutral o-header__button">Menu button</button>
        </div>
      </div> */}
    </header>

    );
  
export {Header};
