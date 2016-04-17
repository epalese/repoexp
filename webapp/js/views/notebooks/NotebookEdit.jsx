"use strict";

import React        from 'react';
import update       from 'react-addons-update';
import Reflux       from 'reflux';
import Moment       from 'moment';
import Config       from 'appRoot/appConfig';
import Actions      from 'appRoot/actions';
import Loader       from 'appRoot/components/loader';
import BasicInput   from 'appRoot/components/basicInput';
import ParagraphEdit from 'appRoot/views/paragraphs/ParagraphEdit';


export default React.createClass({
    mixins: [Reflux.ListenerMixin],

    getInitialState: function () {
        return { 
            loading: true,
            validity: {},
            notebook: {},
            activeParagraphId: undefined,
            activeParagraphOrder: undefined
        };
    },

    // TODO: this function is called by ParagraphEdit components to update
    // the paragraph attribute in the notebook state.
    // I think it is not the best way of using Reflux. Needs a refactor.
    updateParagraphCode: function(paragraphId, code) {
        console.log(code);
        var existingParagraphIdx = Array.findIndex(this.state.notebook.paragraphs,
            function (p) {
                return paragraphId == p.id;
            });
        if (existingParagraphIdx > -1) {
            this.state.notebook.paragraphs[existingParagraphIdx].code = code;
        }
    },

    updateActiveParagraph: function(paragraphId, paragraphOrder) {
        this.setState({
            activeParagraphId: paragraphId,
            activeParagraphOrder: paragraphOrder
        });
    },

    componentWillMount: function () {
        this.editMode   = this.props.params.hasOwnProperty('notebookId');
        this.createMode = !this.editMode;
        this.notebookId = this.editMode ? this.props.params.notebookId : null;
        this.setState({ loading: this.editMode ? true : false });
        if (this.editMode) {
            this.listenTo(Actions.getNotebook.completed, function(notebook) {
                this.setState({ notebook: notebook, loading: false });
            });
            Actions.getNotebook(this.notebookId);
        }
        this.listenTo(Actions.saveNotebook.completed, function(notebook) {
            this.setState({
                loading: false 
            });
        });
    },

    componentDidMount: function () {
        document.addEventListener('keydown', this.onKeyDown);
    },

    componentWillUnmount: function() {
        document.removeEventListener('keydown', this.onKeyDown);
    },

    submit: function (e) {
    },

    onKeyDown: function(e) {
        // CTRL+C, CTRL+M and CTRL+R
        if ((e.which == 67 || e.which == 77 || e.which == 82) & e.ctrlKey) {
            var type;
            if (e.which == 67) {
                type = 'code';
            }
            else if (e.which == 77) {
                type = 'markdown';
            }
            else if (e.which == 82) {
                type = 'react-chart';
            }
            var maxId = 1 + Math.max.apply(Math, this.state.notebook.paragraphs.map(
                function(p){
                    return p.id;
                })
            );
            maxId = (Math.abs(maxId) != Infinity) ? maxId : 0;

            // If outside of any paragraph: append at the end if focus is on nothing
            if (this.state.activeParagraphId == null || 
                this.state.activeParagraphId == undefined) {
                var maxOrder = 1 + Math.max.apply(Math, this.state.notebook.paragraphs.map(
                    function(p){
                        return p.order;
                    })
                );
                var newParagraph = {
                  output: "",
                  code: "",
                  type: type,
                  "id": maxId.toString(),
                  "order": maxOrder
                }
                this.setState(update(this.state, {
                    notebook: { 
                        paragraphs: { $push: [newParagraph] }
                    }
                }));
            }
            // If inside a paragraph: append just after it
            else if (this.state.activeParagraphId != null && 
                this.state.activeParagraphId != undefined) {
                var newOrder = this.state.activeParagraphOrder + 1;
                var newParagraph = {
                  output: "",
                  code: "",
                  type: type,
                  "id": maxId.toString(),
                  "order": newOrder
                }
                var paragraphs = this.state.notebook.paragraphs;
                paragraphs.forEach(function(paragraph, index, array) {
                    if (paragraph.order >= newOrder) {
                        paragraph.order = paragraph.order + 1;
                    }
                });
                paragraphs.splice(newOrder, 0, newParagraph);
                console.log(paragraphs);
                this.setState(update(this.state, {
                    notebook: { 
                        paragraphs: { $set: paragraphs }
                    }
                }));
            }
        }
        // CTRL--
        if (e.which == 189 & e.ctrlKey) {
            if (this.state.activeParagraphId != null && 
                this.state.activeParagraphId != undefined) {
                var paragraphs = this.state.notebook.paragraphs;
                paragraphs.splice(this.state.activeParagraphOrder, 1);
                for (var i = 0; i < paragraphs.length; i++) {
                    paragraphs[i].order = i;
                }
                this.setState(update(this.state, {
                    notebook: { 
                        paragraphs: { $set: paragraphs },
                    },
                    activeParagraphId: {$set: null},
                    activeParagraphOrder: {$set: null}
                }));
            }
        }        
        // CTRL+S
        if (e.which == 83 & e.ctrlKey) {
            console.log("save");
            Actions.saveNotebook(this.state.notebook, this.state.notebook.id);
            this.setState({loading: true});
        }
    },

    titleChange: function (e) {
        this.setState(update(this.state, {
            notebook: { 
                title: { $set: e.target.value }
            }
        }));
    },
    
    render: function () {
        var paragraphsUI = this.state.notebook.paragraphs ?
            this.state.notebook.paragraphs.map(
                function (paragraph) {
                    return (
                        <ParagraphEdit
                            key={paragraph.id}
                            notebookId={this.state.notebook.id}
                            paragraphId={paragraph.id}
                            paragraphs={paragraph}
                            updateParagraphCode={this.updateParagraphCode}
                            updateActiveParagraph={this.updateActiveParagraph}  />);
                }.bind(this))
            : [];
        return (
            <div>
                <BasicInput
                    type="text"
                    ref="title"
                    name="title"
                    value={this.state.notebook.name}
                    error={this.state.validity.name}
                    onChange={this.titleChange}
                    placeholder="notebook title" />
                <div id="help">
                Select a paragraph and then press CTRL+ENTER to execute.
                Wait to see the output in the area below the paragraph.
                </div>
                <div>
                    {paragraphsUI}
                </div>
            </div>
        );
    }
});
