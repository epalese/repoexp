'use strict';

import React from 'react';
import update from 'react-addons-update';
import Reflux from 'reflux';
import Actions from 'appRoot/actions';
import {Entity, EditorBlock} from 'draft-js';

export default React.createClass({
  mixins: [
    Reflux.ListenerMixin      
  ],

  getInitialState: function() {
    let {id, content, output} = this._getValue();
    // let output = Entity
    //   .get(this.props.block.getEntityAt(0))
    //   .getData()['output'];
    return {
      editMode: false,
      content: content,
      output: output
    };
  },

  componentWillMount: function() {
    let id = Entity
        .get(this.props.block.getEntityAt(0))
        .getData()['id'];
    this.listenTo(Actions.sendMsgWS.completed, function(blockId, msg) {
        if (blockId == id) {
            console.log("actions.sendWS completed");
            console.log(msg);
            // this.setState({ notebook: notebook, loading: false });
            // update the paragraph to notify that the message has been sent
            // and we are waiting for an anwer
        }
    });
    this.listenTo(Actions.receiveMsgWS, function(blockId, response) {
        if (blockId == id) {
            console.log("actions.receiveMsgWS: ");
            console.log(response);
            this.setState({output: response.output});
        }
    });
  },

  _onClick: function() {
    if (this.state.editMode) {
      return;
    }
    // let {content, output} = this._getValue();
    this.setState({
      editMode: true,
      // content: content,
      // output: output
    }, () => {
      this._startEdit();
    });
  },

  _onContentValueChange: function(evt) {
    var value = evt.target.value;
    this.setState(update(
      this.state, {
        content: {$set: value},
      })
    );
  },

  _save: function() {
    console.log(this.props);
    var entityKey = this.props.block.getEntityAt(0);
    Entity.mergeData(entityKey, {
      content: this.state.content,
      output: this.state.output
    });
    this.setState({
      editMode: false,
    }, this._finishEdit);
  },

  _remove: function() {
    this.props.blockProps.onRemove(this.props.block.getKey());
  },

  _startEdit: function() {
    this.props.blockProps.onStartEdit(this.props.block.getKey());
  },

  _finishEdit: function() {
    this.props.blockProps.onFinishEdit(this.props.block.getKey());
  },

  _getValue: function() {
    let id = Entity
        .get(this.props.block.getEntityAt(0))
        .getData()['id'];
    let content = Entity
      .get(this.props.block.getEntityAt(0))
      .getData()['content'];
    let output = Entity
      .get(this.props.block.getEntityAt(0))
      .getData()['output'];

    return {id: id, content: content, output: output};
  },

  _onkeyDown: function(e) {
    if (e.which == 13 & e.ctrlKey) {
      console.log("CTRL + ENTER");
      let {id, _, output} = this._getValue();
      let type = Entity
        .get(this.props.block.getEntityAt(0))
        .getData()['type'];
      var msg = {id: id, type: type, content: this.state.content};
      console.log(msg);
      Actions.sendMsgWS(id, msg).then(function() {
          // signal that the message has been sent 
          // and the server is processing the request
          console.log("Message sent and under processing...");
      });
    }
  },

  render() {
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
            onKeyDown={this._onkeyDown}
          />
        </div>;
    }

    return (
      <div className={className} onClick={this._onClick}>
        {editPanel}
        <EditorBlock {...this.props}/>
        <div className="editor-code-output" dangerouslySetInnerHTML={{__html: this.state.output}} />
      </div>
    );
  }
});