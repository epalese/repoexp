'use strict';

import React from 'react';
import update from 'react-addons-update';
import {Entity} from 'draft-js';

export default class CodeBlock extends React.Component {
  constructor(props) {
    super(props);
    let output = Entity
      .get(this.props.block.getEntityAt(0))
      .getData()['output'];
    this.state = {
      editMode: false,
      output: output
    };

    this._onClick = () => {
      if (this.state.editMode) {
        return;
      }
      let {content, output} = this._getValue();
      this.setState({
        editMode: true,
        content: content,
        output: output
      }, () => {
        this._startEdit();
      });
    };

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
  }

  _getValue() {
    let content = Entity
      .get(this.props.block.getEntityAt(0))
      .getData()['content'];
    let output = Entity
      .get(this.props.block.getEntityAt(0))
      .getData()['output'];

    return {content: content, output: output};
  }

  render() {
    console.log("[render] ");
    console.log(this.state);
    var content = null;
    if (this.state.editMode) {
      content = this.state.content;
    } else {
      content = this.state.output;
    }

    var className = 'editor-code-component';
    if (this.state.editMode) {
      className += ' editor-code-edit';
    }

    var editPanel = null;
    if (this.state.editMode) {
      var buttonClass = 'TeXEditor-saveButton';

      editPanel =
        <div className="editor-code-edit-panel">
          <div className="TeXEditor-buttons">
            <button
              className={buttonClass}
              onClick={this._save}>
              Done
            </button>
            <button className="TeXEditor-removeButton" onClick={this._remove}>
              Remove
            </button>
          </div>
          <textarea
            className="editor-code-edit-textarea"
            onChange={this._onContentValueChange}
            ref="textarea"
            value={this.state.content}
          />
        </div>;
    }

    return (
      <div className={className} onClick={this._onClick}>
        <div className="editor-code-output" dangerouslySetInnerHTML={{__html: this.state.output}} />
        {editPanel}
      </div>
    );
  }
}
