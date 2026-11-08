import {Component,type ReactNode} from 'react';
export default class FeatureBoundary extends Component<{children:ReactNode;onClose?:()=>void},{failed:boolean}>{
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true};}
 render(){return this.state.failed?<aside className="feature-error" role="alert"><h3>This feature couldn’t load.</h3><p>Your studio is still available. Refresh the page when you’re ready to retry.</p>{this.props.onClose&&<button onClick={this.props.onClose}>Back to studio</button>}</aside>:this.props.children;}
}
