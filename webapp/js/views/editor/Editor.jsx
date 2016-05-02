'use strict';

import React from 'react';
import update from 'react-addons-update';
import Reflux from 'reflux';
import Draft from 'draft-js';
import {convertFromRaw, convertToRaw} from 'draft-js';
import {Editor, EditorState, ContentState, Modifier, SelectionState} from 'draft-js';
import {Entity, RichUtils} from 'draft-js';
import {getDefaultKeyBinding, KeyBindingUtil} from 'draft-js';
import {Map} from 'immutable';
import Actions from 'appRoot/actions';
import {insertCustomBlock} from 'appRoot/components/editor/util/BlockUtils';
import {insertComponentBlock} from 'appRoot/components/editor/util/BlockUtils';
import {removeComponentBlock} from 'appRoot/components/editor/util/BlockUtils';
import CodeBlock from 'appRoot/components/editor/CodeBlock';
import ReactBlock from 'appRoot/components/editor/ReactBlock';
import {BlockStyleControls, InlineStyleControls} from 'appRoot/components/editor/EditorControls';

const {hasCommandModifier} = KeyBindingUtil;

function customKeyBindingFn(e: SyntheticKeyboardEvent): string {
  if (e.keyCode === 83 /* `S` key */ && hasCommandModifier(e)) {
    return 'editor-save';
  }
  return getDefaultKeyBinding(e);
}


export default React.createClass({
  mixins: [Reflux.ListenerMixin],

  getInitialState: () => {
    return {
      notebook: null,
      loading: true,
      editorState: EditorState.createWithContent(
        ContentState.createFromBlockArray(
          convertFromRaw({
            blocks: [{text: '', type: 'unstyled'}], entityMap: {}
          })
        )
      ),
      liveComponentEdits: Map(),
    };
  },

  componentWillMount: function () {
    this.notebookId = this.props.params.notebookId;
    Actions.getNotebook(this.notebookId);
    this.listenTo(Actions.getNotebook.completed, function(notebook) {
      let editorState = EditorState.createWithContent(
        ContentState.createFromBlockArray(
          convertFromRaw(notebook.content)
        )
      );
      this.setState({
        notebook: notebook,
        editorState: editorState,
        loading: false });
    });
    this.listenTo(Actions.saveNotebook.completed, function(notebook) {
        this.setState({
            loading: false 
        });
    });
  },

  _focus: function() {
    if (this.state.onBlurCallback) {
      this.state.onBlurCallback.callback();
      this.setState({onBlurCallback: undefined});
    }
    this.refs.editor.focus()
  },

  _onChange: function(editorState) {
    var rawEditorState = convertToRaw(editorState.getCurrentContent());
    this.setState(update(
        this.state, {
          notebook: { content: {$set: rawEditorState} },
          editorState: {$set: editorState}
        }
      )
    );
  },

  _toggleInlineStyle: function(inlineStyle) {
    this._onChange(
      RichUtils.toggleInlineStyle(
        this.state.editorState,
        inlineStyle
      )
    );
  },

  _toggleBlockType: function(blockType) {
    if (blockType == 'code-block') {
      this.setState({
        liveComponentEdits: Map(),
        editorState: insertComponentBlock('code', this.state.editorState),
      });
    }
    else if (blockType == 'react-block') {
      this.setState({
        liveComponentEdits: Map(),
        editorState: insertComponentBlock('react', this.state.editorState),
      });
    }
    else {
      this._onChange(
        RichUtils.toggleBlockType(
          this.state.editorState,
          blockType
        )
      );  
    }
  },

  _blockRenderer: function(block) {
    if (block.getType() === 'atomic') {
      const componentType = Entity.get(block.getEntityAt(0)).getData()['type'];
      if (componentType === 'code') {
        return {
          component: CodeBlock,
          editable: false,
          props: {
            onStartEdit: function(blockKey) {
              this.setState({liveComponentEdits: this.state.liveComponentEdits.set(blockKey, true)});
            }.bind(this),
            onFinishEdit: function(blockKey) {
              // console.log(`onFinishEdit ${blockKey}`);
              var {liveComponentEdits} = this.state;
              this.setState({liveComponentEdits: liveComponentEdits.remove(blockKey)});
            }.bind(this),
            onRemove: function(blockKey) {
              this._removeComponent(blockKey)
            }.bind(this),
            onBlurCallback: function(id, callback) {
              // console.log(`Editor onBlurCallback set from ${id}`);
              var oldBlurCallback = this.state.onBlurCallback;
              if (oldBlurCallback) {
                // Check if it is a new component that is trying to
                // register a callback or it is still the old one.
                // In the latter case simply skip the callback call.
                let oldId = oldBlurCallback.id;
                let oldCallback = oldBlurCallback.callback;
                if (oldId != id) {
                  // console.log(`Editor onBlurCallback: it is the new ${oldId}! calling back`);
                  oldCallback();
                  this.setState({onBlurCallback: {id: id, callback: callback}});
                }
                else {
                  // console.log(`Editor onBlurCallback: it is still ${oldId}! Skipping`);
                }
              } else {
                this.setState({onBlurCallback: {id: id, callback: callback}});
              }
              
            }.bind(this)
          },
        };
      }
      else if (componentType === 'react') {
        // console.log("REACT");
        return {
          component: ReactBlock,
          editable: false,
          props: {
            onStartEdit: function(blockKey) {
              this.setState({liveComponentEdits: this.state.liveComponentEdits.set(blockKey, true)});
            }.bind(this),
            onFinishEdit: function(blockKey) {
              var {liveComponentEdits} = this.state;
              this.setState({liveComponentEdits: liveComponentEdits.remove(blockKey)});
            }.bind(this),
            onRemove: function(blockKey) {
              this._removeComponent(blockKey)
            }.bind(this),
            onBlurCallback: function(id, callback) {
              // console.log(`Editor onBlurCallback set from ${id}`);
              var oldBlurCallback = this.state.onBlurCallback;
              if (oldBlurCallback) {
                // Check if it is a new component that is trying to
                // register a callback or it is still the old one.
                // In the latter case simply skip the callback call.
                let oldId = oldBlurCallback.id;
                let oldCallback = oldBlurCallback.callback;
                if (oldId != id) {
                  // console.log(`Editor onBlurCallback: it is the new ${oldId}! calling back`);
                  oldCallback();
                }
                else {
                  // console.log(`Editor onBlurCallback: it is still ${oldId}! Skipping`);
                }
              }
              this.setState({onBlurCallback: {id: id, callback: callback}});
            }.bind(this)
          },
        };  
      }
    }
    return null;
  },

  _handleKeyCommand: function(command) {
    if (command === 'editor-save') {
      var notebook = this.state.notebook;
      notebook.content = convertToRaw(this.state.editorState.getCurrentContent());
      Actions.saveNotebook(notebook, this.state.notebook.id);
      // this.setState({loading: true});
      this.setState(update(
        this.state, {
          notebook: {$set: notebook},
          loading: {$set: true}
        }
      )
    );
    }
    var {editorState} = this.state;
    var newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      this._onChange(newState);
      return true;
    }
    return false;
  },

  _removeComponent: function(blockKey) {
    var {editorState, liveComponentEdits} = this.state;
    this.setState({
      liveComponentEdits: liveComponentEdits.remove(blockKey),
      editorState: removeComponentBlock(editorState, blockKey),
    });
  },

  _logState: function() {
    console.log(this.state);
    var {editorState} = this.state;
    console.log(editorState.getCurrentContent());
    var raw = convertToRaw(editorState.getCurrentContent());
    console.log(raw);
  },

  render: function() {
    return (
      <div className="editor-container">

        <div className="editor-controls">
          <BlockStyleControls
            editorState={this.state.editorState}
            onToggle={this._toggleBlockType}
          />
          <InlineStyleControls
            editorState={this.state.editorState}
            onToggle={this._toggleInlineStyle}
          />
        </div>

        <div>{this.state.loading? "Loading" : ""}</div>
        <div className="editor-root">
          <div className="editor-working-area" onClick={this._focus}>
            <Editor
              blockRendererFn={this._blockRenderer}
              editorState={this.state.editorState}
              handleKeyCommand={this._handleKeyCommand}
              keyBindingFn={customKeyBindingFn}
              onChange={this._onChange}
              placeholder="Start a document..."
              readOnly={this.state.liveComponentEdits.count()}
              ref="editor"
              spellCheck={true}
            />
          </div>
        </div>
      </div>
    );
  }
});
