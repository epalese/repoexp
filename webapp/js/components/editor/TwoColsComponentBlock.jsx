import React, {Component, PropTypes} from 'react';
import {Entity, EditorBlock} from 'draft-js';

export default React.createClass({
   _onChangeCol1: function(v) {
      console.log("_onChangeCol1");
      console.log(v);
      this.props.blockProps.setEntityData(this.props.block, {col1: v});
   },

   _onChangeCol2: function(v) {
      console.log("_onChangeCol2");
      console.log(v);
      this.props.blockProps.setEntityData(this.props.block, {col2: v});
   },

   render: function() {
      console.log('TwoColsComponentBlock');
      console.log(this.props);
      console.log(this.props.blockProps);
      return (
         <div style={{width: '100%'}}>
            <div style={{outline: '1px solid rgba(0, 0, 0, 0.08)', width: '50%', float: 'left', minHeight: '30px'}}>
               <EditorBlock {...this.props}
                  placeholder={'Titel ...'}
                  value={this.props.blockProps.col1}
                  onChange={this._onChangeCol1}/>
            </div>
            <div style={{outline: '1px solid rgba(0, 0, 0, 0.08)', width: '50%', float: 'left', minHeight: '30px'}}>
               <EditorBlock {...this.props}
                  placeholder={'Titel ...'}
                  value={this.props.blockProps.col2}
                  onChange={this._onChangeCol2}/>
            </div>
            <div style={{clear:"both"}} />
         </div>
      );
   }
});
