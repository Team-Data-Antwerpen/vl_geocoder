import { Component } from 'react';
import { Button } from '@acpaas-ui/react-components';
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
              
                <Button className='modal-btn' onClick={ this.onOK }>OK</Button>
                <Button className='modal-btn' onClick={ this.onCancel }>Annuleren</Button>
              </div>
            
            </div>

          </div>   
        );
    }
}

export {Modal}
