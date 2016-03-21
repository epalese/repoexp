"use strict";

import React        from 'react';
import { History }  from 'react-router';
import update       from 'react-addons-update';
import Reflux       from 'reflux';
import Actions      from 'appRoot/actions';
import Loader       from 'appRoot/components/loader';
import marked       from 'marked';

// window.Tools = {};
// window.Tools.React = React;

var ContentEditable = React.createClass({
    render: function(){
        return (
            <div onInput={this.handleInput}
                onBlur={this.handleChange}
                onKeyDown={this.props.onKeyDown}
                contentEditable="true"
                dangerouslySetInnerHTML={{__html: this.props.html}}>
            </div>
        );
    },
    shouldComponentUpdate: function(nextProps){
        return nextProps.html !== this.getDOMNode().innerHTML;
    },
    handleChange: function(){
        var html = this.getDOMNode().innerHTML;
        if (this.props.onChange && html !== this.lastHtml) {
            this.props.onChange({
                target: {
                    value: html
                }
            });
        }
        this.lastHtml = html;
    }
});

export default React.createClass({
    getInitialState: function() {
        return { paragraph: {} };
    },
    componentWillMount: function() {
        this.editMode = this.props.hasOwnProperty('paragraphId');
        if (this.editMode) {
            // check the paragraph type and process the output
            // in case of react type
            var p = this.props.paragraph;
            if (this.props.paragraph.type == 'react') {
                var checked_output;
                try {
                    checked_output = eval.call(this, this.props.paragraph.output); 
                } catch(e) {
                    checked_output = e.toString();
                };
                p.output = checked_output;
            }

            this.setState({ paragraph: p});
        }
    },
    codeChange: function(e) {
        this.setState(
            update(this.state, {
                paragraph: { 
                    code: { $set: e.target.value }
                }
            })
        );
    },
    keyDown: function(e) {
        if (e.which == 13 & e.ctrlKey) {
            e.preventDefault();
            if (this.state.paragraph.type == 'markdown') {
                console.log("keydown markdown code = " + this.state.paragraph.code);
                this.setState(
                    update(this.state, {
                        paragraph: { 
                            output: { $set: this.state.paragraph.code }
                        }
                    })
                );
            }
            else if (this.state.paragraph.type == 'react') {
                console.log("keydown react code = " + this.state.paragraph.code);
                this.setState(
                    update(this.state, {
                        paragraph: { 
                            output: { $set: this.state.paragraph.code }
                        }
                    })
                );
            }
        }
        // else if (e.which == 13 & !e.ctrlKey) {
        //     e.preventDefault();
        //     document.execCommand('insertHTML', false, '<br><br>');
        // }
    },
    rawMarkup: function(html) {
        console.log("rawMarkup = " + html);
        var rawMarkup = marked(
            html,
            {sanitize: true}
            );
        return {__html: rawMarkup};
    },
    render: function() {
        var p = null;

        if (this.state.paragraph.type == 'markdown') {
            console.log("Rerendering markdown");
            p =
                <div className="paragraph">
                    <div className="paragraph-title">
                        <h2 >
                            Paragraph {this.state.paragraph.id}: {this.state.paragraph.type}
                        </h2>
                    </div>
                    <div className="paragraph-code">
                        <textArea
                            onChange={this.codeChange}
                            onKeyDown={this.keyDown}
                            value={this.state.paragraph.code} >
                        </textArea>
                    </div>
                    <div className="paragraph-output">
                        <div dangerouslySetInnerHTML={this.rawMarkup(this.state.paragraph.output)} />
                    </div>
                </div> 

        }
        else if (this.state.paragraph.type == 'react') {
            var checked_output;
            try {
                checked_output = eval.call(null, this.state.paragraph.output);
                // checked_output = eval.call(objectA, this.state.paragraph.output);
            } catch(e) {
                checked_output = e.toString();
            };
            p = 
                <div className="paragraph">
                    <div className="paragraph-title">
                        <h2 >
                            Paragraph {this.state.paragraph.id}: {this.state.paragraph.type}
                        </h2>
                    </div>
                    <div className="paragraph-code">
                        <textArea
                            onChange={this.codeChange}
                            onKeyDown={this.keyDown}
                            value={this.state.paragraph.code} >
                        </textArea>
                    </div>
                    <div className="paragraph-output">
                        <div>{checked_output}</div>
                    </div>
                </div>
        }

        return p;
    }
});
