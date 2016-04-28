'use strict';

import React from 'react';
import update from 'react-addons-update';
import Reflux from 'reflux';
import Draft from 'draft-js';
import {convertFromRaw, convertToRaw} from 'draft-js';
import {Editor, EditorState, ContentState, Modifier, SelectionState} from 'draft-js';
import {AtomicBlockUtils, Entity, RichUtils} from 'draft-js';
import {getDefaultKeyBinding, KeyBindingUtil} from 'draft-js';
import {Map} from 'immutable';
import Actions from 'appRoot/actions';
import CodeBlock from 'appRoot/components/editor/CodeBlock';
import CodeBlockEditable from 'appRoot/components/editor/CodeBlockEditable';

const {hasCommandModifier} = KeyBindingUtil;

function customKeyBindingFn(e: SyntheticKeyboardEvent): string {
  if (e.keyCode === 83 /* `S` key */ && hasCommandModifier(e)) {
    return 'editor-save';
  }
  return getDefaultKeyBinding(e);
}

const insertComponentBlock = (type, editorState) => {
  var entityKey;
  let newId = new Date().getTime();
  if (type == 'code') {
    entityKey = Entity.create(
      'TOKEN',
      'IMMUTABLE',
      {
        id: newId,
        type: 'code',
        visible: true,
        content: '',
        output: ''
      }
    );
  }
  else if (type == 'react') {
    entityKey = Entity.create(
      'TOKEN',
      'IMMUTABLE',
      {
        id: newId,
        type: 'react',
        visible: true,
        content: '',
        output: ''
      }
    );
  }
  return AtomicBlockUtils.insertAtomicBlock(editorState, entityKey, ' ');
}

const removeComponentBlock = (editorState, blockKey) => {
  var content = editorState.getCurrentContent();
  var block = content.getBlockForKey(blockKey);

  var targetRange = new SelectionState({
    anchorKey: blockKey,
    anchorOffset: 0,
    focusKey: blockKey,
    focusOffset: block.getLength(),
  });

  var withoutComponent = Modifier.removeRange(content, targetRange, 'backward');
  var resetBlock = Modifier.setBlockType(
    withoutComponent,
    withoutComponent.getSelectionAfter(),
    'unstyled'
  );

  var newState = EditorState.push(editorState, resetBlock, 'remove-range');
  return EditorState.forceSelection(newState, resetBlock.getSelectionAfter());
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
              var {liveComponentEdits} = this.state;
              this.setState({liveComponentEdits: liveComponentEdits.remove(blockKey)});
            }.bind(this),
            onRemove: function(blockKey) {
              this._removeComponent(blockKey)
            }.bind(this),
          },
        };
      }
      else if (componentType === 'react') {
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

  _insertCodeComponent: function() {
    this.setState({
      liveComponentEdits: Map(),
      editorState: insertComponentBlock('code', this.state.editorState),
    });
  },

  _insertReactComponent: function() {
    this.setState({
      liveComponentEdits: Map(),
      editorState: insertComponentBlock('react', this.state.editorState),
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
        <div>{this.state.loading? "Loading" : ""}</div>
        <button onClick={this._insertCodeComponent} className="Editor-insert">
          {'Insert new Code component'}
        </button>
        <button onClick={this._insertReactComponent} className="Editor-insert">
          {'Insert new React component'}
        </button>
        <button onClick={this._logState} className="Editor-insert">
          {'Log State'}
        </button>
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
