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

    onOK =() => {
      if(this.props.onClose) this.props.onClose(true);
      this.setState({visible: false});
    }

    onCancel =() => {
        if(this.props.onClose) this.props.onClose(false);
        this.setState({visible: false});
    }

    render(){
        return (
            <div className="modal" style={{visibility: this.state.visible ? "visible":"hidden"}} >

            <div className="modal-content">
              <span className="close" onClick={() => this.setState({visible: false} )} >&times;</span>
              <div className="content-wrap">
                 {this.props.children}
              </div>
              <div className='modal-footer'>
                <span className='modal-btn' onClick={ this.onOK }>OK</span>
                <span className='modal-btn' onClick={ this.onCancel }>Annuleren</span>
              </div>
            
            </div>

          </div>   
        );
    }
}

export {Modal}