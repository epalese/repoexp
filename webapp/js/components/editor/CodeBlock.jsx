'use strict';

import React from 'react';
import update from 'react-addons-update';
import {Entity} from 'draft-js';

export default class CodeBlock extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editMode: false,
      visible: false
    };

    // this._onClick = () => {
    //   if (this.state.editMode) {
    //     return;
    //   }
    //   let {content, output} = this._getValue();
    //   this.setState({
    //     editMode: true,
    //     content: content,
    //     output: output
    //   }, () => {
    //     this._startEdit();
    //   });
    // };

    this._onContentValueChange = evt => {
      var value = evt.target.value;
      this.setState(update(
        this.state, {
          content: {$set: value},
        })
      );
    };

    this._save = () => {
      var entityKey = this.props.block.getEntityAt(0);
      Entity.mergeData(entityKey, {
        content: this.state.content
      });
      this.setState({
        editMode: false,
        // code: null,
      }, this._finishEdit);
    };

    this._remove = () => {
      this.props.blockProps.onRemove(this.props.block.getKey());
    };

    this._startEdit = () => {
      this.props.blockProps.onStartEdit(this.props.block.getKey());
    };

    this._finishEdit = () => {
      this.props.blockProps.onFinishEdit(this.props.block.getKey());
    };

    this._onClickTA = () => {
      console.log("[CodeBlock.onClickTA]");
      this.setState({editMode: true});
      this._startEdit();
    }

    // this._onClickDiv = () => {
    //   console.log("[CodeBlock.onClickDiv]");
    // }

    this._onBlurDiv = () => {
      console.log("[CodeBlock._onBlurDiv]");
      this.setState({editMode: false});
      this._finishEdit();
    }
  }

  componentDidMount() {
    console.log("[CodeBlock.componentDidMount]");
    let {visible, content, output} = this._getValue();
    this.setState({
      editMode: false,
      visible: visible,
      content: content,
      output: output
    });
  }

  _getValue() {
    let visible = Entity
      .get(this.props.block.getEntityAt(0))
      .getData()['visible'];
    let content = Entity
      .get(this.props.block.getEntityAt(0))
      .getData()['content'];
    let output = Entity
      .get(this.props.block.getEntityAt(0))
      .getData()['output'];

    return {visible: visible, content: content, output: output};
  }

  render() {
    console.log("[CodeBlock.render] Viible = " + this.state.visible);
    console.log("[CodeBlock.render] Edit mode = " + this.state.editMode);
    var className = 'editor-code';
    if (this.state.editMode) {
      className += ' editor-code-active';
    }
    var editPanel = null;
    if (this.state.visible) {
      var buttonClass = 'editor-code-saveButton';
      // <div
      //       className="Editor-code-output"
      //       dangerouslySetInnerHTML={{__html: this.state.output}} />
      editPanel = (
        <div className="Component-panel">
          {
            this.state.editMode ?
            <textarea
              className="Editor-code-content"
              onClick={this._onClickTA}
              onBlur={this._onBlurDiv} 
              onChange={this._onContentValueChange}
              ref="textarea"
              value={this.state.content}
            />
            : 
            <textarea
              className="Editor-code-content"
              onClick={this._onClickTA}
              onChange={this._onContentValueChange}
              ref="textarea"
              value={this.state.content}
              disabled
            />
          }
          
          
          <div className="Editor-buttons">
            <button
              className={buttonClass}
              onClick={this._save} >
              {'Done'}
            </button>
            <button className="Editor-removeButton" onClick={this._remove}>
              Remove
            </button>
          </div>
        </div>
      );
      return (
        <div className={className}>
          {editPanel}
        </div>
      );
    }
    else {
      // return (
      //   <div 
      //     className={className}
      //      >
      //     {this.state.code}
      //     <button  onClick={this._onClick}>Open</button>
      //   </div>
      // );
      return (
        <div 
          className={className} >
          {this.state.code}
        </div>
      );
    }
  }
}
