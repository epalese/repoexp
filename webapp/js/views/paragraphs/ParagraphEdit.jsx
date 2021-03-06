"use strict";

import React            from 'react';
import { History }      from 'react-router';
import update           from 'react-addons-update';
import Reflux           from 'reflux';
import Actions          from 'appRoot/actions';
import NotebookStore    from 'appRoot/stores/NotebooksStore';
import Loader           from 'appRoot/components/loader';
import marked           from 'marked';
import ReactD3          from 'react-d3-components';

import Divider from 'material-ui/lib/divider';
import TextField from 'material-ui/lib/text-field';
import FloatingActionButton from 'material-ui/lib/floating-action-button';

export default React.createClass({
    mixins: [
        Reflux.ListenerMixin
        // Reflux.connectFilter(NotebookStore, "paragraphs", function(notebooks) {
        //     var notebook = notebooks.filter(function(notebook) {
        //         return notebook.id === this.props.notebookId;
        //     }.bind(this))[0];
        //     var paragraph = notebook.paragraphs.filter(function(paragraph) {
        //         return paragraph.id === this.props.paragraphId;
        //     }.bind(this))[0];
        //     return paragraph;
        // })
    ],

    getInitialState: function() {
        return {
            style: '{"width": "95%", "marginLeft": "auto", "marginRight": "auto"}',
            paragraph: this.props.paragraph
        };
    },

    componentWillMount: function() {
        this.listenTo(Actions.sendMsgWS.completed, function(paragraphId, msg) {
            if (paragraphId == this.state.paragraph.id) {
                console.log("actions.sendWS completed");
                console.log(msg);
                // this.setState({ notebook: notebook, loading: false });
                // update the paragraph to notify that the message has been sent
                // and we are waiting for an anwer
            }
        });
        this.listenTo(Actions.receiveMsgWS, function(paragraphId, response) {
            if (paragraphId == this.state.paragraph.id) {
                console.log("actions.receiveMsgWS: ");
                console.log(response);
                this.setState({paragraph: response});
            }
        });
        this.editMode = this.props.hasOwnProperty('paragraphId');
        if (this.editMode) {
            // check the paragraph type and process the output
            // in case of react type
            var p = this.state.paragraph;
            if (this.state.paragraph.type == 'react') {
                var checked_output;
                try {
                    checked_output = eval.call(this, this.state.paragraph.output);
                } catch(e) {
                    checked_output = e.toString();
                };
                p.output = checked_output;
            }
            this.setState({paragraph: p});
        }
    },

    onFocus: function() {
        // console.log("onFocus");
        this.props.updateActiveParagraph(this.state.paragraph.id, this.state.paragraph.order);
    },

    onBlur: function() {
        // console.log("onBlur");
        this.props.updateActiveParagraph(null, null);
    },

    onCodeChange: function(e) {
        this.setState(
            update(this.state, {
                paragraph: { 
                    code: { $set: e.target.value }
                }
            })
        );
        this.props.updateParagraphCode(this.props.paragraphId, e.target.value);
    },

    onStyleChange: function(e) {
        this.setState(
            update(this.state, {
                style: { $set: e.target.value }
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
            // else if (this.state.paragraphs.type == 'react') {
            //     this.setState(
            //         update(this.state, {
            //             paragraphs: { 
            //                 output: { $set: this.state.paragraphs.code }
            //             }
            //         })
            //     );
            // }
            else if (this.state.paragraph.type == 'react-chart') {
                var parsedCode = JSON.parse(this.state.paragraph.code);
                var output = undefined;
                var type = parsedCode['type'];
                if (type == 'barChart') {
                    var variable = parsedCode['dataSet'];
                    var xVariableName = parsedCode['xVariableName'];
                    var yVariableName = parsedCode['yVariableName'];
                    var width = parsedCode['width'];
                    var height = parsedCode['height'];
                    var label = parsedCode['label'];
                    var margin = parsedCode['margin'];

                    // var dataSet = [
                    //     // {x:"sugo pronto", y:10},
                    //     // {x:"minestrone", y:20},
                    //     // {x:"panzerotti", y:30}

                        // {"Supplier":"STUDENT LOANS COMPANY LIMITED","Tot_Amount":1.358617829E9},
                        // {"Supplier":"POST OFFICE LTD","Tot_Amount":8.509302669301758E8},
                        // {"Supplier":"HIGHER EDUCATION FUNDING COUNCIL FOR ENGLAND","Tot_Amount":4.85789888E8},
                        // {"Supplier":"SKILLS FUNDING AGENCY","Tot_Amount":2.6444E8},
                        // {"Supplier":"ENGINEERING AND PHYSICAL SCIENCES RESEARCH COUNCIL","Tot_Amount":1.918E8},
                        // {"Supplier":"BIOTECHNOLOGY AND BIOLOGICAL SCIENCE RESEARCH COUNCIL","Tot_Amount":8.95E7}

                    //     // {
                    //     //     label: 'somethingA',
                    //     //     values: [{x: 'SomethingA', y: 10}, {x: 'SomethingB', y: 4}, {x: 'SomethingC', y: 3}]
                    //     // }
                    // ];

                    var dataSet = window[variable];
                    var values = dataSet.map(function(e) {
                        return {x: e[xVariableName], y: e[yVariableName]};
                    });

                    var data = [{
                        label: label,
                        values: values
                    }];
                    
                    var BarChart = ReactD3.BarChart;
                    output =
                        <BarChart
                            data={data}
                            width={width}
                            height={height}
                            margin={margin}
                        />
                    console.log("output = ");
                    console.log(ReactD3);
                    console.log(BarChart);
                }

                this.setState(
                    update(this.state, {
                        paragraph: { 
                            output: { $set: output }
                        }
                    })
                );
            }
            else if (this.state.paragraph.type == 'code') {
                var msg = {id: this.props.paragraphId, type: 'code', content: this.state.paragraph.code};
                Actions.sendMsgWS(this.state.paragraph.id, msg).then(function() {
                    // signal that the message has been sent 
                    // and the server is processing the request
                    console.log("Message sent and under processing...");
                });
            }
        }
    },

    rawMarkup: function(html) {
        var rawMarkup = marked(
            html,
            {sanitize: true}
            );
        return {__html: rawMarkup};
    },

    render: function() {
        console.log(JSON.parse(this.state.style));
        var p = null;
        if (this.state.paragraph.type == 'markdown') {
            p = 
                <div style= {{width: '95%',
                        'marginLeft': 'auto',
                        'marginRight': 'auto'}}>
                    <input
                        type="text"
                        value={this.state.style}
                        onChange={this.onStyleChange} />
                    <TextField
                        multiLine={true}
                        rows={5}
                        underlineShow={false}
                        fullWidth={true}
                        value={this.state.paragraph.code}
                        onFocus={ this.onFocus }
                        onBlur={ this.onBlur }
                        onChange={this.onCodeChange}
                        onKeyDown={this.keyDown}
                    />
                    <Divider />
                    <div className="paragraph-output"
                        style={JSON.parse(this.state.style)}>
                        <div dangerouslySetInnerHTML={this.rawMarkup(this.state.paragraph.output)} />
                    </div>
                </div>
            // {
            //     'width': '90%',
            //     'marginLeft': '10px',
            //     'marginRight': 'auto',
            //     'minHeight': '10px',
            //     'columnCount': 2,
            //     'MozColumnCount':2,
            //     'WebkitColumnCount': 2
            // }
            // p = 
            //     <div style= {{width: '95%',
            //                 'marginLeft': 'auto',
            //                 'marginRight': 'auto'}}>
            //         <div style={{float: 'left', marginTop: '5px'}}>
            //             <FloatingActionButton mini={true} disabled={true}>
            //                 <div style={{height: '50', width: '50'}}>
            //                     M
            //                 </div>
            //             </FloatingActionButton>
            //         </div>
            //         <TextField
            //             multiLine={true}
            //             rows={5}
            //             underlineShow={false}
            //             fullWidth={true}
            //             value={this.state.paragraphs.code}
            //             onFocus={ this.onFocus }
            //             onBlur={ this.onBlur }
            //             onChange={this.codeChange}
            //             onKeyDown={this.keyDown}
            //         />
            //         <Divider />
            //         <div className="paragraph-output"
            //             style={
            //                 {
            //                     'width': '90%',
            //                     'marginLeft': '10px',
            //                     'marginRight': 'auto',
            //                     'minHeight': '10px'
            //                 }
            //             }>
            //             <div dangerouslySetInnerHTML={this.rawMarkup(this.state.paragraphs.output)} />
            //         </div>
            //     </div>
            // p =
            //     <div className="paragraph">
            //         <div className="paragraph-title">
            //             <h2 >
            //                 Paragraph {this.state.paragraphs.id}: {this.state.paragraphs.type}
            //             </h2>
            //         </div>
            //         <div className="paragraph-code">
            //             <textArea
            //                 onFocus={this.onFocus}
            //                 onBlur={this.onBlur}
            //                 onChange={this.codeChange}
            //                 onKeyDown={this.keyDown}
            //                 value={this.state.paragraphs.code} >
            //             </textArea>
            //         </div>
            //         <div className="paragraph-output">
            //             <div dangerouslySetInnerHTML={this.rawMarkup(this.state.paragraphs.output)} />
            //         </div>
            //     </div> 

        }
        // else if (this.state.paragraphs.type == 'react') {
        //     var checked_output;
        //     try {
        //         checked_output = eval.call(this, this.state.paragraphs.output);
        //         // checked_output = eval.call(objectA, this.state.paragraph.output);
        //         // var jsCode = Babel.transform(this.state.paragraphs.output);
        //         // checked_output = eval(jsCode.code);
        //     } catch(e) {
        //         checked_output = e.toString();
        //     };
        //     p = 
        //         <div className="paragraph">
        //             <div className="paragraph-title">
        //                 <h2 >
        //                     Paragraph {this.state.paragraphs.id}: {this.state.paragraphs.type}
        //                 </h2>
        //             </div>
        //             <div className="paragraph-code">
        //                 <textArea
        //                     onFocus={ this.onFocus }
        //                     onBlur={ this.onBlur }
        //                     onChange={this.codeChange}
        //                     onKeyDown={this.keyDown}
        //                     value={this.state.paragraphs.code} >
        //                 </textArea>
        //             </div>
        //             <div className="paragraph-output">
        //                 <div>{checked_output}</div>
        //             </div>
        //         </div>
        // }
        else if (this.state.paragraph.type == 'react-chart') {
            p = 
                <div style= {{width: '95%',
                            'marginLeft': 'auto',
                            'marginRight': 'auto'}}>
                    <div style={{float: 'left', marginTop: '5px'}}>
                        <FloatingActionButton mini={true} disabled={true}>
                            <div style={{height: '50', width: '50'}}>
                                R
                            </div>
                        </FloatingActionButton>
                    </div>
                    <TextField
                        multiLine={true}
                        rows={5}
                        underlineShow={false}
                        fullWidth={true}
                        value={this.state.paragraph.code}
                        onFocus={ this.onFocus }
                        onBlur={ this.onBlur }
                        onChange={this.codeChange}
                        onKeyDown={this.keyDown}
                    />
                    <Divider />
                    <div className="paragraph-output"
                        style={
                            {
                                'width': '90%',
                                'marginLeft': '10px',
                                'marginRight': 'auto',
                                'minHeight': '10px'
                            }
                        }>
                        <div>{this.state.paragraph.output}</div>
                    </div>
                </div>
            // p = 
            //     <div className="paragraph">
            //         <div className="paragraph-title">
            //             <h2 >
            //                 Paragraph {this.state.paragraphs.id}: {this.state.paragraphs.type}
            //             </h2>
            //         </div>
            //         <div className="paragraph-code">
            //             <textArea
            //                 onFocus={ this.onFocus }
            //                 onBlur={ this.onBlur }
            //                 onChange={this.codeChange}
            //                 onKeyDown={this.keyDown}
            //                 value={this.state.paragraphs.code} >
            //             </textArea>
            //         </div>
            //         <div className="paragraph-output">
            //             <div>{this.state.paragraphs.output}</div>
            //         </div>
            //     </div>
        }
        else if (this.state.paragraph.type == 'code') {
            p = 
                <div style= {{width: '95%',
                            'marginLeft': 'auto',
                            'marginRight': 'auto'}}>
                    <div style={{float: 'left', marginTop: '5px'}}>
                        <FloatingActionButton mini={true} disabled={true}>
                            <div style={{height: '50', width: '50'}}>
                                C
                            </div>
                        </FloatingActionButton>
                    </div>
                    <TextField
                        multiLine={true}
                        rows={5}
                        underlineShow={false}
                        fullWidth={true}
                        value={this.state.paragraph.code}
                        onFocus={ this.onFocus }
                        onBlur={ this.onBlur }
                        onChange={this.codeChange}
                        onKeyDown={this.keyDown}
                    />
                    <Divider />
                    <div className="paragraph-output"
                        style={
                            {
                                'width': '90%',
                                'marginLeft': '10px',
                                'marginRight': 'auto',
                                'minHeight': '10px'
                            }
                        }>
                        <div dangerouslySetInnerHTML={this.rawMarkup(this.state.paragraph.output)} />
                    </div>
                </div>
            // p = <div className="paragraph">
            //         <div className="paragraph-title">
            //             <h2 >
            //                 Paragraph {this.state.paragraphs.id}: {this.state.paragraphs.type}
            //             </h2>
            //         </div>
            //         <div className="paragraph-code">
            //             <textArea
            //                 onFocus={ this.onFocus }
            //                 onBlur={ this.onBlur }
            //                 onChange={this.codeChange}
            //                 onKeyDown={this.keyDown}
            //                 value={this.state.paragraphs.code} >
            //             </textArea>
            //         </div>
            //         <div className="paragraph-output">
            //             <div dangerouslySetInnerHTML={this.rawMarkup(this.state.paragraphs.output)} />
            //         </div>
            //     </div> 
        }
        return p;
    }
});
