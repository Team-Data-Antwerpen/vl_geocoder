import { Component } from 'react';
//css
import './Modal.css'

class Modal extends Component {
    constructor(props) {
      super(props);
      this.state =  { visible: props.visible };
    }

    componentDidUpdate(prevProps) {
        if (this.props !== prevProps) {
            this.setState({visible: this.props.visible });
        }
      }

    onOKClick =() => {
        if(this.props.onClose) this.props.onClose(true);
        this.setState({visible: false});
    }
   
    onCancel =() => {
        if(this.props.onClose) this.props.onClose(false);
        this.setState({visible: false});
    }

    render(){
        return (
            <div className="modal" style={{display: this.state.visible ? "block":"none"}} >

            <div className="modal-content">
              <span className="modal-close" onClick={() => this.setState({visible: false} )} >&times;</span>
              <p>{this.props.children}</p>
              <div className='modal-footer'>
                {/* <button onClick={ this.onOKClick }>OK</button> */}
                <span className='modal-btn' onClick={ this.onCancel }>Sluiten</span>
              </div>
            </div>

          </div>   
        );
    }
}

export {Modal}