import React from 'react';
import './Loader.css';
import { BiLoader } from 'react-icons/bi'

const Loader = props => {
    return (
    <div className='buzzy-indicator' style={{
       visibility:  props.buzzy ? 'visible' : 'hidden'
    }}>
      <BiLoader className='icon-spin' size={70}></BiLoader><br />
      <span>{props.children}</span>
    </div>)
  }
  
export {Loader};