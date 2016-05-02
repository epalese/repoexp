'use strict';

import {BlockMapBuilder, CharacterMetadata, ContentBlock} from 'draft-js';
import {Entity, Modifier as DraftModifier, EditorState, SelectionState} from 'draft-js'
import {genKey as generateRandomKey} from 'draft-js'
import {List, Repeat} from 'immutable'

const getContentBlock = function() {
  var entityKey = Entity.create(
      'TOKEN',
      'MUTABLE'
    );
  const charData = CharacterMetadata.create({entity: entityKey});
  return new ContentBlock({
      key: generateRandomKey(),
      type: 'unstyled',
      text: ' ',
      characterList: List(Repeat(charData, ' '.length)),
    });
};

const insertCustomBlock = function(
  type: string,
  editorState: EditorState,
  entityKey: string,
  character: string
) : EditorState {
  const contentState = editorState.getCurrentContent();
  const selectionState = editorState.getSelection();

  const afterRemoval = DraftModifier.removeRange(
    contentState,
    selectionState,
    'backward'
  );

  const targetSelection = afterRemoval.getSelectionAfter();
  const afterSplit = DraftModifier.splitBlock(afterRemoval, targetSelection);
  const insertionTarget = afterSplit.getSelectionAfter();

  const asAtomicBlock = DraftModifier.setBlockType(
    afterSplit,
    insertionTarget,
    type
  );

  const charData = CharacterMetadata.create({entity: entityKey});
  const fragmentArray = [
    new ContentBlock({
      key: generateRandomKey(),
      type: type,
      text: character,
      characterList: List(Repeat(charData, character.length)),
    }),
    new ContentBlock({
      key: generateRandomKey(),
      type: 'unstyled',
      text: '',
      characterList: List(),
    }),
  ];

  const fragment = BlockMapBuilder.createFromArray(fragmentArray);

  const withAtomicBlock = DraftModifier.replaceWithFragment(
    asAtomicBlock,
    insertionTarget,
    fragment
  );

  const newContent = withAtomicBlock.merge({
    selectionBefore: selectionState,
    selectionAfter: withAtomicBlock.getSelectionAfter().set('hasFocus', true),
  });

  return EditorState.push(editorState, newContent, 'insert-fragment');
};

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
  return insertCustomBlock('atomic', editorState, entityKey, ' ');
};

const insertTwoColsBlock = (editorState) => {
  var entityKey;
  let newId = new Date().getTime();
  entityKey = Entity.create(
    'TOKEN',
    'MUTABLE',
    {}
    // {col1: {"blocks": [], "entityMap": {}}, col2: {"blocks": [], "entityMap": {}}}
  );
  return insertCustomBlock('two-cols', editorState, entityKey, '');
};

const removeComponentBlock = (editorState, blockKey) => {
  var content = editorState.getCurrentContent();
  var block = content.getBlockForKey(blockKey);

  var targetRange = new SelectionState({
    anchorKey: blockKey,
    anchorOffset: 0,
    focusKey: blockKey,
    focusOffset: block.getLength(),
  });

  var withoutComponent = DraftModifier.removeRange(content, targetRange, 'backward');
  var resetBlock = DraftModifier.setBlockType(
    withoutComponent,
    withoutComponent.getSelectionAfter(),
    'unstyled'
  );

  var newState = EditorState.push(editorState, resetBlock, 'remove-range');
  return EditorState.forceSelection(newState, resetBlock.getSelectionAfter());
}


export {
  insertCustomBlock,
  insertComponentBlock,
  insertTwoColsBlock,
  removeComponentBlock,
  getContentBlock};