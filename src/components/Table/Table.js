import React, { Component } from 'react';
import { BiSelectMultiple, BiLayer } from 'react-icons/bi'
import './Table.css'

class Table extends Component {
    constructor(props) {
      super(props);
      this.mouseDown = false;
    }
  
    drag(rowIdx, target){
      if(this.mouseDown){
        target.checked = !target.checked;
        this.props.onSelectionChange(rowIdx, target.checked);
      }
    }

    componentDidMount (){
      document.body.onmousedown = ()=> (this.mouseDown = true)
      document.body.onmouseup = ()=> (this.mouseDown = false)
    }

    render() {
      return (
        <table id="main-table" style={{
            visibility: this.props.columns.length > 0 ? 'visible' : 'hidden' }}>
          <tbody>
            <tr key='head'>
              <th key="checkbox">
                <div title='Alles Selecteren' className='selBtn' onClick={this.props.selectAll}>
                  <BiSelectMultiple /> Alles
                </div>
              </th>
              {this.props.columns.map(o => {
                return <th key={o.id}>{o.value}</th>;
              })}
            </tr>
            {this.props.rows.map((row, rowIdx) => {
              let values = Object.values(row.data);
              return <tr key={row.id}>
                <td key={`chk${row.id}`}>
                  <div>
                    <BiLayer title='Op kaart bewerken' className='pushBtn' onClick={() => this.props.onMapOpen(rowIdx)} />
                    <input type="checkbox"  
                        checked={row.selected}  onMouseOver={e => this.drag(rowIdx, e.target)}
                        onChange={e => this.props.onSelectionChange(rowIdx, e.target.checked)} />
                  </div>
                </td>
  
                {values.map((cell, cellIdx) => <td key={`${row.id}-${cellIdx}`}>
                  <input disabled={cellIdx < 3 ? "disabled" : ""} className={row.data.x > 0 ? "found" : row.data.x == '' ? '' : "notfound"} onChange={() => this.props.onCellChange(`cell-${row.id}-${cellIdx}`, rowIdx, cellIdx)} type="text" id={`cell-${row.id}-${cellIdx}`} value={cell} />
                </td>)}
              </tr>;
            })}
          </tbody>
        </table>
      );
    }
  }

export {Table}